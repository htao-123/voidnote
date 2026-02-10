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
import { common, createLowlight } from 'lowlight'
import { useMemo, useEffect } from 'react'
import { useDocumentStore } from '../stores/documentStore'
import { SlashCommandExtension } from '../extensions/slash-command-extension'
import CustomCodeBlock from '../extensions/CustomCodeBlock'
import Toolbar from './Toolbar'

const lowlight = createLowlight(common)

export default function EditorContent() {
  const { currentDocument, updateDocument, triggerAutoSave } = useDocumentStore()

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
        {/* 编辑器内容区域 - 可滚动 */}
        <div className="flex-1 h-full overflow-auto px-8 py-6">
          <div className="min-h-0">
            <TiptapEditorContent editor={editor} />
          </div>
        </div>
      </div>
    </EditorContext.Provider>
  )
}
