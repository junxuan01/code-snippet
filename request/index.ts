import { logger } from '@utils/logger';
import { message } from 'antd';
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import {
  BusinessError,
  type CustomRequestConfig,
  type ErrorHandler,
  type HttpResponse,
  type InferResponse,
  type RequestInstanceConfig,
  type RequestInterceptor,
} from './types';

/**
 * HTTP 请求类
 *
 * @description
 * 基于 Axios 封装的 HTTP 请求类，提供以下功能：
 * - 🔐 **自定义认证**: 支持通过 requestInterceptor 添加 Token 和请求头
 * - 📦 **智能解包**: 自动解包 `{ code, data, message }` 格式的响应
 * - 🚨 **统一错误处理**: 支持自定义错误处理器链，自动显示错误提示
 * - 🎯 **类型安全**: 完整的 TypeScript 类型推导支持
 * - 🔧 **高度可定制**: 支持实例级和请求级配置覆盖
 * - 🚀 **便捷方法**: 提供 get、post、put、patch、delete 便捷方法
 *
 * @template DefaultReturnData - 实例级别的 returnData 默认值
 *
 * @example
 * ```typescript
 * // 1. 基础用法 - 创建默认实例
 * const api = new Request({
 *   baseURL: 'https://api.example.com',
 *   returnData: true,
 *   timeout: 10000,
 * });
 *
 * // 使用便捷方法
 * const user = await api.get<User>('/user/1');
 * const users = await api.get<User[]>('/users', { page: 1, page_size: 10 });
 * const created = await api.post<User>('/users', { name: 'John' });
 * const updated = await api.put<User>('/users/1', { name: 'John Doe' });
 * await api.delete('/users/1');
 *
 * // 2. 创建自定义服务实例（如 Maybank）
 * const maybankService = new Request({
 *   baseURL: process.env.MAYBANK_API_URL,
 *   returnData: true,
 *   requestInterceptor: (config) => {
 *     // 确保 headers 存在
 *     config.headers = config.headers ?? {};
 *
 *     const token = getToken();
 *     if (token) {
 *       config.headers.Authorization = `Bearer ${token}`;
 *     }
 *     config.headers['X-Partner'] = 'maybank';
 *     return config;
 *   },
 * });
 *
 * // 3. 获取完整响应（包含 code、message 等）
 * const response = await api.get<User>('/user/1', {}, { returnData: false });
 * if (response.code === 0) {
 *   console.log(response.data);
 * }
 *
 * // 4. 使用通用 request 方法（适合复杂场景）
 * const result = await api.request<User>({
 *   method: 'POST',
 *   url: '/users',
 *   data: { name: 'John' },
 *   hideErrorTip: true,
 * });
 * ```
 */
export class Request<DefaultReturnData extends boolean = true> {
  /** axios 实例 */
  private instance: AxiosInstance;

  /** 实例级别的 returnData 默认值 */
  private defaultReturnData: DefaultReturnData;

  /** 自定义错误处理器列表 */
  private errorHandlers: ErrorHandler[] = [];

  /** 401 处理函数 */
  private onUnauthorized?: () => void;

  /** 是否显示默认错误提示 */
  private showDefaultMessage: boolean;

  /** 自定义消息展示函数 */
  private messageHandler: (msg: string) => void;

  /** 自定义请求拦截器 */
  private requestInterceptor?: RequestInterceptor;

