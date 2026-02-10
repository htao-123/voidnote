import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import EditorContent from './components/EditorContent'
import Breadcrumb from './components/Breadcrumb'
import SettingsModal from './components/SettingsModal'
import { useDocumentStore } from './stores/documentStore'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const { currentDocument, loadFromWorkspace, initialize, selectWorkspace, restoreWorkspace } = useDocumentStore()

  // 初始化应用
  useEffect(() => {
    const initApp = async () => {
      // 使用 Electron 官方推荐的方式：从 userData 目录恢复工作区配置
      const restored = await restoreWorkspace()

      if (restored) {
        // 工作区恢复成功，加载文档
        const success = await loadFromWorkspace()
        if (!success) {
          initialize()
        }
      } else {
        // 没有保存的工作区，弹出选择对话框
        const path = await selectWorkspace()
        if (path) {
          // 从工作区加载文档
          await loadFromWorkspace()
        } else {
          // 用户取消选择，使用示例数据
          initialize()
        }
      }

      setIsLoading(false)
    }

    initApp()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white">
      {/* 侧边栏 */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 面包屑导航 */}
        {currentDocument && <Breadcrumb />}

        {/* 编辑器区域 */}
        {currentDocument ? (
          <EditorContent key={currentDocument.id} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            选择或创建一个文档开始编辑
          </div>
        )}
      </div>

      {/* 设置模态框 */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}

export default App
