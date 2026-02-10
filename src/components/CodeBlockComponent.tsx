import { NodeViewContent, NodeViewWrapper, ReactNodeViewProps } from '@tiptap/react'
import { useCallback, useState, useMemo, useEffect, useRef } from 'react'

// 语言代码映射：将常见缩写映射到完整语言名
const LANGUAGE_ALIASES: Record<string, string> = {
  'js': 'javascript',
  'ts': 'typescript',
  'py': 'python',
  'java': 'java',
  'c': 'c',
  'cpp': 'cpp',
  'cs': 'csharp',
  'go': 'go',
  'rs': 'rust',
  'php': 'php',
  'rb': 'ruby',
  'swift': 'swift',
  'kt': 'kotlin',
  'html': 'html',
  'css': 'css',
  'scss': 'scss',
  'json': 'json',
  'xml': 'xml',
  'sql': 'sql',
  'sh': 'bash',
  'bash': 'bash',
  'shell': 'shell',
  'md': 'markdown',
  'yaml': 'yaml',
  'yml': 'yaml',
  'dockerfile': 'dockerfile',
}

// 支持的编程语言列表
const LANGUAGES = [
  { value: '', label: '纯文本' },
  { value: 'auto', label: '自动检测' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'shell', label: 'Shell' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'yaml', label: 'YAML' },
  { value: 'dockerfile', label: 'Dockerfile' },
]

export default function CodeBlockComponent(props: ReactNodeViewProps) {
  const { node, updateAttributes } = props
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const languageMenuRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false)
      }
    }

    if (showLanguageMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showLanguageMenu])

  // 从 node.attrs 获取语言，如果没有则使用空字符串
  const rawLanguage = (node.attrs?.language as string) || ''

  // 使用别名映射将语言代码转换为标准值
  const currentLanguage = useMemo(() => {
    if (!rawLanguage) return ''
    // 检查是否是别名，如果是则映射到标准值
    const mapped = LANGUAGE_ALIASES[rawLanguage.toLowerCase()]
    return mapped || rawLanguage
  }, [rawLanguage])

  // 当检测到语言别名时，更新节点属性为标准值（确保语法高亮正常工作）
  useEffect(() => {
    if (rawLanguage && rawLanguage !== currentLanguage) {
      // 使用 setTimeout 避免在 React 渲染过程中调用 updateAttributes
      setTimeout(() => {
        updateAttributes({ language: currentLanguage })
      }, 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 只在组件挂载时执行一次

  // 获取当前语言显示名称
  const getLanguageLabel = useCallback(() => {
    const lang = LANGUAGES.find((l) => l.value === currentLanguage)
    return lang ? lang.label : '纯文本'
  }, [currentLanguage])

  // 选择语言
  const selectLanguage = (language: string) => {
    updateAttributes({ language })
    setShowLanguageMenu(false)
  }

  // 复制代码 - 从 node.textContent 获取代码内容
  const copyCode = async () => {
    const code = node.textContent || ''
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 计算代码行数
  const codeLines = useMemo(() => {
    const code = node.textContent || ''
    // 如果代码为空，至少显示一行
    if (!code) return 1
    // 计算行数（以换行符分割）
    return code.split('\n').length
  }, [node.textContent])

  // 生成行号数组
  const lineNumbers = useMemo(() => {
    return Array.from({ length: codeLines }, (_, i) => i + 1)
  }, [codeLines])

  return (
    <NodeViewWrapper className="code-block-node-view">
      <div className="relative my-4 rounded-lg border border-gray-300">
        {/* 工具栏 */}
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-t-lg">
          {/* 语言标签 */}
          <div className="relative" ref={languageMenuRef}>
            <button
              type="button"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            >
              <span>{getLanguageLabel()}</span>
              <svg
                className={`w-3 h-3 transition-transform ${showLanguageMenu ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* 语言下拉菜单 */}
            {showLanguageMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 max-h-64 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-xl z-[9999]">
                <div className="py-1">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.value}
                      type="button"
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        currentLanguage === lang.value
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => selectLanguage(lang.value)}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 复制按钮 */}
          <button
            type="button"
            className={`flex items-center gap-1.5 px-2 py-1 text-sm rounded transition-colors ${
              copied
                ? 'text-green-600 bg-green-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
            }`}
            onClick={copyCode}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>已复制</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>复制</span>
              </>
            )}
          </button>
        </div>

        {/* 代码内容区域 */}
        <div className="flex bg-gray-50 rounded-b-lg overflow-hidden">
          {/* 行号 */}
          <div className="flex-shrink-0 w-8 text-center select-none bg-gray-50">
            <pre className="!m-0 !p-0 !rounded-none py-[0.75rem]">
              <code className="line-numbers">
                {lineNumbers.map((lineNum, index) => (
                  <span key={lineNum} className="block text-gray-400 hover:text-gray-600 transition-colors">
                    {lineNum}
                    {index < lineNumbers.length - 1 && '\n'}
                  </span>
                ))}
              </code>
            </pre>
          </div>

          {/* 代码内容 */}
          <div className="flex-1 overflow-x-auto">
            <pre className="!m-0 !p-0 !rounded-none">
              <NodeViewContent
                as={"code" as any}
                className="block px-4 py-[0.75rem] text-sm"
              />
            </pre>
          </div>
        </div>

        {/* 底部区域 */}
        <div className="px-3 py-4 bg-gray-50 rounded-b-lg"></div>
      </div>
    </NodeViewWrapper>
  )
}
