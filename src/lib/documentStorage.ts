import { Document } from '../types/document'

// 文档存储服务
class DocumentStorage {
  private currentFilePath: string | null = null
  private autoSaveTimer: NodeJS.Timeout | null = null
  private readonly AUTO_SAVE_DELAY = 2000 // 2秒后自动保存

  /**
   * 打开文档
   */
  async openDocument(): Promise<{ filePath: string; documents: Document[] } | null> {
    if (!window.electronAPI) {
      console.warn('Electron API not available')
      return null
    }

    const result = await window.electronAPI.openDocument()
    if (!result) return null

    this.currentFilePath = result.filePath
    return {
      filePath: result.filePath,
      documents: result.data
    }
  }

  /**
   * 保存文档
   */
  async saveDocuments(filePath: string | null, documents: Document[]): Promise<{ success: boolean; filePath?: string; error?: string }> {
    if (!window.electronAPI) {
      console.warn('Electron API not available')
      return { success: false, error: 'Electron API not available' }
    }

    const data = {
      version: '1.0.0',
      lastModified: new Date().toISOString(),
      documents
    }

    const result = await window.electronAPI.saveDocument(filePath, data)

    if (result.success && result.filePath) {
      this.currentFilePath = result.filePath
    }

    return result
  }

  /**
   * 另存为
   */
  async saveAsDocuments(documents: Document[]): Promise<{ success: boolean; filePath?: string; error?: string }> {
    return this.saveDocuments(null, documents)
  }

  /**
   * 获取当前文件路径
   */
  getCurrentFilePath(): string | null {
    return this.currentFilePath
  }

  /**
   * 设置当前文件路径
   */
  setCurrentFilePath(filePath: string | null): void {
    this.currentFilePath = filePath
  }

  /**
   * 是否有未保存的更改
   */
  hasUnsavedChanges(): boolean {
    // 简单实现：检查是否有文件路径
    // 实际应用中应该比较当前状态和上次保存的状态
    return this.currentFilePath === null
  }

  /**
   * 调度自动保存
   */
  scheduleAutoSave(callback: () => void): void {
    this.clearAutoSave()

    this.autoSaveTimer = setTimeout(() => {
      callback()
    }, this.AUTO_SAVE_DELAY)
  }

  /**
   * 清除自动保存定时器
   */
  clearAutoSave(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer)
      this.autoSaveTimer = null
    }
  }

  /**
   * 获取应用数据目录
   */
  async getAppDataPath(): Promise<string | null> {
    if (!window.electronAPI) {
      return null
    }

    return await window.electronAPI.getAppDataPath()
  }
}

// 导出单例
export const documentStorage = new DocumentStorage()
