import { useEditor, EditorContent } from '@tiptap/react'
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
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { useEffect } from 'react'
import { useDocumentStore } from '../stores/documentStore'

interface EditorProps {
  documentId: string
}

const lowlight = createLowlight(common)

export default function Editor({ documentId }: EditorProps) {
  const { currentDocument, updateDocument } = useDocumentStore()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
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
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-100 rounded-lg p-4 my-4',
        },
      }),
    ],
    content: currentDocument?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-full px-8 py-6',
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

  // 当当前文档改变时更新编辑器内容
  useEffect(() => {
    if (editor && currentDocument && editor.getHTML() !== currentDocument.content) {
      editor.commands.setContent(currentDocument.content)
    }
  }, [currentDocument, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="h-full">
      <EditorContent editor={editor} />
    </div>
  )
}
