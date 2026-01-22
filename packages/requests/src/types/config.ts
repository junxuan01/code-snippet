/**
 * 请求配置相关类型定义
 */
import type { AxiosRequestConfig } from 'axios';
import type { DefaultErrorHandlerConfig } from './error';

/**
 * 自定义请求配置
 *
 * @description 扩展 AxiosRequestConfig，添加业务相关的配置选项
 */
export interface CustomRequestConfig extends AxiosRequestConfig {
  /**
   * 是否只返回 data 字段
   * @default true (实例默认值)
   *
   * @description
   * - `true`: 返回 `response.data.data`，类型为 T
   * - `false`: 返回完整 `HttpResponse<T>`
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
   * - `true`: 不检查 code !== 0，直接返回数据（用于特殊接口）
   * - `false`: 检查 code，非 0 时抛出 BusinessError
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
   * 是否只返回 data 字段（实例级别默认值）
   * @default true
   */
  returnData?: boolean;

  /**
   * 401 未授权时的处理函数
   * @description 不提供时默认跳转到 /login
   */
  onUnauthorized?: () => void;

  /** 默认错误处理器配置 */
  defaultErrorHandler?: DefaultErrorHandlerConfig;

  /**
   * 自定义请求拦截器
   * @description 用于添加 headers、token 等
   */
  requestInterceptor?: RequestInterceptor;
}