  /**
   * 构造函数
   *
   * @param config - 请求配置，包含 baseURL、timeout、拦截器等选项
   *
   * @example
   * ```typescript
   * // 基础配置
   * const api = new Request({
   *   baseURL: 'https://api.example.com',
   *   returnData: true,
   *   timeout: 30000,
   * });
   *
   * // 完整配置示例
   * const corporateService = new Request({
   *   baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
   *   returnData: true,
   *   timeout: 10000,
   *
   *   // 自定义请求拦截器 - 添加认证信息
   *   requestInterceptor: (config) => {
   *     // 确保 headers 存在（TypeScript 类型安全）
   *     config.headers = config.headers ?? {};
   *
   *     const token = getToken();
   *     if (token) {
   *       config.headers.Authorization = `Bearer ${token}`;
   *     }
   *     config.headers['tenant-key'] = 'concierge-enterprise';
   *     config.headers['X-Request-Id'] = generateUUID();
   *     return config;
   *   },
   *
   *   // 401 未授权处理
   *   onUnauthorized: () => {
   *     localStorage.removeItem('token');
   *     window.location.href = '/login';
   *   },
   *
   *   // 错误处理配置
   *   defaultErrorHandler: {
   *     showMessage: true,
   *     messageHandler: (msg) => notification.error({ message: msg }),
   *   },
   * });
   * ```
   */
  constructor(
    config: RequestInstanceConfig & { returnData?: DefaultReturnData }
  ) {
    const {
      returnData = true as DefaultReturnData,
      onUnauthorized,
      defaultErrorHandler,
      requestInterceptor,
      ...axiosConfig
    } = config;

    this.defaultReturnData = returnData;
    this.onUnauthorized = onUnauthorized;
    this.showDefaultMessage = defaultErrorHandler?.showMessage ?? true;
    this.messageHandler = defaultErrorHandler?.messageHandler ?? message.error;
    this.requestInterceptor = requestInterceptor;

    // 创建 axios 实例
    this.instance = axios.create({
      timeout: 10000,
      ...axiosConfig,
    });

    // 初始化拦截器
    this.setupInterceptors();
  }

