import { Request, createRequest, request as defaultRequest } from "./index";

// 使用示例

// 1. 使用默认实例
async function useDefaultInstance() {
  try {
    // 直接拿到后端返回的 data 字段
    const userData = await defaultRequest.get<{ id: number; name: string }>(
      "/api/user/123"
    );
    console.log("User data:", userData); // 这里直接是 { id: 123, name: 'John' }

    const newUser = await defaultRequest.post<{ id: number }>("/api/user", {
      name: "Jane",
      email: "jane@example.com",
    });
    console.log("New user ID:", newUser.id);
  } catch (error) {
    console.error("请求失败:", error);
  }
}

// 2. 创建多个实例（用于对接不同的后端服务）
const userService = createRequest({
  baseURL: "https://user-api.example.com",
  timeout: 5000,
  headers: {
    Authorization: "Bearer token-for-user-service",
  },
});

const orderService = createRequest({
  baseURL: "https://order-api.example.com",
  timeout: 8000,
  headers: {
    Authorization: "Bearer token-for-order-service",
  },
});

// 3. 使用不同的服务实例
async function useMultipleServices() {
  try {
    // 用户服务
    const user = await userService.get<{
      id: number;
      name: string;
      email: string;
    }>("/profile");
    console.log("用户信息:", user);

    // 订单服务
    const orders = await orderService.get<
      Array<{ id: number; amount: number }>
    >("/orders");
    console.log("订单列表:", orders);

    // 创建新订单
    const newOrder = await orderService.post<{ orderId: string }>("/orders", {
      userId: user.id,
      items: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ],
    });
    console.log("新订单ID:", newOrder.orderId);
  } catch (error) {
    console.error("服务调用失败:", error);
  }
}

// 4. 处理业务错误
async function handleBusinessError() {
  try {
    await defaultRequest.get("/api/protected-resource");
  } catch (error: any) {
    if (error.name === "BusinessError") {
      console.log("业务错误码:", error.code);
      console.log("错误信息:", error.message);
      console.log("错误数据:", error.data);

      // 根据不同的错误码进行处理
      switch (error.code) {
        case 401:
          console.log("用户未登录，跳转到登录页");
          break;
        case 403:
          console.log("没有权限访问");
          break;
        case 404:
          console.log("资源不存在");
          break;
        default:
          console.log("其他业务错误");
      }
    } else {
      console.error("网络或其他错误:", error);
    }
  }
}

// 5. 跳过业务状态码检查（获取原始响应）
async function skipBusinessCheck() {
  try {
    const response = await defaultRequest.get<{
      code: number;
      data: any;
      message: string;
    }>("/api/some-endpoint", {
      skipBusinessCheck: true,
    });

    console.log("原始响应:", response);
    console.log("状态码:", response.code);
    console.log("数据:", response.data);
    console.log("消息:", response.message);
  } catch (error) {
    console.error("请求失败:", error);
  }
}

// 6. 添加自定义拦截器
function setupCustomInterceptors() {
  // 为用户服务添加请求拦截器
  userService.addRequestInterceptor((config) => {
    console.log("发送用户服务请求:", config.url);
    // 可以在这里添加时间戳、签名等
    config.params = {
      ...config.params,
      timestamp: Date.now(),
    };
    return config;
  });

  // 为订单服务添加响应拦截器
  orderService.addResponseInterceptor((response) => {
    console.log("订单服务响应:", response.status);
    return response;
  });
}

// 7. 类型安全的使用方式
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

interface CreateUserResponse {
  id: number;
  token: string;
}

async function typeSafeUsage() {
  // TypeScript 会自动推断返回类型
  const user: User = await userService.get<User>("/me");

  const newUser: CreateUserResponse =
    await userService.post<CreateUserResponse>("/register", {
      name: "John Doe",
      email: "john@example.com",
      password: "secure-password",
    });

  console.log("新用户:", newUser);
}

// 导出示例函数
export {
  useDefaultInstance,
  useMultipleServices,
  handleBusinessError,
  skipBusinessCheck,
  setupCustomInterceptors,
  typeSafeUsage,
};
