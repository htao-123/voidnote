import { useDocumentStore } from '../stores/documentStore'
import { FileText, Clock, AlignLeft } from 'lucide-react'

export default function DocumentStats() {
  const { currentDocument, getWordCount } = useDocumentStore()

  if (!currentDocument) return null

  const stats = getWordCount(currentDocument.json || '')

  const formatReadTime = (minutes: number) => {
    if (minutes < 1) return '少于1分钟'
    if (minutes < 60) return `${minutes}分钟`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
  }

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
      <div className="flex items-center gap-1.5">
        <FileText className="w-3.5 h-3.5" />
        <span>{stats.words} 字</span>
      </div>
      <div className="flex items-center gap-1.5">
        <AlignLeft className="w-3.5 h-3.5" />
        <span>{stats.chars} 字符</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" />
        <span>阅读约 {formatReadTime(stats.readTime)}</span>
      </div>
    </div>
  )
}
