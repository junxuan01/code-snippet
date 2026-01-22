/**
 * HTTP 请求类
 *
 * @description
 * 基于 Axios 封装的 HTTP 请求类，提供以下功能：
 * - 🔐 **自定义认证**: 支持通过 requestInterceptor 添加 Token 和请求头
 * - 📦 **智能解包**: 自动解包 `{ code, data, message }` 格式的响应
 * - 🚨 **统一错误处理**: 支持自定义错误处理器链
 * - 🎯 **类型安全**: 完整的 TypeScript 类型推导支持
 * - 🔧 **高度可定制**: 支持实例级和请求级配置覆盖
 * - 🚀 **便捷方法**: 提供 get、post、put、patch、delete 便捷方法
 *
 * @template DefaultReturnData - 实例级别的 returnData 默认值
 *
 * @example
 * ```typescript
 * // 创建实例
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
 * ```
 */
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import {
  BusinessError,
  createBusinessErrorFromAxios,
  createBusinessErrorFromResponse,
  ErrorHandlerManager,
} from '../errors';
import type {
  CustomRequestConfig,
  ErrorHandler,
  HttpResponse,
  InferResponse,
  RequestInstanceConfig,
  RequestInterceptor,
} from '../types';

export class Request<DefaultReturnData extends boolean = true> {
  /** axios 实例 */
  private readonly instance: AxiosInstance;

  /** 实例级别的 returnData 默认值 */
  private readonly defaultReturnData: DefaultReturnData;

  /** 错误处理器管理器 */
  private readonly errorManager: ErrorHandlerManager;

  /** 401 处理函数 */
  private readonly onUnauthorized?: () => void;

  /** 自定义请求拦截器 */
  private readonly requestInterceptor?: RequestInterceptor;

  /**
   * 构造函数
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
    this.requestInterceptor = requestInterceptor;
    this.errorManager = new ErrorHandlerManager(defaultErrorHandler);

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
   */
  public registerErrorHandler(handler: ErrorHandler): () => void {
    return this.errorManager.register(handler);
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (this.requestInterceptor) {
          const modifiedConfig = await this.requestInterceptor(config);
          Object.assign(config, modifiedConfig);
        }
        return config;
      },
      (error: AxiosError) => {
        console.error('Request interceptor error:', error);
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
          const error = createBusinessErrorFromResponse(
            responseData.code,
            responseData.message,
            responseData.data,
            response.status
          );

          // 执行错误处理
          this.errorManager.handle(error, config.hideErrorTip);

          return Promise.reject(error);
        }

        return this.resolveReturnData(response, config);
      },
      async (error: AxiosError) => {
        const config = error.config as CustomRequestConfig | undefined;
        const businessError = createBusinessErrorFromAxios(error);

        // 处理 401 未授权
        if (businessError.httpStatus === 401) {
          this.handleUnauthorized();
        }

        // 执行错误处理
        await this.errorManager.handle(businessError, config?.hideErrorTip);

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
    const shouldReturnData = config.returnData ?? this.defaultReturnData;

    if (shouldReturnData) {
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

    return response.data;
  }

  /**
   * 处理 401 未授权
   */
  private handleUnauthorized(): void {
    if (this.onUnauthorized) {
      this.onUnauthorized();
    } else if (typeof globalThis !== 'undefined' && 'location' in globalThis) {
      (globalThis as any).location.href = '/login';
    }
  }

  /**
   * 发送请求
   */
  public request<T, R extends boolean = DefaultReturnData>(
    config: CustomRequestConfig & { returnData?: R }
  ): Promise<InferResponse<T, R>> {
    return this.instance.request(config) as Promise<InferResponse<T, R>>;
  }

  /**
   * GET 请求
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
   * POST 请求
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
   * PUT 请求
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
   * PATCH 请求
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
   * DELETE 请求
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
   */
  public static create<R extends boolean = true>(
    config: RequestInstanceConfig & { returnData?: R }
  ): Request<R> {
    return new Request<R>(config as RequestInstanceConfig & { returnData: R });
  }
}
