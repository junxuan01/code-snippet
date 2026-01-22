# Code Snippet Monorepo 🚀

基于 **Bun** 的 All-in-One Monorepo 项目，包含常用的代码片段和工具库。

## 📦 Packages

| Package | 版本 | 描述 |
|---------|------|------|
| [@code-snippet/requests](./packages/requests) | 0.1.0 | 基于 Axios 的 HTTP 请求库 |
| [@code-snippet/utils](./packages/utils) | 0.1.0 | 通用工具函数库 |

## 🛠️ 技术栈

- **Runtime & Package Manager**: [Bun](https://bun.sh) - 超快的 JavaScript 运行时和包管理器
- **Build Tool**: Bun Build - Bun 内置的打包工具
- **Type System**: TypeScript 5.x
- **HTTP Client**: Axios

## 🚀 快速开始

### 安装依赖

```bash
bun install
```

### 开发模式

```bash
# 开发所有包（watch 模式）
bun run dev

# 开发单个包
bun run --cwd packages/requests dev
```

### 构建

```bash
# 构建所有包
bun run build

# 构建单个包
bun run build:requests
bun run build:utils
```

### 测试

```bash
# 运行测试
bun test

# Watch 模式
bun test --watch
```

### 类型检查

```bash
bun run typecheck
```

### 清理

```bash
# 清理所有构建产物
bun run clean
```

## 📂 项目结构

```
code-snippet/
├── packages/                  # Monorepo 包目录
│   ├── requests/             # HTTP 请求库
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   └── utils/                # 工具库
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── .github/                  # GitHub 配置
├── bunfig.toml              # Bun 配置
├── tsconfig.base.json       # 基础 TS 配置
├── tsconfig.json            # 根 TS 配置
├── package.json             # 根 package.json
├── bun.lockb                # Bun lockfile
└── README.md                # 项目文档
```

## 📚 使用指南

### 在项目中使用

```typescript
// 使用 requests 包
import { Request } from '@code-snippet/requests';

const api = new Request({
  baseURL: 'https://api.example.com',
  returnData: true,
});

const data = await api.get('/users');

// 使用 utils 包
import { logger, generateUUID } from '@code-snippet/utils';

logger.info('Hello, world!');
const id = generateUUID();
```

### 添加新包

1. 在 `packages/` 目录下创建新文件夹
2. 创建 `package.json` 和 `tsconfig.json`
3. 在根 `package.json` 中添加构建脚本
4. 运行 `bun install` 更新依赖

## 🔧 Bun 特性

### 为什么选择 All in Bun？

- ⚡ **超快速度**: Bun 比 Node.js 快 3-4 倍
- 📦 **内置包管理**: 无需 npm/pnpm/yarn
- 🔨 **内置构建工具**: 无需 webpack/rollup/tsup
- 🧪 **内置测试**: 无需 jest/vitest
- 📦 **原生 TypeScript**: 无需额外配置
- 🎯 **零依赖**: 一个工具完成所有任务

### Bun 命令速查

```bash
# 安装依赖
bun install

# 运行脚本
bun run dev
bun run build

# 直接运行文件
bun run index.ts

# 测试
bun test

# 升级依赖
bun update

# 添加依赖
bun add axios
bun add -d typescript

# 清理缓存
bun pm cache rm
```

## 🤝 贡献

欢迎贡献代码！请确保：

1. 代码符合 TypeScript 规范
2. 添加适当的类型注释
3. 更新相关文档
4. 测试通过

## 📄 License

MIT © 2026

## 🔗 相关链接

- [Bun 官方文档](https://bun.sh/docs)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Axios 文档](https://axios-http.com/)

---

**Built with ❤️ using Bun**
