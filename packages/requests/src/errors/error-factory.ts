/**
 * 错误工厂 - 用于创建各类错误
 */
import type { AxiosError } from 'axios';
import type { HttpErrorMessages } from '../types/config';
import { BusinessError } from './business-error';

/**
 * 默认 HTTP 状态码对应的错误消息
 */
export const DEFAULT_HTTP_ERROR_MESSAGES: HttpErrorMessages = {
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
  networkError: 'Network error, please check your connection',
  timeoutError: 'Request timed out, please try again later',
  defaultError: 'Unknown error',
  noResponse: 'No response from server',
};

/**
 * 合并错误消息配置
 */
function mergeErrorMessages(
  custom?: HttpErrorMessages
): Required<HttpErrorMessages> {
  return {
    ...DEFAULT_HTTP_ERROR_MESSAGES,
    ...custom,
  } as Required<HttpErrorMessages>;
}

/**
 * 从 Axios 错误创建 BusinessError
 *
 * @param error - Axios 错误对象
 * @param customMessages - 自定义错误消息
 */
export function createBusinessErrorFromAxios(
  error: AxiosError,
  customMessages?: HttpErrorMessages
): BusinessError {
  const messages = mergeErrorMessages(customMessages);
  const isNetworkError = error.message?.includes('Network Error') ?? false;
  const isTimeoutError = error.message?.includes('timeout') ?? false;

  let code: number | string = -1;
  let errorMessage = messages.defaultError;
  let httpStatus: number | undefined;

  if (error.response) {
    httpStatus = error.response.status;
    code = httpStatus;

    // 使用配置的错误消息
    errorMessage = messages[httpStatus] ?? `Request error (${httpStatus})`;

    // 优先使用后端返回的错误消息
    const responseData = error.response.data as
      | { message?: string; msg?: string; error?: string }
      | undefined;
    if (responseData?.message) {
      errorMessage = responseData.message;
    } else if (responseData?.msg) {
      errorMessage = responseData.msg;
    } else if (responseData?.error) {
      errorMessage = responseData.error;
    }
  } else if (error.request) {
    errorMessage = messages.noResponse;
  } else {
    errorMessage = error.message || messages.defaultError;
  }

  // 特殊错误类型覆盖
  if (isNetworkError) {
    errorMessage = messages.networkError;
  }
  if (isTimeoutError) {
    errorMessage = messages.timeoutError;
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
  code: number | string,
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
