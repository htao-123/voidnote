"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // 文件操作
  selectWorkspace: () => electron.ipcRenderer.invoke("select-workspace"),
  saveMarkdown: (filePath, content) => electron.ipcRenderer.invoke("save-markdown", { filePath, content }),
  loadMarkdownFolder: (workspacePath) => electron.ipcRenderer.invoke("load-markdown-folder", workspacePath),
  watchWorkspace: (workspacePath) => electron.ipcRenderer.invoke("watch-workspace", workspacePath),
  selectImageFile: () => electron.ipcRenderer.invoke("select-image-file"),
  deleteMarkdown: (filePath, isDirectory) => electron.ipcRenderer.invoke("delete-markdown", { filePath, isDirectory }),
  renameMarkdown: (oldPath, newPath) => electron.ipcRenderer.invoke("rename-markdown", { oldPath, newPath }),
  fileExists: (filePath) => electron.ipcRenderer.invoke("file-exists", filePath),
  getAppDataPath: () => electron.ipcRenderer.invoke("get-app-data-path"),
  openDocument: () => electron.ipcRenderer.invoke("open-document"),
  saveDocument: (filePath, data) => electron.ipcRenderer.invoke("save-document", { filePath, data }),
  onFileChanged: (callback) => {
    electron.ipcRenderer.on("file-changed", callback);
  },
  removeFileChangedListener: (callback) => {
    electron.ipcRenderer.removeListener("file-changed", callback);
  },
  // 配置管理（Electron 官方推荐：使用 userData 目录）
  getConfig: () => electron.ipcRenderer.invoke("get-config"),
  setConfig: (config) => electron.ipcRenderer.invoke("set-config", config),
  getWorkspace: () => electron.ipcRenderer.invoke("get-workspace"),
  setWorkspace: (workspace) => electron.ipcRenderer.invoke("set-workspace", workspace),
  clearWorkspace: () => electron.ipcRenderer.invoke("clear-workspace")
});
