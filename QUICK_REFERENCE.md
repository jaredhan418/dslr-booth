# DSLR Photo Booth - 快速参考

## 启动应用

```bash
npm start
```

## 基本操作流程

### 1. 连接相机
```
点击 "连接相机" → 等待连接成功 → 状态显示 "已连接"
```

### 2. 拍照
```
方式一：点击 "拍照" → 立即拍摄
方式二：设置倒计时 → 点击 "倒计时拍照" → 等待倒计时 → 自动拍摄
```

### 3. 编辑照片
```
切换到 "滤镜" 标签 → 调整滑块 → 点击 "应用滤镜"
```

### 4. 使用模板
```
切换到 "图层" 标签 → 点击 "加载模板" → 选择模板文件
```

### 5. 保存照片
```
点击底部 "保存照片" → 照片保存到 captured_photos 文件夹
```

### 6. 打印照片
```
点击 "打印照片" → 选择打印机 → 设置打印参数 → 确认打印
```

## 快捷键

当前版本暂无快捷键支持

## 滤镜效果参考

### 人像增强
- 亮度: 110%
- 对比度: 110%
- 饱和度: 120%

### 黑白艺术
- 灰度: 100%
- 对比度: 130%
- 亮度: 105%

### 复古怀旧
- 棕褐色: 70%
- 饱和度: 80%
- 对比度: 90%

### 柔和梦幻
- 亮度: 110%
- 饱和度: 130%
- 模糊: 2px

## 常见问题速查

### 相机连接失败
1. 检查 USB 连接
2. 确认相机已开机
3. 重启应用和相机

### 预览卡顿
1. 关闭实时预览
2. 减少滤镜使用
3. 关闭其他程序

### 照片保存位置
```
应用目录/captured_photos/
```

## 技术支持

- GitHub Issues: https://github.com/jaredhan418/dslr-booth/issues
- 文档: README.md, USER_GUIDE.md, DEVELOPMENT.md

## 文件位置

```
dslr-booth/
├── main.js              # 主进程
├── renderer.js          # 渲染进程
├── index.html           # 界面
├── styles.css           # 样式
├── package.json         # 配置
├── README.md            # 说明文档
├── USER_GUIDE.md        # 用户手册
├── DEVELOPMENT.md       # 开发指南
├── IMPLEMENTATION.md    # 实现指南
├── assets/              # 资源
├── templates/           # 模板
│   ├── birthday_template.json
│   └── event_template.json
└── captured_photos/     # 照片
```

## 开发命令

```bash
# 安装依赖
npm install

# 启动应用
npm start

# 构建 Windows 版本
npm run build:win

# 查看帮助
npm run --help
```

## 相机支持

### Sony
- Alpha 系列（A7, A9, A6000 等）
- 需要 PTP 支持

### Canon
- EOS 系列（5D, 6D, 80D, R5 等）
- 需要 PTP 支持

### 其他
- 支持 PTP/MTP 协议的数码相机

## 系统要求

- **操作系统**: Windows 10/11
- **Node.js**: >= 14.0.0
- **内存**: >= 4GB
- **磁盘**: >= 500MB

## 版本信息

- **当前版本**: 1.0.0
- **发布日期**: 2026-02-08
- **许可证**: MIT

---

**更多详细信息请参阅完整文档**
