// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const serve = require("electron-serve");
const flasher = require("./flasher.cjs");

const loadURL = serve({ directory: "../build-gui" });

flasher.initialise();

async function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  function sendMessage(channel, ...args) {
    if (mainWindow.isDestroyed()) return;
    mainWindow.webContents.send(channel, ...args);
  }

  ipcMain.handle("listPorts", async (_, chipType) => {
    console.log("listPorts", chipType);
    const ports = await flasher.getPorts(chipType);
    sendMessage("portList", ports);
  });

  ipcMain.handle("flash", async (_, chipType, port, file) => {
    await flasher.flash(chipType, port, file);
    sendMessage("flashComplete");
  });

  if (app.isPackaged) {
    await loadURL(mainWindow);
  } else {
    await mainWindow.loadURL("http://localhost:7812");
    mainWindow.webContents.openDevTools({
      mode: "detach",
    });
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
