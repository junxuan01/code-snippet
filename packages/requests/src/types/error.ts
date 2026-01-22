/**
 * 错误相关类型定义
 */
import type { BusinessError } from '../errors/business-error';

/**
 * 错误处理器接口
 *
 * @description
 * 支持自定义错误处理逻辑，可以注册多个处理器形成处理链。
 * 处理器按注册顺序执行，返回 true 时阻止后续处理。
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
 */
export interface DefaultErrorHandlerConfig {
  /** 是否显示错误提示，默认 true */
  showMessage?: boolean;
  /** 自定义消息展示函数，默认使用 console.error */
  messageHandler?: (message: string) => void;
}

/**
 * 业务错误构造选项
 */
export interface BusinessErrorOptions {
  code: number;
  message: string;
  data?: unknown;
  httpStatus?: number;
  isNetworkError?: boolean;
  isTimeoutError?: boolean;
}
