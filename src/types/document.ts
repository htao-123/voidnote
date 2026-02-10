export interface Document {
  id: string
  title: string
  content: string
  json?: string // JSON 格式的内容（用于精确的编辑器状态恢复）
  icon?: string
  parentId: string | null
  createdAt: number
  updatedAt: number
  children?: Document[]
}

export interface DocumentTreeItem extends Document {
  level: number
  expanded: boolean
}
