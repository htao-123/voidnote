import { create } from 'zustand'

interface ThemeStore {
  isDark: boolean
  toggleTheme: () => void
  setTheme: (isDark: boolean) => void
  initializeTheme: () => void
}

// 主题键名
const THEME_KEY = 'voidnote-theme'

export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: false,

  toggleTheme: () => {
    set((state) => {
      const newTheme = !state.isDark
      // 保存到 localStorage
      localStorage.setItem(THEME_KEY, newTheme ? 'dark' : 'light')
      // 更新 DOM 类名
      if (newTheme) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return { isDark: newTheme }
    })
  },

  setTheme: (isDark: boolean) => {
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    set({ isDark })
  },

  initializeTheme: () => {
    // 从 localStorage 读取主题偏好
    const savedTheme = localStorage.getItem(THEME_KEY)
    if (savedTheme) {
      const isDark = savedTheme === 'dark'
      if (isDark) {
        document.documentElement.classList.add('dark')
      }
      set({ isDark })
    } else {
      // 默认浅色主题
      set({ isDark: false })
    }
  },
}))
