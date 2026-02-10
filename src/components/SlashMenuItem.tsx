import { forwardRef, useEffect, useState } from 'react'
import { Check, Type, Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare, Quote, Code, Minus, Table } from 'lucide-react'
import { commands } from './SlashMenu'

interface SlashMenuItemProps {
  query: string
  editor: any
  range?: any
}

const iconMap = {
  text: Type,
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  ul: List,
  ol: ListOrdered,
  check: CheckSquare,
  quote: Quote,
  code: Code,
  hr: Minus,
  table: Table,
}

export const SlashMenuItem = forwardRef<any, SlashMenuItemProps>(
  ({ query, editor, range }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    const filteredItems = commands.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    )

    useEffect(() => {
      setSelectedIndex(0)
    }, [query])

    const selectItem = (index: number) => {
      const item = filteredItems[index]
      if (item) {
        // 调用命令的 command 函数，传递 editor 和 range
        item.command({ editor, range })
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
      } else if (event.key === 'Enter') {
        event.preventDefault()
        selectItem(selectedIndex)
      }
    }

    useEffect(() => {
      if (typeof ref === 'function') {
        ref({ onKeyDown: handleKeyDown })
      } else if (ref) {
        ref.current = { onKeyDown: handleKeyDown }
      }
    }, [selectedIndex, filteredItems.length])

    if (filteredItems.length === 0) {
      return null
    }

    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[280px] max-h-[400px] overflow-y-auto">
        <div className="text-xs text-gray-500 px-2 py-1 mb-1">
          基础模块
        </div>
        {filteredItems.map((item, index) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap]
          const isActive = index === selectedIndex

          return (
            <button
              key={item.title}
              onClick={() => selectItem(index)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                isActive ? 'bg-blue-50' : 'hover:bg-gray-100'
              }`}
            >
              <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                {Icon && <Icon className="w-5 h-5 text-gray-600" />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">{item.title}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
              {isActive && (
                <Check className="w-4 h-4 text-blue-600" />
              )}
            </button>
          )
        })}
      </div>
    )
  }
)

SlashMenuItem.displayName = 'SlashMenuItem'
