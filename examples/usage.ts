/**
 * 使用示例：展示如何使用 @code-snippet/requests 和 @code-snippet/utils
 *
 * 运行方式：
 * bun run examples/usage.ts
 */

import { Request, type HttpResponse } from '@code-snippet/requests';
import { logger, generateUUID, delay } from '@code-snippet/utils';

// ============================================
// 示例 1: 基础 HTTP 请求
// ============================================
async function example1BasicRequest() {
  logger.info('=== 示例 1: 基础 HTTP 请求 ===');

  const api = new Request({
    baseURL: 'https://jsonplaceholder.typicode.com',
    returnData: false, // 使用假 API，返回原始响应
    timeout: 5000,
  });

  try {
    // GET 请求
    const users = await api.get('/users');
    logger.info('获取到用户列表:', users);

    // POST 请求
    const newPost = await api.post('/posts', {
      title: 'Test Post',
      body: 'This is a test',
      userId: 1,
    });
    logger.info('创建的文章:', newPost);
  } catch (error) {
    logger.error('请求失败:', error);
  }
}

// ============================================
// 示例 2: 自定义认证
// ============================================
async function example2CustomAuth() {
  logger.info('\n=== 示例 2: 自定义认证 ===');

  const authenticatedApi = new Request({
    baseURL: 'https://api.example.com',
    returnData: true,

    // 添加认证 token
    requestInterceptor: config => {
      config.headers = config.headers ?? {};

      // 模拟从 localStorage 获取 token
      const token = 'mock-token-12345';
      config.headers.Authorization = `Bearer ${token}`;

      // 添加请求 ID（用于追踪）
      config.headers['X-Request-Id'] = generateUUID();

      logger.info(
        `添加认证头: Authorization: Bearer ${token.substring(0, 10)}...`
      );

      return config;
    },

    // 处理 401 未授权
    onUnauthorized: () => {
      logger.warn('未授权，需要重新登录');
      // 在实际应用中，这里会跳转到登录页
    },
  });

  logger.info('已创建带认证的 API 实例');
}

// ============================================
// 示例 3: 错误处理
// ============================================
async function example3ErrorHandling() {
  logger.info('\n=== 示例 3: 错误处理 ===');

  const api = new Request({
    baseURL: 'https://jsonplaceholder.typicode.com',
    returnData: false,

    defaultErrorHandler: {
      showMessage: true,
      messageHandler: msg => logger.error(`错误提示: ${msg}`),
    },
  });

  // 注册自定义错误处理器
  api.registerErrorHandler({
    canHandle: err => err.code === 404,
    handle: err => {
      logger.warn('资源未找到，使用默认数据');
      return true; // 阻止默认错误提示
    },
  });

  // 注册网络错误处理器
  api.registerErrorHandler({
    canHandle: err => err.isNetworkError,
    handle: err => {
      logger.error('网络连接失败，请检查网络设置');
      return true;
    },
  });

  try {
    // 请求不存在的资源
    await api.get('/users/999999');
  } catch (error) {
    logger.info('错误已被处理');
  }
}

// ============================================
// 示例 4: 类型安全
// ============================================
interface User {
  id: number;
  name: string;
  email: string;
}

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

async function example4TypeSafety() {
  logger.info('\n=== 示例 4: TypeScript 类型安全 ===');

  const api = new Request({
    baseURL: 'https://jsonplaceholder.typicode.com',
    returnData: false,
  });

  // 使用泛型指定响应类型
  const user = await api.get<User>('/users/1');
  logger.info('用户名:', user);

  // 使用数组类型
  const posts = await api.get<Post[]>('/posts', { userId: 1 });
  logger.info(`用户发布了 ${posts} 篇文章`);

  // 获取完整响应（包含 code、message）
  const response = await api.get<User>('/users/1', {}, { returnData: false });
  logger.info('完整响应:', response);
}

// ============================================
// 示例 5: 工具函数
// ============================================
async function example5Utils() {
  logger.info('\n=== 示例 5: 工具函数 ===');

  // 生成 UUID
  const id1 = generateUUID();
  const id2 = generateUUID();
  logger.info('生成的 UUID:', id1);
  logger.info('再生成一个:', id2);

  // 延迟函数
  logger.info('等待 2 秒...');
  await delay(2000);
  logger.info('继续执行');
}

// ============================================
// 运行所有示例
// ============================================
async function main() {
  logger.info('🚀 开始运行示例...\n');

  try {
    await example1BasicRequest();
    await example2CustomAuth();
    await example3ErrorHandling();
    await example4TypeSafety();
    await example5Utils();

    logger.info('\n✅ 所有示例运行完成！');
  } catch (error) {
    logger.error('\n❌ 示例运行失败:', error);
  }
}

// 运行主函数
main();
