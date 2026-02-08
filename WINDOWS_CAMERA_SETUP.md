# Windows 相机控制设置指南

## 问题说明

gPhoto2 是一个 Linux 库，**不能直接在 Windows 平台上使用**。本指南提供了在 Windows 上控制 Sony/Canon 相机的替代方案。

## Windows 相机控制方案

本应用提供三种 Windows 相机控制模式：

### 1. 演示模式（Demo Mode）
- **适用场景**：无相机时的开发和测试
- **功能**：生成演示照片，所有界面功能可用
- **优点**：无需硬件即可体验完整功能
- **设置**：默认模式，无需额外配置

### 2. Windows PTP 基础模式
- **适用场景**：Windows 原生支持的 PTP/MTP 相机
- **支持相机**：大多数 Canon、Sony、Nikon 数码相机
- **功能**：基础连接检测，有限的远程控制
- **优点**：无需安装额外软件
- **限制**：不支持实时预览，远程拍摄功能有限

#### 设置步骤：
1. 通过 USB 连接相机到电脑
2. 在相机菜单中设置 USB 模式为 "PTP" 或 "PC Remote"
   - Canon: `菜单 → 设置 → 通讯设置 → USB 连接 → PTP`
   - Sony: `菜单 → 设置 → USB 连接 → PTP/MTP 模式`
3. Windows 会自动识别为 "便携设备"
4. 启动应用，点击"连接相机"

### 3. digiCamControl 完整模式（推荐）
- **适用场景**：需要完整相机控制功能
- **支持相机**：Canon、Nikon 等（Sony 支持有限）
- **功能**：实时预览、远程拍摄、参数调节、多相机支持
- **优点**：开源、免费、功能强大
- **要求**：需要单独安装 digiCamControl

#### 设置步骤：

**步骤 1：安装 digiCamControl**

1. 访问官网下载：https://digicamcontrol.com/download
2. 下载最新稳定版（推荐 v2.1 或更高）
3. 运行安装程序，使用默认设置安装
4. 首次启动时允许防火墙访问

**步骤 2：配置 digiCamControl**

1. 启动 digiCamControl
2. 连接相机并确保相机已被识别
3. 在 digiCamControl 中测试拍照功能
4. 启用 HTTP 服务器：
   ```
   Settings → Web Server
   - 勾选 "Enable web server"
   - 端口：5513（默认）
   - 保存设置
   ```

**步骤 3：启动应用**

1. 确保 digiCamControl 正在运行
2. 启动 DSLR Booth 应用
3. 点击"连接相机"
4. 应用会自动检测 digiCamControl 并连接

## 支持的相机品牌

### Canon（佳能）
- **PTP 模式**：✅ 支持检测
- **digiCamControl**：✅ 完整支持
- **推荐相机**：
  - EOS 5D 系列
  - EOS 6D 系列
  - EOS 80D、90D
  - EOS R 系列
  - PowerShot 部分型号

**Canon 设置：**
```
菜单 → 设置 → 通讯设置 → USB 连接 → 选择 "PTP" 或 "PC Remote"
```

### Sony（索尼）
- **PTP 模式**：✅ 支持检测
- **digiCamControl**：⚠️ 有限支持
- **推荐相机**：
  - Alpha 7 系列
  - Alpha 9 系列
  - Alpha 6000 系列

**Sony 设置：**
```
菜单 → 网络 → USB 连接 → 选择 "PTP" 或 "MTP"
或
菜单 → 设置 → USB 连接 → PC Remote
```

**Sony 特别说明：**
- Sony 相机在 Windows 上通过 digiCamControl 支持有限
- 建议使用 Sony 官方 Imaging Edge Remote 软件（但不能与本应用直接集成）
- PTP 基础模式可以检测相机，但远程控制功能受限

### Nikon（尼康）
- **digiCamControl**：✅ 完整支持
- 本应用主要针对 Canon/Sony，但通过 digiCamControl 也可支持 Nikon

## 相机连接故障排除

### 问题 1：相机无法被识别

**解决方法：**
1. 检查 USB 线缆是否正常（使用相机原装线）
2. 尝试不同的 USB 端口（推荐 USB 3.0）
3. 确认相机已开机且电池充足
4. 检查相机 USB 模式设置（必须是 PTP 而非 Mass Storage）
5. 重启相机和电脑
6. 在设备管理器中检查是否有黄色感叹号

### 问题 2：连接后无法拍照

**解决方法：**
1. 确保相机不在录像模式
2. 检查相机存储卡是否已满
3. 确认相机设置允许 PC 控制
4. 在 digiCamControl 中测试是否能拍照
5. 查看应用状态消息了解详细错误

### 问题 3：实时预览不可用

**原因：**
- PTP 基础模式不支持实时预览
- 需要使用 digiCamControl 模式

**解决方法：**
1. 安装并启动 digiCamControl
2. 在 digiCamControl 中启用 Live View
3. 重新连接应用

