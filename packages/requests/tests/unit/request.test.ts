/**
 * Request 类单元测试
 */
import { describe, expect, it } from 'bun:test';
import { BusinessError, defaultResponseParser, Request } from '../../src';

describe('Request', () => {
  describe('constructor', () => {
    it('should create instance with minimal config', () => {
      const api = new Request({
        baseURL: 'https://api.example.com',
      });

      expect(api).toBeDefined();
      expect(api).toBeInstanceOf(Request);
    });

    it('should create instance with full config', () => {
      const api = new Request({
        baseURL: 'https://api.example.com',
        timeout: 5000,
        returnData: false,
        onUnauthorized: () => {},
        requestInterceptor: config => config,
        defaultErrorHandler: {
          showMessage: true,
          messageHandler: () => {},
        },
        responseParser: defaultResponseParser,
        errorMessages: {
          401: '请重新登录',
          networkError: '网络连接失败',
        },
      });

      expect(api).toBeDefined();
    });

    it('should create instance with custom response parser', () => {
      // 自定义响应格式: { status: 'ok', result: T, error: string }
      const api = new Request({
        baseURL: 'https://api.example.com',
        responseParser: {
          isSuccess: (res: { status: string }) => res.status === 'ok',
          getData: (res: { result: unknown }) => res.result,
          getMessage: (res: { error?: string }) => res.error || 'success',
          getCode: (res: { status: string }) => (res.status === 'ok' ? 0 : -1),
        },
      });

      expect(api).toBeDefined();
    });
  });

  describe('axios instance', () => {
    it('should expose axios instance', () => {
      const api = new Request({
        baseURL: 'https://api.example.com',
      });

      expect(api.axios).toBeDefined();
      expect(api.axios.defaults.baseURL).toBe('https://api.example.com');
    });
  });

  describe('static create', () => {
    it('should create instance using factory method', () => {
      const api = Request.create({
        baseURL: 'https://api.example.com',
      });

      expect(api).toBeInstanceOf(Request);
    });

    it('should create instance without config', () => {
      const api = Request.create();

      expect(api).toBeInstanceOf(Request);
    });
  });

  describe('registerErrorHandler', () => {
    it('should register and unregister error handler', () => {
      const api = new Request({
        baseURL: 'https://api.example.com',
      });

      const handler = {
        canHandle: () => true,
        handle: () => true,
      };

      const unregister = api.registerErrorHandler(handler);
      expect(typeof unregister).toBe('function');

      // 取消注册应该不抛出错误
      expect(() => unregister()).not.toThrow();
    });
  });

  describe('HTTP methods', () => {
    it('should have get method', () => {
      const api = new Request({ baseURL: 'https://api.example.com' });
      expect(typeof api.get).toBe('function');
    });

    it('should have post method', () => {
      const api = new Request({ baseURL: 'https://api.example.com' });
      expect(typeof api.post).toBe('function');
    });

    it('should have put method', () => {
      const api = new Request({ baseURL: 'https://api.example.com' });
      expect(typeof api.put).toBe('function');
    });

    it('should have patch method', () => {
      const api = new Request({ baseURL: 'https://api.example.com' });
      expect(typeof api.patch).toBe('function');
    });

    it('should have delete method', () => {
      const api = new Request({ baseURL: 'https://api.example.com' });
      expect(typeof api.delete).toBe('function');
    });

    it('should have request method', () => {
      const api = new Request({ baseURL: 'https://api.example.com' });
      expect(typeof api.request).toBe('function');
    });
  });
});

describe('Request Integration', () => {
  // 这些测试使用真实的 HTTP 请求（jsonplaceholder）
  // 在 CI 环境中可能需要跳过或 mock

  it('should make real GET request', async () => {
    const api = new Request({
      baseURL: 'https://jsonplaceholder.typicode.com',
      // jsonplaceholder 不返回 { code, data, message } 格式，需要自定义解析器
      responseParser: {
        isSuccess: () => true, // 总是成功
        getData: res => res, // 直接返回原始数据
        getMessage: () => 'success',
        getCode: () => 0,
      },
    });

    const todo = await api.get<{ id: number; title: string }>('/todos/1');

    expect(todo).toBeDefined();
    expect(todo.id).toBe(1);
  });

  it('should make real POST request', async () => {
    const api = new Request({
      baseURL: 'https://jsonplaceholder.typicode.com',
      responseParser: {
        isSuccess: () => true,
        getData: res => res,
        getMessage: () => 'success',
        getCode: () => 0,
      },
    });

    const newPost = await api.post<{ id: number; title: string }>('/posts', {
      title: 'Test Post',
      body: 'Test Body',
      userId: 1,
    });

    expect(newPost).toBeDefined();
    expect(newPost.id).toBeDefined();
  });

  it('should handle 404 error', async () => {
    const api = new Request({
      baseURL: 'https://jsonplaceholder.typicode.com',
      responseParser: {
        isSuccess: () => true,
        getData: res => res,
        getMessage: () => 'success',
        getCode: () => 0,
      },
      defaultErrorHandler: {
        showMessage: false, // 禁用错误提示
      },
    });

    try {
      await api.get('/nonexistent-endpoint-12345');
      expect.unreachable('Should throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(BusinessError);
      expect((error as BusinessError).httpStatus).toBe(404);
    }
  });

  it('should use custom error messages', async () => {
    const api = new Request({
      baseURL: 'https://jsonplaceholder.typicode.com',
      responseParser: {
        isSuccess: () => true,
        getData: res => res,
        getMessage: () => 'success',
        getCode: () => 0,
      },
      errorMessages: {
        404: '资源未找到',
      },
      defaultErrorHandler: {
        showMessage: false,
      },
    });

    try {
      await api.get('/nonexistent-endpoint-12345');
      expect.unreachable('Should throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(BusinessError);
      expect((error as BusinessError).message).toBe('资源未找到');
    }
  });
});
