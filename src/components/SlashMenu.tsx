import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import { Instance, Props } from 'tippy.js'
import { SlashMenuItem } from './SlashMenuItem'

interface Command {
  title: string
  description: string
  icon: string
  command: ({ editor, range }: { editor: any; range: any }) => void
}

const commands: Command[] = [
  {
    title: '文本',
    description: '纯文本样式',
    icon: 'text',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setParagraph()
        .run()
    },
  },
  {
    title: '一级标题',
    description: '大标题',
    icon: 'h1',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 1 })
        .run()
    },
  },
  {
    title: '二级标题',
    description: '中标题',
    icon: 'h2',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 2 })
        .run()
    },
  },
  {
    title: '三级标题',
    description: '小标题',
    icon: 'h3',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 3 })
        .run()
    },
  },
  {
    title: '四级标题',
    description: '更小标题',
    icon: 'h4',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 4 })
        .run()
    },
  },
  {
    title: '五级标题',
    description: '极小标题',
    icon: 'h5',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 5 })
        .run()
    },
  },
  {
    title: '六级标题',
    description: '最小标题',
    icon: 'h6',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 6 })
        .run()
    },
  },
  {
    title: '无序列表',
    description: '项目符号列表',
    icon: 'ul',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleBulletList()
        .run()
    },
  },
  {
    title: '有序列表',
    description: '编号列表',
    icon: 'ol',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleOrderedList()
        .run()
    },
  },
  {
    title: '任务列表',
    description: '待办事项列表',
    icon: 'check',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleTaskList()
        .run()
    },
  },
  {
    title: '引用',
    description: '引用文本块',
    icon: 'quote',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleBlockquote()
        .run()
    },
  },
  {
    title: '代码块',
    description: '代码片段',
    icon: 'code',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleCodeBlock()
        .run()
    },
  },
  {
    title: '分割线',
    description: '水平分割线',
    icon: 'hr',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHorizontalRule()
        .run()
    },
  },
  {
    title: '表格',
    description: '插入表格',
    icon: 'table',
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run()
    },
  },
]

export const renderItems = () => {
  let component: ReactRenderer<any, any> | null = null
  let popup: Instance<Props> | null = null

  // 返回一个函数，符合 TipTap suggestion 的类型要求
  return () => ({
    onStart: (props: any) => {
      // TipTap suggestion 会传递: query, editor, range, clientRect, command 等
      component = new ReactRenderer(SlashMenuItem, {
        props, // 包含 query, editor, range 等
        editor: props.editor,
      })

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
      })[0] // tippy 返回数组，取第一个元素
    },
    onUpdate: (props: any) => {
      component?.updateProps(props)

      if (props.clientRect) {
        popup?.setProps({
          getReferenceClientRect: props.clientRect,
        })
      }
    },
    onKeyDown: (props: any) => {
      if (props.event.key === 'Escape') {
        popup?.hide()
        return true
      }

      if (!popup?.state.isShown) {
        return false
      }

      return component?.ref?.onKeyDown(props.event) || false
    },
    onExit: () => {
      popup?.destroy()
      component?.destroy()
    },
  })
}

export { commands }
