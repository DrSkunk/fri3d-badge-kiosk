const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // from frontend to electron
  selectBoard: (board) => ipcRenderer.invoke("selectBoard", board),
  flash: (chipType, port, file) =>
    ipcRenderer.invoke("flash", chipType, port, file),

  // from electron to frontend
  handleFlashComplete: (callback) => {
    ipcRenderer.on("flashComplete", callback);
    return () => ipcRenderer.off("flashComplete", callback);
  },
  handleFlashError: (callback) => {
    ipcRenderer.on("flashError", callback);
    return () => ipcRenderer.off("flashError", callback);
  },
  handleStdout: (callback) => {
    ipcRenderer.on("stdout", callback);
    return () => ipcRenderer.off("stdout", callback);
  },
  handleStderr: (callback) => {
    ipcRenderer.on("stderr", callback);
    return () => ipcRenderer.off("stderr", callback);
  },
  handleError: (callback) => {
    ipcRenderer.on("error", callback);
    return () => ipcRenderer.off("error", callback);
  },
});
