'use client'

import { useCallback } from 'react'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const

export function ThemeToggle() {
  const theme = useUIStore((s) => s.theme)
  const setTheme = useUIStore((s) => s.setTheme)

  const handleThemeChange = useCallback(
    (value: string) => {
      setTheme(value as 'light' | 'dark' | 'system')
    },
    [setTheme],
  )

  const CurrentIcon = THEME_OPTIONS.find((o) => o.value === theme)?.icon ?? Sun

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
        <CurrentIcon className="size-4" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange}>
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon
            return (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                <Icon className="size-4" />
                {option.label}
              </DropdownMenuRadioItem>
            )
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
