/**
 * 类型定义统一导出
 */

// 请求配置相关类型
export type {
  CustomRequestConfig,
  HttpErrorMessages,
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
  DefaultHttpResponse,
  DefaultPaginatedData,
  DefaultPagination,
  DefaultPaginationParams,
  HttpResponse,
  PaginatedData,
  Pagination,
  PaginationParams,
  ResponseParser,
} from './response';

// 导出默认解析器
export { defaultResponseParser } from './response';
