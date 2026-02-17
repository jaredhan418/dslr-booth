# DSLR Photo Booth

一个功能强大的 Electron 桌面应用程序，用于在 Windows 平台上通过 USB 控制 Sony/Canon 数码相机，实现专业的照片拍摄体验。

![DSLR Photo Booth](https://img.shields.io/badge/platform-Windows-blue)
![Electron](https://img.shields.io/badge/Electron-40.0.0-brightgreen)
![React](https://img.shields.io/badge/React-19.2-blue)
![Vite](https://img.shields.io/badge/Vite-7.3-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-v4.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 主要功能

### 📷 相机控制（Windows 优化）
- **多种连接模式**：
  - Windows PTP 基础模式（即插即用）
  - digiCamControl 完整模式（推荐）
  - 演示模式（无相机测试）
- **USB 连接支持**：直接通过 USB 连接 Sony 和 Canon 数码相机
- **实时预览**：查看相机实时画面（digiCamControl 模式）
- **即时拍照**：一键拍摄高质量照片
- **倒计时模式**：支持 1-10 秒倒计时拍照，完美适合自拍
- **gphoto2 WSL2 支持**：通过 WSL2 实现专业的 gphoto2 相机控制（可选）

### 🎨 图像处理
- **实时滤镜系统**：
  - 亮度调节
  - 对比度调节
  - 饱和度调节
  - 模糊效果
  - 灰度效果
  - 棕褐色效果
- **图层管理系统**：
  - 类似 Photoshop 的图层功能
  - 支持图像图层和文字图层
  - 图层显示/隐藏控制
  - 图层透明度调节
  - 模板保存和加载

### 🖨️ 打印功能
- 直接连接 Windows 系统打印服务
- 一键打印处理后的照片
- 支持所有 Windows 兼容打印机

### 📁 照片管理
- 自动保存拍摄的照片
- 照片相册浏览
- 快速加载历史照片进行二次编辑

## 🚀 快速开始

### 系统要求

- **操作系统**：Windows 10/11
- **Node.js**：14.0 或更高版本
- **相机**：Sony 或 Canon 数码相机（支持 PTP/MTP 协议）
- **USB 连接**：USB 2.0 或更高版本
- **可选软件**：digiCamControl（推荐用于完整相机控制）

### 相机支持

本应用提供多种相机控制模式：

1. **演示模式**：无相机时用于开发和测试
2. **Windows PTP 模式**：基础相机检测（原生支持）
3. **digiCamControl 模式**：完整功能（需安装，推荐）
4. **gphoto2 WSL2 模式**：专业级控制（通过 WSL2，可选）

详细设置指南请参阅：[UPGRADE_GUIDE.md](UPGRADE_GUIDE.md)

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/jaredhan418/dslr-booth.git
cd dslr-booth
```

2. **安装依赖**
```bash
npm install
```

3. **启动应用**
```bash
npm start
```

### 打包应用

创建 Windows 可执行文件：
```bash
npm run build:win
```

打包后的应用程序将位于 `dist` 目录中。

## 📖 使用指南

### 连接相机

本应用支持多种相机连接模式，会自动检测最佳可用模式：

**模式 1：digiCamControl（推荐）**
1. 下载并安装 [digiCamControl](https://digicamcontrol.com/download)
2. 启动 digiCamControl 并连接相机
3. 在 digiCamControl 中启用 Web Server（Settings → Web Server）
4. 启动本应用，点击"连接相机"

**模式 2：Windows PTP（基础）**
1. 通过 USB 线缆将相机连接到电脑
2. 在相机中设置 USB 模式为 "PTP" 或 "PC Remote"
3. Windows 会自动识别相机
4. 启动应用，点击"连接相机"

**模式 3：演示模式（无相机）**
- 无需相机，应用会自动使用演示模式
- 可以测试所有界面功能和图像处理功能

**详细设置指南**：请查看 [UPGRADE_GUIDE.md](UPGRADE_GUIDE.md)

### 拍摄照片

**即时拍照**：
1. 确保相机已连接
2. 点击"拍照"按钮
3. 照片将显示在预览区域

**倒计时拍照**：
1. 设置倒计时秒数（1-10 秒）
2. 点击"倒计时拍照"按钮
3. 等待倒计时结束自动拍摄

### 应用滤镜

1. 拍摄或加载照片后，切换到"滤镜"标签
2. 调整各种滤镜参数：
   - 拖动滑块实时预览效果
   - 点击"应用滤镜"保存更改
   - 点击"重置滤镜"恢复原始状态

### 使用图层

**加载模板**：
1. 切换到"图层"标签
2. 点击"加载模板"
3. 选择图片文件或 JSON 模板文件
4. 模板将作为背景层显示

**添加文字**：
1. 点击"添加文字"按钮
2. 输入文字内容
3. 文字将添加到画布中央

**图层管理**：
- 点击眼睛图标切换图层可见性
- 点击垃圾桶图标删除图层
- 使用"清除图层"删除所有图层

**保存模板**：
1. 创建好图层布局后
2. 点击"保存模板"
3. 选择保存位置，模板将保存为 JSON 文件

### 打印照片

1. 编辑完成照片后
2. 点击"打印照片"按钮
3. Windows 打印对话框将自动打开
4. 选择打印机和打印设置
5. 确认打印

### 照片相册

1. 切换到"相册"标签
2. 浏览所有已保存的照片
3. 点击照片可重新加载进行编辑
4. 点击打印图标直接打印照片

## 🛠️ 技术栈

- **Electron 40.0.0**：跨平台桌面应用框架（最新版本）
- **React 19.2.4**：用户界面库（最新版本）
- **TypeScript 5.9.3**：类型安全的开发
- **Vite 7.3.1**：极速构建工具（最新版本）
- **Tailwind CSS v4.0**：实用优先的 CSS 框架（最新版本，CSS-first 配置）
- **Base UI**：Uber 的 React 组件库
- **ESLint v9**：代码质量检查（flat config）
- **Node.js**：后端运行时
- **Canvas API**：图像处理和渲染
- **Windows PTP/MTP**：相机连接（原生支持）
- **digiCamControl API**：高级相机控制（可选）
- **gphoto2 (WSL2)**：专业相机控制（可选）

## 📁 项目结构

```
dslr-booth/
├── electron/                   # Electron 主进程代码
│   ├── main.ts                # 主进程入口（TypeScript）
│   ├── preload.ts             # 预加载脚本
│   ├── camera-interface.ts    # 相机控制接口
│   └── gphoto2-wsl.ts        # gphoto2 WSL2 包装器
├── src/                       # React 应用代码
│   ├── components/            # React 组件
│   │   └── ui/               # UI 组件库
│   ├── App.tsx               # 主应用组件
│   └── main.tsx              # React 入口
├── dist-electron/             # Electron 编译输出
├── dist/                      # React 构建输出
├── templates/                 # 图层模板目录
├── captured_photos/           # 保存的照片目录
├── package.json              # 项目配置
├── vite.config.ts            # Vite 配置
├── tsconfig.json             # TypeScript 配置
├── eslint.config.js          # ESLint v9 配置
├── README.md                 # 项目文档
├── UPGRADE_GUIDE.md          # 升级和设置指南
└── TAILWIND_V4_MIGRATION.md  # Tailwind v4 迁移指南
```

## 🎯 核心功能实现

### 相机连接
应用支持多种相机控制模式，会自动检测最佳可用模式：

1. **自动检测**：应用会自动检测可用的相机和控制模式
2. **Windows PTP**：使用 Windows 原生 PTP/MTP 驱动进行基础相机检测
3. **digiCamControl**：通过 HTTP API 集成实现完整相机控制（推荐）
4. **gphoto2 WSL2**：通过 WSL2 实现专业级相机控制（可选）
5. **演示模式**：无相机时自动启用，用于开发和演示

详细设置请参阅 [UPGRADE_GUIDE.md](UPGRADE_GUIDE.md)

### 实时预览
通过定期从相机获取预览帧，并在 Canvas 上渲染，实现实时预览功能。

### 滤镜系统
使用 Canvas Filter API 实现各种图像滤镜效果，所有效果可实时预览和调整。

### 图层系统
实现了类似 Photoshop 的图层系统：
- 支持图像图层和文字图层
- 图层堆叠和透明度控制
- 模板保存为 JSON 格式，便于复用

### 打印集成
通过 Electron 的 shell 模块调用 Windows 系统的打印服务，支持所有系统打印机。

## 🔧 开发指南

### 代码质量
本项目配置了完整的代码质量工具：

- **ESLint v9**：使用 flat config 格式，包含 React、TypeScript 和 Electron 规则
- **TypeScript**：严格模式，完整的类型检查
- **Prettier 友好**：代码风格统一

### 构建系统
- **Vite 7**：极速开发和构建
- **HMR**：热模块替换，开发时即时更新
- **TypeScript 编译**：自动编译 Electron 和 React 代码
- **优化打包**：生产构建自动优化和压缩

### 配置文件
- `vite.config.ts`：Vite 和 Electron 构建配置
- `eslint.config.js`：ESLint v9 flat config
- `tsconfig.json`：TypeScript 配置（React）
- `electron/tsconfig.json`：TypeScript 配置（Electron）

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📝 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [gPhoto2](http://www.gphoto.org/) - 相机控制库
- 所有贡献者和使用者

## 📮 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue：[GitHub Issues](https://github.com/jaredhan418/dslr-booth/issues)
- 邮件：[项目维护者邮箱]

## 🔮 未来计划

- [ ] 支持更多相机品牌（Nikon、Fujifilm 等）
- [ ] 添加更多滤镜效果
- [ ] 实现照片批量处理
- [ ] 添加 GIF 动画制作功能
- [ ] 支持视频录制
- [ ] 云存储集成
- [ ] 移动设备远程控制

---

**让专业摄影触手可及！** 🎉