/**
 * 响应相关类型定义
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
 */
export interface PaginatedData<T> {
  /** 数据列表 */
  list: T[];
  /** 分页信息 */
  pagination: Pagination;
}

/**
 * 分页请求参数
 *
 * @description 用于列表接口的分页参数
 */
export interface PaginationParams {
  /** 页码，从 1 开始 */
  page?: number;
  /** 每页数量 */
  page_size?: number;
}

/**
 * 根据 returnData 配置推导返回类型
 *
 * @template T - 响应数据类型
 * @template R - returnData 配置值，默认 true
 */
export type InferResponse<T, R extends boolean = true> = R extends false
  ? HttpResponse<T>
  : T;
