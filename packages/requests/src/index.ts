/**
 * @code-snippet/requests
 *
 * 基于 Axios 封装的 TypeScript HTTP 请求库
 */

// 核心类
export { Request, Request as default } from './core';

// 错误类
export {
  BusinessError,
  DEFAULT_HTTP_ERROR_MESSAGES,
  ErrorHandlerManager,
} from './errors';
// 类型导出
export type {
  BusinessErrorOptions,
  // 请求配置类型
  CustomRequestConfig,
  DefaultErrorHandlerConfig,
  // 响应类型（新版本命名）
  DefaultHttpResponse,
  DefaultPaginatedData,
  DefaultPagination,
  DefaultPaginationParams,
  // 错误类型
  ErrorHandler,
  // 自定义错误消息
  HttpErrorMessages,
  // 响应类型（向后兼容别名）
  HttpResponse,
  PaginatedData,
  Pagination,
  PaginationParams,
  RequestInstanceConfig,
  RequestInterceptor,
  // 响应解析器
  ResponseParser,
} from './types';
// 默认解析器
export { defaultResponseParser } from './types';
