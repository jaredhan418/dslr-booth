# DSLR Photo Booth v2.0 - 现代化升级指南

## 升级概览

本次升级将项目现代化，包含以下主要变更：

### ✨ 新特性

1. **Electron 40** - 最新版本，更好的性能和安全性
2. **Vite + React + TypeScript** - 现代化的开发体验
3. **shadcn/ui + Tailwind CSS** - 美观的 UI 组件库
4. **gphoto2 via WSL2** - 在 Windows 上使用 gphoto2

## 技术栈

### 前端
- **React 18** - 用户界面库
- **TypeScript** - 类型安全
- **Vite 5** - 快速的构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架
- **shadcn/ui** - 高质量的 UI 组件
- **Radix UI** - 无样式的可访问组件

### 后端
- **Electron 40** - 桌面应用框架
- **Node.js** - 运行时环境

### 相机控制
- **gphoto2-wsl** - 通过 WSL2 使用 gphoto2
- **camera-interface** - Windows PTP/MTP 原生支持
- **digiCamControl** - 可选的第三方集成

## 项目结构

```
dslr-booth/
├── electron/                 # Electron 主进程
│   ├── main.js              # 主进程入口
│   ├── preload.js           # 预加载脚本（安全桥接）
│   ├── camera-interface.js  # Windows 相机接口
│   └── gphoto2-wsl.js       # gphoto2 WSL2 包装器
├── src/                     # React 应用源码
│   ├── components/          # React 组件
│   │   └── ui/             # shadcn/ui 组件
│   ├── lib/                # 工具函数
│   ├── types/              # TypeScript 类型定义
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # React 入口
│   └── index.css           # 全局样式
├── assets/                  # 静态资源
├── dist/                    # Vite 构建输出
├── dist-electron/           # Electron 打包输出
├── index.html              # HTML 入口
├── vite.config.ts          # Vite 配置
├── tailwind.config.js      # Tailwind 配置
├── tsconfig.json           # TypeScript 配置
└── package.json            # 项目配置
```

## 安装和使用

### 前置要求

1. **Node.js** 18+ 
2. **npm** 或 **yarn**
3. **Windows 10/11** (用于 WSL2)

### 可选：gphoto2 支持

如果要使用 gphoto2（推荐用于专业相机控制）：

1. **安装 WSL2**
   ```powershell
   wsl --install
   ```

2. **安装 usbipd-win**
   ```powershell
   winget install usbipd
   ```

3. **在 WSL2 中安装 gphoto2**
   ```bash
   wsl
   sudo apt update
   sudo apt install gphoto2
   ```

4. **附加 USB 设备到 WSL2**
   ```powershell
   # 列出设备
   usbipd wsl list
   
   # 附加相机（替换 X-Y 为实际的 bus ID）
   usbipd wsl attach --busid X-Y
   ```

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 启动 Vite 开发服务器和 Electron
npm run electron:dev
```

### 构建

```bash
# 构建 Windows 应用
npm run electron:build:win
```

## gphoto2 WSL2 集成

### 工作原理

1. **USB 直通**: usbipd-win 将 Windows USB 设备传递给 WSL2
2. **gphoto2 命令**: 在 WSL2 中运行 gphoto2 命令
3. **进程通信**: Node.js 通过子进程与 WSL2 通信
4. **文件转换**: 自动转换 WSL 和 Windows 路径

### 功能特性

- ✅ 自动检测 WSL2 和 gphoto2 可用性
- ✅ 自动查找和附加相机设备
- ✅ 完整的相机控制（拍照、预览、配置）
- ✅ 与现有相机接口无缝集成
- ✅ 优雅的回退机制

### 使用示例

```typescript
// 在 React 组件中
const connectCamera = async () => {
  // 优先使用 gphoto2
  const result = await window.electronAPI.connectCamera({
    preferGPhoto2: true
  });
  
  if (result.success) {
    console.log('连接模式:', result.mode); // 'gphoto2-wsl' or 'ptp' or 'demo'
  }
};
```

## UI 组件

### shadcn/ui 组件

已集成的组件：
- **Button** - 按钮组件
- **Input** - 输入框
- **Tabs** - 标签页

添加新组件：
```bash
# 使用 shadcn/ui CLI 添加组件
npx shadcn-ui@latest add <component-name>
```

### 自定义主题

在 `tailwind.config.js` 中修改颜色和样式变量。

## API 参考

### Electron API

通过 `window.electronAPI` 访问：

```typescript
// 相机操作
await window.electronAPI.connectCamera(options)
await window.electronAPI.checkGPhoto2WSL()
await window.electronAPI.getPreview()
await window.electronAPI.capturePhoto(options)

// gphoto2 专用
await window.electronAPI.getCameraConfig()
await window.electronAPI.setCameraConfig(key, value)

// 图像操作
await window.electronAPI.saveImage(dataUrl, filename)
await window.electronAPI.printImage(filepath)

// 模板操作
await window.electronAPI.loadTemplate()
await window.electronAPI.saveTemplate(templateData)

// 相册操作
await window.electronAPI.getPhotos()
```

## 安全性

### Context Isolation

Electron 40 默认启用 `contextIsolation`，通过 preload 脚本安全地暴露 API。

### Content Security Policy

建议在生产环境中添加 CSP：

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">
```

## 故障排除

### WSL2 问题

**问题**: WSL2 不可用
```bash
# 检查 WSL 状态
wsl --status

# 更新 WSL
wsl --update
```

**问题**: 相机未检测到
```bash
# 在 WSL2 中检查 USB 设备
wsl lsusb

# 检查 gphoto2
wsl gphoto2 --auto-detect
```

### 构建问题

**问题**: 原生模块编译失败
```bash
# 重新构建原生模块
npm rebuild
```

**问题**: TypeScript 错误
```bash
# 清理并重新构建
rm -rf dist node_modules
npm install
npm run build
```

## 性能优化

### 开发环境
- Vite 的 HMR 提供快速的开发反馈
- React Fast Refresh 保持组件状态

### 生产环境
- 代码分割和懒加载
- Tree shaking 删除未使用的代码
- 资源压缩和优化

## 迁移指南

### 从 v1.0 迁移

1. **备份数据**
   - captured_photos/
   - templates/
   - 配置文件

2. **更新依赖**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **迁移配置**
   - 相机设置保持兼容
   - 模板格式不变

4. **测试功能**
   - 测试相机连接
   - 验证滤镜和图层
   - 检查打印功能

## 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License

---

**版本**: 2.0.0  
**更新日期**: 2026-02-08  
**作者**: DSLR Booth Team
