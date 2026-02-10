import { Document } from '../types/document'

/**
 * 文件名清理：移除不允许的字符
 */
function sanitizeFilename(name: string): string {
  if (!name || name.trim().length === 0) {
    return 'untitled'
  }
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .trim()
    .substring(0, 200)
}

/**
 * HTML 导出服务
 */
export class HTMLExporter {
  /**
   * 将文档内容导出为完整的 HTML 文档
   */
  static exportDocument(doc: Document): string {
    const title = doc.title || '未命名文档'
    const content = doc.content || ''
    const now = new Date().toLocaleString('zh-CN')

    // 完整的 HTML 文档模板
    const htmlTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(title)}</title>
  <style>
    /* 基础样式 */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
        'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.75;
      color: #374151;
      background: #ffffff;
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    /* 标题样式 */
    h1 {
      font-size: 2.25rem;
      font-weight: 700;
      line-height: 2.5rem;
      margin-top: 1.5rem;
      margin-bottom: 1rem;
      color: #1f2937;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 0.5rem;
    }

    h2 {
      font-size: 1.875rem;
      font-weight: 600;
      line-height: 2.25rem;
      margin-top: 1.25rem;
      margin-bottom: 0.75rem;
      color: #1f2937;
    }

    h3 {
      font-size: 1.5rem;
      font-weight: 600;
      line-height: 2rem;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
      color: #1f2937;
    }

    h4, h5, h6 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-top: 0.75rem;
      margin-bottom: 0.25rem;
      color: #1f2937;
    }

    /* 段落样式 */
    p {
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
      line-height: 1.75;
    }

    /* 列表样式 */
    ul, ol {
      padding-left: 1.5rem;
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
    }

    ul {
      list-style-type: disc;
    }

    ol {
      list-style-type: decimal;
    }

    li {
      margin-top: 0.25rem;
      margin-bottom: 0.25rem;
    }

    /* 任务列表样式 */
    ul.task-list {
      list-style: none;
      padding-left: 0;
    }

    ul.task-list li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    ul.task-list li input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
      margin: 0;
    }

    ul.task-list li.checked span {
      text-decoration: line-through;
      color: #9ca3af;
    }

    /* 引用样式 */
    blockquote {
      border-left: 4px solid #3b82f6;
      padding-left: 1rem;
      margin: 1rem 0;
      color: #6b7280;
      font-style: italic;
      background: #f9fafb;
      padding: 1rem;
      border-radius: 0.25rem;
    }

    /* 代码块样式 */
    pre {
      background-color: #1e1e1e;
      border-radius: 0.5rem;
      padding: 1rem;
      margin: 1.5rem 0;
      overflow-x: auto;
    }

    pre code {
      color: #d4d4d4;
      font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace;
      font-size: 0.875rem;
      background: none;
      padding: 0;
      line-height: 1.6;
    }

    /* 行内代码样式 */
    code:not(pre code) {
      background-color: #fef3c7;
      color: #92400e;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
      font-size: 0.875em;
    }

    /* 链接样式 */
    a {
      color: #3b82f6;
      text-decoration: underline;
    }

    a:hover {
      color: #2563eb;
    }

    /* 水平分割线 */
    hr {
      border: none;
      border-top: 2px solid #e5e7eb;
      margin: 2rem 0;
    }

    /* 表格样式 */
    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
      margin: 1rem 0;
      overflow: hidden;
    }

    table td,
    table th {
      min-width: 1em;
      border: 1px solid #d1d5db;
      padding: 0.375rem 0.75rem;
      vertical-align: top;
    }

    table th {
      font-weight: 600;
      text-align: left;
      background-color: #f9fafb;
    }

    /* 图片样式 */
    img {
      max-width: 100%;
      height: auto;
      border-radius: 0.5rem;
      margin: 1rem 0;
    }

    /* 文本对齐 */
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }

    /* 粗体和斜体 */
    strong { font-weight: 600; }
    em { font-style: italic; }
    u { text-decoration: underline; }

    /* 页脚信息 */
    .footer {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
      font-size: 0.875rem;
      color: #9ca3af;
    }

    @media print {
      body {
        padding: 0;
        max-width: 100%;
      }

      .footer {
        page-break-inside: avoid;
      }

      h1, h2, h3 {
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>
  <article>
    <h1>${this.escapeHtml(title)}</h1>
    ${content}
  </article>
  <footer class="footer">
    <p>导出时间：${now}</p>
    <p>由 <strong>VoidNote</strong> 导出</p>
  </footer>
</body>
</html>`

    return htmlTemplate
  }

  /**
   * HTML 转义
   */
  private static escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    return text.replace(/[&<>"']/g, m => map[m])
  }

  /**
   * 获取导出文件名
   */
  static getFileName(doc: Document): string {
    return sanitizeFilename(doc.title || '未命名文档') + '.html'
  }
}

/**
 * PDF 导出服务
 */
export class PDFExporter {
  /**
   * 使用 Electron 的 printToPDF API 导出 PDF
   */
  static async exportToPDF(htmlContent: string, title: string): Promise<Blob> {
    // 使用浏览器原生打印功能或 Electron API
    // 这里返回一个可以用于下载的 Blob
    if (window.electronAPI?.exportToPDF) {
      const result = await window.electronAPI.exportToPDF(htmlContent, title)
      if (result.success) {
        // 将 base64 转换为 Blob
        const binaryString = atob(result.data!)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        return new Blob([bytes], { type: 'application/pdf' })
      }
      throw new Error(result.error || 'PDF 导出失败')
    }

    // 如果 Electron API 不可用，使用浏览器打印
    throw new Error('PDF 导出功能仅在 Electron 环境下可用')
  }

  /**
   * 获取导出文件名
   */
  static getFileName(doc: Document): string {
    return sanitizeFilename(doc.title || '未命名文档') + '.pdf'
  }
}

/**
 * 导出管理器
 */
export class ExportManager {
  /**
   * 导出当前文档为 HTML
   */
  static async exportAsHTML(doc: Document): Promise<void> {
    if (!window.electronAPI) {
      throw new Error('导出功能仅在 Electron 环境下可用')
    }

    const htmlContent = HTMLExporter.exportDocument(doc)
    const fileName = HTMLExporter.getFileName(doc)

    // 使用 Electron 的文件保存对话框
    const result = await window.electronAPI.saveHTMLFile(fileName, htmlContent)

    if (!result.success) {
      throw new Error(result.error || 'HTML 导出失败')
    }

    if (result.canceled) {
      return // 用户取消了保存
    }

    console.log('[ExportManager] HTML exported successfully:', result.filePath)
  }

  /**
   * 导出当前文档为 PDF
   */
  static async exportAsPDF(doc: Document): Promise<void> {
    if (!window.electronAPI) {
      throw new Error('导出功能仅在 Electron 环境下可用')
    }

    // 首先生成 HTML 内容
    const htmlContent = HTMLExporter.exportDocument(doc)
    const fileName = PDFExporter.getFileName(doc)

    // 使用 Electron 的 PDF 导出功能
    const result = await window.electronAPI.exportPDFFile(fileName, htmlContent)

    if (!result.success) {
      throw new Error(result.error || 'PDF 导出失败')
    }

    if (result.canceled) {
      return // 用户取消了保存
    }

    console.log('[ExportManager] PDF exported successfully:', result.filePath)
  }
}
