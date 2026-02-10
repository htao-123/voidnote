import { FolderOpen, Sparkles } from 'lucide-react'
import { useDocumentStore } from '../stores/documentStore'

export default function WorkspaceWelcome() {
  const { selectWorkspace } = useDocumentStore()

  const handleSelectWorkspace = async () => {
    const path = await selectWorkspace()
    if (path) {
      // 保存工作区路径到本地存储
      localStorage.setItem('voidnote_workspace', path)
      // 重新加载页面以从工作区加载文档
      window.location.reload()
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8 p-12">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* 标题 */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">欢迎使用 VoidNote</h1>
          <p className="text-lg text-gray-600">选择一个文件夹作为知识库存储位置</p>
        </div>

        {/* 说明 */}
        <div className="max-w-md mx-auto text-left bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">知识库功能</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>以 Markdown 格式存储文档，便于版本控制和协作</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>树状文档结构，支持无限层级嵌套</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>文件夹结构反映文档层级关系</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>自动保存，永不丢失内容</span>
            </li>
          </ul>
        </div>

        {/* 选择按钮 */}
        <button
          onClick={handleSelectWorkspace}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        >
          <FolderOpen className="w-5 h-5" />
          选择知识库文件夹
        </button>

        {/* 提示 */}
        <p className="text-sm text-gray-500">
          提示：建议选择一个新的空文件夹作为知识库目录
        </p>
      </div>
    </div>
  )
}
