/**
 * 类型定义统一导出
 */

// 请求配置相关类型
export type {
  CustomRequestConfig,
  RequestInstanceConfig,
  RequestInterceptor,
} from './config';
// 错误相关类型
export type {
  BusinessErrorOptions,
  DefaultErrorHandlerConfig,
  ErrorHandler,
} from './error';
// 响应相关类型
export type {
  HttpResponse,
  InferResponse,
  PaginatedData,
  Pagination,
  PaginationParams,
} from './response';