  /**
   * 注册自定义错误处理器
   *
   * @description
   * 处理器按注册顺序执行，返回 true 时阻止后续处理。
   * 可用于实现自定义的错误处理逻辑，如特定错误码的弹窗提示、跳转等。
   *
   * @param handler - 错误处理器对象
   * @returns 返回取消注册的函数
   *
   * @example
   * ```typescript
   * // 注册处理特定错误码的处理器
   * const unregister = api.registerErrorHandler({
   *   canHandle: (err) => err.code === 50001,
   *   handle: (err) => {
   *     Modal.confirm({
   *       title: '会话已过期',
   *       content: '请重新登录',
   *       onOk: () => router.push('/login'),
   *     });
   *     return true; // 阻止默认错误提示
   *   },
   * });
   *
   * // 注册网络错误处理器
   * api.registerErrorHandler({
   *   canHandle: (err) => err.isNetworkError,
   *   handle: (err) => {
   *     notification.error({
   *       message: '网络连接失败',
   *       description: '请检查您的网络连接后重试',
   *     });
   *     return true;
   *   },
   * });
   *
   * // 在组件卸载时取消注册
   * useEffect(() => {
   *   return () => unregister();
   * }, []);
   * ```
   */
  public registerErrorHandler(handler: ErrorHandler): () => void {
    this.errorHandlers.push(handler);
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index > -1) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // 执行自定义请求拦截器（如添加 headers）
        if (this.requestInterceptor) {
          const modifiedConfig = await this.requestInterceptor(config);
          Object.assign(config, modifiedConfig);
        }
        return config;
      },
      (error: AxiosError) => {
        logger.error('请求拦截器错误:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<HttpResponse>): any => {
        const config = response.config as CustomRequestConfig;
        const responseData = response.data;

        // 跳过业务检查（用于特殊接口）
        if (config.skipBusinessCheck) {
          return this.resolveReturnData(response, config);
        }

        // 检查业务状态码
        if (responseData?.code !== undefined && responseData.code !== 0) {
          const error = new BusinessError({
            code: responseData.code,
            message: responseData.message || 'Request failed',
            data: responseData.data,
            httpStatus: response.status,
          });

          // 执行错误处理
          this.handleError(error, config);

          return Promise.reject(error);
        }

        return this.resolveReturnData(response, config);
      },
      async (error: AxiosError) => {
        const config = error.config as CustomRequestConfig | undefined;
        const businessError = this.createBusinessError(error);

        // 执行错误处理
        await this.handleError(businessError, config);

        return Promise.reject(businessError);
      }
    );
  }

  /**
   * 根据配置决定返回数据格式
   */
  private resolveReturnData(
    response: AxiosResponse<HttpResponse>,
    config: CustomRequestConfig
  ): unknown {
    // 优先使用请求级配置，否则使用实例级配置
    const shouldReturnData = config.returnData ?? this.defaultReturnData;

    if (shouldReturnData) {
      // 返回 data 部分
      const responseData = response.data;
      if (
        responseData &&
        typeof responseData === 'object' &&
        'data' in responseData
      ) {
        return responseData.data;
      }
      return response.data;
    }

    // 返回完整响应
    return response.data;
  }

  /**
   * 创建业务错误对象
   */
  private createBusinessError(error: AxiosError): BusinessError {
    const isNetworkError = error.message?.includes('Network Error') ?? false;
    const isTimeoutError = error.message?.includes('timeout') ?? false;

    let code = -1;
    let errorMessage = 'Unknown error';
    let httpStatus: number | undefined;

    if (error.response) {
      httpStatus = error.response.status;
      code = httpStatus;

      // 根据 HTTP 状态码设置错误消息
      switch (httpStatus) {
        case 400:
          errorMessage = 'Invalid request parameters';
          break;
        case 401:
          errorMessage = 'Unauthorized, please login again';
          this.handleUnauthorized();
          break;
        case 403:
          errorMessage = 'Access denied';
          break;
        case 404:
          errorMessage = 'Requested resource not found';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
        default:
          errorMessage = `Request error (${httpStatus})`;
      }

      // 优先使用后端返回的错误消息
      const responseData = error.response.data as
        | { message?: string }
        | undefined;
      if (responseData?.message) {
        errorMessage = responseData.message;
      }
    } else if (error.request) {
      errorMessage = 'No response from server';
    } else {
      errorMessage = error.message || 'Request failed';
    }

    // 特殊错误类型
    if (isNetworkError) {
      errorMessage = 'Network error, please check your connection';
    }
    if (isTimeoutError) {
      errorMessage = 'Request timed out, please try again later';
    }

    return new BusinessError({
      code,
      message: errorMessage,
      httpStatus,
      isNetworkError,
      isTimeoutError,
    });
  }

  /**
   * 处理 401 未授权
   * 注意：这里暂时不清除 storage，因为重新登录时会覆盖旧数据
   */
  private handleUnauthorized(): void {
    if (this.onUnauthorized) {
      this.onUnauthorized();
    } else {
      // 默认行为：跳转到登录页
      window.location.href = '/login';
    }
  }

  /**
   * 执行错误处理链
   */
  private async handleError(
    error: BusinessError,
    config?: CustomRequestConfig
  ): Promise<void> {
    // 如果配置了隐藏错误提示，直接返回
    if (config?.hideErrorTip) {
      return;
    }

    // 执行自定义错误处理器
    for (const handler of this.errorHandlers) {
      if (handler.canHandle(error)) {
        const shouldStop = await handler.handle(error);
        if (shouldStop) {
          return; // 阻止后续处理
        }
      }
    }

    // 默认错误处理：显示错误消息
    if (this.showDefaultMessage) {
      logger.error(`Request error: ${error.message}`);
      this.messageHandler(error.message);
    }
  }

  /**
   * 发送请求
   *
   * @description 通用请求方法，支持所有 HTTP 方法
   *
   * @template T - 响应数据类型
   * @template R - returnData 配置（可选，覆盖实例默认值）
   * @param config - 请求配置，包含 method、url、data/params 等
   * @returns Promise，解析为响应数据
   *
   * @example
   * ```typescript
   * // GET 请求
   * const user = await api.request<User>({
   *   method: 'GET',
   *   url: '/user/1',
   * });
   *
   * // POST 请求
   * const result = await api.request<CreateResult>({
   *   method: 'POST',
   *   url: '/users',
   *   data: { name: 'John', email: 'john@example.com' },
   * });
   *
   * // PUT 请求（完整更新）
   * const updatedUser = await api.request<User>({
   *   method: 'PUT',
   *   url: '/users/1',
   *   data: { id: 1, name: 'John Doe', email: 'john.new@example.com' },
   * });
   *
   * // PATCH 请求（部分更新）
   * const patchedUser = await api.request<User>({
   *   method: 'PATCH',
   *   url: '/users/1',
   *   data: { email: 'new.email@example.com' },
   * });
   *
   * // DELETE 请求
   * await api.request({ method: 'DELETE', url: '/users/1' });
   *
   * // 获取完整响应（包含 code、message）
   * const response = await api.request<User>({
   *   method: 'GET',
   *   url: '/user/1',
   *   returnData: false,
   * });
   * if (response.code === 0) {
   *   console.log('Success:', response.data);
   * }
   *
   * // 隐藏错误提示，自行处理
   * try {
   *   await api.request({
   *     method: 'POST',
   *     url: '/login',
   *     data: credentials,
   *     hideErrorTip: true,
   *   });
   * } catch (error) {
   *   if (error instanceof BusinessError) {
   *     showCustomErrorModal(error.message);
   *   }
   * }
   * ```
   */
  public request<T, R extends boolean = DefaultReturnData>(
    config: CustomRequestConfig & { returnData?: R }
  ): Promise<InferResponse<T, R>> {
    return this.instance.request(config) as Promise<InferResponse<T, R>>;
  }

  /**
   * GET 请求便捷方法
   *
   * @template T - 响应数据类型
   * @template R - returnData 配置
   * @param url - 请求 URL
   * @param params - URL 查询参数（支持任意对象类型）
   * @param config - 额外配置选项
   *
   * @example
   * ```typescript
   * // 简单 GET
   * const user = await api.get<User>('/user/1');
   *
   * // 带参数
   * const users = await api.get<User[]>('/users', { page: 1, page_size: 10 });
   *
   * // 自定义配置
   * const result = await api.get<User>('/user/1', {}, { hideErrorTip: true });
   * ```
   */
  public get<T, R extends boolean = DefaultReturnData>(
    url: string,
    params?: object,
    config?: Omit<CustomRequestConfig, 'url' | 'method' | 'params'> & {
      returnData?: R;
    }
  ): Promise<InferResponse<T, R>> {
    return this.request<T, R>({
      method: 'GET',
      url,
      params,
      ...config,
    } as CustomRequestConfig & { returnData?: R });
  }

  /**
   * POST 请求便捷方法
   *
   * @template T - 响应数据类型
   * @template R - returnData 配置
   * @param url - 请求 URL
   * @param data - 请求体数据
   * @param config - 额外配置选项
   *
   * @example
   * ```typescript
   * // 创建资源
   * const result = await api.post<CreateResult>('/users', {
   *   name: 'John',
   *   email: 'john@example.com',
   * });
   *
   * // 自定义配置
   * const loginResult = await api.post('/login', credentials, {
   *   hideErrorTip: true,
   * });
   * ```
   */
  public post<T, R extends boolean = DefaultReturnData>(
    url: string,
    data?: unknown,
    config?: Omit<CustomRequestConfig, 'url' | 'method' | 'data'> & {
      returnData?: R;
    }
  ): Promise<InferResponse<T, R>> {
    return this.request<T, R>({
      method: 'POST',
      url,
      data,
      ...config,
    } as CustomRequestConfig & { returnData?: R });
  }

  /**
   * PUT 请求便捷方法（完整更新）
   *
   * @template T - 响应数据类型
   * @template R - returnData 配置
   * @param url - 请求 URL
   * @param data - 请求体数据
   * @param config - 额外配置选项
   *
   * @example
   * ```typescript
   * const updatedUser = await api.put<User>('/users/1', {
   *   id: 1,
   *   name: 'John Doe',
   *   email: 'john@example.com',
   * });
   * ```
   */
  public put<T, R extends boolean = DefaultReturnData>(
    url: string,
    data?: unknown,
    config?: Omit<CustomRequestConfig, 'url' | 'method' | 'data'> & {
      returnData?: R;
    }
  ): Promise<InferResponse<T, R>> {
    return this.request<T, R>({
      method: 'PUT',
      url,
      data,
      ...config,
    } as CustomRequestConfig & { returnData?: R });
  }

  /**
   * PATCH 请求便捷方法（部分更新）
   *
   * @template T - 响应数据类型
   * @template R - returnData 配置
   * @param url - 请求 URL
   * @param data - 请求体数据
   * @param config - 额外配置选项
   *
   * @example
   * ```typescript
   * const patchedUser = await api.patch<User>('/users/1', {
   *   email: 'new.email@example.com',
   * });
   * ```
   */
  public patch<T, R extends boolean = DefaultReturnData>(
    url: string,
    data?: unknown,
    config?: Omit<CustomRequestConfig, 'url' | 'method' | 'data'> & {
      returnData?: R;
    }
  ): Promise<InferResponse<T, R>> {
    return this.request<T, R>({
      method: 'PATCH',
      url,
      data,
      ...config,
    } as CustomRequestConfig & { returnData?: R });
  }

  /**
   * DELETE 请求便捷方法
   *
   * @template T - 响应数据类型
   * @template R - returnData 配置
   * @param url - 请求 URL
   * @param config - 额外配置选项
   *
   * @example
   * ```typescript
   * // 删除资源
   * await api.delete('/users/1');
   *
   * // 带响应数据
   * const result = await api.delete<{ deleted: boolean }>('/users/1');
   * ```
   */
  public delete<T, R extends boolean = DefaultReturnData>(
    url: string,
    config?: Omit<CustomRequestConfig, 'url' | 'method'> & { returnData?: R }
  ): Promise<InferResponse<T, R>> {
    return this.request<T, R>({
      method: 'DELETE',
      url,
      ...config,
    } as CustomRequestConfig & { returnData?: R });
  }

  /**
   * 静态工厂方法
   *
   * @description 创建具有特定配置的 Request 实例
   *
   * @template R - 是否只返回数据部分
   * @param config - 自定义配置
   * @returns 新的 Request 实例
   *
   * @example
   * ```typescript
   * // 创建返回数据的实例（默认）
   * const api = Request.create({
   *   baseURL: 'https://api.example.com',
   *   returnData: true,
   * });
   *
   * // 创建返回完整响应的实例
   * const apiWithResponse = Request.create({
   *   baseURL: 'https://api.example.com',
   *   returnData: false,
   * });
   *
   * // 创建带自定义配置的实例
   * const maybankApi = Request.create({
   *   baseURL: process.env.MAYBANK_API_URL,
   *   returnData: true,
   *   requestInterceptor: (config) => {
   *     // 确保 headers 存在（TypeScript 类型安全）
   *     config.headers = config.headers ?? {};
   *
   *     config.headers.Authorization = `Bearer ${getToken()}`;
   *     config.headers['X-Partner'] = 'maybank';
   *     return config;
   *   },
   *   onUnauthorized: () => {
   *     removeToken();
   *     router.push('/login');
   *   },
   * });
   * ```
   */
  public static create<R extends boolean = true>(
    config: RequestInstanceConfig & { returnData?: R }
  ): Request<R> {
    return new Request<R>(config as RequestInstanceConfig & { returnData: R });
  }
}

export default Request;

// 重新导出类型，方便外部使用
export {
  BusinessError,
  type CustomRequestConfig,
  type ErrorHandler,
  type HttpResponse,
  type InferResponse,
  type PaginatedData,
  type Pagination,
  type PaginationParams,
  type RequestInstanceConfig,
  type RequestInterceptor,
} from './types';
