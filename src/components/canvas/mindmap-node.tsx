'use client'

import { memo, useCallback } from 'react'
import { Handle, Position, NodeResizer, type NodeProps, type Node } from '@xyflow/react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCanvasStore } from '@/stores/canvas-store'
import type { NodeShape } from '@/types'

export type MindMapNodeData = {
  title: string
  description?: string
  emoji?: string
  color: string
  shape: NodeShape
  collapsed: boolean
  locked: boolean
  childCount: number
}

export type MindMapNodeType = Node<MindMapNodeData, 'mindMapNode'>

const SHAPE_CLIP: Record<NodeShape, string> = {
  roundedRectangle: 'inset(0 round 8px)',
  rectangle: 'inset(0)',
  circle: 'circle(50%)',
  ellipse: 'ellipse(50% 50% at 50% 50%)',
  diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  triangle: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  stickyNote: 'polygon(0% 0%, 85% 0%, 100% 15%, 100% 100%, 0% 100%)',
  cloud: 'path("M 50,15 C 70,10 85,25 80,45 C 95,40 100,60 85,70 C 90,85 70,90 55,80 C 40,90 15,85 20,65 C 5,65 0,40 20,30 C 15,15 30,10 50,15 Z")',
}

function MindMapNodeComponent({ id, data, selected }: NodeProps<MindMapNodeType>) {
  const toggleCollapse = useCanvasStore((s) => s.toggleCollapse)

  const handleCollapseToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    toggleCollapse(id)
  }, [id, toggleCollapse])

  return (
    <div className="relative h-full w-full">
      <NodeResizer
        minWidth={100}
        minHeight={40}
        isVisible={selected}
        handleClassName="!size-3 !border !border-blue-500 !bg-white !rounded-sm"
        lineClassName="!border-blue-400/30"
      />

      <Handle type="target" position={Position.Top} className="!size-2.5 !border-2 !border-white !bg-gray-400" />
      <Handle type="source" position={Position.Bottom} className="!size-2.5 !border-2 !border-white !bg-gray-400" />
      <Handle type="target" position={Position.Left} className="!size-2.5 !border-2 !border-white !bg-gray-400" />
      <Handle type="source" position={Position.Right} className="!size-2.5 !border-2 !border-white !bg-gray-400" />

      <div
        className={cn(
          'relative flex h-full w-full flex-col overflow-hidden border transition-shadow',
          'bg-white dark:bg-neutral-800',
          selected
            ? 'border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.3)]'
            : 'border-gray-300 dark:border-neutral-600',
        )}
        style={{
          clipPath: SHAPE_CLIP[data.shape] ?? SHAPE_CLIP.roundedRectangle,
        }}
      >
        <div className="flex items-start justify-between gap-1 px-3 py-2">
          <div className="flex min-w-0 items-center gap-1.5">
            {data.emoji && (
              <span className="flex-shrink-0 text-base leading-none">{data.emoji}</span>
            )}
            <span className="truncate text-sm">{data.title}</span>
          </div>
          {data.childCount > 0 && (
            <button
              onClick={handleCollapseToggle}
              className="flex size-5 flex-shrink-0 items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-neutral-700"
            >
              {data.collapsed ? (
                <ChevronRight className="size-3.5 text-gray-500" />
              ) : (
                <ChevronDown className="size-3.5 text-gray-500" />
              )}
            </button>
          )}
        </div>

        {data.collapsed && data.childCount > 0 && (
          <div
            className="absolute bottom-1.5 right-1.5 flex size-4 items-center justify-center rounded-full text-[9px] font-medium text-white"
            style={{ backgroundColor: data.color }}
          >
            {data.childCount}
          </div>
        )}

        {data.locked && (
          <div className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-black/5" />
        )}
      </div>
    </div>
  )
}

export const MindMapNode = memo(MindMapNodeComponent)
