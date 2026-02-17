import { contextBridge, ipcRenderer } from 'electron';

console.log('Preload script loaded');

try {
  // Expose protected methods that allow the renderer process to use ipcRenderer
  contextBridge.exposeInMainWorld('electronAPI', {
    // Camera operations
    connectCamera: (options?: any) => ipcRenderer.invoke('connect-camera', options),
    checkGPhoto2WSL: () => ipcRenderer.invoke('check-gphoto2-wsl'),
    listUSBDevices: () => ipcRenderer.invoke('list-usb-devices'),
    getPreview: () => ipcRenderer.invoke('get-preview'),
    capturePhoto: (options?: any) => ipcRenderer.invoke('capture-photo', options),
    getCameraConfig: () => ipcRenderer.invoke('get-camera-config'),
    setCameraConfig: (key: string, value: string) => ipcRenderer.invoke('set-camera-config', key, value),
    
    // Image operations
    saveImage: (dataUrl: string, filename: string) => ipcRenderer.invoke('save-image', dataUrl, filename),
    printImage: (filepath: string) => ipcRenderer.invoke('print-image', filepath),
    
    // Template operations
    loadTemplate: () => ipcRenderer.invoke('load-template'),
    saveTemplate: (templateData: any) => ipcRenderer.invoke('save-template', templateData),
    
    // Gallery operations
    getPhotos: () => ipcRenderer.invoke('get-photos'),
  });
  
  console.log('electronAPI exposed successfully');
} catch (error) {
  console.error('Error in preload script:', error);
}
