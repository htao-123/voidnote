import { Document } from '../types/document'

// 简单的路径连接函数（用于渲染进程）
function joinPath(...parts: string[]): string {
  // 过滤掉空字符串，然后用 / 连接
  return parts.filter(p => p && p.length > 0).join('/').replace(/\/+/g, '/')
}



// 文件名清理：移除不允许的字符
function sanitizeFilename(name: string): string {
  if (!name || name.trim().length === 0) {
    return 'untitled'
  }
  return name
    .replace(/[<>:"/\\|?*]/g, '')  // 移除 Windows 不允许的字符
    .replace(/\s+/g, '_')           // 空格替换为下划线
    .trim()                         // 去除首尾空格
    .substring(0, 200)               // 限制长度
}

interface WorkspaceInfo {
  path: string
  name: string
}

class MarkdownStorage {
  private workspace: WorkspaceInfo | null = null

  /**
   * 设置工作区
   */
  async setWorkspace(path: string): Promise<boolean> {
    if (!window.electronAPI) {
      console.warn('Electron API not available')
      return false
    }

    this.workspace = {
      path,
      name: path.split(/[/\\]/).filter(Boolean).pop() || '知识库'
    }
    return true
  }

  /**
   * 获取工作区信息
   */
  getWorkspace(): WorkspaceInfo | null {
    return this.workspace
  }

  /**
   * 将文档标题转换为文件路径
   * @param doc 文档对象
   * @param allDocuments 所有文档列表（用于查找父文档路径）
   */
  getDocumentPath(doc: Document, allDocuments: Document[] = []): string {
    if (!this.workspace) return ''

    // 构建路径：工作区/父文档名/当前文档.md
    const pathParts: string[] = [this.workspace.path]

    // 递归查找父文档路径
    if (doc.parentId) {
      const parentPath = this.buildParentPath(doc.parentId, allDocuments)
      if (parentPath) {
        pathParts.push(parentPath)
      }
    }

    pathParts.push(sanitizeFilename(doc.title) + '.md')

    return joinPath(...pathParts)
  }

  /**
   * 递归构建父文档路径
   * @param parentId 父文档 ID
   * @param allDocuments 所有文档列表
   * @returns 父文档的文件夹路径
   */
  private buildParentPath(parentId: string, allDocuments: Document[]): string {
    const parent = allDocuments.find(d => d.id === parentId)
    if (!parent) return ''

    const parentName = sanitizeFilename(parent.title)

    // 如果父文档也有父文档，递归查找
    if (parent.parentId) {
      const grandParentPath = this.buildParentPath(parent.parentId, allDocuments)
      return grandParentPath ? joinPath(grandParentPath, parentName) : parentName
    }

    return parentName
  }

  /**
   * 生成唯一的文档标题（仅在内存中检查）
   * @param baseTitle 基础标题
   * @param allDocuments 所有文档列表
   * @param parentId 父文档 ID
   * @param currentDocId 当前文档 ID（用于排除自己）
   * @returns 唯一的标题
   */
  private generateUniqueTitle(baseTitle: string, allDocuments: Document[], parentId: string | null = null, currentDocId?: string): string {
    // 只检查内存中的重复文档，不检查文件系统
    let uniqueTitle = baseTitle
    let suffix = 1

    while (allDocuments.some(doc =>
      doc.id !== currentDocId &&
      doc.title === uniqueTitle &&
      doc.parentId === parentId
    )) {
      suffix++
      uniqueTitle = baseTitle + ' (' + suffix + ')'
    }

    return uniqueTitle
  }

  /**
   * 保存单个文档为 Markdown 文件
   * @param doc 要保存的文档
   * @param allDocuments 所有文档列表（用于构建路径）
   */
  async saveDocument(doc: Document, allDocuments: Document[] = []): Promise<{ success: boolean; error?: string; actualTitle?: string }> {
    if (!window.electronAPI) {
      console.error('[MarkdownStorage] saveDocument failed: electronAPI not available')
      return { success: false, error: 'electronAPI not available' }
    }

    if (!this.workspace) {
      console.error('[MarkdownStorage] saveDocument failed: no workspace set')
      return { success: false, error: 'No workspace selected' }
    }

    try {
      const uniqueTitle = doc.title
      const filePath = this.getDocumentPath(doc, allDocuments)
      console.log('[MarkdownStorage] Saving document:', uniqueTitle, 'to path:', filePath)

      // 使用 JSON 格式存储，避免转义问题
      let contentToSave = doc.json || ''

      // 如果没有 JSON 字段，生成空的 TipTap JSON
      if (!contentToSave) {
        contentToSave = JSON.stringify({ type: 'doc', content: [] })
      }

      const result = await window.electronAPI.saveMarkdown(filePath, contentToSave)

      if (result.success) {
        console.log('[MarkdownStorage] Document saved successfully:', filePath)
      } else {
        console.error('[MarkdownStorage] Failed to save document:', result.error)
      }

      return { ...result, actualTitle: uniqueTitle }
    } catch (error: any) {
      console.error('[MarkdownStorage] Error saving document:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 保存所有文档
   */
  async saveAllDocuments(documents: Document[]): Promise<{ success: boolean; error?: string }> {
    console.log('[MarkdownStorage] Saving all documents, count:', documents.length)

    const results = await Promise.all(
      documents.map(doc => this.saveDocument(doc, documents))
    )

    const failures = results.filter(r => !r.success)
    if (failures.length > 0) {
      console.error('[MarkdownStorage] Some documents failed to save:', failures.length)
      return { success: false, error: failures[0]?.error }
    }

    console.log('[MarkdownStorage] All documents saved successfully')
    return { success: true }
  }

  /**
   * 从文件夹加载所有文档
   */
  async loadDocuments(): Promise<{ success: boolean; documents?: Document[]; error?: string }> {
    if (!window.electronAPI || !this.workspace) {
      return { success: false, error: 'No workspace selected' }
    }

    try {
      return await window.electronAPI.loadMarkdownFolder(this.workspace.path)
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * 开始监听工作区文件变化
   */
  async watchWorkspace(onChange: (data: { path: string; eventType: string; exists: boolean }) => void): Promise<boolean> {
    if (!window.electronAPI || !this.workspace) {
      return false
    }

    try {
      const result = await window.electronAPI.watchWorkspace(this.workspace.path)
      if (result.success) {
        window.electronAPI.onFileChanged((_, data) => onChange(data))
      }
      return result.success
    } catch (error) {
      console.error('Error watching workspace:', error)
      return false
    }
  }

  /**
   * 停止监听工作区文件变化
   */
  async unwatchWorkspace(): Promise<boolean> {
    if (!window.electronAPI || !this.workspace) {
      return false
    }

    try {
      const result = await window.electronAPI.unwatchWorkspace(this.workspace.path)
      return result.success
    } catch (error) {
      console.error('Error unwatching workspace:', error)
      return false
    }
  }

  /**
   * 删除文档或文件夹
   * @param doc 要删除的文档
   * @param allDocuments 所有文档列表（用于检查是否有子文档）
   */
  async delete(doc: Document, allDocuments: Document[] = []): Promise<{ success: boolean; error?: string }> {
    if (!window.electronAPI || !this.workspace) {
      return { success: false, error: 'No workspace selected' }
    }

    try {
      const filePath = this.getDocumentPath(doc, allDocuments)

      // 检查是否有子文档
      const hasChildren = allDocuments.some(d => d.parentId === doc.id)

      // 1. 先删除 .md 文件
      let mdFileDeleted = true
      const mdFileExists = await window.electronAPI.fileExists(filePath)
      if (mdFileExists) {
        const mdResult = await window.electronAPI.deleteMarkdown(filePath, false)
        mdFileDeleted = mdResult.success
        if (!mdFileDeleted) {
          console.error('[MarkdownStorage] Failed to delete .md file:', mdResult.error)
        }
      }

      // 2. 如果有子文档，删除同名文件夹
      let folderDeleted = true
      if (hasChildren) {
        // 获取文件夹路径（去掉 .md 后缀）
        const folderPath = filePath.slice(0, -3) // 移除 '.md'
        const folderExists = await window.electronAPI.fileExists(folderPath)
        if (folderExists) {
          const folderResult = await window.electronAPI.deleteMarkdown(folderPath, true)
          folderDeleted = folderResult.success
          if (!folderDeleted) {
            console.error('[MarkdownStorage] Failed to delete folder:', folderResult.error)
          }
        }
      }

      // 3. 如果是子文档，检查父文档的文件夹是否为空，为空则删除
      let parentFolderDeleted = true
      if (doc.parentId) {
        const parentFolderResult = await this.cleanEmptyParentFolder(doc, allDocuments)
        parentFolderDeleted = parentFolderResult.success
        if (!parentFolderDeleted) {
          console.error('[MarkdownStorage] Failed to clean parent folder:', parentFolderResult.error)
        }
      }

      return { success: mdFileDeleted && folderDeleted && parentFolderDeleted }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * 清理空的父文件夹
   * @param doc 子文档
   * @param allDocuments 所有文档列表
   */
  private async cleanEmptyParentFolder(doc: Document, allDocuments: Document[]): Promise<{ success: boolean; error?: string }> {
    if (!window.electronAPI || !this.workspace) {
      return { success: false, error: 'No workspace selected' }
    }

    try {
      // 获取父文档
      const parentDoc = allDocuments.find(d => d.id === doc.parentId)
      if (!parentDoc) {
        return { success: true } // 没有父文档，无需清理
      }

      // 获取父文档的文件夹路径（父文档.md 去掉 .md 后缀）
      const parentFolderPath = this.getDocumentPath(parentDoc, allDocuments).slice(0, -3)

      // 检查该文件夹是否为空
      const checkResult = await window.electronAPI.isDirectoryEmpty(parentFolderPath)
      if (!checkResult.success) {
        return { success: false, error: checkResult.error }
      }

      // 如果为空，删除该文件夹
      if (checkResult.isEmpty) {
        const deleteResult = await window.electronAPI.deleteMarkdown(parentFolderPath, true)
        if (!deleteResult.success) {
          return { success: false, error: deleteResult.error }
        }
        console.log('[MarkdownStorage] Deleted empty parent folder:', parentFolderPath)
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * 重命名文档
   * @param doc 要重命名的文档
   * @param newTitle 新标题
   * @param allDocuments 所有文档列表
   */
  async rename(doc: Document, newTitle: string, allDocuments: Document[] = []): Promise<{ success: boolean; error?: string; actualTitle?: string }> {
    if (!window.electronAPI || !this.workspace) {
      return { success: false, error: 'No workspace selected' }
    }

    try {
      const oldPath = this.getDocumentPath(doc, allDocuments)

      // 检查新标题是否与内存中其他文档冲突
      const uniqueTitle = this.generateUniqueTitle(newTitle, allDocuments, doc.parentId, doc.id)

      // 临时创建新文档对象来获取新路径
      const tempDoc = { ...doc, title: uniqueTitle }
      const newPath = this.getDocumentPath(tempDoc, allDocuments)

      console.log('[MarkdownStorage] Renaming:', oldPath, '->', newPath)

      // 检查旧文件是否存在（如果不存在，说明是新建的文档还没保存）
      const oldExists = await window.electronAPI.fileExists(oldPath)

      if (!oldExists) {
        console.log('[MarkdownStorage] Source file does not exist (new document), skipping file system rename')
        // 文件不存在，不需要重命名，只返回成功和实际标题
        // 后续的自动保存会使用新标题创建文件
        return { success: true, actualTitle: uniqueTitle }
      }

      const result = await window.electronAPI.renameMarkdown(oldPath, newPath)

      if (result.success) {
        console.log('[MarkdownStorage] Rename successful')
      } else {
        console.error('[MarkdownStorage] Rename failed:', result.error)
      }

      return { ...result, actualTitle: uniqueTitle }
    } catch (error: any) {
      console.error('[MarkdownStorage] Rename error:', error)
      return { success: false, error: error.message }
    }
  }
}

// 导出单例
export const markdownStorage = new MarkdownStorage()
