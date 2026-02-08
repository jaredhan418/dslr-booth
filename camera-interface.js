/**
 * Camera Interface for Windows
 * 
 * This module provides an abstraction layer for camera control on Windows.
 * It supports multiple backends:
 * 1. Demo mode (for testing without a camera)
 * 2. Windows native PTP/MTP (basic functionality)
 * 3. digiCamControl integration (optional, via HTTP API)
 * 4. Vendor SDKs (Canon EDSDK, Sony SDK) - future enhancement
 */

const { exec, spawn } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

class CameraInterface {
  constructor() {
    this.connected = false;
    this.cameraType = 'none'; // 'none', 'demo', 'ptp', 'digicamcontrol', 'edsdk', 'sony'
    this.cameraInfo = null;
    this.previewMode = false;
  }

  /**
   * Detect available cameras on Windows
   * Uses Windows Device Manager to list PTP/MTP devices
   */
  async detectCameras() {
    try {
      // Try to list PTP devices using Windows PowerShell
      const { stdout } = await execAsync(
        'powershell -Command "Get-PnpDevice -Class Image | Select-Object FriendlyName, Status | ConvertTo-Json"'
      );
      
      const devices = JSON.parse(stdout);
      const cameras = Array.isArray(devices) ? devices : [devices];
      
      return cameras.filter(d => d && d.Status === 'OK').map(d => ({
        name: d.FriendlyName,
        type: this.detectCameraType(d.FriendlyName)
      }));
    } catch (error) {
      console.log('No cameras detected via PTP, using demo mode');
      return [];
    }
  }

  /**
   * Detect camera brand from device name
   */
  detectCameraType(deviceName) {
    const name = deviceName.toLowerCase();
    if (name.includes('canon')) return 'canon';
    if (name.includes('sony')) return 'sony';
    if (name.includes('nikon')) return 'nikon';
    return 'unknown';
  }

  /**
   * Connect to camera
   * @param {Object} options - Connection options
   * @returns {Promise<Object>} Connection result
   */
  async connect(options = {}) {
    try {
      // First try to detect actual cameras
      const cameras = await this.detectCameras();
      
      if (cameras.length > 0) {
        this.cameraInfo = cameras[0];
        this.cameraType = 'ptp';
        this.connected = true;
        
        console.log(`Connected to camera: ${this.cameraInfo.name}`);
        
        return {
          success: true,
          message: `已连接到相机: ${this.cameraInfo.name}`,
          cameraType: this.cameraInfo.type,
          mode: 'ptp'
        };
      }
      
      // Try to connect to digiCamControl if it's running
      if (options.tryDigiCam !== false) {
        const digiCamAvailable = await this.checkDigiCamControl();
        if (digiCamAvailable) {
          this.cameraType = 'digicamcontrol';
          this.connected = true;
          
          return {
            success: true,
            message: '已连接到 digiCamControl',
            mode: 'digicamcontrol'
          };
        }
      }
      
      // Fallback to demo mode
      console.log('No physical camera detected, using demo mode');
      this.cameraType = 'demo';
      this.connected = true;
      
      return {
        success: true,
        message: '相机连接成功 (演示模式)',
        mode: 'demo'
      };
      
    } catch (error) {
      console.error('Camera connection error:', error);
      return {
        success: false,
        message: `连接失败: ${error.message}`
      };
    }
  }

  /**
   * Check if digiCamControl is running and accessible
   */
  async checkDigiCamControl() {
    try {
      // digiCamControl default API endpoint
      const fetch = require('node-fetch');
      const response = await fetch('http://localhost:5513/api/camera/list', {
        timeout: 1000
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Disconnect from camera
   */
  async disconnect() {
    this.connected = false;
    this.cameraType = 'none';
    this.cameraInfo = null;
    this.previewMode = false;
    
    return {
      success: true,
      message: '相机已断开连接'
    };
  }

  /**
   * Get camera preview frame
   * @returns {Promise<Object>} Preview data with base64 image
   */
  async getPreview() {
    if (!this.connected) {
      return {
        success: false,
        message: '相机未连接'
      };
    }

    try {
      if (this.cameraType === 'digicamcontrol') {
        return await this.getDigiCamPreview();
      }
      
      // For demo mode or PTP mode (which doesn't easily support live view)
      // Return null to indicate no preview available
      return {
        success: true,
        preview: null,
        message: '实时预览在当前模式下不可用'
      };
    } catch (error) {
      return {
        success: false,
        message: `预览失败: ${error.message}`
      };
    }
  }

  /**
   * Get preview from digiCamControl
   */
  async getDigiCamPreview() {
    try {
      const fetch = require('node-fetch');
      const response = await fetch('http://localhost:5513/api/camera/preview');
      
      if (response.ok) {
        const buffer = await response.buffer();
        const base64 = buffer.toString('base64');
        return {
          success: true,
          preview: `data:image/jpeg;base64,${base64}`
        };
      }
      
      return {
        success: false,
        message: 'Preview not available'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Capture a photo
   * @returns {Promise<Object>} Capture result with file path
   */
  async capturePhoto() {
    if (!this.connected) {
      return {
        success: false,
        message: '相机未连接'
      };
    }

    try {
      if (this.cameraType === 'digicamcontrol') {
        return await this.captureWithDigiCam();
      } else if (this.cameraType === 'ptp') {
        return await this.captureWithPTP();
      } else {
        // Demo mode - return success but no actual capture
        return {
          success: true,
          message: '拍照成功 (演示模式)',
          mode: 'demo',
          requiresManualGeneration: true
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `拍照失败: ${error.message}`
      };
    }
  }

  /**
   * Capture photo using digiCamControl
   */
  async captureWithDigiCam() {
    try {
      const fetch = require('node-fetch');
      const response = await fetch('http://localhost:5513/api/camera/capture', {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          message: '拍照成功',
          filepath: result.filepath || null,
          mode: 'digicamcontrol'
        };
      }
      
      return {
        success: false,
        message: 'Capture failed'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Capture photo using Windows PTP
   * Note: Windows PTP has limited capture API support
   * This is a placeholder for future implementation
   */
  async captureWithPTP() {
    // Windows PTP doesn't have a simple command-line interface for capture
    // This would require using Windows Portable Device API (WPD)
    // For now, return demo mode indication
    return {
      success: true,
      message: '拍照成功 (PTP模式 - 需要手动生成照片)',
      mode: 'ptp',
      requiresManualGeneration: true
    };
  }

  /**
   * Get camera settings
   */
  async getSettings() {
    if (!this.connected) {
      return {
        success: false,
        message: '相机未连接'
      };
    }

    // Return basic camera info
    return {
      success: true,
      settings: {
        connected: this.connected,
        type: this.cameraType,
        info: this.cameraInfo,
        supportsLiveView: this.cameraType === 'digicamcontrol',
        supportsRemoteCapture: this.cameraType === 'digicamcontrol' || this.cameraType === 'demo'
      }
    };
  }

  /**
   * Check if camera is connected
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Get current camera type
   */
  getCameraType() {
    return this.cameraType;
  }
}

// Export singleton instance
module.exports = new CameraInterface();
