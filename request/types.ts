import type { AxiosRequestConfig } from 'axios';

/**
 * ========================================
 * 响应类型定义
 * ========================================
 */

/**
 * 标准 HTTP 响应结构
 *
 * @description 后端返回的统一格式，所有 API 响应都遵循此结构
 *
 * @template T - 响应数据的类型
 *
 * @example
 * ```typescript
 * // 后端返回示例
 * {
 *   "code": 0,
 *   "message": "success",
 *   "data": { "id": 1, "name": "John" }
 * }
 *
 * // TypeScript 使用
 * interface User {
 *   id: number;
 *   name: string;
 * }
 * const response: HttpResponse<User> = await api.get('/user/1');
 * console.log(response.data.name); // "John"
 * ```
 */
export interface HttpResponse<T = unknown> {
  /** 业务状态码，0 表示成功，其他值表示错误 */
  code: number;
  /** 响应数据 */
  data: T;
  /** 响应消息，成功时通常为 "success" */
  message: string;
}

/**
 * 分页数据结构
 *
 * @description 用于分页接口的分页信息
 *
 * @example
 * ```typescript
 * const pagination: Pagination = {
 *   page: 1,
 *   page_size: 10,
 *   total: 100,
 *   total_pages: 10
 * };
 * ```
 */
export interface Pagination {
  /** 当前页码，从 1 开始 */
  page: number;
  /** 每页数量 */
  page_size: number;
  /** 数据总数量 */
  total: number;
  /** 总页数（可选） */
  total_pages?: number;
}

/**
 * 分页响应数据
 *
 * @description 用于列表接口的分页响应结构
 *
 * @template T - 列表项的类型
 *
 * @example
 * ```typescript
 * // 获取用户列表
 * const result = await api.get<PaginatedData<User>>('/users', { page: 1, page_size: 10 });
 * console.log(result.list);        // User[]
 * console.log(result.pagination);  // Pagination
 * ```
 */
export interface PaginatedData<T> {
  /** 数据列表 */
  list: T[];
  /** 分页信息 */
  pagination: Pagination;
}

/**
 * ========================================
 * 错误类型定义
 * ========================================
 */

/**
 * 业务错误类
 *
 * @description
 * 统一的错误类，封装了业务错误、HTTP 错误、网络错误等。
 * 便于在错误处理器中进行统一处理。
 *
 * @example
 * ```typescript
 * try {
 *   await api.get('/user/1');
 * } catch (error) {
 *   if (error instanceof BusinessError) {
 *     console.log('业务错误码:', error.code);
 *     console.log('错误消息:', error.message);
 *
 *     if (error.isNetworkError) {
 *       console.log('网络错误');
 *     }
 *     if (error.isTimeoutError) {
 *       console.log('请求超时');
 *     }
 *   }
 * }
 * ```
 */
export class BusinessError extends Error {
  /** 业务状态码 */
  code: number;
  /** 原始响应数据 */
  data?: unknown;
  /** HTTP 状态码 */
  httpStatus?: number;
  /** 是否为网络错误 */
  isNetworkError: boolean;
  /** 是否为超时错误 */
  isTimeoutError: boolean;

  constructor(options: {
    code: number;
    message: string;
    data?: unknown;
    httpStatus?: number;
    isNetworkError?: boolean;
    isTimeoutError?: boolean;
  }) {
    super(options.message);
    this.name = 'BusinessError';
    this.code = options.code;
    this.data = options.data;
    this.httpStatus = options.httpStatus;
    this.isNetworkError = options.isNetworkError ?? false;
    this.isTimeoutError = options.isTimeoutError ?? false;
  }
}

/**
 * ========================================
 * 错误处理器类型定义
 * ========================================
 */

