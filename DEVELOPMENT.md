# DSLR Photo Booth - 开发指南

## 开发环境设置

### 前置要求

1. **Node.js 和 npm**
   ```bash
   # 检查版本
   node --version  # >= 14.0.0
   npm --version   # >= 6.0.0
   ```

2. **Git**
   ```bash
   git --version
   ```

3. **Windows 构建工具** (仅 Windows)
   ```bash
   npm install --global windows-build-tools
   ```

### 克隆和安装

```bash
# 克隆仓库
git clone https://github.com/jaredhan418/dslr-booth.git
cd dslr-booth

# 安装依赖
npm install

# 启动开发模式
npm start
```

## 项目结构详解

```
dslr-booth/
├── main.js                 # Electron 主进程
│   ├── 窗口创建和管理
│   ├── IPC 处理器
│   ├── 文件系统操作
│   └── 相机接口调用
│
├── renderer.js             # 渲染进程
│   ├── UI 事件处理
│   ├── Canvas 图像处理
│   ├── 状态管理
│   └── IPC 通信
│
├── index.html              # 主界面
│   ├── 布局结构
│   ├── 控件定义
│   └── 标签页系统
│
├── styles.css              # 样式表
│   ├── 布局样式
│   ├── 组件样式
│   ├── 动画效果
│   └── 响应式设计
│
├── package.json            # 项目配置
├── assets/                 # 资源文件
├── templates/              # 模板文件
├── captured_photos/        # 照片存储
│
├── README.md               # 项目说明
├── IMPLEMENTATION.md       # 实现指南
├── USER_GUIDE.md          # 用户手册
└── DEVELOPMENT.md         # 本文档
```

## 核心模块说明

### 1. 主进程 (main.js)

**职责：**
- 创建和管理应用窗口
- 处理系统级操作
- 管理文件 I/O
- 与相机硬件通信

**主要 IPC 处理器：**

```javascript
// 相机控制
ipcMain.handle('connect-camera', async () => {})
ipcMain.handle('get-preview', async () => {})
ipcMain.handle('capture-photo', async () => {})

// 文件操作
ipcMain.handle('save-image', async (event, dataUrl, filename) => {})
ipcMain.handle('load-template', async () => {})
ipcMain.handle('save-template', async (event, templateData) => {})

// 打印
ipcMain.handle('print-image', async (event, filepath) => {})
```

### 2. 渲染进程 (renderer.js)

**职责：**
- 处理用户交互
- 管理应用状态
- Canvas 图像渲染
- 调用主进程服务

**核心状态：**

```javascript
let cameraConnected = false;      // 相机连接状态
let previewActive = false;        // 预览激活状态
let currentPhoto = null;          // 当前照片数据
let templateLayers = [];          // 图层数组
let currentFilters = {};          // 滤镜配置
```

**主要功能模块：**

1. **相机管理**
   - `connectCamera()` - 连接相机
   - `startPreview()` - 开始预览
   - `stopPreview()` - 停止预览
   - `capturePhoto()` - 拍照
   - `captureWithCountdown()` - 倒计时拍照

2. **图像处理**
   - `applyFiltersToCanvas()` - 应用滤镜
   - `redrawCanvas()` - 重绘画布
   - `drawLayers()` - 绘制图层

3. **图层管理**
   - `loadTemplate()` - 加载模板
   - `saveTemplate()` - 保存模板
   - `addTextLayer()` - 添加文字
   - `updateLayersList()` - 更新图层列表

4. **文件操作**
   - `savePhoto()` - 保存照片
   - `printPhoto()` - 打印照片
   - `loadGallery()` - 加载相册

## 开发工作流

### 开发模式

```bash
# 启动应用
npm start

# 启用开发者工具
# 在 main.js 中取消注释：
# mainWindow.webContents.openDevTools();
```

### 调试技巧

**1. 主进程调试**
```javascript
// 在 main.js 中添加日志
console.log('[Main]', message);
```

**2. 渲染进程调试**
```javascript
// 在 renderer.js 中使用 console
console.log('[Renderer]', message);

// 使用 Chrome DevTools
// F12 或 Ctrl+Shift+I
```

**3. IPC 通信调试**
```javascript
// 在主进程
ipcMain.handle('test', async (event, data) => {
    console.log('Received:', data);
    return { success: true };
});

// 在渲染进程
const result = await ipcRenderer.invoke('test', { test: 'data' });
console.log('Result:', result);
```

