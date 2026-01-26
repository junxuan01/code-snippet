/**
 * HTTP 请求类
 *
 * @description
 * 基于 Axios 封装的 HTTP 请求类，提供以下功能：
 * - 🔐 **自定义认证**: 支持通过 requestInterceptor 添加 Token 和请求头
 * - 📦 **智能解包**: 自动解包响应数据，支持自定义响应格式
 * - 🚨 **统一错误处理**: 支持自定义错误处理器链
 * - 🎯 **类型安全**: 完整的 TypeScript 类型推导支持
 * - 🔧 **高度可定制**: 支持实例级和请求级配置覆盖
 * - 🚀 **便捷方法**: 提供 get、post、put、patch、delete 便捷方法
 * - 🌍 **i18n 支持**: 错误消息可自定义，支持国际化
 *
 * @example
 * ```typescript
 * // 创建实例（使用默认响应格式 { code, data, message }）
 * const api = new Request({
 *   baseURL: 'https://api.example.com',
 *   timeout: 10000,
 * });
 *
 * // 自定义响应格式
 * const api = new Request({
 *   baseURL: 'https://api.example.com',
 *   responseParser: {
 *     isSuccess: (res) => res.status === 'ok',
 *     getData: (res) => res.result,
 *     getMessage: (res) => res.error || 'success',
 *     getCode: (res) => res.status === 'ok' ? 0 : -1,
 *   },
 * });
 *
 * // 使用便捷方法
 * const user = await api.get<User>('/user/1');
 * const users = await api.get<User[]>('/users', { page: 1, pageSize: 10 });
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
  createBusinessErrorFromAxios,
  createBusinessErrorFromResponse,
  ErrorHandlerManager,
} from '../errors';
import type {
  CustomRequestConfig,
  ErrorHandler,
  HttpErrorMessages,
  RequestInstanceConfig,
  RequestInterceptor,
} from '../types';
import { defaultResponseParser, type ResponseParser } from '../types/response';

/**
 * HTTP 请求类
 */
export class Request {
  /** axios 实例 */
  private readonly _axios: AxiosInstance;

  /** 是否默认返回解包数据 */
  private readonly defaultReturnData: boolean;

  /** 错误处理器管理器 */
  private readonly errorManager: ErrorHandlerManager;

  /** 401 处理函数 */
  private readonly onUnauthorized?: () => void;

  /** 自定义请求拦截器 */
  private readonly requestInterceptor?: RequestInterceptor;

  /** 响应解析器 */
  private readonly responseParser: ResponseParser<any>;

  /** 自定义错误消息 */
  private readonly errorMessages?: HttpErrorMessages;

  /**
   * 获取底层 axios 实例
   * @description 用于高级配置场景，如添加额外拦截器
   */
  public get axios(): AxiosInstance {
    return this._axios;
  }

