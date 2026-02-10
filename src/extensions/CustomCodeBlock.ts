import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { Selection } from '@tiptap/pm/state'
import CodeBlockComponent from '../components/CodeBlockComponent'

const CustomCodeBlock = CodeBlockLowlight.extend({
  name: 'codeBlock',

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent, {
      contentDOMElementTag: 'code',
    })
  },

  addKeyboardShortcuts() {
    return {
      // 不使用默认的三次回车退出
      // 可以通过向下箭头退出
      'ArrowDown': ({ editor }) => {
        const { state } = editor
        const { selection } = state
        const { $from, empty } = selection

        if (!empty || $from.parent.type !== this.type) {
          return false
        }

        const isAtEnd = $from.parentOffset === $from.parent.nodeSize - 2

        if (isAtEnd) {
          const after = $from.after()
          if (after === undefined) {
            return editor.commands.exitCode()
          }

          const nodeAfter = state.doc.nodeAt(after)
          if (nodeAfter) {
            return editor.commands.command(({ tr }) => {
              tr.setSelection(Selection.near(state.doc.resolve(after)))
              return true
            })
          }

          return editor.commands.exitCode()
        }

        return false
      },

      // 退格键：代码块为空时阻止删除
      'Backspace': ({ editor }) => {
        const { state } = editor
        const { selection } = state
        const { $from, empty } = selection

        if (!empty || $from.parent.type !== this.type) {
          return false
        }

        // 检查代码块是否为空（只有一行且没有内容）
        const isCodeBlockEmpty = $from.parent.childCount === 0 ||
          ($from.parent.childCount === 1 && $from.parent.firstChild?.nodeSize === 2)

        if (isCodeBlockEmpty && $from.parentOffset === 0) {
          // 代码块为空且光标在开头，阻止删除
          return true
        }

        return false
      },
    }
  },
})

export default CustomCodeBlock
