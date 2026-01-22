# Copilot Instructions for code snippets

## 项目概述

这是一个基于 Bun workspace 的 monorepo 项目，全部使用 Bun 自带的能力运行和管理。

## 技术栈

- **运行时/包管理器**: Bun 1.3+
- **构建工具**: tsup（生成 ESM 格式，支持 tree-shaking）
- **格式化/检查**: Biome.js
- **测试**: Bun test
- **语言**: TypeScript 5.7+

## 项目结构

```
code-snippet/
├── packages/
│   ├── requests/          # 基于 axios 封装的请求库
│   │   ├── src/
│   │   │   ├── core/      # 核心请求类
│   │   │   ├── errors/    # 错误处理
│   │   │   └── types/     # 类型定义
│   │   └── tests/         # 单元测试
│   └── utils/             # 通用工具库
├── package.json           # 工作区配置
├── tsconfig.base.json     # 基础 TS 配置
├── bunfig.toml            # Bun 配置
└── biome.json             # Biome 配置
```

## 开发规范

### 命名规范

- **文件名**: 使用小写 kebab-case（如 `error-handler.ts`）
- **类名/接口名**: 使用 PascalCase（如 `BusinessError`）
- **函数/变量名**: 使用 camelCase（如 `createRequest`）

### 代码风格

- 使用单引号
- 2 空格缩进
- 行宽 100 字符
- 使用 Biome 进行格式化

## 常用命令

```bash
# 安装依赖
bun install

# 构建所有包
bun run build

# 运行测试
bun test

# 格式化代码
bun run format

# 代码检查
bun run lint
```

## Packages

### @code-snippet/requests

基于 Axios 封装的 TypeScript HTTP 请求库，提供：

- 🔐 自定义认证：支持通过拦截器添加 Token
- 📦 智能解包：自动解包 `{ code, data, message }` 格式响应
- 🚨 统一错误处理：支持自定义错误处理器链
- 🎯 类型安全：完整的 TypeScript 类型推导

### @code-snippet/utils

通用工具函数库，提供：

- logger：日志工具
- delay：延迟函数
- generateUUID：UUID 生成

## 添加新包

1. 在 `packages/` 下创建新目录
2. 添加 `package.json`（name 使用 `@code-snippet/xxx` 格式）
3. 添加 `tsconfig.json`（继承 `../../tsconfig.base.json`）
4. 添加 `tsup.config.ts`（参考现有包配置）
5. 在根目录 `tsconfig.json` 添加 references
