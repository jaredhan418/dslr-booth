import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log paths for debugging
console.log('Main process __dirname:', __dirname);
console.log('Main process __filename:', __filename);

// Import camera modules
import cameraInterface from './camera-interface.js';
import gphoto2WSL from './gphoto2-wsl.js';

let mainWindow: BrowserWindow | null;

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('Preload script path:', preloadPath);
  console.log('Preload script exists:', fs.existsSync(preloadPath));

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      // Modern Electron security settings
      contextIsolation: true,
      nodeIntegration: false,
      preload: preloadPath
    },
    icon: path.join(__dirname, '..', 'assets', 'icon.png')
  });

  // Load from Vite dev server in development, or from built files in production
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Create directories for captured photos and templates
const capturedPhotosDir = path.join(app.getPath('userData'), 'captured_photos');
const templatesDir = path.join(app.getPath('userData'), 'templates');

if (!fs.existsSync(capturedPhotosDir)) {
  fs.mkdirSync(capturedPhotosDir, { recursive: true });
}

if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// IPC Handlers

// Camera connection handler with multi-backend support
ipcMain.handle('connect-camera', async (event, options: any = {}) => {
  try {
    // Try gphoto2-wsl first if requested
    if (options.preferGPhoto2) {
      const gphoto2Result = await gphoto2WSL.connect();
      if (gphoto2Result.success) {
        return gphoto2Result;
      }
      console.log('gphoto2-wsl failed, falling back to other methods');
    }

    // Fallback to existing camera interface
    const result = await cameraInterface.connect(options);
    return result;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});

// Check gphoto2-wsl availability
ipcMain.handle('check-gphoto2-wsl', async () => {
  try {
    const available = await gphoto2WSL.checkAvailability();
    return {
      success: true,
      available: available,
      wslAvailable: gphoto2WSL.wslAvailable,
      gphoto2Available: gphoto2WSL.gphoto2Available
    };
  } catch (error: any) {
    return {
      success: false,
      available: false,
      message: error.message
    };
  }
});

// List USB devices for manual attachment
ipcMain.handle('list-usb-devices', async () => {
  try {
    const devices = await gphoto2WSL.listUSBDevices();
    return {
      success: true,
      devices: devices
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
});

// Live preview handler
ipcMain.handle('get-preview', async (event) => {
  try {
    // Try gphoto2-wsl first if connected
    if (gphoto2WSL.isConnected()) {
      return await gphoto2WSL.getPreview();
    }
    
    // Fallback to camera interface
    const result = await cameraInterface.getPreview();
    return result;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});

// Capture photo handler
ipcMain.handle('capture-photo', async (event, options: any = {}) => {
  try {
    // Try gphoto2-wsl first if connected
    if (gphoto2WSL.isConnected()) {
      const result = await gphoto2WSL.capturePhoto({
        ...options,
        path: capturedPhotosDir
      });
      return result;
    }
    
    // Fallback to camera interface
    const result = await cameraInterface.capturePhoto();
    
    if (result.success) {
      const timestamp = Date.now();
      const filename = `photo_${timestamp}.jpg`;
      const filepath = path.join(capturedPhotosDir, filename);
      
      return { 
        ...result,
        filepath: filepath,
        filename: filename
      };
    }
    
    return result;
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});

// Get camera config (gphoto2 specific)
ipcMain.handle('get-camera-config', async () => {
  try {
    if (gphoto2WSL.isConnected()) {
      return await gphoto2WSL.getConfig();
    }
    return {
      success: false,
      message: 'gphoto2 not connected'
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});

// Set camera config (gphoto2 specific)
ipcMain.handle('set-camera-config', async (event, key: string, value: string) => {
  try {
    if (gphoto2WSL.isConnected()) {
      return await gphoto2WSL.setConfig(key, value);
    }
    return {
      success: false,
      message: 'gphoto2 not connected'
    };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});

// Save processed image handler
ipcMain.handle('save-image', async (event, dataUrl: string, filename: string) => {
  try {
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filepath = path.join(capturedPhotosDir, filename);
    
    fs.writeFileSync(filepath, buffer);
    
    return { success: true, filepath: filepath };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});

// Print image handler
ipcMain.handle('print-image', async (event, filepath: string) => {
  try {
    if (fs.existsSync(filepath)) {
      shell.openPath(filepath);
      return { success: true, message: 'Print dialog opened' };
    } else {
      return { success: false, message: 'File not found' };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});

// Load template handler
ipcMain.handle('load-template', async (event) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] },
        { name: 'Templates', extensions: ['json'] }
      ]
    });
    
    if (result.canceled) {
      return { success: false, message: 'Cancelled' };
    }
    
    const filepath = result.filePaths[0];
    const ext = path.extname(filepath).toLowerCase();
    
    if (ext === '.json') {
      const templateData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      return { success: true, template: templateData, type: 'template' };
    } else {
      const imageData = fs.readFileSync(filepath);
      const base64 = imageData.toString('base64');
      return { 
        success: true, 
        template: {
          image: `data:image/${ext.substring(1)};base64,${base64}`,
          layers: []
        },
        type: 'image'
      };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});

// Save template handler
ipcMain.handle('save-template', async (event, templateData: any) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow!, {
      defaultPath: path.join(templatesDir, 'template.json'),
      filters: [
        { name: 'Template', extensions: ['json'] }
      ]
    });
    
    if (result.canceled) {
      return { success: false, message: 'Cancelled' };
    }
    
    fs.writeFileSync(result.filePath!, JSON.stringify(templateData, null, 2));
    
    return { success: true, filepath: result.filePath };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
});

// Get captured photos list
ipcMain.handle('get-photos', async () => {
  try {
    const files = fs.readdirSync(capturedPhotosDir);
    const photos = files
      .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
      .map(filename => ({
        filename,
        filepath: path.join(capturedPhotosDir, filename),
        timestamp: fs.statSync(path.join(capturedPhotosDir, filename)).mtime
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return {
      success: true,
      photos: photos
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message
    };
  }
});
