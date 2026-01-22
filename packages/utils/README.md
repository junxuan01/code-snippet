# @code-snippet/utils

通用工具函数库。

## ✨ 特性

- 🪵 **Logger**: 简单的日志工具
- ⏱️ **Delay**: 延迟函数
- 🆔 **UUID**: UUID 生成器

## 📦 安装

```bash
bun add @code-snippet/utils
```

## 🚀 使用

```typescript
import { logger, delay, generateUUID } from '@code-snippet/utils';

// 日志
logger.info('Hello, world!');
logger.error('An error occurred');

// 延迟
await delay(1000);

// UUID
const id = generateUUID();
```

## 📄 License

MIT
