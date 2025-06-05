# Request 类 - 基于 Axios 的 TypeScript 封装

这是一个基于 Axios 的请求库，专为 TypeScript 项目设计，支持多实例、统一返回格式处理和业务状态码判断。

## 特性

- ✅ **多实例支持**：可以创建多个请求实例，用于对接不同的后端服务
- ✅ **统一返回格式**：自动处理后端统一返回格式 `{code: number, data: T, message: string}`
- ✅ **直接获取数据**：调用 `request.get/post` 等方法时直接拿到 `data` 字段的内容
- ✅ **业务状态码判断**：自动检查 `code === 0` 来判断接口是否成功
- ✅ **TypeScript 支持**：完整的类型定义和类型推断
- ✅ **错误处理**：统一的错误处理机制
- ✅ **拦截器支持**：支持请求和响应拦截器

## 安装

```bash
bun add axios
# 或
npm install axios
```

## 快速开始

### 1. 基本使用

```typescript
import { request } from './request';

// 直接获取 data 字段的数据
const userData = await request.get<{ id: number; name: string }>('/api/user/123');
console.log(userData); // { id: 123, name: 'John' }

// POST 请求
const newUser = await request.post<{ id: number }>('/api/user', {
  name: 'Jane',
  email: 'jane@example.com'
});
console.log(newUser.id); // 直接访问返回的数据
```

### 2. 创建多个实例

```typescript
import { createRequest } from './request';

// 用户服务
const userService = createRequest({
  baseURL: 'https://user-api.example.com',
  headers: {
    'Authorization': 'Bearer user-token'
  }
});

// 订单服务
const orderService = createRequest({
  baseURL: 'https://order-api.example.com',
  headers: {
    'Authorization': 'Bearer order-token'
  }
});

// 使用不同的服务
const user = await userService.get<User>('/profile');
const orders = await orderService.get<Order[]>('/orders');
```

### 3. 错误处理

```typescript
import { BusinessError } from './request';

try {
  const data = await request.get('/api/protected');
} catch (error: any) {
  if (error instanceof BusinessError) {
    console.log('业务错误码:', error.code);
    console.log('错误信息:', error.message);
    
    switch (error.code) {
      case 401:
        // 处理未登录
        break;
      case 403:
        // 处理无权限
        break;
    }
  } else {
    // 网络错误等
    console.error('请求失败:', error);
  }
}
```

### 4. 跳过业务检查

如果需要获取原始响应（包含 code、data、message），可以设置 `skipBusinessCheck: true`：

```typescript
const response = await request.get<ApiResponse<UserData>>('/api/user', {
  skipBusinessCheck: true
});

console.log(response.code);    // 状态码
console.log(response.data);    // 业务数据
console.log(response.message); // 消息
```

### 5. 添加拦截器

```typescript
// 添加请求拦截器
userService.addRequestInterceptor((config) => {
  config.headers['X-Timestamp'] = Date.now().toString();
  return config;
});

// 添加响应拦截器
userService.addResponseInterceptor((response) => {
  console.log('请求耗时:', Date.now() - startTime);
  return response;
});
```

## API 参考

### Request 类

#### 构造函数

```typescript
new Request(config?: AxiosRequestConfig)
```

#### 方法

- `get<T>(url: string, config?: RequestConfig): Promise<T>`
- `post<T>(url: string, data?: any, config?: RequestConfig): Promise<T>`
- `put<T>(url: string, data?: any, config?: RequestConfig): Promise<T>`
- `delete<T>(url: string, config?: RequestConfig): Promise<T>`
- `patch<T>(url: string, data?: any, config?: RequestConfig): Promise<T>`
- `getInstance(): AxiosInstance` - 获取原始 axios 实例
- `addRequestInterceptor()` - 添加请求拦截器
- `addResponseInterceptor()` - 添加响应拦截器

### 类型定义

```typescript
// 后端统一返回格式
interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 请求配置
interface RequestConfig extends AxiosRequestConfig {
  skipBusinessCheck?: boolean; // 是否跳过业务状态码检查
}

// 业务错误
class BusinessError extends Error {
  code: number;
  data?: any;
}
```

### 工厂函数

```typescript
// 创建新实例
createRequest(config?: AxiosRequestConfig): Request

// 默认实例
export const request: Request
```

## 最佳实践

1. **为不同服务创建不同实例**：
   ```typescript
   const userAPI = createRequest({ baseURL: '/api/user' });
   const orderAPI = createRequest({ baseURL: '/api/order' });
   ```

2. **使用 TypeScript 类型**：
   ```typescript
   interface User { id: number; name: string; }
   const user = await userAPI.get<User>('/profile');
   ```

3. **统一错误处理**：
   ```typescript
   // 在应用级别设置全局错误处理
   window.addEventListener('unhandledrejection', (event) => {
     if (event.reason instanceof BusinessError) {
       // 处理业务错误
     }
   });
   ```

4. **添加通用拦截器**：
   ```typescript
   // 自动添加认证头
   userAPI.addRequestInterceptor((config) => {
     const token = localStorage.getItem('token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```

## 注意事项

- 默认超时时间为 10 秒
- 只有当后端返回的 `code === 0` 时才认为请求成功
- 业务错误会抛出 `BusinessError` 异常
- 网络错误等会抛出原始的 Axios 错误
