'use client'

import { getBezierPath, type ConnectionLineComponentProps } from '@xyflow/react'

export function ConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
}: ConnectionLineComponentProps) {
  const [edgePath] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  })

  return (
    <path
      fill="none"
      stroke="var(--color-accent, #3b82f6)"
      strokeWidth={2}
      className="stroke-accent/50"
      d={edgePath}
    />
  )
}
