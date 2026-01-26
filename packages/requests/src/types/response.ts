/**
 * 响应相关类型定义
 *
 * @description
 * 提供灵活的响应结构定义，支持用户自定义响应格式。
 * 默认提供常见的 { code, data, message } 格式作为参考实现。
 */

/**
 * 默认的 HTTP 响应结构
 *
 * @description
 * 这是一个常见的后端响应格式，用户可以根据自己项目的实际情况
 * 定义自己的响应结构，并通过 ResponseParser 告诉 Request 如何解析。
 *
 * @template T - 响应数据的类型
 *
 * @example
 * ```typescript
 * // 如果你的后端返回这种格式，可以直接使用
 * {
 *   "code": 0,
 *   "message": "success",
 *   "data": { "id": 1, "name": "John" }
 * }
 * ```
 */
export interface DefaultHttpResponse<T = unknown> {
  /** 业务状态码，0 表示成功，其他值表示错误 */
  code: number;
  /** 响应数据 */
  data: T;
  /** 响应消息，成功时通常为 "success" */
  message: string;
}

/**
 * @deprecated 使用 DefaultHttpResponse 代替，此别名保留用于向后兼容
 */
export type HttpResponse<T = unknown> = DefaultHttpResponse<T>;

/**
 * 响应解析器
 *
 * @description
 * 定义如何解析后端响应，支持各种不同的响应格式。
 * 用户可以根据自己项目的 API 规范实现此接口。
 *
 * @template TResponse - 原始响应类型
 *
 * @example
 * ```typescript
 * // 示例：解析 { code, data, msg } 格式
 * const parser: ResponseParser = {
 *   isSuccess: (res) => res.code === 0,
 *   getData: (res) => res.data,
 *   getMessage: (res) => res.msg,
 *   getCode: (res) => res.code,
 * };
 *
 * // 示例：解析 { status, result, error } 格式
 * const parser: ResponseParser = {
 *   isSuccess: (res) => res.status === 'success',
 *   getData: (res) => res.result,
 *   getMessage: (res) => res.error || 'success',
 *   getCode: (res) => res.status === 'success' ? 0 : -1,
 * };
 * ```
 */
export interface ResponseParser<TResponse = unknown> {
  /**
   * 判断响应是否成功
   * @param response - 原始响应数据
   * @returns 是否成功
   */
  isSuccess: (response: TResponse) => boolean;

  /**
   * 提取响应中的数据
   * @param response - 原始响应数据
   * @returns 实际的业务数据
   */
  getData: (response: TResponse) => unknown;

  /**
   * 提取响应中的消息
   * @param response - 原始响应数据
   * @returns 响应消息
   */
  getMessage: (response: TResponse) => string;

  /**
   * 提取响应中的业务码
   * @param response - 原始响应数据
   * @returns 业务状态码
   */
  getCode: (response: TResponse) => number | string;
}

/**
 * 默认响应解析器
 *
 * @description 适用于 { code: 0, data: T, message: string } 格式的响应
 */
export const defaultResponseParser: ResponseParser<DefaultHttpResponse> = {
  isSuccess: res => res.code === 0,
  getData: res => res.data,
  getMessage: res => res.message,
  getCode: res => res.code,
};

/**
 * 默认分页数据结构
 *
 * @description
 * 这是一个常见的分页结构，用户可以根据自己项目定义自己的分页类型。
 * 这些类型仅作为参考实现导出。
 */
export interface DefaultPagination {
  /** 当前页码，从 1 开始 */
  page: number;
  /** 每页数量 */
  pageSize: number;
  /** 数据总数量 */
  total: number;
  /** 总页数（可选） */
  totalPages?: number;
}

/**
 * @deprecated 使用 DefaultPagination 代替，此别名保留用于向后兼容
 */
export type Pagination = DefaultPagination;

/**
 * 默认分页响应数据
 *
 * @template T - 列表项的类型
 */
export interface DefaultPaginatedData<T> {
  /** 数据列表 */
  list: T[];
  /** 分页信息 */
  pagination: DefaultPagination;
}

/**
 * @deprecated 使用 DefaultPaginatedData 代替，此别名保留用于向后兼容
 */
export type PaginatedData<T> = DefaultPaginatedData<T>;

/**
 * 默认分页请求参数
 */
export interface DefaultPaginationParams {
  /** 页码，从 1 开始 */
  page?: number;
  /** 每页数量 */
  pageSize?: number;
}

/**
 * @deprecated 使用 DefaultPaginationParams 代替，此别名保留用于向后兼容
 */
export type PaginationParams = DefaultPaginationParams;