/**
 * 错误处理器接口
 *
 * @description
 * 支持自定义错误处理逻辑，可以注册多个处理器形成处理链。
 * 处理器按注册顺序执行，返回 true 时阻止后续处理。
 *
 * @example
 * ```typescript
 * // 注册自定义错误处理器
 * const unregister = api.registerErrorHandler({
 *   canHandle: (error) => error.code === 50001, // 只处理特定错误码
 *   handle: (error) => {
 *     Modal.confirm({
 *       title: '会话已过期',
 *       content: '请重新登录',
 *       onOk: () => router.push('/login'),
 *     });
 *     return true; // 阻止默认错误提示
 *   },
 * });
 *
 * // 取消注册
 * unregister();
 * ```
 */
export interface ErrorHandler {
  /**
   * 判断是否处理该错误
   * @param error - 业务错误
   * @returns 返回 true 表示该处理器会处理此错误
   */
  canHandle: (error: BusinessError) => boolean;

  /**
   * 处理错误
   * @param error - 业务错误
   * @returns 返回 true 表示阻止后续处理器和默认处理
   */
  handle: (
    error: BusinessError
  ) => boolean | undefined | Promise<boolean | undefined>;
}

/**
 * 默认错误处理器配置
 *
 * @description 配置默认的错误提示行为
 *
 * @example
 * ```typescript
 * const api = new Request({
 *   baseURL: '/api',
 *   returnData: true,
 *   defaultErrorHandler: {
 *     showMessage: true,
 *     messageHandler: (msg) => notification.error({ message: msg }),
 *   },
 * });
 * ```
 */
export interface DefaultErrorHandlerConfig {
  /** 是否显示错误提示，默认 true */
  showMessage?: boolean;
  /** 自定义消息展示函数，默认使用 antd message.error */
  messageHandler?: (message: string) => void;
}

/**
 * ========================================
 * 请求配置类型定义
 * ========================================
 */

/**
 * 自定义请求配置
 *
 * @description 扩展 AxiosRequestConfig，添加业务相关的配置选项
 *
 * @example
 * ```typescript
 * // 基础请求
 * await api.get<User>('/user/1');
 *
 * // 自定义配置
 * await api.get<User>('/user/1', {}, {
 *   hideErrorTip: true,     // 隐藏错误提示
 *   returnData: false,      // 返回完整响应
 *   skipBusinessCheck: true // 跳过业务码检查
 * });
 * ```
 */
export interface CustomRequestConfig extends AxiosRequestConfig {
  /**
   * 是否只返回 data 字段
   * @default true (实例默认值)
   *
   * @description
   * - `true`: 返回 `response.data.data`，类型为 T
   * - `false`: 返回完整 `HttpResponse<T>`
   *
   * @example
   * ```typescript
   * // returnData: true (默认)
   * const user = await api.get<User>('/user/1');
   * // user 类型为 User
   *
   * // returnData: false
   * const response = await api.get<User>('/user/1', {}, { returnData: false });
   * // response 类型为 HttpResponse<User>
   * console.log(response.code, response.message, response.data);
   * ```
   */
  returnData?: boolean;

  /**
   * 是否隐藏错误提示
   * @default false
   *
   * @description
   * - `true`: 不显示全局错误提示，适合自行处理错误的场景
   * - `false`: 显示全局错误提示
   *
   * @example
   * ```typescript
   * // 隐藏错误提示，自行处理
   * try {
   *   await api.post('/login', credentials, { hideErrorTip: true });
   * } catch (error) {
   *   if (error instanceof BusinessError) {
   *     showCustomErrorModal(error.message);
   *   }
   * }
   * ```
   */
  hideErrorTip?: boolean;

  /**
   * 是否跳过业务错误检查
   * @default false
   *
   * @description
   * - `true`: 不检查 code !== 0，直接返回数据（用于特殊接口）
   * - `false`: 检查 code，非 0 时抛出 BusinessError
   *
   * @example
   * ```typescript
   * // 某些接口返回非标准格式
   * const data = await api.get('/third-party/api', {}, {
   *   skipBusinessCheck: true
   * });
   * ```
   */
  skipBusinessCheck?: boolean;
}

