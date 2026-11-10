const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  backendUrl: 'http://127.0.0.1:8000',
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  saveFileDialog: (options) => ipcRenderer.invoke('dialog:saveFile', options),
  exportDiagramImage: (data) => ipcRenderer.invoke('diagram:exportImage', data),
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  onBackendStatus: (callback) => ipcRenderer.on('backend:status', (_event, value) => callback(value))
});

