# 🚀 All in Bun Monorepo - 快速开始指南

## 📋 前置要求

### 安装 Bun

#### macOS / Linux

```bash
curl -fsSL https://bun.sh/install | bash
```

#### Windows

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

#### 验证安装

```bash
bun --version
```

---

## 🎯 项目设置

### 1. 克隆项目后首次设置

```bash
# 进入项目目录
cd code-snippet

# 安装所有依赖（包括 workspace 包）
bun install
```

### 2. 构建所有包

```bash
bun run build
```

---

## 💻 开发工作流

### 日常开发

```bash
# 开发模式（watch 所有包）
bun run dev

# 或者开发单个包
bun run --cwd packages/requests dev
bun run --cwd packages/utils dev
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
# 运行所有测试
bun test

# Watch 模式
bun test --watch

# 测试单个文件
bun test packages/requests/src/index.test.ts
```

### 类型检查

```bash
# 检查所有包
bun run typecheck
```

### 清理

```bash
# 清理构建产物
bun run clean
```

---

## 📦 添加依赖

### 给特定包添加依赖

```bash
# 给 requests 包添加依赖
cd packages/requests
bun add lodash

# 或者从根目录
bun add --cwd packages/requests lodash
```

### 给根目录添加开发依赖

```bash
bun add -d prettier eslint
```

### Workspace 内部依赖

在 `packages/requests/package.json` 中：

```json
{
  "dependencies": {
    "@code-snippet/utils": "workspace:*"
  }
}
```

然后运行：

```bash
bun install
```

---

## 🔧 Bun 特有功能

### 1. 直接运行 TypeScript

```bash
# 无需编译，直接运行
bun run packages/requests/src/index.ts
```

### 2. Bun Build（内置打包）

```bash
# 打包单个文件
bun build packages/requests/src/index.ts --outdir packages/requests/dist --format esm

# 打包多个格式
bun build src/index.ts --outdir dist --format esm --format cjs

# 生成 source map
bun build src/index.ts --outdir dist --sourcemap=external

# Minify
bun build src/index.ts --outdir dist --minify

# Watch 模式
bun build src/index.ts --outdir dist --watch
```

### 3. Bun Test

```bash
# 运行测试（支持 describe、it、expect）
bun test

# 使用匹配模式
bun test --test-name-pattern "Request"

# 显示详细输出
bun test --verbose
```

### 4. 性能优势

| 操作 | Node.js + npm | Bun |
|------|---------------|-----|
| 安装依赖 | ~20s | ~1s |
| 运行 TypeScript | 需要 ts-node | 原生支持 |
| 打包 | 需要 webpack/rollup | 内置 |
| 测试 | 需要 jest/vitest | 内置 |

---

## 🐛 常见问题

### Q: 为什么不用 pnpm/npm?

A: Bun 本身就是包管理器，速度更快，功能更强大，无需额外工具。

### Q: 如何处理 TypeScript 类型定义？

A: 使用 `bun x tsc` 生成类型定义文件：

```bash
bun x tsc --project tsconfig.json --declaration --emitDeclarationOnly --outDir dist
```

### Q: 生产环境可以用 Bun 吗？

A: Bun 已经稳定，可用于生产环境。但如果需要部署到 Node.js 环境，请先用 `bun build` 打包。

### Q: 如何升级 Bun？

```bash
bun upgrade
```

---

## 📚 学习资源

- [Bun 官方文档](https://bun.sh/docs)
- [Bun Workspace 指南](https://bun.sh/docs/install/workspaces)
- [Bun Build API](https://bun.sh/docs/bundler)
- [Bun Test Runner](https://bun.sh/docs/cli/test)

---

## 🎓 Bun 最佳实践

1. **使用 bunfig.toml** 配置全局选项
2. **利用 workspace** 管理 monorepo
3. **使用内置工具** 避免安装额外依赖
4. **类型定义** 使用 `bun x tsc` 生成
5. **CI/CD** 使用 Docker 或 GitHub Actions with Bun

---

**Happy Coding with Bun! 🎉**
