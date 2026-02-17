export interface ElectronAPI {
  connectCamera: (options?: { preferGPhoto2?: boolean }) => Promise<any>;
  checkGPhoto2WSL: () => Promise<any>;
  listUSBDevices: () => Promise<any>;
  getPreview: () => Promise<any>;
  capturePhoto: (options?: any) => Promise<any>;
  getCameraConfig: () => Promise<any>;
  setCameraConfig: (key: string, value: string) => Promise<any>;
  saveImage: (dataUrl: string, filename: string) => Promise<any>;
  printImage: (filepath: string) => Promise<any>;
  loadTemplate: () => Promise<any>;
  saveTemplate: (templateData: any) => Promise<any>;
  getPhotos: () => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
