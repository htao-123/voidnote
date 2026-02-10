import { create } from 'zustand'
import { Document } from '../types/document'
import { documentStorage } from '../lib/documentStorage'
import { markdownStorage } from '../lib/markdownStorage'

interface WorkspaceInfo {
  path: string
  name: string
}

interface DocumentStore {
  documents: Document[]
  currentDocument: Document | null
  selectedDocumentId: string | null
  expandedFolders: Set<string>

  // 工作区信息
  workspace: WorkspaceInfo | null

  // 文件信息
  currentFilePath: string | null
  isSaving: boolean
  hasUnsavedChanges: boolean
  lastSavedTime: number | null

  // 操作方法
  setCurrentDocument: (document: Document | null) => void
  setSelectedDocumentId: (id: string | null) => void
  addDocument: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => Document
  updateDocument: (id: string, updates: Partial<Document>) => void
  deleteDocument: (id: string) => void
  toggleFolder: (id: string) => void
  isExpanded: (id: string) => boolean
  getDocumentPath: (documentId: string) => Document[]  // 获取文档路径

  // 工作区操作
  setWorkspace: (path: string, name: string) => Promise<boolean>
  selectWorkspace: () => Promise<string | null>
  restoreWorkspace: () => Promise<boolean>

  // 文件操作
  openDocument: () => Promise<boolean>
  saveDocument: () => Promise<boolean>
  saveAsDocument: () => Promise<boolean>
  newDocument: () => void

  // 初始化
  initialize: () => void
  hasWorkspace: () => boolean

  // 工作区文档加载
  loadFromWorkspace: () => Promise<boolean>
  onFileChanged: (callback: (event: any, data: { path: string; eventType: string; exists: boolean }) => void) => void
}

