# Code Snippet Monorepo

基于pnpm workspace的monorepo项目结构。

## 项目结构

```
code-snippet/
├── packages/
│   ├── common/    # 公共工具库
│   └── core/      # 核心功能模块
├── package.json
└── pnpm-workspace.yaml
```

## 开发命令

```bash
# 安装所有依赖
pnpm install

# 构建所有包
pnpm build

# 开发模式
pnpm dev

# 清理构建产物
pnpm clean
```

## 新增包

在packages目录下创建新目录，添加package.json文件，然后执行`pnpm install`。