/**
 * 请求拦截器函数
 *
 * @description 用于在发送请求前修改配置，如添加 headers、token 等
 *
 * @example
 * ```typescript
 * const requestInterceptor: RequestInterceptor = (config) => {
 *   // 确保 headers 存在（TypeScript 类型安全）
 *   config.headers = config.headers ?? {};
 *
 *   // 添加认证 token
 *   const token = localStorage.getItem('token');
 *   if (token) {
 *     config.headers.Authorization = `Bearer ${token}`;
 *   }
 *
 *   // 添加自定义请求头
 *   config.headers['X-Partner'] = 'maybank';
 *   config.headers['X-Request-Id'] = generateUUID();
 *
 *   return config;
 * };
 * ```
 */
export type RequestInterceptor = (
  config: AxiosRequestConfig
) => AxiosRequestConfig | Promise<AxiosRequestConfig>;

/**
 * Request 实例配置
 *
 * @description 创建 Request 实例时的完整配置选项
 *
 * @example
 * ```typescript
 * // 创建自定义 API 实例
 * const maybankApi = new Request({
 *   baseURL: process.env.MAYBANK_API_URL,
 *   returnData: true,
 *   timeout: 30000,
 *
 *   // 自定义请求拦截器
 *   requestInterceptor: (config) => {
 *     // 确保 headers 存在（TypeScript 类型安全）
 *     config.headers = config.headers ?? {};
 *
 *     config.headers.Authorization = `Bearer ${getToken()}`;
 *     config.headers['X-Partner'] = 'maybank';
 *     return config;
 *   },
 *
 *   // 401 未授权处理
 *   onUnauthorized: () => {
 *     localStorage.removeItem('token');
 *     router.push('/login');
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
export interface RequestInstanceConfig extends CustomRequestConfig {
  /**
   * 是否只返回 data 字段（实例级别默认值）
   * @default true
   */
  returnData?: boolean;

  /**
   * 401 未授权时的处理函数
   * @description 不提供时默认跳转到 /login
   */
  onUnauthorized?: () => void;

  /** 默认错误处理器配置 */
  defaultErrorHandler?: DefaultErrorHandlerConfig;

  /**
   * 自定义请求拦截器
   * @description 用于添加 headers、token 等
   */
  requestInterceptor?: RequestInterceptor;
}

/**
 * ========================================
 * 类型推导工具类型
 * ========================================
 */

/**
 * 根据 returnData 配置推导返回类型
 *
 * @description
 * TypeScript 条件类型，用于根据 `returnData` 参数自动推导 API 方法的返回类型。
 * 这使得 IDE 能够提供准确的类型提示和自动补全。
 *
 * @template T - 响应数据类型
 * @template R - returnData 配置值，默认 true
 *
 * @example
 * ```typescript
 * // returnData: true (默认)
 * type Result1 = InferResponse<User, true>;  // User
 *
 * // returnData: false
 * type Result2 = InferResponse<User, false>; // HttpResponse<User>
 *
 * // 实际使用
 * const api = new Request({ baseURL: '/api', returnData: true });
 *
 * // 自动推导为 User
 * const user = await api.get<User>('/user/1');
 *
 * // 通过配置覆盖，推导为 HttpResponse<User>
 * const response = await api.get<User>('/user/1', {}, { returnData: false });
 * ```
 */
export type InferResponse<T, R extends boolean = true> = R extends false
  ? HttpResponse<T>
  : T;

/**
 * 分页请求参数
 *
 * @description 用于列表接口的分页参数
 *
 * @example
 * ```typescript
 * // 获取分页用户列表
 * const params: PaginationParams = { page: 1, page_size: 10 };
 * const result = await api.get<PaginatedData<User>>('/users', params);
 * ```
 */
export interface PaginationParams {
  /** 页码，从 1 开始 */
  page?: number;
  /** 每页数量 */
  page_size?: number;
}
