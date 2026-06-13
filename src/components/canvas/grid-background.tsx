'use client'

import { Background, BackgroundVariant } from '@xyflow/react'
import { useUIStore } from '@/stores/ui-store'

export function GridBackground() {
  const effectiveTheme = useUIStore((s) => s.effectiveTheme)
  const isDark = effectiveTheme === 'dark'

  return (
    <Background
      variant={BackgroundVariant.Dots}
      color={isDark ? '#27272a' : '#e5e7eb'}
      gap={20}
      size={1.5}
    />
  )
}
