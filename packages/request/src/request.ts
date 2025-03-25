import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import axios, { CancelTokenSource } from "axios";

/**
 * 自定义请求配置接口，扩展 AxiosRequestConfig
 */
export type CustomAxiosRequestConfig = AxiosRequestConfig & {
  /** 是否只返回响应数据，默认为 true */
  returnData?: boolean;
  /** 是否隐藏错误提示，默认为 false */
  hideErrorTip?: boolean;
  /** 请求唯一标识符 */
  requestId?: string;
  /** 是否取消之前的同类请求，默认为 false */
  cancelPrevious?: boolean;
};

/**
 * HTTP 请求响应接口
 */
export interface HttpResponse<T = any> {
  /** 数据 */
  data: T;
  /** 状态码 */
  code: number;
  /** 消息 */
  message: string;
  /** 是否成功 */
  success: boolean;
}

export class Request {
  /** baseConfig 基础请求配置 */
  private baseConfig: AxiosRequestConfig = {
    timeout: 10000,
  };

  /** axios 实例 */
  private instance: AxiosInstance;

  /** 存储请求标识和取消令牌的映射 */
  private pendingRequests: Map<string, CancelTokenSource> = new Map();

  /**
   * 构造函数
   * @param config 请求配置
   */
  constructor(config: CustomAxiosRequestConfig) {
    // 创建 axios 实例
    this.instance = axios.create({
      ...this.baseConfig,
      ...config,
    });

    // 初始化拦截器
    this.setupInterceptors();
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 转换为自定义配置类型
        const customConfig = config as InternalAxiosRequestConfig &
          CustomAxiosRequestConfig;

        // 处理取消请求逻辑
        if (customConfig.requestId) {
          this.handleCancelRequest(customConfig);
        }

        // 这里可以添加认证信息，如 token
        // if (store.getters.token) {
        //   config.headers['Authorization'] = `Bearer ${store.getters.token}`;
        // }

        // 请求开始时间
        customConfig.headers["Request-Start-Time"] = Date.now().toString();

        return customConfig;
      },
      (error: AxiosError) => {
        console.error("请求拦截器错误:", error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 移除已完成的请求
        const config = response.config as CustomAxiosRequestConfig;
        if (config.requestId) {
          this.pendingRequests.delete(config.requestId);
        }

        // 计算请求耗时
        const requestStartTime = Number(
          response.config.headers["Request-Start-Time"] || 0
        );
        const requestEndTime = Date.now();
        const requestDuration = requestEndTime - requestStartTime;

        console.log(`请求 ${response.config.url} 耗时: ${requestDuration}ms`);

        // 根据配置决定是否只返回数据部分
        if (config.returnData !== false) {
          return response.data;
        }

        return response;
      },
      (error: AxiosError) => {
        // 处理被取消的请求
        if (axios.isCancel(error)) {
          console.log("请求被取消:", error.message);
          return Promise.reject(new Error("请求被取消"));
        }

        // 移除已完成的请求（即使是出错的）
        const config = (error as AxiosError).config
          ? ((error as AxiosError).config as CustomAxiosRequestConfig)
          : undefined;
        if (config?.requestId) {
          this.pendingRequests.delete(config.requestId);
        }

        // 处理请求错误
        const errorResponse = this.handleRequestError(error);

        // 如果不隐藏错误提示，可以在这里显示错误消息
        if (config?.hideErrorTip !== true) {
          this.showErrorMessage(errorResponse);
        }

        return Promise.reject(errorResponse);
      }
    );
  }

  /**
   * 处理取消请求逻辑
   * @param config 请求配置
   */
  private handleCancelRequest(config: CustomAxiosRequestConfig): void {
    // 创建取消令牌
    const source = axios.CancelToken.source();
    config.cancelToken = source.token;

    // 如果存在 requestId
    if (config.requestId) {
      // 检查是否需要取消之前的请求
      if (config.cancelPrevious && this.pendingRequests.has(config.requestId)) {
        // 取消之前具有相同 requestId 的请求
        const previousSource = this.pendingRequests.get(config.requestId);
        previousSource?.cancel(`重复请求: ${config.requestId}`);
      }

      // 存储当前请求的取消令牌
      this.pendingRequests.set(config.requestId, source);
    }
  }

  /**
   * 手动取消请求
   * @param requestId 请求ID
   * @param message 取消消息
   */
  public cancelRequest(
    requestId: string,
    message: string = "请求被手动取消"
  ): void {
    if (this.pendingRequests.has(requestId)) {
      const source = this.pendingRequests.get(requestId);
      source?.cancel(message);
      this.pendingRequests.delete(requestId);
    }
  }

  /**
   * 处理请求错误
   * @param error 错误对象
   * @returns 标准化的错误响应
   */
  private handleRequestError(error: AxiosError): HttpResponse {
    let errorMessage = "未知错误";
    let statusCode = 500;

    if (error.response) {
      // 服务器返回了错误状态码的响应
      statusCode = error.response.status;

      switch (statusCode) {
        case 400:
          errorMessage = "请求参数错误";
          break;
        case 401:
          errorMessage = "未授权，请重新登录";
          // 可以在这里处理未授权的情况，例如清除本地令牌并跳转到登录页面
          break;
        case 403:
          errorMessage = "拒绝访问";
          break;
        case 404:
          errorMessage = "请求的资源不存在";
          break;
        case 500:
          errorMessage = "服务器内部错误";
          break;
        default:
          errorMessage = `请求出错 (${statusCode})`;
      }

      // 如果响应中有详细错误信息，优先使用
      if (error.response.data && typeof error.response.data === "object") {
        errorMessage =
          (error.response.data as { message?: string }).message || errorMessage;
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      errorMessage = "服务器无响应";
    } else {
      // 设置请求时发生了错误
      errorMessage = error.message || "请求失败";
    }

    // 网络错误特殊处理
    if (error.message?.includes("Network Error")) {
      errorMessage = "网络错误，请检查您的网络连接";
    }

    // 超时错误特殊处理
    if (error.message?.includes("timeout")) {
      errorMessage = "请求超时，请稍后重试";
    }

    return {
      data: null,
      code: statusCode,
      message: errorMessage,
      success: false,
    };
  }

  /**
   * 显示错误消息
   * @param errorResponse 错误响应
   */
  private showErrorMessage(errorResponse: HttpResponse): void {
    // 这里可以集成您的UI库的消息提示组件
    console.error(`请求错误: ${errorResponse.message}`);

    // 如果使用UI库，可以添加如下代码：
    // message.error(errorResponse.message);
    // 或
    // notification.error({
    //   title: '请求错误',
    //   message: errorResponse.message
    // });
  }

  /**
   * 发送 GET 请求
   * @param url 请求地址
   * @param params 请求参数
   * @param config 自定义配置
   * @returns Promise 对象
   */
  public async get<T = any>(
    url: string,
    params: any = {},
    config: CustomAxiosRequestConfig = {}
  ): Promise<T> {
    return this.instance.get(url, { ...config, params });
  }

  /**
   * 发送 POST 请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 自定义配置
   * @returns Promise 对象
   */
  public async post<T = any>(
    url: string,
    data: any = {},
    config: CustomAxiosRequestConfig = {}
  ): Promise<T> {
    return this.instance.post(url, data, config);
  }

  /**
   * 发送 PUT 请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 自定义配置
   * @returns Promise 对象
   */
  public async put<T = any>(
    url: string,
    data: any = {},
    config: CustomAxiosRequestConfig = {}
  ): Promise<T> {
    return this.instance.put(url, data, config);
  }

  /**
   * 发送 DELETE 请求
   * @param url 请求地址
   * @param params 请求参数
   * @param config 自定义配置
   * @returns Promise 对象
   */
  public async delete<T = any>(
    url: string,
    params: any = {},
    config: CustomAxiosRequestConfig = {}
  ): Promise<T> {
    return this.instance.delete(url, { ...config, params });
  }

  /**
   * 发送 PATCH 请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 自定义配置
   * @returns Promise 对象
   */
  public async patch<T = any>(
    url: string,
    data: any = {},
    config: CustomAxiosRequestConfig = {}
  ): Promise<T> {
    return this.instance.patch(url, data, config);
  }

  /**
   * 通用请求方法
   * @param config 完整的请求配置
   * @returns Promise 对象
   */
  public async request<T = any>(config: CustomAxiosRequestConfig): Promise<T> {
    return this.instance.request(config);
  }

  /**
   * 创建自定义实例
   * @param config 自定义配置
   * @returns 新的 Request 实例
   */
  public static create(config: CustomAxiosRequestConfig): Request {
    return new Request(config);
  }
}
