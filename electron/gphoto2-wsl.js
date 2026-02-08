/**
 * gPhoto2 WSL2 Wrapper for Windows
 * 
 * This module enables gphoto2 camera control on Windows by running it in WSL2
 * with USB passthrough via usbipd-win.
 * 
 * Prerequisites:
 * 1. WSL2 installed and configured
 * 2. usbipd-win installed on Windows
 * 3. gphoto2 installed in WSL2: sudo apt install gphoto2
 * 4. USB device attached to WSL2: usbipd wsl attach --busid <busid>
 */

const { exec, spawn } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class GPhoto2WSL {
  constructor() {
    this.wslAvailable = false;
    this.gphoto2Available = false;
    this.connected = false;
  }

  /**
   * Check if WSL2 is available and gphoto2 is installed
   */
  async checkAvailability() {
    try {
      // Check if WSL is available
      const { stdout: wslCheck } = await execAsync('wsl --status');
      this.wslAvailable = wslCheck.includes('WSL');

      if (!this.wslAvailable) {
        console.log('WSL2 not available');
        return false;
      }

      // Check if gphoto2 is installed in WSL
      try {
        await execAsync('wsl which gphoto2');
        this.gphoto2Available = true;
        console.log('gphoto2 found in WSL2');
      } catch (error) {
        console.log('gphoto2 not installed in WSL2');
        this.gphoto2Available = false;
        return false;
      }

      return true;
    } catch (error) {
      console.log('Error checking WSL/gphoto2:', error.message);
      return false;
    }
  }

  /**
   * List attached USB devices using usbipd
   */
  async listUSBDevices() {
    try {
      const { stdout } = await execAsync('usbipd wsl list');
      return stdout;
    } catch (error) {
      throw new Error('usbipd-win not installed or not accessible');
    }
  }

  /**
   * Auto-detect and attach camera to WSL2
   */
  async autoAttachCamera() {
    try {
      const devices = await this.listUSBDevices();
      
      // Look for camera keywords in device list
      const lines = devices.split('\n');
      for (const line of lines) {
        const lower = line.toLowerCase();
        if ((lower.includes('canon') || lower.includes('sony') || lower.includes('nikon')) && 
            !lower.includes('attached')) {
          // Extract bus ID (format: X-Y)
          const match = line.match(/(\d+-\d+)/);
          if (match) {
            const busId = match[1];
            console.log(`Found camera at bus ${busId}, attempting to attach...`);
            await execAsync(`usbipd wsl attach --busid ${busId}`);
            console.log('Camera attached to WSL2');
            return true;
          }
        }
      }
      
      console.log('No camera found to attach');
      return false;
    } catch (error) {
      console.error('Error attaching camera:', error.message);
      return false;
    }
  }

  /**
   * Detect cameras using gphoto2 in WSL2
   */
  async detectCameras() {
    try {
      const { stdout } = await execAsync('wsl gphoto2 --auto-detect');
      
      // Parse gphoto2 output
      const lines = stdout.split('\n').filter(line => line.trim());
      const cameras = [];
      
      for (const line of lines) {
        if (line.includes('usb:')) {
          const parts = line.split('usb:');
          if (parts.length > 1) {
            cameras.push({
              model: parts[0].trim(),
              port: 'usb:' + parts[1].trim(),
              type: this.detectCameraType(parts[0])
            });
          }
        }
      }
      
      return cameras;
    } catch (error) {
      console.log('No cameras detected via gphoto2');
      return [];
    }
  }

  /**
   * Detect camera brand from model name
   */
  detectCameraType(modelName) {
    const name = modelName.toLowerCase();
    if (name.includes('canon')) return 'canon';
    if (name.includes('sony')) return 'sony';
    if (name.includes('nikon')) return 'nikon';
    return 'unknown';
  }

  /**
   * Connect to camera
   */
  async connect() {
    try {
      // Check if WSL and gphoto2 are available
      const available = await this.checkAvailability();
      if (!available) {
        return {
          success: false,
          message: 'WSL2 或 gphoto2 不可用。请参考文档安装配置。',
          mode: 'unavailable'
        };
      }

      // Try to auto-attach camera
      await this.autoAttachCamera();

      // Wait a moment for device to settle
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Detect cameras
      const cameras = await this.detectCameras();
      
      if (cameras.length > 0) {
        this.connected = true;
        this.cameraInfo = cameras[0];
        
        return {
          success: true,
          message: `已通过 gphoto2 连接到相机: ${cameras[0].model}`,
          mode: 'gphoto2-wsl',
          camera: cameras[0]
        };
      } else {
        return {
          success: false,
          message: '未检测到相机。请确保相机已连接并且 USB 设备已附加到 WSL2。',
          mode: 'no-camera'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `连接失败: ${error.message}`,
        mode: 'error'
      };
    }
  }

  /**
   * Capture photo using gphoto2
   */
  async capturePhoto(options = {}) {
    if (!this.connected) {
      return {
        success: false,
        message: '相机未连接'
      };
    }

    try {
      const filename = options.filename || `photo_${Date.now()}.jpg`;
      const targetPath = options.path || '/tmp';
      
      // Capture and download photo
      const cmd = `wsl gphoto2 --capture-image-and-download --filename="${targetPath}/${filename}"`;
      const { stdout, stderr } = await execAsync(cmd);
      
      // Convert WSL path to Windows path
      const { stdout: winPath } = await execAsync(`wsl wslpath -w "${targetPath}/${filename}"`);
      const windowsPath = winPath.trim();
      
      return {
        success: true,
        message: '拍照成功',
        filepath: windowsPath,
        filename: filename,
        mode: 'gphoto2-wsl'
      };
    } catch (error) {
      return {
        success: false,
        message: `拍照失败: ${error.message}`
      };
    }
  }

  /**
   * Get camera configuration
   */
  async getConfig() {
    if (!this.connected) {
      return { success: false, message: '相机未连接' };
    }

    try {
      const { stdout } = await execAsync('wsl gphoto2 --list-config');
      return {
        success: true,
        config: stdout
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Set camera configuration
   */
  async setConfig(key, value) {
    if (!this.connected) {
      return { success: false, message: '相机未连接' };
    }

    try {
      await execAsync(`wsl gphoto2 --set-config ${key}=${value}`);
      return {
        success: true,
        message: `设置 ${key} = ${value}`
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Get live preview (if supported)
   */
  async getPreview() {
    if (!this.connected) {
      return { success: false, message: '相机未连接' };
    }

    try {
      // Capture preview to temp file
      const tempFile = `/tmp/preview_${Date.now()}.jpg`;
      await execAsync(`wsl gphoto2 --capture-preview --filename="${tempFile}"`);
      
      // Read file content
      const { stdout } = await execAsync(`wsl base64 "${tempFile}"`);
      const base64 = stdout.trim();
      
      // Clean up
      await execAsync(`wsl rm "${tempFile}"`).catch(() => {});
      
      return {
        success: true,
        preview: `data:image/jpeg;base64,${base64}`
      };
    } catch (error) {
      return {
        success: false,
        message: '预览不可用'
      };
    }
  }

  /**
   * Disconnect from camera
   */
  async disconnect() {
    this.connected = false;
    this.cameraInfo = null;
    return {
      success: true,
      message: '相机已断开连接'
    };
  }

  /**
   * Check connection status
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Get camera info
   */
  getCameraInfo() {
    return this.cameraInfo;
  }
}

module.exports = new GPhoto2WSL();
