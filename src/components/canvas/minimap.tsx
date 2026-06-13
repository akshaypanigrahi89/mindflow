'use client'

import { MiniMap } from '@xyflow/react'

export function CanvasMiniMap() {
  return (
    <MiniMap
      className="!rounded-lg !border !border-border !bg-background/80 !shadow-lg !backdrop-blur-md"
      nodeColor={(node) => (node.data as { color?: string })?.color ?? '#4F46E5'}
      maskColor="var(--color-background, rgba(0,0,0,0.1))"
      style={{ background: 'transparent' }}
      pannable
      zoomable
    />
  )
}
