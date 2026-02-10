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
import { useMemo } from 'react'
import { useDocumentStore } from '../stores/documentStore'
import { SlashCommandExtension } from '../extensions/slash-command-extension'
import CustomCodeBlock from '../extensions/CustomCodeBlock'
import Toolbar from './Toolbar'

const lowlight = createLowlight(common)

export default function EditorContent() {
  const { currentDocument, updateDocument } = useDocumentStore()

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
    content: currentDocument?.content || '',
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-full px-8 py-6',
      },
    },
    onUpdate: ({ editor }) => {
      if (currentDocument) {
        updateDocument(currentDocument.id, {
          content: editor.getHTML(),
        })
      }
    },
  })

  const providerValue = useMemo(() => ({ editor }), [editor])

  if (!editor) {
    return null
  }

  return (
    <EditorContext.Provider value={providerValue}>
      <div className="flex-1 flex flex-col">
        <Toolbar />
        <div className="flex-1 overflow-auto">
          <TiptapEditorContent editor={editor} />
        </div>
      </div>
    </EditorContext.Provider>
  )
}
