import { Request, CustomAxiosRequestConfig } from "./request";

/**
 * 创建请求实例
 * @param config 请求配置
 * @returns Request 实例
 */
export function createRequest(config: CustomAxiosRequestConfig = {}): Request {
  return new Request(config);
}

/**
 * 默认请求实例
 */
export const request = createRequest({
  baseURL: "/",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default request;
