const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // from frontend to electron
  selectPort: (port) => ipcRenderer.send("selectPort", port),

  // from electron to frontend
  handlePortList: (callback) => ipcRenderer.on("portList", callback),
});
