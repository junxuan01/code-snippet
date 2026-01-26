/**
 * 请求配置相关类型定义
 */
import type { AxiosRequestConfig } from 'axios';
import type { DefaultErrorHandlerConfig } from './error';
import type { ResponseParser } from './response';

/**
 * HTTP 错误消息映射
 *
 * @description 用于自定义 HTTP 状态码对应的错误消息，支持 i18n
 */
export type HttpErrorMessages = Partial<Record<number, string>> & {
  /** 网络错误消息 */
  networkError?: string;
  /** 超时错误消息 */
  timeoutError?: string;
  /** 默认错误消息 */
  defaultError?: string;
  /** 无响应错误消息 */
  noResponse?: string;
};

/**
 * 自定义请求配置
 *
 * @description 扩展 AxiosRequestConfig，添加业务相关的配置选项
 */
export interface CustomRequestConfig extends AxiosRequestConfig {
  /**
   * 是否只返回解包后的 data 字段
   * @default true (实例默认值)
   *
   * @description
   * - `true`: 返回解包后的数据，类型为 T
   * - `false`: 返回完整原始响应
   */
  returnData?: boolean;

  /**
   * 是否隐藏错误提示
   * @default false
   *
   * @description
   * - `true`: 不显示全局错误提示，适合自行处理错误的场景
   * - `false`: 显示全局错误提示
   */
  hideErrorTip?: boolean;

  /**
   * 是否跳过业务错误检查
   * @default false
   *
   * @description
   * - `true`: 不检查业务状态码，直接返回数据（用于特殊接口或第三方 API）
   * - `false`: 使用 responseParser 检查业务状态
   */
  skipBusinessCheck?: boolean;
}

/**
 * 请求拦截器函数
 *
 * @description 用于在发送请求前修改配置，如添加 headers、token 等
 */
export type RequestInterceptor = (
  config: AxiosRequestConfig
) => AxiosRequestConfig | Promise<AxiosRequestConfig>;

/**
 * Request 实例配置
 *
 * @description 创建 Request 实例时的完整配置选项
 */
export interface RequestInstanceConfig extends CustomRequestConfig {
  /**
   * 是否只返回解包后的 data 字段（实例级别默认值）
   * @default true
   */
  returnData?: boolean;

  /**
   * 401 未授权时的处理函数
   * @description 不提供时不做任何处理，由用户自行决定行为
   */
  onUnauthorized?: () => void;

  /** 默认错误处理器配置 */
  defaultErrorHandler?: DefaultErrorHandlerConfig;

  /**
   * 自定义请求拦截器
   * @description 用于添加 headers、token 等
   */
  requestInterceptor?: RequestInterceptor;

  /**
   * 响应解析器
   * @description 定义如何解析后端响应，支持自定义响应格式
   * @default defaultResponseParser (适用于 { code: 0, data, message } 格式)
   */
  responseParser?: ResponseParser<any>;

  /**
   * 自定义 HTTP 错误消息
   * @description 用于覆盖默认的错误消息，支持 i18n
   */
  errorMessages?: HttpErrorMessages;
}