### 代码风格

**JavaScript**
- 使用 ES6+ 语法
- 驼峰命名法
- 函数命名清晰描述功能
- 适当添加注释

**HTML**
- 语义化标签
- 使用有意义的 id 和 class
- 保持结构清晰

**CSS**
- BEM 命名规范（可选）
- 组织相关样式
- 使用 CSS 变量管理主题色

### Git 工作流

**分支策略：**
```bash
main           # 主分支，稳定版本
├── develop    # 开发分支
│   ├── feature/camera-control    # 功能分支
│   ├── feature/filters           # 功能分支
│   └── bugfix/preview-issue      # 修复分支
```

**提交规范：**
```bash
# 格式
<type>(<scope>): <subject>

# 类型
feat: 新功能
fix: 修复
docs: 文档
style: 格式
refactor: 重构
test: 测试
chore: 构建/工具

# 示例
feat(camera): add Sony camera support
fix(preview): resolve lag issue
docs(readme): update installation guide
```

## 添加新功能

### 示例：添加新滤镜

**1. 在 renderer.js 中添加滤镜**

```javascript
// 更新默认滤镜
let currentFilters = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    hueRotate: 0  // 新增
};

// 更新滤镜应用函数
function applyFiltersToCanvas() {
    const filters = [];
    // ... 现有滤镜
    if (currentFilters.hueRotate > 0) {
        filters.push(`hue-rotate(${currentFilters.hueRotate}deg)`);
    }
    ctx.filter = filters.join(' ') || 'none';
}
```

**2. 在 index.html 中添加控件**

```html
<div class="filter-item">
    <label>色相旋转</label>
    <input type="range" id="hue-rotate" min="0" max="360" value="0">
    <span id="hue-rotate-value">0°</span>
</div>
```

**3. 在 renderer.js 中绑定事件**

```javascript
function setupFilterControls() {
    // ... 现有代码
    
    const hueRotate = document.getElementById('hue-rotate');
    const hueRotateValue = document.getElementById('hue-rotate-value');
    
    hueRotate.addEventListener('input', (e) => {
        const value = e.target.value;
        currentFilters.hueRotate = parseInt(value);
        hueRotateValue.textContent = `${value}°`;
        
        if (currentPhoto) {
            redrawCanvas();
        }
    });
}
```

### 示例：添加新相机品牌支持

**1. 安装相机库**

```bash
npm install nikon-camera-control
```

**2. 在 main.js 中扩展相机接口**

```javascript
const NikonCamera = require('nikon-camera-control');

let currentCamera = null;
let cameraType = null; // 'sony', 'canon', 'nikon'

ipcMain.handle('connect-camera', async (event) => {
    try {
        // 尝试检测相机类型
        const cameras = await detectCameras();
        
        if (cameras.nikon) {
            currentCamera = new NikonCamera();
            cameraType = 'nikon';
        } else if (cameras.sony) {
            // Sony 连接逻辑
            cameraType = 'sony';
        } else if (cameras.canon) {
            // Canon 连接逻辑
            cameraType = 'canon';
        }
        
        await currentCamera.connect();
        return { success: true, type: cameraType };
    } catch (error) {
        return { success: false, message: error.message };
    }
});
```

## 构建和打包

### 开发构建

```bash
# 启动开发服务器
npm start
```

### 生产构建

```bash
# Windows
npm run build:win

# 构建产物位置
dist/
├── DSLR Booth Setup 1.0.0.exe    # 安装程序
└── win-unpacked/                 # 未打包版本
    └── DSLR Booth.exe
```

### 构建配置

在 `package.json` 中的 `build` 字段：

```json
{
  "build": {
    "appId": "com.dslr-booth.app",
    "productName": "DSLR Booth",
    "win": {
      "target": ["nsis"],
      "icon": "assets/icon.ico"
    },
    "files": [
      "main.js",
      "renderer.js",
      "index.html",
      "styles.css",
      "assets/**/*",
      "modules/**/*"
    ]
  }
}
```

### 优化构建大小

```json
{
  "build": {
    "asar": true,
    "compression": "maximum",
    "files": [
      "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
      "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
      "!**/node_modules/*.d.ts",
      "!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}",
      "!.editorconfig",
      "!**/._*",
      "!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}",
      "!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}",
      "!**/{appveyor.yml,.travis.yml,circle.yml}",
      "!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}"
    ]
  }
}
```

