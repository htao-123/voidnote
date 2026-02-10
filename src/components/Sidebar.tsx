import { useState, useRef, useEffect, useMemo } from 'react'
import { FileText, Plus, Search, ChevronRight, ChevronDown, MoreHorizontal, Pencil, Trash2, X, Check, PlusCircle, Settings, FolderOpen } from 'lucide-react'
import { useDocumentStore } from '../stores/documentStore'
import { cn } from '../lib/utils'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onOpenSettings?: () => void
}

export default function Sidebar({ collapsed, onToggle, onOpenSettings }: SidebarProps) {
  const {
    documents,
    selectedDocumentId,
    setCurrentDocument,
    setSelectedDocumentId,
    addDocument,
    updateDocument,
    deleteDocument,
    toggleFolder,
    isExpanded,
  } = useDocumentStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [contextMenuId, setContextMenuId] = useState<string | null>(null)
  const [isNewDocument, setIsNewDocument] = useState(false)  // 标记是否是新创建的文档
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  // 点击外部关闭上下文菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 自动聚焦编辑框
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  const handleCreateDocument = () => {
    // 检查是否已有同名文档，生成唯一标题
    let baseTitle = '新建文档'
    let suffix = 1
    let uniqueTitle = baseTitle

    while (documents.some(d => d.title === uniqueTitle && d.parentId === null)) {
      suffix++
      uniqueTitle = baseTitle + ' (' + suffix + ')'
    }

    const newDoc = addDocument({
      title: uniqueTitle,
      content: '',
      json: JSON.stringify({ type: 'doc', content: [] }),
      parentId: null,
    })
    setCurrentDocument(newDoc)
    setEditingId(newDoc.id)
    setEditTitle(uniqueTitle)
    setIsNewDocument(true)  // 标记为新文档
  }

  // 创建子文档
  const handleCreateChildDocument = (parentId: string) => {
    // 检查是否已有同名子文档，生成唯一标题
    let baseTitle = '新建子文档'
    let suffix = 1
    let uniqueTitle = baseTitle

    while (documents.some(d => d.title === uniqueTitle && d.parentId === parentId)) {
      suffix++
      uniqueTitle = baseTitle + ' (' + suffix + ')'
    }

    const newDoc = addDocument({
      title: uniqueTitle,
      content: '',
      json: JSON.stringify({ type: 'doc', content: [] }),
      parentId,
    })
    setCurrentDocument(newDoc)
    setEditingId(newDoc.id)
    setEditTitle(uniqueTitle)
    setContextMenuId(null)
    setIsNewDocument(true)  // 标记为新文档
    // 自动展开父节点
    if (!isExpanded(parentId)) {
      toggleFolder(parentId)
    }
  }

  const handleSelectDocument = (doc: typeof documents[0]) => {
    if (editingId !== doc.id) {
      setSelectedDocumentId(doc.id)
      setCurrentDocument(doc)
    }
  }

  const handleStartEdit = (e: React.MouseEvent, doc: typeof documents[0]) => {
    e.stopPropagation()
    setEditingId(doc.id)
    setEditTitle(doc.title)
    setContextMenuId(null)
    setIsNewDocument(false)  // 重命名不是新文档
  }

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      updateDocument(editingId, { title: editTitle.trim() })
    }
    setEditingId(null)
    setEditTitle('')
    setIsNewDocument(false)
  }

  const handleCancelEdit = () => {
    // 如果是新创建的文档，取消时删除它
    if (isNewDocument && editingId) {
      deleteDocument(editingId)
      if (selectedDocumentId === editingId) {
        setSelectedDocumentId(null)
        setCurrentDocument(null)
      }
    }
    setEditingId(null)
    setEditTitle('')
    setIsNewDocument(false)
  }

  const handleDelete = (docId: string) => {
    if (confirm('确定要删除这个文档吗？')) {
      deleteDocument(docId)
      if (selectedDocumentId === docId) {
        setSelectedDocumentId(null)
        setCurrentDocument(null)
      }
    }
    setContextMenuId(null)
  }

  // 构建文档树
  const buildTree = (docs: typeof documents, parentId: string | null = null) => {
    return docs.filter((doc) => doc.parentId === parentId).sort((a, b) => a.createdAt - b.createdAt)
  }

  // 递归搜索所有文档
  const searchDocuments = (query: string) => {
    if (!query.trim()) return []
    const lowerQuery = query.toLowerCase()
    const results: Array<{ doc: typeof documents[0]; path: string[] }> = []

    const searchRecursive = (docs: typeof documents, parentId: string | null = null, currentPath: string[] = []) => {
      const children = docs.filter(d => d.parentId === parentId)
      for (const doc of children) {
        const docPath = [...currentPath, doc.title]
        if (doc.title.toLowerCase().includes(lowerQuery)) {
          results.push({ doc, path: docPath })
        }
        // 递归搜索子文档
        searchRecursive(docs, doc.id, docPath)
      }
    }

    searchRecursive(documents)
    return results
  }

  // 使用 useMemo 缓存搜索结果
  const searchResults = useMemo(() => searchDocuments(searchQuery), [searchQuery, documents])

  const renderDocumentItem = (doc: typeof documents[0], level: number = 0) => {
    const hasChildren = documents.some((d) => d.parentId === doc.id)
    const isSelected = selectedDocumentId === doc.id
    const expanded = isExpanded(doc.id)
    const isEditing = editingId === doc.id
    const showContextMenu = contextMenuId === doc.id

    return (
      <div key={doc.id} className="group">
        <div
          className={cn(
            'flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md mx-1 my-0.5',
            isSelected && !isEditing && 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50'
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => !isEditing && handleSelectDocument(doc)}
        >
          {hasChildren && (
            <button
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600200 rounded"
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(doc.id)
              }}
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}
          <FileText className={cn('w-4 h-4', isSelected ? 'text-blue-600' : 'text-gray-500')} />
          {!collapsed && (
            <>
              {isEditing ? (
                <div className="flex-1 flex items-center gap-1">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit()
                      if (e.key === 'Escape') handleCancelEdit()
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 px-2 py-0.5 text-sm bg-white dark:bg-gray-800 border border-blue-500 rounded focus:outline-none"
                  />
                  <button onClick={handleSaveEdit} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600200 rounded">
                    <Check className="w-4 h-4 text-green-600" />
                  </button>
                  <button onClick={handleCancelEdit} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600200 rounded">
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ) : (
                <>
                  <span
                    className={cn('text-sm truncate flex-1', isSelected ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300')}
                  >
                    {doc.title}
                  </span>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setContextMenuId(contextMenuId === doc.id ? null : doc.id)
                      }}
                      className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600200 rounded opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                    {showContextMenu && (
                      <div
                        ref={contextMenuRef}
                        className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-[120px]"
                      >
                        <button
                          onClick={() => handleCreateChildDocument(doc.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <PlusCircle className="w-4 h-4" />
                          添加子文档
                        </button>
                        <button
                          onClick={(e) => handleStartEdit(e, doc)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <Pencil className="w-4 h-4" />
                          重命名
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          删除
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
        {hasChildren && expanded && renderDocumentList(doc.id, level + 1)}
      </div>
    )
  }

  const renderDocumentList = (parentId: string | null, level: number = 0) => {
    const items = buildTree(documents, parentId)
    return items.map((doc) => renderDocumentItem(doc, level))
  }

  // 渲染搜索结果
  const renderSearchResults = () => {
    if (searchResults.length === 0) {
      return (
        <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>未找到匹配的文档</p>
        </div>
      )
    }

    return (
      <div className="px-2">
        <div className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          找到 {searchResults.length} 个结果
        </div>
        {searchResults.map(({ doc, path }) => {
          const isSelected = selectedDocumentId === doc.id
          return (
            <div
              key={doc.id}
              onClick={() => handleSelectDocument(doc)}
              className={cn(
                'flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md mx-1 my-0.5',
                isSelected && 'bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50'
              )}
            >
              <FileText className={cn('w-4 h-4 flex-shrink-0', isSelected ? 'text-blue-600' : 'text-gray-500')} />
              <div className="flex-1 min-w-0">
                <div className={cn('text-sm truncate', isSelected ? 'text-blue-600 font-medium' : 'text-gray-700')}>
                  {doc.title}
                </div>
                {path.length > 1 && (
                  <div className="text-xs text-gray-400 truncate flex items-center gap-1">
                    <FolderOpen className="w-3 h-3" />
                    {path.slice(0, -1).join(' / ')}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 dark:border-gray-700 flex flex-col', collapsed ? 'w-12' : 'w-64')}>
      {/* 头部 */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          {!collapsed && <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">VoidNote</h1>}
          <button
            className={cn('p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600200 rounded-md transition-colors', collapsed && 'w-full')}
            onClick={onToggle}
          >
            <svg
              className={cn('w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform', collapsed && 'rotate-180')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {!collapsed && (
          <>
            {/* 搜索框 */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索文档..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 新建按钮 */}
            <button
              onClick={handleCreateDocument}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新建文档
            </button>
          </>
        )}
      </div>

      {/* 文档列表 */}
      <div className="flex-1 overflow-auto py-2">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2 py-2">
            {documents.slice(0, 5).map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleSelectDocument(doc)}
                className={cn('p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600200', selectedDocumentId === doc.id && 'bg-blue-100')}
                title={doc.title}
              >
                <FileText className={cn('w-5 h-5', selectedDocumentId === doc.id ? 'text-blue-600' : 'text-gray-500')} />
              </button>
            ))}
          </div>
        ) : searchQuery.trim() ? (
          renderSearchResults()
        ) : (
          <div className="min-w-full">
            {renderDocumentList(null)}
          </div>
        )}
      </div>

      {/* 底部 */}
      {!collapsed && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Settings className="w-4 h-4" />
            设置
          </button>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">{documents.length} 个文档</div>
        </div>
      )}
      {collapsed && onOpenSettings && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onOpenSettings}
            className="w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-600200 rounded-md transition-colors"
            title="设置"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      )}
    </div>
  )
}
