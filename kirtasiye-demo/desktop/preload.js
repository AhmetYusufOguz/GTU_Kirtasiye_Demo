const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  sync: () => ipcRenderer.invoke('sync:get'),
  info: () => ipcRenderer.invoke('info:get'),
  getOrder: (code) => ipcRenderer.invoke('order:get', code),
  print: (code) => ipcRenderer.invoke('order:print', code),
  markPrinted: (code) => ipcRenderer.invoke('order:markPrinted', code),
  openExternal: (code) => ipcRenderer.invoke('order:openExternal', code),
});
