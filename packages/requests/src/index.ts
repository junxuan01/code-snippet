/**
 * @code-snippet/requests
 *
 * 基于 Axios 封装的 TypeScript HTTP 请求库
 */

// 核心类
export { Request, Request as default } from './core';

// 错误类
export { BusinessError, ErrorHandlerManager } from './errors';

// 类型导出
export type {
  BusinessErrorOptions,
  // 请求配置类型
  CustomRequestConfig,
  DefaultErrorHandlerConfig,
  // 错误类型
  ErrorHandler,
  // 响应类型
  HttpResponse,
  InferResponse,
  PaginatedData,
  Pagination,
  PaginationParams,
  RequestInstanceConfig,
  RequestInterceptor,
} from './types';
