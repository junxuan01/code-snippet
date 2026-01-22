/**
 * 错误处理器管理
 */

import type { DefaultErrorHandlerConfig, ErrorHandler } from '../types';
import type { BusinessError } from './business-error';

/**
 * 错误处理器管理器
 *
 * @description 管理错误处理器链，执行错误处理逻辑
 */
export class ErrorHandlerManager {
  private handlers: ErrorHandler[] = [];
  private showDefaultMessage: boolean;
  private messageHandler: (msg: string) => void;

  constructor(config?: DefaultErrorHandlerConfig) {
    this.showDefaultMessage = config?.showMessage ?? true;
    this.messageHandler = config?.messageHandler ?? console.error;
  }

  /**
   * 注册错误处理器
   * @param handler - 错误处理器
   * @returns 取消注册的函数
   */
  register(handler: ErrorHandler): () => void {
    this.handlers.push(handler);
    return () => {
      const index = this.handlers.indexOf(handler);
      if (index > -1) {
        this.handlers.splice(index, 1);
      }
    };
  }

  /**
   * 处理错误
   * @param error - 业务错误
   * @param hideErrorTip - 是否隐藏错误提示
   */
  async handle(error: BusinessError, hideErrorTip?: boolean): Promise<void> {
    // 如果配置了隐藏错误提示，直接返回
    if (hideErrorTip) {
      return;
    }

    // 执行自定义错误处理器
    for (const handler of this.handlers) {
      if (handler.canHandle(error)) {
        const shouldStop = await handler.handle(error);
        if (shouldStop) {
          return; // 阻止后续处理
        }
      }
    }

    // 默认错误处理：显示错误消息
    if (this.showDefaultMessage) {
      this.messageHandler(error.message);
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: DefaultErrorHandlerConfig): void {
    if (config.showMessage !== undefined) {
      this.showDefaultMessage = config.showMessage;
    }
    if (config.messageHandler) {
      this.messageHandler = config.messageHandler;
    }
  }
}
