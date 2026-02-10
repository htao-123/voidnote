import { X, FolderOpen, Info, Clock, Sun, Moon } from 'lucide-react'
import { useDocumentStore } from '../stores/documentStore'
import { useThemeStore } from '../stores/themeStore'

interface SettingsModalProps {
  onClose: () => void
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { workspace, selectWorkspace, autoSaveConfig, updateAutoSaveConfig } = useDocumentStore()
  const { isDark, toggleTheme } = useThemeStore()

  const handleChangeWorkspace = async () => {
    const path = await selectWorkspace()
    if (path) {
      localStorage.setItem('voidnote_workspace', path)
      // 重新加载页面以应用新的工作区
      window.location.reload()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">设置</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 自动保存设置 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-medium">
              <Clock className="w-5 h-5" />
              <span>自动保存</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">启用自动保存</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  停止输入 {autoSaveConfig.delay / 1000} 秒后自动保存
                </p>
              </div>
              <button
                onClick={() => updateAutoSaveConfig({ enabled: !autoSaveConfig.enabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  autoSaveConfig.enabled ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-0 w-4 h-4 bg-white rounded-full transition-transform ${
                    autoSaveConfig.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 主题设置 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-medium">
              {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span>主题模式</span>
            </div>
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">深色模式</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  切换浅色/深色主题
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isDark ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-0 w-4 h-4 bg-white rounded-full transition-transform ${
                    isDark ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 工作区设置 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-medium">
              <FolderOpen className="w-5 h-5" />
              <span>知识库位置</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
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
            <p className="text-xs text-gray-500 dark:text-gray-400">
              更改知识库位置后，应用将重新加载以从新位置读取文档。
            </p>
          </div>

          {/* 关于 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-medium">
              <Info className="w-5 h-5" />
              <span>关于</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p><strong>VoidNote</strong> - 极简风格的 Markdown 知识库应用</p>
              <p>文档以 Markdown 格式存储，便于版本控制和协作。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
