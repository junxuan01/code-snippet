/**
 * 错误工厂 - 用于创建各类错误
 */
import type { AxiosError } from 'axios';
import { BusinessError } from './business-error';

/**
 * HTTP 状态码对应的错误消息
 */
const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request parameters',
  401: 'Unauthorized, please login again',
  403: 'Access denied',
  404: 'Requested resource not found',
  405: 'Method not allowed',
  408: 'Request timeout',
  429: 'Too many requests',
  500: 'Internal server error',
  502: 'Bad gateway',
  503: 'Service unavailable',
  504: 'Gateway timeout',
};

/**
 * 从 Axios 错误创建 BusinessError
 */
export function createBusinessErrorFromAxios(error: AxiosError): BusinessError {
  const isNetworkError = error.message?.includes('Network Error') ?? false;
  const isTimeoutError = error.message?.includes('timeout') ?? false;

  let code = -1;
  let errorMessage = 'Unknown error';
  let httpStatus: number | undefined;

  if (error.response) {
    httpStatus = error.response.status;
    code = httpStatus;

    // 使用预定义的错误消息
    errorMessage =
      HTTP_ERROR_MESSAGES[httpStatus] ?? `Request error (${httpStatus})`;

    // 优先使用后端返回的错误消息
    const responseData = error.response.data as
      | { message?: string }
      | undefined;
    if (responseData?.message) {
      errorMessage = responseData.message;
    }
  } else if (error.request) {
    errorMessage = 'No response from server';
  } else {
    errorMessage = error.message || 'Request failed';
  }

  // 特殊错误类型覆盖
  if (isNetworkError) {
    errorMessage = 'Network error, please check your connection';
  }
  if (isTimeoutError) {
    errorMessage = 'Request timed out, please try again later';
  }

  return new BusinessError({
    code,
    message: errorMessage,
    httpStatus,
    isNetworkError,
    isTimeoutError,
  });
}

/**
 * 从业务响应创建 BusinessError
 */
export function createBusinessErrorFromResponse(
  code: number,
  message: string,
  data?: unknown,
  httpStatus?: number
): BusinessError {
  return new BusinessError({
    code,
    message: message || 'Request failed',
    data,
    httpStatus,
  });
}
