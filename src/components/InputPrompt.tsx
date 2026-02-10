import { useEffect, useRef } from 'react'

interface InputPromptProps {
  isOpen: boolean
  title: string
  message?: string
  defaultValue?: string
  placeholder?: string
  onConfirm: (value: string) => void
  onCancel: () => void
}

export default function InputPrompt({
  isOpen,
  title,
  message,
  defaultValue = '',
  placeholder = '',
  onConfirm,
  onCancel,
}: InputPromptProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
          {message && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{message}</p>}
          <input
            ref={inputRef}
            type="text"
            defaultValue={defaultValue}
            placeholder={placeholder}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onConfirm((e.target as HTMLInputElement).value)
              } else if (e.key === 'Escape') {
                onCancel()
              }
            }}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => {
                const value = inputRef.current?.value || ''
                onConfirm(value)
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
