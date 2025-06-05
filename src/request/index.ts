import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

// 后端统一返回格式
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 请求配置接口
export interface RequestConfig extends AxiosRequestConfig {
  // 是否跳过业务状态码检查
  skipBusinessCheck?: boolean;
}

// 自定义错误类
export class BusinessError extends Error {
  code: number;
  data?: any;

  constructor(code: number, message: string, data?: any) {
    super(message);
    this.name = "BusinessError";
    this.code = code;
    this.data = data;
  }
}

export class Request {
  private instance: AxiosInstance;
  constructor(config?: AxiosRequestConfig) {
    this.instance = axios.create({
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
      ...config,
    });

    this.setupInterceptors();
  }
  // 设置拦截器
  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 可以在这里添加 token 等
        // 加一个示例：如果有 token，则添加到请求头
        const token =
          "eyJhbGciOiJQUzI1NiIsInR5cCI6IkpXVCJ9.eyJFbWFpbCI6ImppYWp1bi50YW5AbHVtZW5zLnNnIiwiRXhwaXJlZEF0IjoiMjAyNS0xMS0xN1QxODowNjo0MS4wNTY0NDQrMDg6MDAiLCJQaG9uZSI6IiIsIlVzZXJJZCI6MSwiVXNlck5hbWUiOiIifQ.B2bG1ZMEhFcoUTyS7O_hr-OWAc9F9Gz5KWocJbRCwa3UGjCd5f0pIdbtgAUHofDHMuhQqs9zbqkMPsLH6-hlM8lmoEFJftqfQtnD5feG9DN1evZYpoV7mUqFgnuiuZdvujUb3uBPcEwB9DCPhOtknuzzZiAmh1k1Ko-3PPsrrxDZwBJSXOCwTgo_vp5vsh-13OKchv3hprC3LABnaM8dXObRrYLaVl6AvHDxOPb6DrH2vuOlqEY3yTbE_hgapSd5hlM8v-QgOHCCFbMwodhKpIdeA3oOQ0E10r3MFFRgZ6f89bimeRQGcokB7rueWJ9J9kDCZ8rLiCZtNfxw8UID5Q";
        if (token) {
          (
            config as InternalAxiosRequestConfig
          ).headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { data } = response;
        const requestConfig = response.config as RequestConfig;
        // 如果跳过业务检查，直接返回原始响应
        if (requestConfig.skipBusinessCheck) {
          return response;
        }
        // 检查业务状态码
        if (data.code !== 0) {
          throw new BusinessError(data.code, data.message, data.data);
        }
        return response;
      },
      (error) => {
        // 处理网络错误等
        if (error.response) {
          // 服务器返回了错误状态码
          console.error(
            "API Error:",
            error.response.status,
            error.response.data
          );
        } else if (error.request) {
          // 请求已发出但没有收到响应
          console.error("Network Error:", error.message);
        } else {
          // 其他错误
          console.error("Request Error:", error.message);
        }
        return Promise.reject(error);
      }
    );
  }
  // 通用请求方法
  private async request<T = any>(config: RequestConfig): Promise<T> {
    try {
      const response = await this.instance.request<ApiResponse<T>>(config);
      // 如果跳过业务检查，返回完整响应数据
      if (config.skipBusinessCheck) {
        return response.data as T;
      }
      // 返回业务数据
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
  // GET 请求
  async get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({
      method: "GET",
      params: config?.params,
      url,
      ...config,
    });
  }

  // POST 请求
  async post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>({
      method: "POST",
      url,
      data,
      ...config,
    });
  }

  // PUT 请求
  async put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>({
      method: "PUT",
      url,
      data,
      ...config,
    });
  }

  // DELETE 请求
  async delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>({
      method: "DELETE",
      url,
      ...config,
    });
  }

  // PATCH 请求
  async patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>({
      method: "PATCH",
      url,
      data,
      ...config,
    });
  }

  // 获取原始 axios 实例（用于更复杂的自定义）
  getInstance(): AxiosInstance {
    return this.instance;
  }

  // 添加请求拦截器
  addRequestInterceptor(
    onFulfilled?: (
      config: InternalAxiosRequestConfig
    ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>,
    onRejected?: (error: any) => any
  ) {
    return this.instance.interceptors.request.use(onFulfilled, onRejected);
  }

  // 添加响应拦截器
  addResponseInterceptor(
    onFulfilled?: (
      response: AxiosResponse
    ) => AxiosResponse | Promise<AxiosResponse>,
    onRejected?: (error: any) => any
  ) {
    return this.instance.interceptors.response.use(onFulfilled, onRejected);
  }
}
