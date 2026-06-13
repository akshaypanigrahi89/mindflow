'use client'

import { useEffect, type ReactNode } from 'react'
import { useUIStore } from '@/stores/ui-store'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)
  const effectiveTheme = useUIStore((s) => s.effectiveTheme)

  useEffect(() => {
    const root = document.documentElement
    if (effectiveTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [effectiveTheme])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        setTheme('system')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, setTheme])

  useEffect(() => {
    setTheme(theme)
  }, [])

  return <>{children}</>
}
