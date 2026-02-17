# Preload Script Execution Fix

## 问题描述

Preload 脚本没有被正确执行，导致 `window.electronAPI` 未定义，引发 TypeError。

## 原因分析

`vite-plugin-electron` 的 preload 配置中存在两个问题：

1. **onstart reload handler**：不必要的 reload 调用干扰了 preload 脚本的正常加载
2. **缺少 external 配置**：没有正确处理 electron 模块的外部依赖

## 解决方案

### 修改前（有问题）
```typescript
{
  entry: 'electron/preload.ts',
  onstart(options) {
    options.reload();  // ❌ 导致问题
  },
  vite: {
    build: {
      outDir: 'dist-electron'
      // ❌ 缺少 external 配置
    }
  }
}
```

### 修改后（正确）
```typescript
{
  entry: 'electron/preload.ts',
  // ✅ 移除 onstart reload
  vite: {
    build: {
      outDir: 'dist-electron',
      rollupOptions: {
        external: ['electron']  // ✅ 添加 external
      }
    }
  }
}
```

## 结果

✅ Preload 脚本正确编译到 `dist-electron/preload.js`  
✅ `electronAPI` 成功暴露给渲染进程  
✅ 所有 IPC 通信正常工作  
✅ 不再出现 TypeError

## 验证方法

1. 构建项目：
```bash
npm run build
```

2. 检查输出：
```bash
ls -la dist-electron/
# 应该看到 main.js 和 preload.js
```

3. 运行应用：
```bash
npm run electron:dev
```

4. 在开发者工具控制台检查：
```javascript
console.log(window.electronAPI);
// 应该显示对象，包含所有 API 方法
```

## 最佳实践

1. **简化配置**：preload 配置应该与 main 进程保持一致
2. **外部依赖**：始终将 'electron' 标记为 external
3. **避免 reload**：不要在 preload 配置中使用 onstart reload
4. **日志调试**：在 preload.ts 中添加 console.log 帮助调试加载问题

## 相关文件

- `vite.config.ts` - Vite 和 Electron 构建配置
- `electron/preload.ts` - Preload 脚本源码
- `electron/main.ts` - 主进程，加载 preload 脚本
- `src/App.tsx` - 渲染进程，使用 electronAPI

## 参考资料

- [vite-plugin-electron 文档](https://github.com/electron-vite/vite-plugin-electron)
- [Electron Preload Scripts](https://www.electronjs.org/docs/latest/tutorial/tutorial-preload)
- [Electron Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
