# Copilot Instructions for code snippets

# 诉求：

你是一个Google高级架构师
我想做个 bun workspace 的 monorepo 项目。packages包括:

- 1. requests: 一个封装了 axios 的请求库
     等等

# 要求：

- All in bun 全部使用bun自带的能力运行和管理

请帮我生成一个完整的 monorepo 项目结构，包括各个 package 的基础代码文件和配置文件。要求如下：

- 每个 package 都有独立的 tsconfig.json 文件
- 根目录有一个统一的 tsconfig.base.json 文件，供各个 package 继承
- 每个 package 都有独立的 package.json 文件，包含必要的依赖和脚本
- 根目录有一个统一的 package.json 文件，管理工作区和公共依赖

请根据提示文件，帮助我完成方案。先不要写代码。包括打包工具的选择。README.md 文件等。
