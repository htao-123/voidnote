// 工作区配置信息
interface WorkspaceConfig {
  path: string
  name: string
}

// 应用配置
interface AppConfig {
  workspace?: WorkspaceConfig
}

// 文档打开结果
interface DocumentOpenResult {
  filePath: string
  data: Array<{
    id: string
    title: string
    content: string
    icon?: string
    parentId: string | null
    createdAt: number
    updatedAt: number
  }>
}

// 文档保存结果
interface DocumentSaveResult {
  success: boolean
  filePath?: string
  error?: string
}

// Electron API 类型声明
interface ElectronAPI {
  // 文件系统操作
  saveFile: (content: string, filePath: string) => Promise<void>
  openFile: () => Promise<void>
  selectImageFile: () => Promise<string | null>

  // 工作区操作
  selectWorkspace: () => Promise<string | null>

  // Markdown 文件操作
  saveMarkdown: (filePath: string, content: string) => Promise<{ success: boolean; filePath?: string; error?: string }>
  deleteMarkdown: (filePath: string, isDirectory: boolean) => Promise<{ success: boolean; error?: string }>
  renameMarkdown: (oldPath: string, newPath: string) => Promise<{ success: boolean; error?: string }>
  fileExists: (filePath: string) => Promise<boolean>
  isDirectoryEmpty: (dirPath: string) => Promise<{ success: boolean; isEmpty: boolean; error?: string }>

  // 文件监听
  watchWorkspace: (workspacePath: string) => Promise<{ success: boolean; error?: string }>
  unwatchWorkspace: (workspacePath: string) => Promise<{ success: boolean; error?: string }>
  loadMarkdownFolder: (workspacePath: string) => Promise<{
    success: boolean
    error?: string
    documents: Array<{
      id: string
      title: string
      content: string
      parentId: string | null
      createdAt: number
      updatedAt: number
    }>
  }>

  // 事件监听
  onFileChanged: (callback: (event: any, data: { path: string; eventType: string; exists: boolean }) => void) => void
  removeFileChangedListener: (callback: (...args: any[]) => void) => void

  // 获取应用数据目录
  getAppDataPath: () => Promise<string>

  // 文档操作
  openDocument: () => Promise<{ filePath: string; data: any } | null>
  saveDocument: (filePath: string | null, data: any) => Promise<{ success: boolean; filePath?: string; error?: string; canceled?: boolean }>

  // 配置管理（Electron 官方推荐：使用 userData 目录）
  getConfig: () => Promise<AppConfig>
  setConfig: (config: AppConfig) => Promise<{ success: boolean }>
  getWorkspace: () => Promise<WorkspaceConfig | null>
  setWorkspace: (workspace: WorkspaceConfig) => Promise<{ success: boolean }>
  clearWorkspace: () => Promise<{ success: boolean }>

  // 全屏模式
  toggleFullscreen: () => Promise<{ success: boolean; isFullScreen?: boolean; error?: string }>
  isFullscreen: () => Promise<boolean>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