// 生成唯一 ID
const generateId = () => `doc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  currentDocument: null,
  selectedDocumentId: null,
  expandedFolders: new Set(['root']),
  currentFilePath: null,
  isSaving: false,
  hasUnsavedChanges: false,
  lastSavedTime: null,
  workspace: null,

  setCurrentDocument: (document) => {
    set({
      currentDocument: document,
      selectedDocumentId: document?.id || null,
    })
  },

  setSelectedDocumentId: (id) => set({ selectedDocumentId: id }),

  addDocument: (doc) => {
    const newDoc: Document = {
      ...doc,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    set((state) => ({
      documents: [...state.documents, newDoc],
      hasUnsavedChanges: true
    }))
    return newDoc
  },

  updateDocument: (id, updates) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, ...updates, updatedAt: Date.now() } : doc
      ),
      currentDocument:
        state.currentDocument?.id === id
          ? { ...state.currentDocument, ...updates, updatedAt: Date.now() }
          : state.currentDocument,
      hasUnsavedChanges: true,
    }))
  },

  deleteDocument: (id) => {
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id && doc.parentId !== id),
      currentDocument: state.currentDocument?.id === id ? null : state.currentDocument,
      hasUnsavedChanges: true,
    }))
  },

  toggleFolder: (id) => {
    set((state) => {
      const newExpanded = new Set(state.expandedFolders)
      if (newExpanded.has(id)) {
        newExpanded.delete(id)
      } else {
        newExpanded.add(id)
      }
      return { expandedFolders: newExpanded }
    })
  },

  isExpanded: (id) => get().expandedFolders.has(id),

  // 获取文档路径（从根到当前文档）
  getDocumentPath: (documentId: string) => {
    const { documents } = get()
    const path: Document[] = []
    let currentDoc = documents.find(d => d.id === documentId)

    while (currentDoc) {
      path.unshift(currentDoc)
      currentDoc = documents.find(d => d.id === currentDoc!.parentId)
    }

    return path
  },

  // 打开文档
  openDocument: async () => {
    const result = await documentStorage.openDocument()
    if (!result) return false

    set({
      documents: result.documents,
      currentFilePath: result.filePath,
      hasUnsavedChanges: false,
      lastSavedTime: Date.now(),
    })

    // 设置当前文档为第一个文档
    if (result.documents.length > 0) {
      set({
        currentDocument: result.documents[0],
        selectedDocumentId: result.documents[0].id,
      })
    }

    return true
  },

  // 保存文档（手动保存）
  saveDocument: async () => {
    const state = get()
    console.log('[DocumentStore] saveDocument called, has workspace:', !!state.workspace, 'documents count:', state.documents.length)

    // 如果有工作区，保存为 Markdown 到工作区
    if (state.workspace) {
      set({ isSaving: true })

      // 保存所有文档到工作区
      const result = await markdownStorage.saveAllDocuments(state.documents)

      set({
        isSaving: false,
        hasUnsavedChanges: !result.success,
        lastSavedTime: result.success ? Date.now() : state.lastSavedTime,
      })

      console.log('[DocumentStore] Workspace save result:', result.success)
      return result.success
    }

    // 否则保存为 JSON 项目文件
    console.log('[DocumentStore] No workspace, saving as JSON file')
    set({ isSaving: true })

    const result = await documentStorage.saveDocuments(
      state.currentFilePath,
      state.documents
    )

    set({
      isSaving: false,
      currentFilePath: result.filePath || null,
      hasUnsavedChanges: !result.success,
      lastSavedTime: result.success ? Date.now() : state.lastSavedTime,
    })

    console.log('[DocumentStore] JSON save result:', result.success)
    return result.success
  },

  // 另存为
  saveAsDocument: async () => {
    const state = get()

    set({ isSaving: true })

    const result = await documentStorage.saveAsDocuments(state.documents)

    set({
      isSaving: false,
      currentFilePath: result.filePath || null,
      hasUnsavedChanges: !result.success,
      lastSavedTime: result.success ? Date.now() : state.lastSavedTime,
    })

    return result.success
  },

  // 新建文档（清空当前状态）
  newDocument: () => {
    documentStorage.setCurrentFilePath(null)
    set({
      documents: [],
      currentDocument: null,
      selectedDocumentId: null,
      currentFilePath: null,
      hasUnsavedChanges: false,
      lastSavedTime: null,
    })
  },

  initialize: () => {
    // 初始化示例文档 - 展示知识库树状结构
    const now = Date.now()
    const sampleDocs: Document[] = [
      {
        id: 'doc_1',
        title: '🏠 我的知识库',
        content: '<h1>我的知识库</h1><p>这是一个极简风格的 Markdown 知识库应用，支持树状文档结构。</p><h2>快速开始</h2><ul><li><strong>打开文档</strong>：点击侧边栏的文档</li><li><strong>保存文档</strong>：按 Ctrl+S 或点击工具栏保存按钮</li><li><strong>新建文档</strong>：点击侧边栏的新建按钮</li></ul><p>所有更改需要手动保存到文件。</p>',
        parentId: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'doc_2',
        title: '📚 学习笔记',
        content: '<h1>学习笔记</h1><p>记录学习过程中的各种笔记和心得。</p>',
        parentId: null,
        createdAt: now + 1,
        updatedAt: now + 1,
      },
      {
        id: 'doc_3',
        title: '前端开发',
        content: '<h2>前端开发笔记</h2><p>React、Vue、TypeScript 等前端技术学习记录。</p>',
        parentId: 'doc_2',
        createdAt: now + 2,
        updatedAt: now + 2,
      },
      {
        id: 'doc_4',
        title: '后端开发',
        content: '<h2>后端开发笔记</h2><p>Node.js、Python、数据库等后端技术学习记录。</p>',
        parentId: 'doc_2',
        createdAt: now + 3,
        updatedAt: now + 3,
      },
      {
        id: 'doc_5',
        title: '💡 项目想法',
        content: '<h1>项目想法</h1><p>记录各种项目灵感和想法。</p>',
        parentId: null,
        createdAt: now + 4,
        updatedAt: now + 4,
      },
      {
        id: 'doc_6',
        title: 'Web 应用',
        content: '<h2>Web 应用想法</h2><p>各种 Web 应用项目的想法和规划。</p>',
        parentId: 'doc_5',
        createdAt: now + 5,
        updatedAt: now + 5,
      },
      {
        id: 'doc_7',
        title: '移动应用',
        content: '<h2>移动应用想法</h2><p>各种移动应用项目的想法和规划。</p>',
        parentId: 'doc_5',
        createdAt: now + 6,
        updatedAt: now + 6,
      },
    ]
    set({
      documents: sampleDocs,
      currentDocument: sampleDocs[0],
      selectedDocumentId: sampleDocs[0].id,
      expandedFolders: new Set(['root', 'doc_2', 'doc_5']), // 默认展开有子文档的节点
      hasUnsavedChanges: true
    })
  },

  // 设置工作区
  setWorkspace: async (path: string, name: string) => {
    const result = await markdownStorage.setWorkspace(path)
    if (result) {
      // 使用 Electron 官方推荐的配置存储方式（userData 目录）
      if (window.electronAPI && window.electronAPI.setWorkspace) {
        await window.electronAPI.setWorkspace({ path, name })
      }
      set({ workspace: { path, name } })
      console.log('[DocumentStore] Workspace saved to config:', { path, name })
    }
    return result
  },

  // 选择工作区文件夹
  selectWorkspace: async () => {
    if (!window.electronAPI) return null
    const path = await window.electronAPI.selectWorkspace()
    if (path) {
      const name = path.split(/[/\\]/).filter(Boolean).pop() || '知识库'
      await get().setWorkspace(path, name)
    }
    return path
  },

  // 检查是否已设置工作区
  hasWorkspace: () => {
    return get().workspace !== null
  },

  // 从配置文件恢复工作区（Electron 官方推荐：userData 目录）
  restoreWorkspace: async () => {
    if (!window.electronAPI || !window.electronAPI.getWorkspace) {
      return false
    }

    const workspaceInfo = await window.electronAPI.getWorkspace()
    if (workspaceInfo) {
      try {
        await markdownStorage.setWorkspace(workspaceInfo.path)
        set({ workspace: workspaceInfo })
        console.log('[DocumentStore] Workspace restored from config:', workspaceInfo)
        return true
      } catch (e) {
        console.error('[DocumentStore] Failed to restore workspace:', e)
        // 清除无效的配置
        if (window.electronAPI.clearWorkspace) {
          await window.electronAPI.clearWorkspace()
        }
        return false
      }
    }
    return false
  },

  // 从工作区加载文档
  loadFromWorkspace: async () => {
    const result = await markdownStorage.loadDocuments()
    if (!result.success || !result.documents) return false

    set({
      documents: result.documents,
      hasUnsavedChanges: false,
      lastSavedTime: Date.now(),
    })

    // 设置当前文档为第一个文档
    if (result.documents.length > 0) {
      set({
        currentDocument: result.documents[0],
        selectedDocumentId: result.documents[0].id,
      })
    }

    return true
  },

  // 监听文件变化
  onFileChanged: (callback) => {
    if (!get().workspace) return

    markdownStorage.watchWorkspace((data) => {
      // Electron IPC 回调提供 event 和 data，但 markdownStorage 只提供 data
      // 这里模拟 Electron IPC 的参数格式
      callback(null, data)
    })
  },
}))
