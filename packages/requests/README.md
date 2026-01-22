# @code-snippet/requests

基于 Axios 封装的 TypeScript HTTP 请求库，专为现代 Web 应用设计。

## ✨ 特性

- 🔐 **自定义认证**: 支持通过 requestInterceptor 添加 Token 和请求头
- 📦 **智能解包**: 自动解包 `{ code, data, message }` 格式的响应
- 🚨 **统一错误处理**: 支持自定义错误处理器链
- 🎯 **类型安全**: 完整的 TypeScript 类型推导支持
- 🔧 **高度可定制**: 支持实例级和请求级配置覆盖
- 🚀 **便捷方法**: 提供 get、post、put、patch、delete 便捷方法
- 🪶 **轻量级**: ~8KB gzipped，无额外依赖（仅 axios）
- 🔌 **易于集成**: 完美配合 React Query、SWR、useRequest 等

## 📦 安装

```bash
# 使用 bun
bun add @code-snippet/requests

# 使用 pnpm
pnpm add @code-snippet/requests

# 使用 npm
npm install @code-snippet/requests
```

## 🚀 快速开始

### 基础用法

```typescript
import { Request } from '@code-snippet/requests';

// 创建实例
const api = new Request({
  baseURL: 'https://api.example.com',
  returnData: true,  // 自动解包 data 字段
  timeout: 10000,
});

// 发送请求
const user = await api.get<User>('/user/1');
const users = await api.get<User[]>('/users', { page: 1, page_size: 10 });
const created = await api.post<User>('/users', { name: 'John' });
```

### 自定义认证

```typescript
const api = new Request({
  baseURL: 'https://api.example.com',
  returnData: true,
  
  // 添加请求拦截器
  requestInterceptor: (config) => {
    config.headers = config.headers ?? {};
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  
  // 处理 401 未授权
  onUnauthorized: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
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

### 配合 React Query 使用

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { Request } from '@code-snippet/requests';

const api = new Request({ baseURL: '/api', returnData: true });

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

## 📁 项目结构

```
src/
├── index.ts              # 主入口
├── core/
│   └── Request.ts        # 核心请求类
├── errors/
│   ├── BusinessError.ts  # 业务错误类
│   ├── ErrorHandlerManager.ts
│   └── errorFactory.ts   # 错误工厂
└── types/
    ├── config.ts         # 配置类型
    ├── error.ts          # 错误类型
    └── response.ts       # 响应类型
```

## 📖 API 文档

### Request 类

#### 构造函数

```typescript
constructor(config: RequestInstanceConfig & { returnData?: boolean })
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

#### 方法

- `get<T>(url, params?, config?): Promise<T>`
- `post<T>(url, data?, config?): Promise<T>`
- `put<T>(url, data?, config?): Promise<T>`
- `patch<T>(url, data?, config?): Promise<T>`
- `delete<T>(url, config?): Promise<T>`
- `request<T>(config): Promise<T>`
- `registerErrorHandler(handler): () => void`

### BusinessError 类

```typescript
class BusinessError extends Error {
  code: number;           // 业务错误码
  data?: unknown;         // 原始响应数据
  httpStatus?: number;    // HTTP 状态码
  isNetworkError: boolean; // 是否网络错误
  isTimeoutError: boolean; // 是否超时错误
}
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
