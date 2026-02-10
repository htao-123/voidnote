import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Table,
  CheckSquare,
  Undo,
  Redo,
  Download,
  FileText,
  File,
  Keyboard,
  Trash2,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  Table2,
  MinusCircle,
} from 'lucide-react'
import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { cn } from '../lib/utils'
import { exportToMarkdown } from '../lib/shortcuts'
import { ExportManager } from '../lib/exportDocument'
import { useDocumentStore } from '../stores/documentStore'
import { useState, useEffect } from 'react'
import InputPrompt from './InputPrompt'

export default function Toolbar() {
  const { editor } = useCurrentEditor()
  const {
    currentDocument,
    saveDocument,
  } = useDocumentStore()
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [linkPrompt, setLinkPrompt] = useState({ isOpen: false })
  const [imagePrompt, setImagePrompt] = useState({ isOpen: false })
  const [imageChoicePrompt, setImageChoicePrompt] = useState({ isOpen: false })

  // 键盘快捷键监听
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Ctrl+S 保存
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        await saveDocument()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [saveDocument])

  // 使用 useEditorState 优化性能，只在相关状态变化时重新渲染
  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor?.isActive('bold') ?? false,
      isItalic: editor?.isActive('italic') ?? false,
      isUnderline: editor?.isActive('underline') ?? false,
      isStrike: editor?.isActive('strike') ?? false,
      isCode: editor?.isActive('code') ?? false,
      isH1: editor?.isActive('heading', { level: 1 }) ?? false,
      isH2: editor?.isActive('heading', { level: 2 }) ?? false,
      isH3: editor?.isActive('heading', { level: 3 }) ?? false,
      isBulletList: editor?.isActive('bulletList') ?? false,
      isOrderedList: editor?.isActive('orderedList') ?? false,
      isTaskList: editor?.isActive('taskList') ?? false,
      isBlockquote: editor?.isActive('blockquote') ?? false,
      isAlignLeft: editor?.isActive({ textAlign: 'left' }) ?? false,
      isAlignCenter: editor?.isActive({ textAlign: 'center' }) ?? false,
      isAlignRight: editor?.isActive({ textAlign: 'right' }) ?? false,
      canUndo: editor?.can().undo() ?? false,
      canRedo: editor?.can().redo() ?? false,
    }),
  })

  if (!editor || !editorState) {
    return null
  }

  const handleAction = async (action: string) => {
    switch (action) {
      case 'undo':
        editor.chain().focus().undo().run()
        break
      case 'redo':
        editor.chain().focus().redo().run()
        break
      case 'h1':
        editor.chain().focus().toggleHeading({ level: 1 }).run()
        break
      case 'h2':
        editor.chain().focus().toggleHeading({ level: 2 }).run()
        break
      case 'h3':
        editor.chain().focus().toggleHeading({ level: 3 }).run()
        break
      case 'bold':
        editor.chain().focus().toggleBold().run()
        break
      case 'italic':
        editor.chain().focus().toggleItalic().run()
        break
      case 'underline':
        editor.chain().focus().toggleUnderline().run()
        break
      case 'strike':
        editor.chain().focus().toggleStrike().run()
        break
      case 'code':
        editor.chain().focus().toggleCode().run()
        break
      case 'bulletList':
        editor.chain().focus().toggleBulletList().run()
        break
      case 'orderedList':
        editor.chain().focus().toggleOrderedList().run()
        break
      case 'taskList':
        editor.chain().focus().toggleTaskList().run()
        break
      case 'blockquote':
        editor.chain().focus().toggleBlockquote().run()
        break
      case 'horizontalRule':
        editor.chain().focus().setHorizontalRule().run()
        break
      case 'table':
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        break
      case 'link':
        setLinkPrompt({ isOpen: true })
        break
      case 'image':
        setImageChoicePrompt({ isOpen: true })
        break
      case 'alignLeft':
        editor.chain().focus().setTextAlign('left').run()
        break
      case 'alignCenter':
        editor.chain().focus().setTextAlign('center').run()
        break
      case 'alignRight':
        editor.chain().focus().setTextAlign('right').run()
        break
      case 'exportMarkdown':
        handleExportMarkdown()
        break
      case 'exportHTML':
        await handleExportHTML()
        break
      case 'exportPDF':
        await handleExportPDF()
        break
      case 'toggleShortcuts':
        setShowShortcuts(!showShortcuts)
        break
      // 表格操作
      case 'addRowBefore':
        editor.chain().focus().addRowBefore().run()
        break
      case 'addRowAfter':
        editor.chain().focus().addRowAfter().run()
        break
      case 'deleteRow':
        editor.chain().focus().deleteRow().run()
        break
      case 'addColumnBefore':
        editor.chain().focus().addColumnBefore().run()
        break
      case 'addColumnAfter':
        editor.chain().focus().addColumnAfter().run()
        break
      case 'deleteColumn':
        editor.chain().focus().deleteColumn().run()
        break
      case 'deleteTable':
        editor.chain().focus().deleteTable().run()
        break
    }
  }

  const handleExportMarkdown = () => {
    if (!currentDocument) return

    const markdown = exportToMarkdown(editor)
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentDocument.title}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportHTML = async () => {
    if (!currentDocument) {
      alert('请先打开一个文档')
      return
    }

    try {
      await ExportManager.exportAsHTML(currentDocument)
    } catch (error: any) {
      alert(`导出 HTML 失败: ${error.message}`)
    }
  }

  const handleExportPDF = async () => {
    if (!currentDocument) {
      alert('请先打开一个文档')
      return
    }

    try {
      await ExportManager.exportAsPDF(currentDocument)
    } catch (error: any) {
      alert(`导出 PDF 失败: ${error.message}`)
    }
  }
  const toolbarGroups = [
    // 历史记录
    {
      items: [
        { icon: Undo, action: 'undo', title: '撤销' },
        { icon: Redo, action: 'redo', title: '重做' },
      ],
    },
    // 标题
    {
      items: [
        { icon: Heading1, action: 'h1', title: '一级标题' },
        { icon: Heading2, action: 'h2', title: '二级标题' },
        { icon: Heading3, action: 'h3', title: '三级标题' },
      ],
    },
    // 文本格式
    {
      items: [
        { icon: Bold, action: 'bold', title: '粗体' },
        { icon: Italic, action: 'italic', title: '斜体' },
        { icon: Underline, action: 'underline', title: '下划线' },
        { icon: Strikethrough, action: 'strike', title: '删除线' },
        { icon: Code, action: 'code', title: '行内代码' },
      ],
    },
    // 列表
    {
      items: [
        { icon: List, action: 'bulletList', title: '无序列表' },
        { icon: ListOrdered, action: 'orderedList', title: '有序列表' },
        { icon: CheckSquare, action: 'taskList', title: '任务列表' },
      ],
    },
    // 其他元素
    {
      items: [
        { icon: Quote, action: 'blockquote', title: '引用' },
        { icon: Minus, action: 'horizontalRule', title: '分割线' },
        { icon: Table, action: 'table', title: '表格' },
      ],
    },
    // 插入
    {
      items: [
        { icon: LinkIcon, action: 'link', title: '插入链接' },
        { icon: ImageIcon, action: 'image', title: '插入图片' },
      ],
    },
    // 表格操作
    {
      items: [
        { icon: ArrowUpToLine, action: 'addRowBefore', title: '在上方添加行' },
        { icon: ArrowDownToLine, action: 'addRowAfter', title: '在下方添加行' },
        { icon: ArrowLeftToLine, action: 'addColumnBefore', title: '在左侧添加列' },
        { icon: ArrowRightToLine, action: 'addColumnAfter', title: '在右侧添加列' },
        { icon: Trash2, action: 'deleteRow', title: '删除行' },
        { icon: MinusCircle, action: 'deleteColumn', title: '删除列' },
        { icon: Table2, action: 'deleteTable', title: '删除表格' },
      ],
    },
    // 对齐
    {
      items: [
        { icon: AlignLeft, action: 'alignLeft', title: '左对齐' },
        { icon: AlignCenter, action: 'alignCenter', title: '居中' },
        { icon: AlignRight, action: 'alignRight', title: '右对齐' },
      ],
    },
    // 主题和导出
    {
      items: [
        { icon: Download, action: 'exportMarkdown', title: '导出 Markdown' },
        { icon: FileText, action: 'exportHTML', title: '导出 HTML' },
        { icon: File, action: 'exportPDF', title: '导出 PDF' },
        { icon: Keyboard, action: 'toggleShortcuts', title: '快捷键' },
      ],
    },
  ]

  return (
    <div className="relative">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {toolbarGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="flex items-center gap-0.5">
              {groupIndex > 0 && <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />}
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.action}
                    onClick={() => handleAction(item.action)}
                    disabled={
                      (item.action === 'undo' && !editorState.canUndo) ||
                      (item.action === 'redo' && !editorState.canRedo)
                    }
                    className={cn(
                      "p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors flex-shrink-0",
                      (item.action === 'bold' && editorState.isBold) ||
                      (item.action === 'italic' && editorState.isItalic) ||
                      (item.action === 'underline' && editorState.isUnderline) ||
                      (item.action === 'strike' && editorState.isStrike) ||
                      (item.action === 'code' && editorState.isCode) ||
                      (item.action === 'h1' && editorState.isH1) ||
                      (item.action === 'h2' && editorState.isH2) ||
                      (item.action === 'h3' && editorState.isH3) ||
                      (item.action === 'bulletList' && editorState.isBulletList) ||
                      (item.action === 'orderedList' && editorState.isOrderedList) ||
                      (item.action === 'taskList' && editorState.isTaskList) ||
                      (item.action === 'blockquote' && editorState.isBlockquote) ||
                      (item.action === 'alignLeft' && editorState.isAlignLeft) ||
                      (item.action === 'alignCenter' && editorState.isAlignCenter) ||
                      (item.action === 'alignRight' && editorState.isAlignRight)
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "",
                      ((item.action === 'undo' && !editorState.canUndo) ||
                      (item.action === 'redo' && !editorState.canRedo))
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    )}
                    title={item.title}
                  >
                    <Icon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 快捷键面板 */}
      {showShortcuts && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-10"
            onClick={() => setShowShortcuts(false)}
          />
          <div className="absolute right-4 top-14 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-20 w-80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">键盘快捷键</h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">粗体</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">Ctrl+B</kbd>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">斜体</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">Ctrl+I</kbd>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">插入链接</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">Ctrl+K</kbd>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">撤销</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">Ctrl+Z</kbd>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">重做</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">Ctrl+Shift+Z</kbd>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">快捷菜单</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">/</kbd>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">保存</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">Ctrl+S</kbd>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 链接输入对话框 */}
      <InputPrompt
        isOpen={linkPrompt.isOpen}
        title="插入链接"
        message="请输入链接地址："
        placeholder="https://example.com"
        onConfirm={(value) => {
          if (value.trim()) {
            const url = value.trim()
            // 检查是否有选中的文本
            const { from, to } = editor.state.selection
            const hasSelection = from !== to

            if (hasSelection) {
              // 有选中文本，直接转换为链接
              editor.chain().focus().setLink({ href: url }).run()
            } else {
              // 没有选中文本，插入 URL 作为链接文本
              editor.chain().focus().insertContent([
                {
                  type: 'text',
                  text: url,
                  marks: [{ type: 'link', attrs: { href: url } }]
                }
              ]).run()
            }
          }
          setLinkPrompt({ isOpen: false })
        }}
        onCancel={() => setLinkPrompt({ isOpen: false })}
      />

      {/* 图片选择对话框 */}
      <InputPrompt
        isOpen={imageChoicePrompt.isOpen}
        title="选择图片来源"
        message='输入 "url" 使用网络图片，输入 "file" 选择本地文件'
        placeholder="url 或 file"
        onConfirm={async (value) => {
          const choice = value.trim().toLowerCase()
          setImageChoicePrompt({ isOpen: false })

          if (choice === 'url') {
            setImagePrompt({ isOpen: true })
          } else if (choice === 'file') {
            if (window.electronAPI?.selectImageFile) {
              const base64Image = await window.electronAPI.selectImageFile()
              if (base64Image) {
                editor.chain().focus().setImage({ src: base64Image }).run()
              }
            }
          }
        }}
        onCancel={() => setImageChoicePrompt({ isOpen: false })}
      />

      {/* 图片 URL 输入对话框 */}
      <InputPrompt
        isOpen={imagePrompt.isOpen}
        title="插入图片"
        message="请输入图片地址："
        placeholder="https://example.com/image.jpg"
        onConfirm={(value) => {
          if (value.trim()) {
            editor.chain().focus().setImage({ src: value.trim() }).run()
          }
          setImagePrompt({ isOpen: false })
        }}
        onCancel={() => setImagePrompt({ isOpen: false })}
      />
    </div>
  )
}
