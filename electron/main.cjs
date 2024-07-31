// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
// const serve = require("electron-serve");

// console.log(serve);
// const loadURL = serve({ directory: "../build-gui" });

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

  mainWindow.webContents.session.on(
    "select-serial-port",
    (event, portList, webContents, callback) => {
      // Add listeners to handle ports being added or removed before the callback for `select-serial-port`
      // is called.

      sendMessage("portList", portList);
      mainWindow.webContents.session.on("serial-port-added", (event, port) => {
        console.log("serial-port-added FIRED WITH", port);
        // Optionally update portList to add the new port
      });

      mainWindow.webContents.session.on(
        "serial-port-removed",
        (event, port) => {
          console.log("serial-port-removed FIRED WITH", port);
          // Optionally update portList to remove the port
        }
      );

      event.preventDefault();
      ipcMain.once("selectPort", (event, portId) => {
        callback(portId);
      });
      // give
      // if (portList && portList.length > 0) {
      //   console.log("portList", portList);
      //   callback(portList[0].portId);
      // } else {
      //   // eslint-disable-next-line n/no-callback-literal
      //   callback(""); // Could not find any matching devices
      // }
    }
  );

  // and load the index.html of the app.
  // mainWindow.loadFile("index.html");
  if (app.isPackaged) {
    // await loadURL(mainWindow);
  } else {
    await mainWindow.loadURL("http://localhost:7812");
    mainWindow.webContents.openDevTools({
      mode: "detach",
    });
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