### 问题 4：digiCamControl 连接失败

**解决方法：**
1. 确认 digiCamControl 正在运行
2. 检查 Web Server 是否已启用（Settings → Web Server）
3. 确认端口 5513 未被占用
4. 测试访问：http://localhost:5513/api/camera/list
5. 检查防火墙设置

## 高级配置

### 使用 Canon EDSDK（可选）

对于需要更高级 Canon 相机控制的开发者：

1. **注册 Canon 开发者账号**
   - 访问：https://developercommunity.usa.canon.com/
   - 申请 EDSDK 访问权限

2. **下载 EDSDK**
   - 下载适用于 Windows 的 EDSDK
   - 安装 SDK 和示例程序

3. **集成选项**
   - 使用 nodejs-canon-control-server
   - 或自行开发 Node.js 原生模块

### 使用 Sony Camera Remote SDK（可选）

对于 Sony 相机的完整控制：

1. **下载 Sony Camera Remote SDK**
   - 访问 Sony 开发者网站
   - 下载适用于您相机型号的 SDK

2. **集成方案**
   - SDK 主要支持 WiFi 连接
   - 可以通过 HTTP/WebSocket 与应用集成

## 性能优化

### USB 连接优化
- 使用高质量 USB 线缆（最好是原装）
- 连接到 USB 3.0 端口（更快的传输速度）
- 避免使用 USB Hub（可能导致供电不足）

### 多相机设置
- digiCamControl 支持同时连接多台相机
- 每台相机需要单独的 USB 端口
- 建议使用有源 USB Hub

### 电源管理
- 长时间使用时建议使用 AC 电源适配器
- 禁用相机自动关机功能
- 监控电池电量

## 命令行工具

### 检测 PTP 设备（PowerShell）
```powershell
Get-PnpDevice -Class Image | Select-Object FriendlyName, Status
```

### 测试 digiCamControl API
```powershell
# 列出相机
Invoke-WebRequest -Uri "http://localhost:5513/api/camera/list"

# 拍照
Invoke-WebRequest -Uri "http://localhost:5513/api/camera/capture" -Method POST
```

## 开发者参考

### 相机接口模块
- **文件**：`camera-interface.js`
- **功能**：
  - 自动检测相机
  - 多模式支持（演示/PTP/digiCamControl）
  - 异步操作
  - 错误处理

### 扩展相机支持

要添加新的相机控制后端：

```javascript
// camera-interface.js
async captureWithCustomBackend() {
  // 实现自定义相机控制逻辑
  return {
    success: true,
    filepath: '...',
    mode: 'custom'
  };
}
```

## 常见问题（FAQ）

**Q: 为什么不能使用 gPhoto2？**
A: gPhoto2 是 Linux 原生库，依赖 libusb 和 Linux 设备驱动。虽然可以通过 WSL（Windows Subsystem for Linux）运行，但对于普通用户来说过于复杂且不稳定。

**Q: 是否需要 node-gyp？**
A: 当前实现不需要 node-gyp。我们使用纯 JavaScript 和系统命令接口，避免了原生模块编译的复杂性。如果将来要集成 Canon EDSDK 或 Sony SDK，可能需要编写原生模块。

**Q: 应用能否离线工作？**
A: 可以。演示模式完全离线工作。PTP 模式和 digiCamControl 模式也不需要网络连接。

**Q: 支持无线相机控制吗？**
A: 当前版本仅支持 USB 连接。未来可能添加 WiFi 支持（通过相机的 WiFi 功能或 Sony 的网络 SDK）。

**Q: 如何贡献代码？**
A: 欢迎提交 Pull Request！特别需要：
- 更多相机型号的测试和支持
- Sony 相机的更好集成
- Canon EDSDK 集成
- 性能优化

## 相关资源

### 官方文档
- **digiCamControl**: https://digicamcontrol.com/
- **Canon EDSDK**: https://developercommunity.usa.canon.com/
- **Sony Camera Remote SDK**: https://developer.sony.com/

### 社区资源
- **nodejs-canon-control-server**: https://github.com/UWStout/nodejs-canon-control-server
- **node-webcam**: https://www.npmjs.com/package/node-webcam

### 技术文章
- Windows PTP Device Support: https://learn.microsoft.com/en-us/windows-hardware/drivers/image/installing-a-ptp-camera
- USB Camera Control on Windows: https://docs.microsoft.com/en-us/windows/uwp/audio-video-camera/

## 更新日志

### v1.0.1 (2026-02-08)
- ✅ 移除 gPhoto2 依赖（Windows 不兼容）
- ✅ 添加 Windows PTP 支持
- ✅ 集成 digiCamControl 支持
- ✅ 添加相机自动检测
- ✅ 改进演示模式
- ✅ 添加详细的 Windows 设置文档

---

**需要帮助？** 请查看 [GitHub Issues](https://github.com/jaredhan418/dslr-booth/issues) 或参考完整文档。
