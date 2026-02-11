import { useEditor, EditorContent as TiptapEditorContent, EditorContext } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import TextAlign from '@tiptap/extension-text-align'
import FileHandler from '@tiptap/extension-file-handler'
import TableOfContents from '@tiptap/extension-table-of-contents'
import { common, createLowlight } from 'lowlight'
import { useMemo, useEffect, useState } from 'react'
import { useDocumentStore } from '../stores/documentStore'
import { SlashCommandExtension } from '../extensions/slash-command-extension'
import CustomCodeBlock from '../extensions/CustomCodeBlock'
import Toolbar from './Toolbar'
import TableOfContentsSidebar from './TableOfContents'

const lowlight = createLowlight(common)

export default function EditorContent() {
  const { currentDocument, updateDocument, triggerAutoSave } = useDocumentStore()
  const [tocData, setTocData] = useState<any[]>([])
  const [showToc, setShowToc] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null)

  // 生成唯一 ID 的辅助函数（使用索引确保唯一性）
  const generateUniqueId = (text: string, index: number): string => {
    const baseId = text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u4e00-\u9fa5-]+/g, '')
      .substring(0, 40)

    return `${baseId}-${index}`
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        link: false,
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Placeholder.configure({
        placeholder: '输入 / 唤起快捷命令，或直接开始输入...',
        emptyEditorClass: 'is-editor-empty',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CustomCodeBlock.configure({
        lowlight,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      FileHandler.configure({
        onPaste: (editor, files) => {
          // 处理粘贴的图片文件
          files.forEach((file) => {
            if (file.type.startsWith('image/')) {
              const reader = new FileReader()
              reader.onload = () => {
                const base64 = reader.result as string
                editor.chain().focus().setImage({ src: base64 }).run()
              }
              reader.readAsDataURL(file)
            }
          })
          return true // 阻止默认行为
        },
        onDrop: (editor, files) => {
          // 处理拖放的图片文件
          files.forEach((file) => {
            if (file.type.startsWith('image/')) {
              const reader = new FileReader()
              reader.onload = () => {
                const base64 = reader.result as string
                editor.chain().focus().setImage({ src: base64 }).run()
              }
              reader.readAsDataURL(file)
            }
          })
          return true // 阻止默认行为
        },
      }),
      TableOfContents.configure({
        getId: (text) => text, // 简单返回文本，ID 处理在 onUpdate 中
        onUpdate: (data) => {
          // 为每个项目生成唯一的 ID
          const dataWithUniqueIds = data.map((item, index) => ({
            ...item,
            id: generateUniqueId(item.textContent, index),
          }))
          setTocData(dataWithUniqueIds)
          // 当有 2 个以上标题时自动显示目录
          setShowToc(data.length >= 2)
        },
      }),
      SlashCommandExtension,
    ],
    // 不在初始化时设置 content，避免双重设置导致转义问题
    content: '',
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      if (currentDocument) {
        const json = editor.getJSON()
        // 只使用 JSON 格式保存内容，避免所有转义问题
        updateDocument(currentDocument.id, {
          content: '',
          json: JSON.stringify(json),
        })
        // 触发自动保存
        triggerAutoSave()
      }
    },
  })

  // 当当前文档改变时更新编辑器内容
  useEffect(() => {
    if (editor && currentDocument) {
      // 使用 JSON 格式加载内容
      if (currentDocument.json) {
        try {
          const jsonContent = JSON.parse(currentDocument.json)
          editor.commands.setContent(jsonContent, {
            emitUpdate: false,
          })
        } catch (e) {
          console.error('[EditorContent] JSON parse error:', e)
          // JSON 解析失败，初始化为空内容
          editor.commands.setContent('', { emitUpdate: false })
        }
      } else {
        // 新建文档，初始化为空内容
        editor.commands.setContent('', { emitUpdate: false })
      }
    }
  }, [currentDocument?.id, editor])

  // 监听滚动位置，更新当前激活的标题和阅读进度
  useEffect(() => {
    if (!scrollContainer || !editor) return

    const handleScroll = () => {
      // 计算阅读进度
      const scrollTop = scrollContainer.scrollTop
      const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight
      const progress = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0
      setScrollProgress(progress)
    }

    // 初始调用
    handleScroll()

    // 监听滚动事件
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [scrollContainer, editor, tocData])

  // 处理目录项点击 - 跳转到对应标题
  const handleTocItemClick = (item: any) => {
    if (editor && item.pos !== undefined && scrollContainer) {
      // 获取标题位置的坐标
      const coords = editor.view.coordsAtPos(item.pos)
      if (coords) {
        // 计算滚动位置：需要加上当前滚动位置，并减去滚动容器的偏移
        const containerRect = scrollContainer.getBoundingClientRect()
        const scrollTop = scrollContainer.scrollTop
        const targetScrollTop = scrollTop + coords.top - containerRect.top - 20

        scrollContainer.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth',
        })
      }
    }
  }

  const providerValue = useMemo(() => ({ editor }), [editor])

  if (!editor) {
    return null
  }

  return (
    <EditorContext.Provider value={providerValue}>
      <div className="flex-1 flex flex-col min-h-0">
        {/* 工具栏 - 固定在顶部 */}
        <div className="flex-shrink-0">
          <Toolbar />
        </div>
        {/* 编辑器内容区域 + 目录侧边栏 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 编辑器内容 - 可滚动 */}
          <div
            ref={setScrollContainer}
            className="flex-1 overflow-auto px-8 py-6"
          >
            <div className="min-h-0 max-w-3xl">
              <TiptapEditorContent editor={editor} />
            </div>
          </div>
          {/* 目录侧边栏 - 固定宽度 */}
          {showToc && tocData.length > 0 && (
            <TableOfContentsSidebar
              items={tocData}
              onItemClick={handleTocItemClick}
              scrollProgress={scrollProgress}
            />
          )}
        </div>
      </div>
    </EditorContext.Provider>
  )
}