## 测试

### 手动测试清单

**相机功能：**
- [ ] 相机连接成功
- [ ] 相机连接失败处理
- [ ] 实时预览正常
- [ ] 即时拍照功能
- [ ] 倒计时拍照功能

**滤镜功能：**
- [ ] 各滤镜效果正确
- [ ] 滤镜组合正常
- [ ] 重置滤镜功能
- [ ] 应用滤镜保存

**图层功能：**
- [ ] 加载图片模板
- [ ] 加载 JSON 模板
- [ ] 添加文字图层
- [ ] 图层显示/隐藏
- [ ] 删除图层
- [ ] 保存模板

**文件操作：**
- [ ] 保存照片
- [ ] 照片命名正确
- [ ] 相册加载
- [ ] 从相册重新加载

**打印功能：**
- [ ] 打印对话框打开
- [ ] 打印当前照片
- [ ] 打印相册照片

### 单元测试（未来）

```javascript
// 示例：测试滤镜应用
describe('Filter System', () => {
    test('applies brightness filter', () => {
        const filters = { brightness: 120, contrast: 100 };
        const result = applyFilters(filters);
        expect(result).toContain('brightness(120%)');
    });
    
    test('combines multiple filters', () => {
        const filters = { 
            brightness: 110, 
            contrast: 120,
            saturation: 130
        };
        const result = applyFilters(filters);
        expect(result).toContain('brightness(110%)');
        expect(result).toContain('contrast(120%)');
        expect(result).toContain('saturate(130%)');
    });
});
```

## 性能优化

### 图像处理优化

**1. 使用 OffscreenCanvas**
```javascript
const offscreen = new OffscreenCanvas(800, 600);
const ctx = offscreen.getContext('2d');
// 在后台处理图像
```

**2. 图像缓存**
```javascript
const imageCache = new Map();

function getCachedImage(url) {
    if (imageCache.has(url)) {
        return imageCache.get(url);
    }
    const img = new Image();
    img.src = url;
    imageCache.set(url, img);
    return img;
}
```

**3. 防抖和节流**
```javascript
// 防抖：等待用户停止操作后执行
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// 节流：限制执行频率
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 应用到滤镜滑块
slider.addEventListener('input', debounce((e) => {
    updateFilter(e.target.value);
}, 100));
```

### 内存管理

**1. 清理资源**
```javascript
function cleanup() {
    // 停止预览
    if (previewInterval) {
        clearInterval(previewInterval);
        previewInterval = null;
    }
    
    // 清空 Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 释放图像引用
    currentPhoto = null;
    
    // 清空缓存
    imageCache.clear();
}

window.addEventListener('beforeunload', cleanup);
```

## 故障排除

### 常见开发问题

**1. npm install 失败**
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

**2. Electron 无法启动**
```bash
# 重新构建原生模块
npm rebuild

# 或使用 electron-rebuild
npm install --save-dev electron-rebuild
npx electron-rebuild
```

**3. Canvas 相关错误**
```bash
# Windows 需要额外依赖
npm install --global windows-build-tools

# 重新安装 canvas
npm uninstall canvas
npm install canvas
```

## 贡献指南

### 提交 PR 流程

1. **Fork 仓库**
2. **创建功能分支**
   ```bash
   git checkout -b feature/my-feature
   ```
3. **开发和测试**
4. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   ```
5. **推送分支**
   ```bash
   git push origin feature/my-feature
   ```
6. **创建 Pull Request**

### 代码审查标准

- [ ] 代码符合项目风格
- [ ] 功能完整且正常工作
- [ ] 没有引入新的 bug
- [ ] 更新了相关文档
- [ ] 通过所有测试
- [ ] 性能没有明显下降

## 资源链接

### 官方文档
- [Electron 文档](https://www.electronjs.org/docs)
- [Node.js 文档](https://nodejs.org/docs)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

### 相机控制
- [gPhoto2](http://www.gphoto.org/)
- [libgphoto2 文档](http://www.gphoto.org/doc/)

### 学习资源
- [Electron 教程](https://www.electronjs.org/docs/latest/tutorial/quick-start)
- [Canvas 教程](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)

## 联系方式

- **Issue 跟踪**: GitHub Issues
- **讨论**: GitHub Discussions
- **邮件**: [维护者邮箱]

---

**Happy Coding!** 💻✨
