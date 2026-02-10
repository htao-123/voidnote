import Suggestion from '@tiptap/suggestion'
import { Extension } from '@tiptap/core'
import { renderItems, commands } from '../components/SlashMenu'

export const SlashCommandExtension = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        allowedPrefixes: [' ', ''],
        startOfLine: true,
        items: ({ query }: { query: string }) => {
          return commands.filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase())
          )
        },
        render: renderItems(),
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        ...this.options.suggestion,
        editor: this.editor,
      }),
    ]
  },
})

