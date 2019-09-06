import { app, BrowserWindow, dialog, Menu, shell } from "electron";
import { machineId } from "node-machine-id";
import registerIPC, { cleanUp, loadGraphSQLite } from "./ipc/server";
import { setupConfig } from "./config";

import fs from "fs";
import {
  LOADED_GRAPH_STATE,
  MENU_IMPORT_CSV,
  MENU_LOAD,
  MENU_SAVE_GRAPH_SQLITE,
  MENU_SAVE_GRAPH_STATE,
  MENU_NEW_PROJECT,
  MENU_SAVE_GRAPH_STATE_TO_PROJECT // TODO: Add this to file menu below
} from "./constants";

if (require("electron-squirrel-startup")) app.quit();
const defaultMenu = require("electron-default-menu");

const os = require("os");
const path = require("path");
const mkdirp = require("mkdirp");

// Before entering the rendering process, check whether the default workspace
// directory exists. If not, create them for the first time.
const userDataPath = app.getPath("userData"); // Get the system-dependent user data directory
const defaultWorkspacePath = path.join(userDataPath, "workspace"); // The directory where projects are stored by default
if (!fs.existsSync(defaultWorkspacePath)) {
  mkdirp.sync(defaultWorkspacePath); // Create the directory (and its parents if needed) if not present
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const isDevMode = process.execPath.match(/[\\/]electron/);

const createWindow = async () => {
  try {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 1024,
      height: 768,
      minWidth: 800,
      minHeight: 600
    });

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    // Open the DevTools.
    if (isDevMode) {
      mainWindow.webContents.openDevTools();
    }

    registerIPC(mainWindow);
    setupConfig();

    // Emitted when the window is closed.
    mainWindow.on("closed", () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null;
    });

    const fileMenu = {
      label: "File",
      submenu: [
        {
          label: "Save Snapshot...",
          click(item, focusedWindow) {
            focusedWindow.webContents.send(MENU_SAVE_GRAPH_STATE);
          }
        },
        {
          label: "Export Graph Database...",
          click(item, focusedWindow) {
            focusedWindow.webContents.send(MENU_SAVE_GRAPH_SQLITE);
          }
        },
        { type: "separator" },
        {
          label: "Load...",
          click(item, focusedWindow) {
            focusedWindow.webContents.send(MENU_LOAD);
          }
        },
        { type: "separator" },
        {
          label: "Import CSV...",
          click(item, focusedWindow) {
            focusedWindow.webContents.send(MENU_IMPORT_CSV);
          }
        },
        { type: "separator" },
        {
          label: "Open Survey",
          async click(item, focusedWindow) {
            const url = `https://docs.google.com/forms/d/e/1FAIpQLSdNslFR8vc-er_Hlazuk0ZnU25e8evrjoyAbMp41gjIUquFuw/viewform?usp=pp_url&entry.1684600221=${await machineId()}`;
            shell.openExternal(url);
          }
        }
      ]
    };

    const menu = [...defaultMenu(app, shell)];

    let splicePos = 0;
    if (os.platform() === "darwin") {
      splicePos = 1;
    }

    menu.splice(splicePos, 0, {
      label: "File",
      submenu: [
        {
          label: "Save Snapshot",
          accelerator: "CmdOrCtrl+S",
          click(item, focusedWindow) {
            focusedWindow.webContents.send(MENU_SAVE_GRAPH_STATE_TO_PROJECT);
          }
        },
        {
          label: "Save Snapshot As..",
          click(item, focusedWindow) {
            focusedWindow.webContents.send(MENU_SAVE_GRAPH_STATE);
          }
        },
        {
          label: "Save Graph",
          click(item, focusedWindow) {
            focusedWindow.webContents.send(MENU_SAVE_GRAPH_SQLITE);
          }
        },
        {
          label: "Load Snapshot",
          click(item, focusedWindow) {
            dialog.showOpenDialog(
              {
                properties: ["openFile"],
                filters: [
                  { name: "Argo Snapshot File", extensions: ["argosnapshot"] }
                ]
              },
              filePaths => {
                if (filePaths) {
                  fs.readFile(filePaths[0], "utf8", (err, data) => {
                    focusedWindow.webContents.send(LOADED_GRAPH_STATE, data);
                  });
                }
              }
            );
          }
        },
        {
          label: "Load Graph",
          click(item, focusedWindow) {
            loadGraphSQLite(focusedWindow);
          }
        }
      ]
    });

    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
  } catch (err) {
    return Promise.reject(err);
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () =>
  createWindow().catch(error => {
    // log and rethrow
    console.log(error);
    throw error;
  })
);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  cleanUp();
  app.quit();
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
