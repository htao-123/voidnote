import { useDocumentStore } from '../stores/documentStore'
import { ChevronRight, FileText, AlignLeft, Clock } from 'lucide-react'

export default function Breadcrumb() {
  const { currentDocument, getDocumentPath, setCurrentDocument, isSaving, hasUnsavedChanges, lastSavedTime, getWordCount } = useDocumentStore()

  if (!currentDocument) return null

  const path = getDocumentPath(currentDocument.id)
  const stats = getWordCount(currentDocument.content)

  // 格式化阅读时间
  const formatReadTime = (minutes: number) => {
    if (minutes < 1) return '<1分钟'
    if (minutes < 60) return `${minutes}分钟`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
  }

  // 格式化最后保存时间
  const formatLastSavedTime = (timestamp: number | null) => {
    if (!timestamp) return ''
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 5) return '刚刚'
    if (seconds < 60) return `${seconds}秒前`
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    return new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm">
      <div className="flex items-center gap-1 flex-1 min-w-0">
        {path.map((doc, index) => {
          const isLast = index === path.length - 1
          return (
            <div key={doc.id} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              )}
              <button
                onClick={() => setCurrentDocument(doc)}
                className={`truncate max-w-[150px] hover:text-blue-600 transition-colors ${
                  isLast
                    ? 'text-gray-900 dark:text-gray-100 font-medium cursor-default'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
                disabled={isLast}
              >
                {doc.title}
              </button>
            </div>
          )
        })}
      </div>
      {/* 字数统计 */}
      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 mx-2">
        <div className="flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" />
          <span>{stats.words} 字</span>
        </div>
        <div className="flex items-center gap-1">
          <AlignLeft className="w-3.5 h-3.5" />
          <span>{stats.chars} 字符</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatReadTime(stats.readTime)}</span>
        </div>
      </div>
      {/* 保存状态 */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        {isSaving && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
            <span>保存中</span>
          </div>
        )}
        {!isSaving && lastSavedTime && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400" title={hasUnsavedChanges ? '有未保存的更改' : '已保存'}>
            <div className={`w-1.5 h-1.5 rounded-full ${hasUnsavedChanges ? 'bg-yellow-500' : 'bg-green-500'}`} />
            <span>{formatLastSavedTime(lastSavedTime)}</span>
          </div>
        )}
        {!isSaving && !lastSavedTime && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <span>未保存</span>
          </div>
        )}
      </div>
    </div>
  )
}
