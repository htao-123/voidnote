// 自动保存配置
const AUTOSAVE_CONFIG_KEY = 'voidnote-autosave'
const DEFAULT_AUTOSAVE_DELAY = 2000 // 2秒

export interface AutoSaveConfig {
  enabled: boolean
  delay: number // 毫秒
}

// 获取自动保存配置
export function getAutoSaveConfig(): AutoSaveConfig {
  const saved = localStorage.getItem(AUTOSAVE_CONFIG_KEY)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return { enabled: false, delay: DEFAULT_AUTOSAVE_DELAY }
    }
  }
  return { enabled: false, delay: DEFAULT_AUTOSAVE_DELAY } // 默认关闭
}

// 保存自动保存配置
export function saveAutoSaveConfig(config: AutoSaveConfig): void {
  localStorage.setItem(AUTOSAVE_CONFIG_KEY, JSON.stringify(config))
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}
