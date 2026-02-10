import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import path from 'path'
import fs from 'fs'

let mainWindow: BrowserWindow | null = null
let workspaceWatcher: fs.FSWatcher | null = null

// 配置文件路径（userData 目录是 Electron 官方推荐的用户数据存储位置）
function getConfigPath(): string {
  return path.join(app.getPath('userData'), 'config.json')
}

// 默认配置
interface AppConfig {
  workspace?: {
    path: string
    name: string
  }
}

// 读取配置
async function readConfig(): Promise<AppConfig> {
  try {
    const exists = await fs.promises.access(getConfigPath()).then(() => true).catch(() => false)
    if (exists) {
      const data = await fs.promises.readFile(getConfigPath(), 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading config:', error)
  }
  return {}
}

// 写入配置
async function writeConfig(config: AppConfig): Promise<void> {
  try {
    // 确保 userData 目录存在
    const userDataDir = app.getPath('userData')
    const dirExists = await fs.promises.access(userDataDir).then(() => true).catch(() => false)
    if (!dirExists) {
      await fs.promises.mkdir(userDataDir, { recursive: true })
    }
    await fs.promises.writeFile(getConfigPath(), JSON.stringify(config, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing config:', error)
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(__dirname, '../../build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  })

  // 开发环境加载 Vite 开发服务器
  const rendererURL = process.env.ELECTRON_RENDERER_URL || process.env.VITE_DEV_SERVER_URL
  if (rendererURL) {
    mainWindow.loadURL(rendererURL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // 移除默认菜单栏
  Menu.setApplicationMenu(null)
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 选择工作区文件夹
ipcMain.handle('select-workspace', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory', 'createDirectory'],
    message: '选择一个文件夹作为知识库存储位置'
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  return result.filePaths[0]
})

// 保存 Markdown 文件
ipcMain.handle('save-markdown', async (_, { filePath, content }) => {
  try {
    // 参数验证
    if (!filePath || typeof filePath !== 'string') {
      return { success: false, error: 'Invalid file path' }
    }
    if (typeof content !== 'string') {
      return { success: false, error: 'Invalid content type' }
    }

    const dir = path.dirname(filePath)
    const dirExists = await fs.promises.access(dir).then(() => true).catch(() => false)
    if (!dirExists) {
      await fs.promises.mkdir(dir, { recursive: true })
    }
    await fs.promises.writeFile(filePath, content, 'utf-8')
    return { success: true, filePath }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// 从文件夹加载 Markdown 文件
ipcMain.handle('load-markdown-folder', async (_, workspacePath: string) => {
  try {
    // 参数验证
    if (!workspacePath || typeof workspacePath !== 'string') {
      return { success: false, error: 'Invalid workspace path', documents: [] }
    }

    const documents: any[] = []

    // 递归读取文件夹
    async function readFolder(dir: string, parentId: string | null = null): Promise<void> {
      const files = await fs.promises.readdir(dir, { withFileTypes: true })

      // 先收集文件夹中的 .md 文件和子文件夹
      const mdFiles: Array<{ name: string; docId: string }> = []

      // 读取所有 Markdown 文件
      for (const file of files) {
        if (!file.isDirectory() && file.name.endsWith('.md')) {
          const fullPath = path.join(dir, file.name)
          try {
            const content = await fs.promises.readFile(fullPath, 'utf-8')
            const stats = await fs.promises.stat(fullPath)
            const title = file.name.slice(0, -3)

            const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
            const doc = {
              id: docId,
              title,
              content,
              parentId,
              createdAt: stats.mtime.getTime(),
              updatedAt: stats.mtime.getTime(),
            }
            documents.push(doc)
            mdFiles.push({ name: file.name, docId })
          } catch (e) {
            console.error('Error reading markdown file:', fullPath, e)
          }
        }
      }

      // 处理子文件夹 - 检查子文件夹名是否匹配某个 .md 文件
      for (const file of files) {
        if (file.isDirectory()) {
          const fullPath = path.join(dir, file.name)

          // 查找是否有匹配的 .md 文件（子文件夹名 + .md）
          const matchingDoc = mdFiles.find(md => md.name === `${file.name}.md`)

          // 如果有匹配的文档，使用该文档的 ID 作为父 ID；否则使用传入的父 ID
          await readFolder(fullPath, matchingDoc?.docId || parentId)
        }
      }
    }

    await readFolder(workspacePath)
    return { success: true, documents }
  } catch (error: any) {
    return { success: false, error: error.message, documents: [] }
  }
})

// 选择图片文件
ipcMain.handle('select-image-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  const filePath = result.filePaths[0]

  try {
    const data = await fs.promises.readFile(filePath)
    const base64 = data.toString('base64')
    const ext = path.extname(filePath).slice(1)
    return `data:image/${ext};base64,${base64}`
  } catch (error: any) {
    return null
  }
})

// 删除文件或文件夹
ipcMain.handle('delete-markdown', async (_, { filePath, isDirectory }: { filePath: string; isDirectory: boolean }) => {
  try {
    // 参数验证
    if (!filePath || typeof filePath !== 'string') {
      return { success: false, error: 'Invalid file path' }
    }

    if (isDirectory) {
      await fs.promises.rm(filePath, { recursive: true, force: true })
    } else {
      await fs.promises.unlink(filePath)
    }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// 重命名文件或文件夹
ipcMain.handle('rename-markdown', async (_, { oldPath, newPath }: { oldPath: string; newPath: string }) => {
  try {
    // 参数验证
    if (!oldPath || !newPath || typeof oldPath !== 'string' || typeof newPath !== 'string') {
      return { success: false, error: 'Invalid file paths' }
    }

    // 检查源文件是否存在
    const oldExists = await fs.promises.access(oldPath).then(() => true).catch(() => false)
    if (!oldExists) {
      return { success: false, error: 'Source file does not exist' }
    }

    // 检查目标文件是否已存在
    const newExists = await fs.promises.access(newPath).then(() => true).catch(() => false)
    if (newExists) {
      return { success: false, error: 'Target file already exists' }
    }

    await fs.promises.rename(oldPath, newPath)
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// 检查文件是否存在
ipcMain.handle('file-exists', async (_, filePath: string) => {
  try {
    // 参数验证
    if (!filePath || typeof filePath !== 'string') {
      return false
    }
    const exists = await fs.promises.access(filePath).then(() => true).catch(() => false)
    return exists
  } catch (error) {
    return false
  }
})

// 获取应用数据目录
ipcMain.handle('get-app-data-path', async () => {
  return app.getPath('userData')
})

// 监听工作区文件变化
ipcMain.handle('watch-workspace', async (_, workspacePath: string) => {
  try {
    // 停止之前的监听
    if (workspaceWatcher) {
      workspaceWatcher.close()
      workspaceWatcher = null
    }

    // 监听工作区变化
    workspaceWatcher = fs.watch(workspacePath, { recursive: true }, (eventType, filename) => {
      if (filename && filename.endsWith('.md')) {
        const fullPath = path.join(workspacePath, filename)
        const exists = fs.existsSync(fullPath)
        mainWindow?.webContents.send('file-changed', {
          path: fullPath,
          eventType,
          exists
        })
      }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error watching workspace:', error)
    return { success: false, error: error.message }
  }
})

// 打开文档文件
ipcMain.handle('open-document', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openFile'],
      filters: [
        { name: 'VoidNote Documents', extensions: ['voidnote'] },
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const filePath = result.filePaths[0]
    const content = await fs.promises.readFile(filePath, 'utf-8')
    const data = JSON.parse(content)

    return { filePath, data }
  } catch (error: any) {
    return null
  }
})

// 保存文档文件
ipcMain.handle('save-document', async (_, { filePath, data }) => {
  try {
    // 参数验证
    if (data === null || data === undefined) {
      return { success: false, error: 'Invalid data' }
    }

    let savePath = filePath

    // 如果没有指定路径，弹出保存对话框
    if (!savePath) {
      const result = await dialog.showSaveDialog(mainWindow!, {
        defaultPath: 'untitled.voidnote',
        filters: [
          { name: 'VoidNote Documents', extensions: ['voidnote'] },
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (result.canceled || !result.filePath) {
        return { success: false, canceled: true }
      }

      savePath = result.filePath
    }

    const content = JSON.stringify(data, null, 2)
    await fs.promises.writeFile(savePath, content, 'utf-8')

    return { success: true, filePath: savePath }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// ========== 配置管理（Electron 官方推荐：使用 userData 目录）==========

// 获取配置
ipcMain.handle('get-config', async () => {
  return await readConfig()
})

// 保存配置
ipcMain.handle('set-config', async (_, config: AppConfig) => {
  await writeConfig(config)
  return { success: true }
})

// 获取工作区配置
ipcMain.handle('get-workspace', async () => {
  const config = await readConfig()
  return config.workspace || null
})

// 设置工作区配置
ipcMain.handle('set-workspace', async (_, workspace: { path: string; name: string }) => {
  const config = await readConfig()
  config.workspace = workspace
  await writeConfig(config)
  return { success: true }
})

// 清除工作区配置
ipcMain.handle('clear-workspace', async () => {
  const config = await readConfig()
  delete config.workspace
  await writeConfig(config)
  return { success: true }
})
