# DSLR Photo Booth - 实现指南

## 概述

本文档详细说明了 DSLR Photo Booth 应用程序的实现细节和架构。

## 架构设计

### 应用结构

```
┌─────────────────────────────────────────┐
│         Electron 主进程 (main.js)        │
│  - 窗口管理                              │
│  - IPC 通信处理                          │
│  - 文件系统操作                          │
│  - 相机接口                              │
└─────────────────────────────────────────┘
                    ↕ IPC
┌─────────────────────────────────────────┐
│      渲染进程 (renderer.js)              │
│  - UI 交互逻辑                           │
│  - Canvas 图像处理                       │
│  - 状态管理                              │
│  - 事件处理                              │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│       用户界面 (index.html)              │
│  - 预览区域                              │
│  - 控制面板                              │
│  - 滤镜控制                              │
│  - 图层管理                              │
└─────────────────────────────────────────┘
```

## 核心功能实现

### 1. 相机连接

#### 技术方案
- 使用 gPhoto2 库与相机通信
- 支持 PTP (Picture Transfer Protocol) 协议
- 自动检测已连接的相机设备

#### 实现代码位置
- `main.js`: `ipcMain.handle('connect-camera')`
- 相机初始化和连接逻辑

#### 支持的相机
- Sony Alpha 系列
- Canon EOS 系列
- 其他支持 PTP 协议的相机

### 2. 实时预览

#### 工作原理
1. 从相机获取预览帧（JPEG 格式）
2. 转换为 Base64 编码
3. 在 Canvas 上渲染
4. 应用当前滤镜效果
5. 叠加图层

#### 性能优化
- 预览帧率：10 FPS
- 图像压缩：JPEG 质量 85%
- 异步渲染避免阻塞 UI

#### 实现代码
```javascript
// 渲染进程
function startPreview() {
  previewInterval = setInterval(async () => {
    const result = await ipcRenderer.invoke('get-preview');
    if (result.success && result.preview) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        applyFiltersToCanvas();
        drawLayers();
      };
      img.src = result.preview;
    }
  }, 100);
}
```

### 3. 照片拍摄

#### 拍摄流程
1. 发送拍摄命令到相机
2. 等待相机完成拍摄
3. 从相机下载图片
4. 保存到本地文件系统
5. 在 Canvas 上显示

#### 倒计时模式
- 支持 1-10 秒倒计时
- 视觉反馈（大号数字显示）
- 音效提示（可选）

### 4. 滤镜系统

#### 支持的滤镜
- **亮度** (brightness): 0-200%
- **对比度** (contrast): 0-200%
- **饱和度** (saturation): 0-200%
- **模糊** (blur): 0-10px
- **灰度** (grayscale): 0-100%
- **棕褐色** (sepia): 0-100%

#### 实现技术
使用 Canvas Filter API：
```javascript
ctx.filter = 'brightness(120%) contrast(110%) saturate(130%)';
```

#### 实时预览
- 滤镜参数调整时实时更新
- 不修改原始图像，仅影响显示
- 点击"应用滤镜"后保存到图像数据

### 5. 图层系统

#### 图层类型
1. **图像图层**
   - 加载外部图片作为模板
   - 支持位置、大小、透明度调整
   
2. **文字图层**
   - 自定义文字内容
   - 字体、大小、颜色可调
   - 对齐方式控制

#### 图层属性
```javascript
{
  type: 'image' | 'text',
  visible: boolean,
  opacity: 0-1,
  x: number,
  y: number,
  // 图像图层特有
  image: string (base64 或 URL),
  width: number,
  height: number,
  // 文字图层特有
  text: string,
  fontSize: number,
  fontFamily: string,
  color: string,
  align: 'left' | 'center' | 'right'
}
```

#### 模板保存格式
```json
{
  "version": "1.0",
  "layers": [
    {
      "type": "image",
      "image": "data:image/png;base64,...",
      "x": 0,
      "y": 0,
      "width": 800,
      "height": 600,
      "visible": true,
      "opacity": 0.5
    }
  ]
}
```

### 6. 打印功能

#### Windows 打印集成
使用 Electron 的 `shell.openPath()` 方法：
1. 保存处理后的图像到文件
2. 调用系统默认图片查看器
3. 触发打印对话框

#### 替代方案
- 使用 Electron 的 `webContents.print()` 方法
- 直接控制打印设置和布局

### 7. 照片管理

#### 文件组织
```
captured_photos/
├── photo_1707361430000.jpg
├── photo_1707361435000.jpg
└── ...
```

#### 命名规则
- 格式：`photo_{timestamp}.jpg`
- 时间戳：Unix 毫秒时间戳
- 避免文件名冲突

## 开发注意事项

### 相机驱动
Windows 上需要安装相机驱动：
1. Canon: 安装 Canon EOS Utility
2. Sony: 安装 Sony Imaging Edge

### gPhoto2 配置
在 Windows 上配置 gPhoto2：
```bash
# 安装 libgphoto2
# 需要编译工具链支持
```

### Node.js 原生模块
canvas 和 gphoto2 包含原生模块，需要：
```bash
npm install --global windows-build-tools
npm rebuild
```

## 性能优化建议

### 图像处理
- 使用 Web Workers 处理大图像
- 实现图像缓存机制
- 延迟加载相册图片

### 内存管理
- 及时释放 Canvas 资源
- 限制相册显示数量
- 实现分页加载

### UI 响应性
- 使用 requestAnimationFrame
- 防抖和节流处理
- 异步操作使用 Promise

## 安全考虑

### 文件访问
- 验证文件路径，防止目录遍历
- 限制可访问的文件类型
- 安全地处理用户输入

### 数据处理
- 验证图像数据完整性
- 清理临时文件
- 安全地存储用户设置

## 测试策略

### 单元测试
- 测试图像处理函数
- 测试图层管理逻辑
- 测试文件操作

### 集成测试
- 测试 IPC 通信
- 测试相机连接流程
- 测试完整拍摄流程

### UI 测试
- 测试按钮交互
- 测试滑块控件
- 测试标签切换

## 常见问题

### Q: 相机无法连接？
A: 
1. 检查 USB 连接
2. 确认相机已开机
3. 检查相机设置（USB 模式）
4. 安装相机驱动

### Q: 预览画面卡顿？
A:
1. 降低预览帧率
2. 减小预览分辨率
3. 关闭不必要的滤镜

### Q: 打印功能无响应？
A:
1. 检查打印机连接
2. 确认打印机驱动已安装
3. 检查文件是否成功保存

## 扩展功能建议

### 近期计划
- [ ] 添加更多预设滤镜模板
- [ ] 实现照片批量导出
- [ ] 添加二维码/水印功能
- [ ] 支持 RAW 格式处理

### 长期规划
- [ ] 支持更多相机品牌
- [ ] 实现人脸识别和美颜
- [ ] 添加 AR 贴纸和特效
- [ ] 云端同步和分享功能

## 贡献指南

### 代码规范
- 使用 ESLint 检查代码
- 遵循 JavaScript Standard Style
- 编写清晰的注释

### 提交规范
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建/工具相关

## 参考资源

- [Electron 文档](https://www.electronjs.org/docs)
- [Canvas API 参考](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [gPhoto2 文档](http://www.gphoto.org/doc/)
- [Node.js API](https://nodejs.org/api/)

---

更新日期：2026-02-08
版本：1.0.0
