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
  /** 业务状态码，支持数字或字符串 */
  readonly code: number | string;
  /** 原始响应数据 */
  readonly data?: unknown;
  /** HTTP 状态码 */
  readonly httpStatus?: number;
  /** 是否为网络错误 */
  readonly isNetworkError: boolean;
  /** 是否为超时错误 */
  readonly isTimeoutError: boolean;

  constructor(options: {
    code: number | string;
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

    // 保持正确的原型链
    Object.setPrototypeOf(this, BusinessError.prototype);
  }

  /**
   * 转换为 JSON 格式（便于日志记录）
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      data: this.data,
      httpStatus: this.httpStatus,
      isNetworkError: this.isNetworkError,
      isTimeoutError: this.isTimeoutError,
    };
  }
}
