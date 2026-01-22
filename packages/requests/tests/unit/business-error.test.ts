/**
 * BusinessError 单元测试
 */
import { describe, expect, it } from 'bun:test';
import { BusinessError } from '../../src/errors';

describe('BusinessError', () => {
  describe('constructor', () => {
    it('should create an error with basic options', () => {
      const error = new BusinessError({
        code: 10001,
        message: 'Test error message',
      });

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BusinessError);
      expect(error.name).toBe('BusinessError');
      expect(error.code).toBe(10001);
      expect(error.message).toBe('Test error message');
      expect(error.isNetworkError).toBe(false);
      expect(error.isTimeoutError).toBe(false);
    });

    it('should create an error with all options', () => {
      const data = { userId: 1 };
      const error = new BusinessError({
        code: 401,
        message: 'Unauthorized',
        data,
        httpStatus: 401,
        isNetworkError: false,
        isTimeoutError: false,
      });

      expect(error.code).toBe(401);
      expect(error.message).toBe('Unauthorized');
      expect(error.data).toEqual(data);
      expect(error.httpStatus).toBe(401);
    });

    it('should create a network error', () => {
      const error = new BusinessError({
        code: -1,
        message: 'Network Error',
        isNetworkError: true,
      });

      expect(error.isNetworkError).toBe(true);
      expect(error.isTimeoutError).toBe(false);
    });

    it('should create a timeout error', () => {
      const error = new BusinessError({
        code: -1,
        message: 'Timeout',
        isTimeoutError: true,
      });

      expect(error.isNetworkError).toBe(false);
      expect(error.isTimeoutError).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('should serialize error to JSON', () => {
      const error = new BusinessError({
        code: 500,
        message: 'Internal Server Error',
        httpStatus: 500,
        data: { detail: 'Something went wrong' },
      });

      const json = error.toJSON();

      expect(json).toEqual({
        name: 'BusinessError',
        code: 500,
        message: 'Internal Server Error',
        data: { detail: 'Something went wrong' },
        httpStatus: 500,
        isNetworkError: false,
        isTimeoutError: false,
      });
    });
  });

  describe('instanceof check', () => {
    it('should pass instanceof check after throw and catch', () => {
      try {
        throw new BusinessError({
          code: 400,
          message: 'Bad Request',
        });
      } catch (error) {
        expect(error instanceof BusinessError).toBe(true);
        expect((error as BusinessError).code).toBe(400);
      }
    });
  });
});
