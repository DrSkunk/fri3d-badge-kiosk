const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // from frontend to electron
  // selectPort: (port) => ipcRenderer.send("selectPort", port),
  listPorts: (type) => ipcRenderer.invoke("listPorts", type),
  flash: (chipType, port, file) =>
    ipcRenderer.invoke("flash", chipType, port, file),

  // from electron to frontend
  handlePortList: (callback) => ipcRenderer.on("portList", callback),
  handleFlashComplete: (callback) => ipcRenderer.on("flashComplete", callback),
  handleError: (callback) => ipcRenderer.on("error", callback),
  handleStdout: (callback) => ipcRenderer.on("stdout", callback),
  handleStderr: (callback) => ipcRenderer.on("test", callback),
});
