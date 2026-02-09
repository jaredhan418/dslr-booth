# Electron TypeScript 执行问题修复

## 问题描述

运行 Electron 应用时出现错误：
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'D:\CodeRepo\dslr-booth\electron\camera-interface.js' 
imported from D:\CodeRepo\dslr-booth\electron\main.ts
```

## 问题原因

1. Electron 尝试直接执行 TypeScript 文件 (`.ts`)
2. TypeScript 代码中的导入使用 `.js` 扩展名（TypeScript ESM 约定）
3. 但实际文件是 `.ts` 扩展名
4. Electron 无法原生执行 TypeScript 代码

## 解决方案

使用 `vite-plugin-electron` 自动编译 TypeScript 文件到 JavaScript。

### 1. 配置 vite.config.ts

```typescript
import electron from 'vite-plugin-electron';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron([
      {
        // 主进程入口
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      },
      {
        // Preload 脚本
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron'
          }
        }
      }
    ])
  ],
  // ... 其他配置
});
```

### 2. 更新 package.json

```json
{
  "main": "dist-electron/main.js",  // 指向编译后的文件
  "scripts": {
    "electron:dev": "vite",  // Vite 会自动编译和启动 Electron
    "electron:build": "vite build && electron-builder"
  }
}
```

### 3. 创建 electron/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020"],
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "strict": true,
    "allowImportingTsExtensions": true,
    "noEmit": true
  },
  "include": ["./**/*.ts"]
}
```

## 工作原理

### 开发模式
1. 运行 `npm run electron:dev`
2. Vite 启动开发服务器 (http://localhost:5173)
3. `vite-plugin-electron` 监视 TypeScript 文件变化
4. 自动编译 TS → JS 到 `dist-electron/` 目录
5. Electron 启动并加载编译后的 JS 文件
6. 支持热重载（HMR）

### 生产构建
1. 运行 `npm run electron:build:win`
2. Vite 构建 React 应用 → `dist/`
3. `vite-plugin-electron` 编译 Electron 代码 → `dist-electron/`
4. `electron-builder` 打包所有文件

## 编译输出

```bash
dist-electron/
├── main.js       # 编译后的主进程 (17.55 KB)
└── preload.js    # 编译后的 preload (0.83 KB)
```

## 优势

1. **无需手动编译**: Vite 自动处理 TypeScript 编译
2. **快速开发**: 热重载支持，修改即生效
3. **类型安全**: 完整的 TypeScript 类型检查
4. **单一命令**: 一个命令完成所有构建
5. **正确的模块解析**: 自动处理 .js 扩展名约定
6. **性能优化**: esbuild 提供极快的编译速度

## 常见问题

### Q: 为什么 TypeScript 导入使用 .js 扩展名？
A: 这是 TypeScript ESM 的约定。TypeScript 不会修改导入路径，所以需要使用运行时的扩展名（.js），而不是源文件扩展名（.ts）。

### Q: 如何调试 Electron 主进程？
A: 在开发模式下，Electron 会自动打开 DevTools。也可以使用 VSCode 的调试配置。

### Q: 编译后的文件在哪里？
A: 编译后的文件在 `dist-electron/` 目录中。这个目录已经添加到 `.gitignore`。

### Q: 如何验证编译是否成功？
A: 运行 `npm run build`，检查 `dist-electron/` 目录是否包含 `main.js` 和 `preload.js`。

## 相关文档

- [vite-plugin-electron](https://github.com/electron-vite/vite-plugin-electron)
- [TypeScript ESM Support](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [Electron + Vite](https://electron-vite.org/)

## 总结

通过配置 `vite-plugin-electron`，我们实现了：
- ✅ 自动 TypeScript 编译
- ✅ 快速开发体验
- ✅ 类型安全保证
- ✅ 生产构建优化

现在可以直接运行 `npm run electron:dev` 启动应用，无需担心 TypeScript 执行问题。
