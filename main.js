const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  mainWindow.loadFile('index.html');
  
  // Open DevTools in development
  // mainWindow.webContents.openDevTools();

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
const capturedPhotosDir = path.join(__dirname, 'captured_photos');
const templatesDir = path.join(__dirname, 'templates');

if (!fs.existsSync(capturedPhotosDir)) {
  fs.mkdirSync(capturedPhotosDir, { recursive: true });
}

if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// IPC Handlers

// Camera connection handler
ipcMain.handle('connect-camera', async (event) => {
  try {
    // This will be implemented with gphoto2 binding
    // For now, return mock success for development
    return { success: true, message: 'Camera connected successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Live preview handler
ipcMain.handle('get-preview', async (event) => {
  try {
    // This will capture preview frame from camera
    // Return base64 encoded image
    return { success: true, preview: null };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Capture photo handler
ipcMain.handle('capture-photo', async (event) => {
  try {
    const timestamp = Date.now();
    const filename = `photo_${timestamp}.jpg`;
    const filepath = path.join(capturedPhotosDir, filename);
    
    // This will capture photo from camera
    // For now, return mock data
    return { 
      success: true, 
      filepath: filepath,
      filename: filename
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Save processed image handler
ipcMain.handle('save-image', async (event, dataUrl, filename) => {
  try {
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filepath = path.join(capturedPhotosDir, filename);
    
    fs.writeFileSync(filepath, buffer);
    
    return { success: true, filepath: filepath };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Print image handler
ipcMain.handle('print-image', async (event, filepath) => {
  try {
    const { shell } = require('electron');
    
    // On Windows, this will open the default photo viewer with print dialog
    if (fs.existsSync(filepath)) {
      shell.openPath(filepath);
      return { success: true, message: 'Print dialog opened' };
    } else {
      return { success: false, message: 'File not found' };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Load template handler
ipcMain.handle('load-template', async (event) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
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
      // Load template configuration
      const templateData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      return { success: true, template: templateData, type: 'template' };
    } else {
      // Load image as template
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
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Save template handler
ipcMain.handle('save-template', async (event, templateData) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: path.join(templatesDir, 'template.json'),
      filters: [
        { name: 'Template', extensions: ['json'] }
      ]
    });
    
    if (result.canceled) {
      return { success: false, message: 'Cancelled' };
    }
    
    fs.writeFileSync(result.filePath, JSON.stringify(templateData, null, 2));
    
    return { success: true, filepath: result.filePath };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
