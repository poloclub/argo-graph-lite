# Migration of Electron IPC to Web Worker

The original Argo uses Electron IPC for handling I/O intensive tasks. Argo-lite's in-browser environment does not have access to Electron IPC, but we aim to provide a consistent API to be used across both versions. Thus a dummy `ipcRenderer` and `ipcMain` is implemented.

`server.js` is unused. Its functionalities are migrated to `worker.js`.

Status: Work-in-progress