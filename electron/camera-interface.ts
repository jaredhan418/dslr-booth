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

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface CameraInfo {
  name: string;
  type: string;
}

interface CameraResult {
  success: boolean;
  message: string;
  cameraType?: string;
  mode?: string;
  filepath?: string;
  filename?: string;
  requiresManualGeneration?: boolean;
  preview?: string | null;
  settings?: any;
}

type CameraType = 'none' | 'demo' | 'ptp' | 'digicamcontrol' | 'edsdk' | 'sony';

class CameraInterface {
  private connected: boolean = false;
  private cameraType: CameraType = 'none';
  private cameraInfo: CameraInfo | null = null;
  private previewMode: boolean = false;

  /**
   * Detect available cameras on Windows
   * Uses Windows Device Manager to list PTP/MTP devices
   */
  async detectCameras(): Promise<CameraInfo[]> {
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
  private detectCameraType(deviceName: string): string {
    const name = deviceName.toLowerCase();
    if (name.includes('canon')) return 'canon';
    if (name.includes('sony')) return 'sony';
    if (name.includes('nikon')) return 'nikon';
    return 'unknown';
  }

  /**
   * Connect to camera
   * @param options - Connection options
   * @returns Connection result
   */
  async connect(options: any = {}): Promise<CameraResult> {
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
      
    } catch (error: any) {
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
  private async checkDigiCamControl(): Promise<boolean> {
    try {
      // digiCamControl default API endpoint
      // Use AbortSignal for timeout in Electron's built-in fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      
      const response = await fetch('http://localhost:5513/api/camera/list', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Disconnect from camera
   */
  async disconnect(): Promise<CameraResult> {
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
   * @returns Preview data with base64 image
   */
  async getPreview(): Promise<CameraResult> {
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
    } catch (error: any) {
      return {
        success: false,
        message: `预览失败: ${error.message}`
      };
    }
  }

  /**
   * Get preview from digiCamControl
   */
  private async getDigiCamPreview(): Promise<CameraResult> {
    try {
      const response = await fetch('http://localhost:5513/api/camera/preview');
      
      if (response.ok) {
        const buffer = await response.buffer();
        const base64 = buffer.toString('base64');
        return {
          success: true,
          preview: `data:image/jpeg;base64,${base64}`,
          message: ''
        };
      }
      
      return {
        success: false,
        message: 'Preview not available'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Capture a photo
   * @returns Capture result with file path
   */
  async capturePhoto(): Promise<CameraResult> {
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
    } catch (error: any) {
      return {
        success: false,
        message: `拍照失败: ${error.message}`
      };
    }
  }

  /**
   * Capture photo using digiCamControl
   */
  private async captureWithDigiCam(): Promise<CameraResult> {
    try {
      const response = await fetch('http://localhost:5513/api/camera/capture', {
        method: 'POST'
      });
      
      if (response.ok) {
        const result: any = await response.json();
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
    } catch (error: any) {
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
  private async captureWithPTP(): Promise<CameraResult> {
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
  async getSettings(): Promise<CameraResult> {
    if (!this.connected) {
      return {
        success: false,
        message: '相机未连接'
      };
    }

    // Return basic camera info
    return {
      success: true,
      message: '',
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
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get current camera type
   */
  getCameraType(): CameraType {
    return this.cameraType;
  }
}

// Export singleton instance
export default new CameraInterface();
