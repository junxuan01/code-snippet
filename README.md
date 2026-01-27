# Code Snippet Monorepo 🚀

基于 **Bun** 的 Monorepo 项目，包含常用的代码片段和工具库。

## 📦 Packages

| Package | 描述 |
|---------|------|
| [@junxuan/requests](./packages/requests) | 基于 Axios 的 HTTP 请求库 |
| [@junxuan/utils](./packages/utils) | 通用工具函数库 |

## 🛠️ 技术栈

- **Runtime & Package Manager**: [Bun](https://bun.sh) 1.3+
- **Build Tool**: [tsup](https://tsup.egoist.dev/) (ESM 格式)
- **Formatter & Linter**: [Biome](https://biomejs.dev/)
- **Type System**: TypeScript 5.7+
- **Versioning**: [Changesets](https://github.com/changesets/changesets)

## 🚀 快速开始

### 环境要求

- Bun 1.3+
- Node.js 18+ (npm 发布需要)

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

### 代码规范

```bash
# 格式化代码
bun run format

# 代码检查
bun run lint

# 格式化 + 检查
bun run check

# CI 检查（不自动修复）
bun run ci
```

### 类型检查

```bash
bun run typecheck
```

### 清理

```bash
bun run clean
```

## 📤 发布流程

### 使用交互式工具（推荐）

```bash
bun run pub
```

会显示菜单让你选择操作：
- 创建变更记录
- 更新版本号
- 发布到 npm
- 一键发布

### 手动发布步骤

#### 1. 创建变更记录

每次完成功能开发或 bug 修复后：

```bash
bun run changeset
```

按提示选择：
- 哪些包有变更
- 版本类型：`patch`（修复）、`minor`（新功能）、`major`（破坏性变更）
- 变更描述

然后提交生成的 changeset 文件。

#### 2. 更新版本号

```bash
bun run version
git add .
git commit -m "chore: version packages"
```

#### 3. 发布到 npm

```bash
# 确保已登录 npm
npm login

# 发布
bun run release

# 推送代码和 tag
git push --follow-tags
```

## 📂 项目结构

```
code-snippet/
├── packages/                  # Monorepo 包目录
│   ├── requests/             # HTTP 请求库
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── README.md
│   └── utils/                # 工具库
│       ├── src/
│       ├── package.json
│       └── README.md
├── scripts/
│   └── release.sh            # 发布脚本
├── .changeset/               # Changesets 配置
├── .github/                  # GitHub 配置
├── biome.json               # Biome 配置
├── bunfig.toml              # Bun 配置
├── tsconfig.base.json       # 基础 TS 配置
├── tsconfig.json            # 根 TS 配置
└── package.json             # 根 package.json
```

## ➕ 添加新包

1. 在 `packages/` 目录下创建新文件夹
2. 添加 `package.json`（name 使用 `@junxuan/xxx` 格式）
3. 添加 `tsconfig.json`（继承 `../../tsconfig.base.json`）
4. 添加 `tsup.config.ts`（参考现有包配置）
5. 在根目录 `tsconfig.json` 添加 references
6. 运行 `bun install`

## 📝 开发规范

### 命名规范

- **文件名**: kebab-case（如 `error-handler.ts`）
- **类名/接口名**: PascalCase（如 `BusinessError`）
- **函数/变量名**: camelCase（如 `createRequest`）

### 代码风格

- 单引号
- 2 空格缩进
- 行宽 100 字符
- 使用 Biome 进行格式化

## 📄 License

MIT © 2026
