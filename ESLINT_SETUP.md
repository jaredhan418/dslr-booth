# ESLint v9 配置文档

## 概述

本项目已配置 ESLint v9 以确保代码质量和一致性。配置包括对 React 19 和 Electron 40 的完整支持。

## 已安装的包

### 核心
- **eslint** (^9.39.2) - ESLint 核心
- **@eslint/js** (^9.39.2) - ESLint JavaScript 配置
- **typescript-eslint** (^8.54.0) - TypeScript ESLint 解析器和插件

### React 相关
- **eslint-plugin-react** (^7.37.5) - React 规则
- **eslint-plugin-react-hooks** (^5.2.0) - React Hooks 规则
- **eslint-plugin-react-refresh** (^0.4.26) - React Fast Refresh 规则
- **eslint-plugin-jsx-a11y** (^6.10.2) - JSX 可访问性规则

### 工具
- **globals** (^15.15.0) - 全局变量定义

## 配置文件

### eslint.config.js

使用 ESLint v9 的 **扁平配置格式**（Flat Config），配置分为三个主要部分：

#### 1. React 应用配置 (src/)
- 目标文件: `src/**/*.{ts,tsx}`
- 环境: 浏览器
- 插件:
  - React 核心规则
  - React Hooks 规则（推荐配置）
  - React Refresh（HMR 支持）
  - JSX A11y（可访问性）
- React 版本: 19.2
- 关键规则:
  - 不需要显式导入 React（React 17+）
  - 使用 TypeScript 进行类型检查而非 prop-types
  - 可访问性规则启用

#### 2. Electron 主进程配置 (electron/)
- 目标文件: `electron/**/*.{ts,js}`
- 环境: Node.js
- 关键规则:
  - 允许 console.log（主进程调试需要）
  - 允许动态 require（Electron 特性）
  - TypeScript 严格规则

#### 3. 配置文件
- 目标: `*.config.{ts,js,mjs}`
- 环境: Node.js

## NPM 脚本

```bash
# 检查代码
npm run lint

# 自动修复问题
npm run lint:fix
```

## VS Code 集成

项目包含 `.vscode/settings.json` 配置：
- 保存时自动修复 ESLint 问题
- ESLint 作为默认格式化工具
- 支持 TypeScript 和 React

## 规则说明

### TypeScript 规则
- `@typescript-eslint/no-unused-vars`: 警告未使用的变量（以 `_` 开头的除外）
- `@typescript-eslint/no-explicit-any`: 警告使用 `any` 类型
- `@typescript-eslint/no-require-imports`: Electron 中允许 require

### React 规则
- `react/react-in-jsx-scope`: 关闭（React 17+ 不需要）
- `react/prop-types`: 关闭（使用 TypeScript）
- `react-refresh/only-export-components`: 警告非组件导出（HMR 需要）

### 可访问性规则
- JSX A11y 推荐配置启用
- 确保表单元素有关联的标签
- 确保语义化 HTML

## 当前状态

✅ **0 错误**  
⚠️ **61 警告**

### 警告类型
1. **TypeScript any 类型** (主要): 建议添加具体类型定义
2. **未使用的变量**: 主要是 catch 块中的 error 参数（可以用 `_error` 忽略）
3. **未使用的参数**: 事件处理器中未使用的 event 参数

## 最佳实践

### 1. 避免 any 类型
```typescript
// ❌ 不好
function handleData(data: any) { }

// ✅ 好
interface Data {
  id: string;
  value: number;
}
function handleData(data: Data) { }
```

### 2. 处理未使用的变量
```typescript
// ❌ 会警告
try {
  // code
} catch (error) {
  console.log('Error occurred');
}

// ✅ 使用 _ 前缀
try {
  // code
} catch (_error) {
  console.log('Error occurred');
}
```

### 3. React 组件导出
```typescript
// ✅ 只导出组件
export function MyComponent() {
  return <div>Hello</div>;
}

// ⚠️ 会警告（导出了常量）
export const MY_CONSTANT = 'value';
export function MyComponent() {
  return <div>Hello</div>;
}
```

### 4. 可访问性
```tsx
// ❌ 标签无关联
<label>Name</label>
<input type="text" />

// ✅ 使用 htmlFor
<label htmlFor="name">Name</label>
<input id="name" type="text" />
```

## 忽略规则

如果需要忽略特定规则，使用注释：

```typescript
// 忽略单行
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = fetchData();

// 忽略整个文件
/* eslint-disable @typescript-eslint/no-explicit-any */

// 忽略文件的特定规则
/* eslint-disable-next-line jsx-a11y/label-has-associated-control */
```

## 配置更新

要修改规则，编辑 `eslint.config.js`:

```javascript
rules: {
  // 将警告改为错误
  '@typescript-eslint/no-explicit-any': 'error',
  
  // 关闭规则
  'no-console': 'off',
  
  // 自定义规则选项
  '@typescript-eslint/no-unused-vars': [
    'warn',
    { argsIgnorePattern: '^_' }
  ],
}
```

## CI/CD 集成

在 CI 管道中添加：

```yaml
- name: Lint
  run: npm run lint
```

## 常见问题

### Q: 为什么使用扁平配置？
A: ESLint v9 推荐使用扁平配置格式，它更简单、更灵活，并且是未来的标准。

### Q: 为什么有这么多警告？
A: 警告是建议，不会阻止构建。它们帮助改进代码质量，可以逐步修复。

### Q: 如何在 Electron 中使用 console.log？
A: 已配置允许，主进程需要 console 进行日志记录。

### Q: React 19 兼容吗？
A: 是的，所有插件都支持 React 19。

## 参考资源

- [ESLint v9 文档](https://eslint.org/docs/latest/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react)
- [JSX A11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)

---

**配置版本**: ESLint v9  
**最后更新**: 2026-02-09
