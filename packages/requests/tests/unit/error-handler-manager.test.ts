/**
 * ErrorHandlerManager 单元测试
 */
import { describe, expect, it, mock } from 'bun:test';
import { BusinessError, ErrorHandlerManager } from '../../src/errors';

describe('ErrorHandlerManager', () => {
  describe('constructor', () => {
    it('should create with default config', () => {
      const manager = new ErrorHandlerManager();
      expect(manager).toBeDefined();
    });

    it('should create with custom config', () => {
      const messageHandler = mock(() => {});
      const manager = new ErrorHandlerManager({
        showMessage: true,
        messageHandler,
      });
      expect(manager).toBeDefined();
    });
  });

  describe('register', () => {
    it('should register a handler and return unregister function', () => {
      const manager = new ErrorHandlerManager();
      const handler = {
        canHandle: () => true,
        handle: () => true,
      };

      const unregister = manager.register(handler);
      expect(typeof unregister).toBe('function');
    });

    it('should unregister handler when calling returned function', async () => {
      const manager = new ErrorHandlerManager({ showMessage: false });
      const handleFn = mock(() => true);
      const handler = {
        canHandle: () => true,
        handle: handleFn,
      };

      const unregister = manager.register(handler);

      // 第一次调用，handler 应该被执行
      const error = new BusinessError({ code: 1, message: 'test' });
      await manager.handle(error);
      expect(handleFn).toHaveBeenCalledTimes(1);

      // 取消注册
      unregister();

      // 第二次调用，handler 不应该被执行
      await manager.handle(error);
      expect(handleFn).toHaveBeenCalledTimes(1); // 仍然是 1 次
    });
  });

  describe('handle', () => {
    it('should skip handling when hideErrorTip is true', async () => {
      const messageHandler = mock(() => {});
      const manager = new ErrorHandlerManager({
        showMessage: true,
        messageHandler,
      });

      const error = new BusinessError({ code: 1, message: 'test' });
      await manager.handle(error, true); // hideErrorTip = true

      expect(messageHandler).not.toHaveBeenCalled();
    });

    it('should call custom handler when canHandle returns true', async () => {
      const manager = new ErrorHandlerManager({ showMessage: false });
      const handleFn = mock(() => true);
      const handler = {
        canHandle: (err: BusinessError) => err.code === 10001,
        handle: handleFn,
      };

      manager.register(handler);

      const error = new BusinessError({ code: 10001, message: 'test' });
      await manager.handle(error);

      expect(handleFn).toHaveBeenCalledWith(error);
    });

    it('should not call handler when canHandle returns false', async () => {
      const manager = new ErrorHandlerManager({ showMessage: false });
      const handleFn = mock(() => true);
      const handler = {
        canHandle: (err: BusinessError) => err.code === 10001,
        handle: handleFn,
      };

      manager.register(handler);

      const error = new BusinessError({ code: 99999, message: 'test' });
      await manager.handle(error);

      expect(handleFn).not.toHaveBeenCalled();
    });

    it('should stop chain when handler returns true', async () => {
      const messageHandler = mock(() => {});
      const manager = new ErrorHandlerManager({
        showMessage: true,
        messageHandler,
      });

      const handler = {
        canHandle: () => true,
        handle: () => true, // 返回 true，阻止后续处理
      };

      manager.register(handler);

      const error = new BusinessError({ code: 1, message: 'test' });
      await manager.handle(error);

      // 默认的 messageHandler 不应该被调用
      expect(messageHandler).not.toHaveBeenCalled();
    });

    it('should continue chain when handler returns false/undefined', async () => {
      const messageHandler = mock(() => {});
      const manager = new ErrorHandlerManager({
        showMessage: true,
        messageHandler,
      });

      const handler = {
        canHandle: () => true,
        handle: () => false, // 返回 false，继续处理
      };

      manager.register(handler);

      const error = new BusinessError({ code: 1, message: 'test' });
      await manager.handle(error);

      // 默认的 messageHandler 应该被调用
      expect(messageHandler).toHaveBeenCalledWith('test');
    });

    it('should call default message handler when showMessage is true', async () => {
      const messageHandler = mock(() => {});
      const manager = new ErrorHandlerManager({
        showMessage: true,
        messageHandler,
      });

      const error = new BusinessError({ code: 1, message: 'Error occurred' });
      await manager.handle(error);

      expect(messageHandler).toHaveBeenCalledWith('Error occurred');
    });

    it('should not call message handler when showMessage is false', async () => {
      const messageHandler = mock(() => {});
      const manager = new ErrorHandlerManager({
        showMessage: false,
        messageHandler,
      });

      const error = new BusinessError({ code: 1, message: 'test' });
      await manager.handle(error);

      expect(messageHandler).not.toHaveBeenCalled();
    });
  });

  describe('updateConfig', () => {
    it('should update showMessage config', async () => {
      const messageHandler = mock(() => {});
      const manager = new ErrorHandlerManager({
        showMessage: true,
        messageHandler,
      });

      // 更新配置
      manager.updateConfig({ showMessage: false });

      const error = new BusinessError({ code: 1, message: 'test' });
      await manager.handle(error);

      expect(messageHandler).not.toHaveBeenCalled();
    });

    it('should update messageHandler', async () => {
      const oldHandler = mock(() => {});
      const newHandler = mock(() => {});

      const manager = new ErrorHandlerManager({
        showMessage: true,
        messageHandler: oldHandler,
      });

      // 更新配置
      manager.updateConfig({ messageHandler: newHandler });

      const error = new BusinessError({ code: 1, message: 'test' });
      await manager.handle(error);

      expect(oldHandler).not.toHaveBeenCalled();
      expect(newHandler).toHaveBeenCalledWith('test');
    });
  });
});
