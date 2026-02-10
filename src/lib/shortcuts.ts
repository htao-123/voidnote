// 导出 Markdown 功能
import { type Editor } from '@tiptap/react'

export function exportToMarkdown(editor: Editor): string {
  const { html } = editor
  const doc = editor.state.doc

  let markdown = ''

  doc.descendants((node, pos) => {
    const nodeType = node.type.name

    switch (nodeType) {
      case 'heading':
        const level = node.attrs.level
        markdown += '#'.repeat(level) + ' ' + node.textContent + '\n\n'
        return false

      case 'paragraph':
        if (node.textContent.trim()) {
          markdown += node.textContent + '\n\n'
        }
        return false

      case 'bulletList':
        markdown += '\n'
        return true

      case 'orderedList':
        markdown += '\n'
        return true

      case 'listItem':
        const isOrdered = node.parent?.type.name === 'orderedList'
        const index = node.parent ? node.parent.childIndexOf(node) + 1 : 1
        const prefix = isOrdered ? `${index}. ` : '- '
        markdown += prefix + node.textContent + '\n'
        return false

      case 'blockquote':
        markdown += '> ' + node.textContent + '\n\n'
        return false

      case 'codeBlock':
        markdown += '```\n' + node.textContent + '\n```\n\n'
        return false

      case 'taskList':
        markdown += '\n'
        return true

      case 'taskItem':
        const checked = node.attrs.checked ? '[x]' : '[ ]'
        markdown += `- ${checked} ${node.textContent}\n`
        return false

      case 'table':
        markdown += exportTable(node)
        return false

      default:
        return true
    }
  })

  return markdown.trim()
}

function exportTable(node: any): string {
  let markdown = '\n'

  node.forEach((row: any, rowIndex: number) => {
    markdown += '| '
    row.forEach((cell: any) => {
      markdown += cell.textContent + ' | '
    })
    markdown += '\n'

    if (rowIndex === 0) {
      markdown += '| '
      row.forEach(() => {
        markdown += '--- | '
      })
      markdown += '\n'
    }
  })

  markdown += '\n'
  return markdown
}

// 快捷键列表
export const keyboardShortcuts = [
  { key: 'Mod+B', description: '粗体' },
  { key: 'Mod+I', description: '斜体' },
  { key: 'Mod+K', description: '插入链接' },
  { key: 'Mod+Shift+K', description: '插入代码块' },
  { key: 'Mod+/', description: '唤起快捷菜单' },
  { key: 'Mod+Z', description: '撤销' },
  { key: 'Mod+Shift+Z', description: '重做' },
  { key: 'Mod+Shift+7', description: '一级标题 (Ctrl+7)' },
  { key: 'Mod+Shift+8', description: '二级标题 (Ctrl+8)' },
  { key: 'Mod+Shift+9', description: '三级标题 (Ctrl+9)' },
]
