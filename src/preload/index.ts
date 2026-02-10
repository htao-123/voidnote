import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // 文件操作
  selectWorkspace: () => ipcRenderer.invoke('select-workspace'),
  saveMarkdown: (filePath: string, content: string) =>
    ipcRenderer.invoke('save-markdown', { filePath, content }),
  loadMarkdownFolder: (workspacePath: string) =>
    ipcRenderer.invoke('load-markdown-folder', workspacePath),
  watchWorkspace: (workspacePath: string) =>
    ipcRenderer.invoke('watch-workspace', workspacePath),
  selectImageFile: () =>
    ipcRenderer.invoke('select-image-file'),
  deleteMarkdown: (filePath: string, isDirectory: boolean) =>
    ipcRenderer.invoke('delete-markdown', { filePath, isDirectory }),
  renameMarkdown: (oldPath: string, newPath: string) =>
    ipcRenderer.invoke('rename-markdown', { oldPath, newPath }),
  fileExists: (filePath: string) =>
    ipcRenderer.invoke('file-exists', filePath),
  getAppDataPath: () =>
    ipcRenderer.invoke('get-app-data-path'),
  openDocument: () =>
    ipcRenderer.invoke('open-document'),
  saveDocument: (filePath: string | null, data: any) =>
    ipcRenderer.invoke('save-document', { filePath, data }),
  onFileChanged: (callback: (event: any, data: { path: string; eventType: string; exists: boolean }) => void) => {
    ipcRenderer.on('file-changed', callback)
  },
  removeFileChangedListener: (callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener('file-changed', callback)
  },

  // 配置管理（Electron 官方推荐：使用 userData 目录）
  getConfig: () => ipcRenderer.invoke('get-config'),
  setConfig: (config: any) => ipcRenderer.invoke('set-config', config),
  getWorkspace: () => ipcRenderer.invoke('get-workspace'),
  setWorkspace: (workspace: { path: string; name: string }) =>
    ipcRenderer.invoke('set-workspace', workspace),
  clearWorkspace: () => ipcRenderer.invoke('clear-workspace')
})
