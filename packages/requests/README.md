# @junxuan/requests

基于 Axios 封装的 TypeScript HTTP 请求库，专为现代 Web 应用设计。

## ✨ 特性

- 🔐 **自定义认证**: 支持通过 requestInterceptor 添加 Token 和请求头
- 📦 **智能解包**: 自动解包响应数据，**支持任意响应格式**
- 🚨 **统一错误处理**: 支持自定义错误处理器链
- 🎯 **类型安全**: 完整的 TypeScript 类型推导支持
- 🔧 **高度可定制**: 支持实例级和请求级配置覆盖
- 🚀 **便捷方法**: 提供 get、post、put、patch、delete 便捷方法
- 🌍 **i18n 支持**: 错误消息可自定义，支持国际化
- 🪶 **轻量级**: ~8KB gzipped，axios 作为 peerDependency
- 🔌 **易于集成**: 完美配合 React Query、SWR、useRequest 等

## 📦 安装

```bash
# 使用 bun
bun add @junxuan/requests axios

# 使用 pnpm
pnpm add @junxuan/requests axios

# 使用 npm
npm install @junxuan/requests axios
```

## 🚀 快速开始

### 基础用法（默认响应格式）

适用于 `{ code: 0, data: T, message: string }` 格式的后端响应：

```typescript
import { Request } from '@junxuan/requests';

// 创建实例
const api = new Request({
  baseURL: 'https://api.example.com',
  timeout: 10000,
});

// 发送请求 - 自动解包 data 字段
const user = await api.get<User>('/user/1');
const users = await api.get<User[]>('/users', { page: 1, pageSize: 10 });
const created = await api.post<User>('/users', { name: 'John' });
```

### 自定义响应格式 🆕

不同项目的 API 响应格式可能不同，使用 `responseParser` 适配你的后端：

```typescript
import { Request, type ResponseParser } from '@code-snippet/requests';

// 示例1: { status: 'ok', result: T, error: string }
const api = new Request({
  baseURL: 'https://api.example.com',
  responseParser: {
    isSuccess: (res) => res.status === 'ok',
    getData: (res) => res.result,
    getMessage: (res) => res.error || 'success',
    getCode: (res) => res.status === 'ok' ? 0 : -1,
  },
});

// 示例2: { success: true, data: T, msg: string }
const api2 = new Request({
  baseURL: 'https://api.example.com',
  responseParser: {
    isSuccess: (res) => res.success === true,
    getData: (res) => res.data,
    getMessage: (res) => res.msg,
    getCode: (res) => res.success ? 0 : -1,
  },
});

// 示例3: 第三方 API（无业务包装，直接返回数据）
const thirdPartyApi = new Request({
  baseURL: 'https://jsonplaceholder.typicode.com',
  responseParser: {
    isSuccess: () => true,  // HTTP 成功即业务成功
    getData: (res) => res,   // 直接返回原始数据
    getMessage: () => 'success',
    getCode: () => 0,
  },
});
```

### 自定义认证

```typescript
const api = new Request({
  baseURL: 'https://api.example.com',
  
  // 添加请求拦截器
  requestInterceptor: (config) => {
    config.headers = config.headers ?? {};
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  
  // 处理 401 未授权（不提供则不做任何处理）
  onUnauthorized: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
});
```

### 自定义错误消息（i18n）🆕

```typescript
const api = new Request({
  baseURL: 'https://api.example.com',
  
  // 自定义错误消息，支持 i18n
  errorMessages: {
    401: '登录已过期，请重新登录',
    403: '无权访问',
    404: '请求的资源不存在',
    500: '服务器内部错误',
    networkError: '网络连接失败，请检查网络',
    timeoutError: '请求超时，请稍后重试',
  },
});
```

### 自定义错误处理

```typescript
// 注册错误处理器
api.registerErrorHandler({
  canHandle: (err) => err.code === 50001,
  handle: (err) => {
    alert('会话已过期，请重新登录');
    return true; // 阻止默认错误提示
  },
});

// 网络错误处理
api.registerErrorHandler({
  canHandle: (err) => err.isNetworkError,
  handle: (err) => {
    alert('网络连接失败');
    return true;
  },
});
```

### 访问底层 Axios 实例 🆕

```typescript
const api = new Request({ baseURL: 'https://api.example.com' });

// 直接访问 axios 实例进行高级配置
api.axios.interceptors.request.use((config) => {
  // 添加额外的请求拦截器
  return config;
});
```

### 配合 React Query 使用

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { Request } from '@code-snippet/requests';

const api = new Request({ baseURL: '/api' });

// 查询
function useUser(id: number) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => api.get<User>(`/users/${id}`),
  });
}

// 变更
function useCreateUser() {
  return useMutation({
    mutationFn: (data: CreateUserData) => api.post<User>('/users', data),
  });
}
```

## 📖 API 文档

### Request 类

#### 构造函数

```typescript
constructor(config?: RequestInstanceConfig)
```

#### 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `baseURL` | `string` | - | API 基础 URL |
| `timeout` | `number` | `10000` | 请求超时时间（ms） |
| `returnData` | `boolean` | `true` | 是否自动解包 data 字段 |
| `requestInterceptor` | `Function` | - | 请求拦截器 |
| `onUnauthorized` | `Function` | - | 401 处理函数 |
| `defaultErrorHandler` | `Object` | - | 默认错误处理配置 |
| `responseParser` | `ResponseParser` | 见下方 | 响应解析器 |
| `errorMessages` | `HttpErrorMessages` | 见下方 | 自定义错误消息 |

#### ResponseParser 接口

```typescript
interface ResponseParser<TResponse = unknown> {
  isSuccess: (response: TResponse) => boolean;
  getData: (response: TResponse) => unknown;
  getMessage: (response: TResponse) => string;
  getCode: (response: TResponse) => number | string;
}
```

默认解析器适用于 `{ code: 0, data: T, message: string }` 格式：

```typescript
import { defaultResponseParser } from '@code-snippet/requests';
```

#### 方法

- `get<T>(url, params?, config?): Promise<T>`
- `post<T>(url, data?, config?): Promise<T>`
- `put<T>(url, data?, config?): Promise<T>`
- `patch<T>(url, data?, config?): Promise<T>`
- `delete<T>(url, config?): Promise<T>`
- `request<T>(config): Promise<T>`
- `registerErrorHandler(handler): () => void`
- `axios`: 获取底层 axios 实例

### BusinessError 类

```typescript
class BusinessError extends Error {
  code: number | string;   // 业务错误码
  data?: unknown;          // 原始响应数据
  httpStatus?: number;     // HTTP 状态码
  isNetworkError: boolean; // 是否网络错误
  isTimeoutError: boolean; // 是否超时错误
}
```

## 📁 项目结构

```
src/
├── index.ts              # 主入口
├── core/
│   └── request.ts        # 核心请求类
├── errors/
│   ├── business-error.ts # 业务错误类
│   ├── error-handler-manager.ts
│   └── error-factory.ts  # 错误工厂
└── types/
    ├── config.ts         # 配置类型
    ├── error.ts          # 错误类型
    └── response.ts       # 响应类型和解析器
```

## 🧪 测试

```bash
# 运行测试
bun test packages/requests

# 查看覆盖率
bun test packages/requests --coverage
```

## 📄 License

MIT
