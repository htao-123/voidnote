import { useState, useMemo } from 'react'
import { List, ChevronRight, ChevronDown, X } from 'lucide-react'

interface TocItemData {
  id: string
  textContent: string
  level: number
  itemIndex: number
  isActive: boolean
  isScrolledOver: boolean
}

interface TableOfContentsProps {
  items: TocItemData[]
  onItemClick?: (item: TocItemData) => void
  scrollProgress?: number
}

// 获取标题级别标签
function getHeadingLevelLabel(level: number): string {
  return `H${level}`
}

// 获取标题级别颜色
function getHeadingLevelColor(level: number): string {
  const colors = {
    1: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
    2: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    3: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    4: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
    5: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20',
    6: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20',
  }
  return colors[level as keyof typeof colors] || colors[6]
}

export default function TableOfContents({
  items,
  onItemClick,
  scrollProgress = 0
}: TableOfContentsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set())

  // 计算每个项目应该显示的子项（考虑折叠状态）
  const visibleItems = useMemo(() => {
    const result: TocItemData[] = []
    // 折叠栈：存储被折叠的项及其级别
    const collapsedStack: Array<{ id: string; level: number }> = []

    for (const item of items) {
      // 清理栈中级别大于等于当前级别的项（遇到同级或更高级别时，之前的折叠失效）
      while (collapsedStack.length > 0 && collapsedStack[collapsedStack.length - 1].level >= item.level) {
        collapsedStack.pop()
      }

      // 检查是否应该隐藏（栈中有折叠项，且当前项级别更高）
      const shouldHide = collapsedStack.length > 0 && collapsedStack.some(c => item.level > c.level)
      if (shouldHide) continue

      result.push(item)

      // 如果当前项被折叠，添加到栈
      if (collapsedItems.has(item.id)) {
        collapsedStack.push({ id: item.id, level: item.level })
      }
    }

    return result
  }, [items, collapsedItems])

  // 切换项目的折叠状态
  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setCollapsedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // 检查项目是否有子项
  const hasChildren = (item: TocItemData): boolean => {
    const itemIndex = items.findIndex(i => i.id === item.id)
    if (itemIndex === -1) return false
    const nextItem = items[itemIndex + 1]
    return nextItem && nextItem.level > item.level
  }

  // 处理点击事件
  const handleItemClick = (item: TocItemData) => {
    onItemClick?.(item)
  }

  // 只显示有内容的目录
  if (!items || items.length === 0) {
    return null
  }

  // 完全隐藏时只显示一个小按钮
  if (isHidden) {
    return (
      <div className="w-10 h-full flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsHidden(false)}
          className="flex-1 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="显示目录"
        >
          <List className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-56 h-full flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
          <List className="w-3.5 h-3.5" />
          <span>目录</span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">({items.length})</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title={isCollapsed ? '展开目录' : '折叠目录'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
            )}
          </button>
          <button
            onClick={() => setIsHidden(true)}
            className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="隐藏目录"
          >
            <X className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          </button>
        </div>
      </div>

      {/* 阅读进度条 */}
      {!isCollapsed && (
        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500 mb-1">
            <span>阅读进度</span>
            <span>{scrollProgress}%</span>
          </div>
          <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 目录列表 - 可滚动 */}
      {!isCollapsed && (
        <ul className="flex-1 overflow-y-auto py-1">
          {visibleItems.length > 0 ? (
            visibleItems.map((item) => {
              const itemHasChildren = hasChildren(item)
              const isItemCollapsed = collapsedItems.has(item.id)

              return (
                <li key={item.id}>
                  <div className="flex items-center group">
                    {/* 左侧折叠/展开按钮 */}
                    <button
                      onClick={(e) => toggleCollapse(item.id, e)}
                      className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                      style={{ marginLeft: `${(item.level - 1) * 0.75}rem` }}
                      title={isItemCollapsed ? '展开' : '收起'}
                    >
                      {itemHasChildren ? (
                        isItemCollapsed ? (
                          <ChevronRight className="w-3 h-3 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-gray-400" />
                        )
                      ) : (
                        <span className="w-3 h-3" />
                      )}
                    </button>

                    <button
                      onClick={() => handleItemClick(item)}
                      className="flex-1 min-w-0 text-left py-1.5 px-2 text-xs transition-all duration-200 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {/* 标题级别标签 */}
                        <span
                          className={`text-[9px] px-1 py-0.5 rounded font-medium flex-shrink-0 ${getHeadingLevelColor(item.level)}`}
                        >
                          {getHeadingLevelLabel(item.level)}
                        </span>
                        <span className="truncate block flex-1">{item.textContent}</span>
                      </div>
                    </button>
                  </div>
                </li>
              )
            })
          ) : (
            <li className="px-3 py-4 text-center text-xs text-gray-400 dark:text-gray-500">
              暂无标题
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
