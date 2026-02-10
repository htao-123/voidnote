export interface Document {
  id: string
  title: string
  content: string
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