  /**
   * 构造函数
   */
  constructor(config: RequestInstanceConfig = {}) {
    const {
      returnData = true,
      onUnauthorized,
      defaultErrorHandler,
      requestInterceptor,
      responseParser = defaultResponseParser,
      errorMessages,
      ...axiosConfig
    } = config;

    this.defaultReturnData = returnData;
    this.onUnauthorized = onUnauthorized;
    this.requestInterceptor = requestInterceptor;
    this.responseParser = responseParser;
    this.errorMessages = errorMessages;
    this.errorManager = new ErrorHandlerManager(defaultErrorHandler);

    // 创建 axios 实例
    this._axios = axios.create({
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
    this._axios.interceptors.request.use(
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
    this._axios.interceptors.response.use(
      (response: AxiosResponse): AxiosResponse | Promise<never> => {
        const config = response.config as CustomRequestConfig;
        const responseData = response.data;

        // 跳过业务检查（用于特殊接口或第三方 API）
        if (config.skipBusinessCheck) {
          return this.resolveReturnData(response, config);
        }

        // 使用响应解析器检查业务状态
        if (responseData !== null && responseData !== undefined) {
          const isSuccess = this.responseParser.isSuccess(responseData);

          if (!isSuccess) {
            const code = this.responseParser.getCode(responseData);
            const message = this.responseParser.getMessage(responseData);
            const data = this.responseParser.getData(responseData);

            const error = createBusinessErrorFromResponse(
              code,
              message,
              data,
              response.status
            );

            // 执行错误处理
            this.errorManager.handle(error, config.hideErrorTip);

            return Promise.reject(error);
          }
        }

        return this.resolveReturnData(response, config);
      },
      async (error: AxiosError) => {
        const config = error.config as CustomRequestConfig | undefined;
        const businessError = createBusinessErrorFromAxios(
          error,
          this.errorMessages
        );

        // 处理 401 未授权
        if (businessError.httpStatus === 401 && this.onUnauthorized) {
          this.onUnauthorized();
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
    response: AxiosResponse,
    config: CustomRequestConfig
  ): any {
    const shouldReturnData = config.returnData ?? this.defaultReturnData;

    if (shouldReturnData) {
      const responseData = response.data;
      // 尝试使用解析器提取数据
      if (responseData !== null && responseData !== undefined) {
        try {
          return this.responseParser.getData(responseData);
        } catch {
          // 如果解析失败，返回原始数据
          return responseData;
        }
      }
      return responseData;
    }

    return response.data;
  }

  /**
   * 发送请求
   *
   * @template T - 期望返回的数据类型
   * @template Raw - 是否返回原始响应（returnData: false）
   */
  public request<T, Raw extends boolean = false>(
    config: CustomRequestConfig & { returnData?: Raw }
  ): Promise<Raw extends true ? unknown : T> {
    return this._axios.request(config) as Promise<
      Raw extends true ? unknown : T
    >;
  }

  /**
   * GET 请求
   */
  public get<T, Raw extends boolean = false>(
    url: string,
    params?: object,
    config?: Omit<CustomRequestConfig, 'url' | 'method' | 'params'> & {
      returnData?: Raw;
    }
  ): Promise<Raw extends true ? unknown : T> {
    return this.request<T, Raw>({
      method: 'GET',
      url,
      params,
      ...config,
    } as CustomRequestConfig & { returnData?: Raw });
  }

  /**
   * POST 请求
   */
  public post<T, Raw extends boolean = false>(
    url: string,
    data?: unknown,
    config?: Omit<CustomRequestConfig, 'url' | 'method' | 'data'> & {
      returnData?: Raw;
    }
  ): Promise<Raw extends true ? unknown : T> {
    return this.request<T, Raw>({
      method: 'POST',
      url,
      data,
      ...config,
    } as CustomRequestConfig & { returnData?: Raw });
  }

  /**
   * PUT 请求
   */
  public put<T, Raw extends boolean = false>(
    url: string,
    data?: unknown,
    config?: Omit<CustomRequestConfig, 'url' | 'method' | 'data'> & {
      returnData?: Raw;
    }
  ): Promise<Raw extends true ? unknown : T> {
    return this.request<T, Raw>({
      method: 'PUT',
      url,
      data,
      ...config,
    } as CustomRequestConfig & { returnData?: Raw });
  }

  /**
   * PATCH 请求
   */
  public patch<T, Raw extends boolean = false>(
    url: string,
    data?: unknown,
    config?: Omit<CustomRequestConfig, 'url' | 'method' | 'data'> & {
      returnData?: Raw;
    }
  ): Promise<Raw extends true ? unknown : T> {
    return this.request<T, Raw>({
      method: 'PATCH',
      url,
      data,
      ...config,
    } as CustomRequestConfig & { returnData?: Raw });
  }

  /**
   * DELETE 请求
   */
  public delete<T, Raw extends boolean = false>(
    url: string,
    config?: Omit<CustomRequestConfig, 'url' | 'method'> & { returnData?: Raw }
  ): Promise<Raw extends true ? unknown : T> {
    return this.request<T, Raw>({
      method: 'DELETE',
      url,
      ...config,
    } as CustomRequestConfig & { returnData?: Raw });
  }

  /**
   * 静态工厂方法
   */
  public static create(config: RequestInstanceConfig = {}): Request {
    return new Request(config);
  }
}
