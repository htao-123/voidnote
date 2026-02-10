"use strict";
const electron = require("electron");
const path = require("path");
const fs = require("fs");
let mainWindow = null;
let workspaceWatcher = null;
const CONFIG_FILE = path.join(electron.app.getPath("userData"), "config.json");
async function readConfig() {
  try {
    const exists = await fs.promises.access(CONFIG_FILE).then(() => true).catch(() => false);
    if (exists) {
      const data = await fs.promises.readFile(CONFIG_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading config:", error);
  }
  return {};
}
async function writeConfig(config) {
  try {
    const userDataDir = electron.app.getPath("userData");
    const dirExists = await fs.promises.access(userDataDir).then(() => true).catch(() => false);
    if (!dirExists) {
      await fs.promises.mkdir(userDataDir, { recursive: true });
    }
    await fs.promises.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing config:", error);
  }
}
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });
  const rendererURL = process.env.ELECTRON_RENDERER_URL || process.env.VITE_DEV_SERVER_URL;
  if (rendererURL) {
    mainWindow.loadURL(rendererURL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.ipcMain.handle("select-workspace", async () => {
  const result = await electron.dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory", "createDirectory"],
    message: "选择一个文件夹作为知识库存储位置"
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});
electron.ipcMain.handle("save-markdown", async (_, { filePath, content }) => {
  try {
    if (!filePath || typeof filePath !== "string") {
      return { success: false, error: "Invalid file path" };
    }
    if (typeof content !== "string") {
      return { success: false, error: "Invalid content type" };
    }
    const dir = path.dirname(filePath);
    const dirExists = await fs.promises.access(dir).then(() => true).catch(() => false);
    if (!dirExists) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    await fs.promises.writeFile(filePath, content, "utf-8");
    return { success: true, filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("load-markdown-folder", async (_, workspacePath) => {
  try {
    if (!workspacePath || typeof workspacePath !== "string") {
      return { success: false, error: "Invalid workspace path", documents: [] };
    }
    const documents = [];
    async function readFolder(dir, parentId = null) {
      const files = await fs.promises.readdir(dir, { withFileTypes: true });
      const mdFiles = [];
      for (const file of files) {
        if (!file.isDirectory() && file.name.endsWith(".md")) {
          const fullPath = path.join(dir, file.name);
          try {
            const content = await fs.promises.readFile(fullPath, "utf-8");
            const stats = await fs.promises.stat(fullPath);
            const title = file.name.slice(0, -3);
            const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
            const doc = {
              id: docId,
              title,
              content,
              parentId,
              createdAt: stats.mtime.getTime(),
              updatedAt: stats.mtime.getTime()
            };
            documents.push(doc);
            mdFiles.push({ name: file.name, docId });
          } catch (e) {
            console.error("Error reading markdown file:", fullPath, e);
          }
        }
      }
      for (const file of files) {
        if (file.isDirectory()) {
          const fullPath = path.join(dir, file.name);
          const matchingDoc = mdFiles.find((md) => md.name === `${file.name}.md`);
          await readFolder(fullPath, matchingDoc?.docId || parentId);
        }
      }
    }
    await readFolder(workspacePath);
    return { success: true, documents };
  } catch (error) {
    return { success: false, error: error.message, documents: [] };
  }
});
electron.ipcMain.handle("select-image-file", async () => {
  const result = await electron.dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      { name: "Images", extensions: ["jpg", "jpeg", "png", "gif", "bmp", "webp"] },
      { name: "All Files", extensions: ["*"] }
    ]
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  const filePath = result.filePaths[0];
  try {
    const data = await fs.promises.readFile(filePath);
    const base64 = data.toString("base64");
    const ext = path.extname(filePath).slice(1);
    return `data:image/${ext};base64,${base64}`;
  } catch (error) {
    return null;
  }
});
electron.ipcMain.handle("delete-markdown", async (_, { filePath, isDirectory }) => {
  try {
    if (!filePath || typeof filePath !== "string") {
      return { success: false, error: "Invalid file path" };
    }
    if (isDirectory) {
      await fs.promises.rm(filePath, { recursive: true, force: true });
    } else {
      await fs.promises.unlink(filePath);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("rename-markdown", async (_, { oldPath, newPath }) => {
  try {
    if (!oldPath || !newPath || typeof oldPath !== "string" || typeof newPath !== "string") {
      return { success: false, error: "Invalid file paths" };
    }
    const oldExists = await fs.promises.access(oldPath).then(() => true).catch(() => false);
    if (!oldExists) {
      return { success: false, error: "Source file does not exist" };
    }
    const newExists = await fs.promises.access(newPath).then(() => true).catch(() => false);
    if (newExists) {
      return { success: false, error: "Target file already exists" };
    }
    await fs.promises.rename(oldPath, newPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("file-exists", async (_, filePath) => {
  try {
    if (!filePath || typeof filePath !== "string") {
      return false;
    }
    const exists = await fs.promises.access(filePath).then(() => true).catch(() => false);
    return exists;
  } catch (error) {
    return false;
  }
});
electron.ipcMain.handle("get-app-data-path", async () => {
  return electron.app.getPath("userData");
});
electron.ipcMain.handle("watch-workspace", async (_, workspacePath) => {
  try {
    if (workspaceWatcher) {
      workspaceWatcher.close();
      workspaceWatcher = null;
    }
    workspaceWatcher = fs.watch(workspacePath, { recursive: true }, (eventType, filename) => {
      if (filename && filename.endsWith(".md")) {
        const fullPath = path.join(workspacePath, filename);
        const exists = fs.existsSync(fullPath);
        mainWindow?.webContents.send("file-changed", {
          path: fullPath,
          eventType,
          exists
        });
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Error watching workspace:", error);
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("open-document", async () => {
  try {
    const result = await electron.dialog.showOpenDialog(mainWindow, {
      properties: ["openFile"],
      filters: [
        { name: "VoidNote Documents", extensions: ["voidnote"] },
        { name: "JSON Files", extensions: ["json"] },
        { name: "All Files", extensions: ["*"] }
      ]
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    const filePath = result.filePaths[0];
    const content = await fs.promises.readFile(filePath, "utf-8");
    const data = JSON.parse(content);
    return { filePath, data };
  } catch (error) {
    return null;
  }
});
electron.ipcMain.handle("save-document", async (_, { filePath, data }) => {
  try {
    if (data === null || data === void 0) {
      return { success: false, error: "Invalid data" };
    }
    let savePath = filePath;
    if (!savePath) {
      const result = await electron.dialog.showSaveDialog(mainWindow, {
        defaultPath: "untitled.voidnote",
        filters: [
          { name: "VoidNote Documents", extensions: ["voidnote"] },
          { name: "JSON Files", extensions: ["json"] },
          { name: "All Files", extensions: ["*"] }
        ]
      });
      if (result.canceled || !result.filePath) {
        return { success: false, canceled: true };
      }
      savePath = result.filePath;
    }
    const content = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(savePath, content, "utf-8");
    return { success: true, filePath: savePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("get-config", async () => {
  return await readConfig();
});
electron.ipcMain.handle("set-config", async (_, config) => {
  await writeConfig(config);
  return { success: true };
});
electron.ipcMain.handle("get-workspace", async () => {
  const config = await readConfig();
  return config.workspace || null;
});
electron.ipcMain.handle("set-workspace", async (_, workspace) => {
  const config = await readConfig();
  config.workspace = workspace;
  await writeConfig(config);
  return { success: true };
});
electron.ipcMain.handle("clear-workspace", async () => {
  const config = await readConfig();
  delete config.workspace;
  await writeConfig(config);
  return { success: true };
});
