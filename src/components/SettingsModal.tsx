import { X, FolderOpen, Info } from 'lucide-react'
import { useDocumentStore } from '../stores/documentStore'

interface SettingsModalProps {
  onClose: () => void
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { workspace, selectWorkspace } = useDocumentStore()

  const handleChangeWorkspace = async () => {
    const path = await selectWorkspace()
    if (path) {
      localStorage.setItem('voidnote_workspace', path)
      // 重新加载页面以应用新的工作区
      window.location.reload()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">设置</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 工作区设置 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-medium">
              <FolderOpen className="w-5 h-5" />
              <span>知识库位置</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 break-all">
                {workspace?.path || '未设置工作区'}
              </p>
            </div>
            <button
              onClick={handleChangeWorkspace}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              更改知识库位置
            </button>
            <p className="text-xs text-gray-500">
              更改知识库位置后，应用将重新加载以从新位置读取文档。
            </p>
          </div>

          {/* 关于 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-medium">
              <Info className="w-5 h-5" />
              <span>关于</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-1">
              <p><strong>VoidNote</strong> - 极简风格的 Markdown 知识库应用</p>
              <p>文档以 Markdown 格式存储，便于版本控制和协作。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
