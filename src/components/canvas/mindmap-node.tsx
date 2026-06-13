'use client'

import { memo, useState, useCallback } from 'react'
import { Handle, Position, NodeResizer, type NodeProps, type Node } from '@xyflow/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Lock, MessageSquare, Heart, Paperclip, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCanvasStore } from '@/stores/canvas-store'
import type { NodeShape } from '@/types'

export type MindMapNodeData = {
  title: string
  description?: string
  emoji?: string
  icon?: string
  color: string
  shape: NodeShape
  collapsed: boolean
  locked: boolean
  tags: string[]
  childCount: number
  commentCount: number
  reactionCount: number
}

export type MindMapNodeType = Node<MindMapNodeData, 'mindMapNode'>

const SHAPE_CLIP_PATHS: Record<NodeShape, string> = {
  roundedRectangle: 'inset(0 round 10px)',
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

const RECTANGULAR_SHAPES: NodeShape[] = ['roundedRectangle', 'rectangle', 'stickyNote']

function MindMapNodeComponent({ id, data, selected }: NodeProps<MindMapNodeType>) {
  const [hovered, setHovered] = useState(false)
  const toggleCollapse = useCanvasStore((s) => s.toggleCollapse)
  const isRectangular = RECTANGULAR_SHAPES.includes(data.shape)

  const handleCollapseToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    toggleCollapse(id)
  }, [id, toggleCollapse])

  return (
    <div
      className={cn('relative h-full w-full', data.locked && 'pointer-events-none')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <NodeResizer
        minWidth={120}
        minHeight={60}
        isVisible={selected}
        handleClassName="!size-3 !border-2 !border-white !bg-neutral-900/50 !rounded-sm"
        lineClassName="!border-neutral-400/30"
      />

      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          '!size-3 !border-2 !border-white !bg-neutral-900/50 !transition-opacity',
          !hovered && !selected && '!opacity-0',
        )}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          '!size-3 !border-2 !border-white !bg-neutral-900/50 !transition-opacity',
          !hovered && !selected && '!opacity-0',
        )}
      />
      <Handle
        type="target"
        position={Position.Left}
        className={cn(
          '!size-3 !border-2 !border-white !bg-neutral-900/50 !transition-opacity',
          !hovered && !selected && '!opacity-0',
        )}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={cn(
          '!size-3 !border-2 !border-white !bg-neutral-900/50 !transition-opacity',
          !hovered && !selected && '!opacity-0',
        )}
      />

      <div
        className={cn(
          'relative flex h-full w-full flex-col overflow-hidden border backdrop-blur-xl transition-all duration-200',
          'bg-white/70 dark:bg-neutral-900/70',
          selected
            ? 'border-accent shadow-[0_0_20px_rgba(59,130,246,0.3)]'
            : 'border-white/20 dark:border-white/10',
          hovered && !selected && 'shadow-xl',
          isRectangular && 'border-l-4',
        )}
        style={{
          clipPath: SHAPE_CLIP_PATHS[data.shape] ?? SHAPE_CLIP_PATHS.roundedRectangle,
          borderLeftColor: isRectangular ? data.color : undefined,
          borderColor: !isRectangular ? `${data.color}40` : undefined,
        }}
      >
        <div className="flex h-full flex-col p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              {data.emoji && (
                <span className="flex-shrink-0 text-lg leading-none">{data.emoji}</span>
              )}
              <span className="truncate text-sm font-medium">{data.title}</span>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1">
              {data.childCount > 0 && (
                <button
                  onClick={handleCollapseToggle}
                  className="flex size-5 items-center justify-center rounded hover:bg-black/10 dark:hover:bg-white/10"
                >
                  {data.collapsed ? (
                    <ChevronRight className="size-3.5" />
                  ) : (
                    <ChevronDown className="size-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>

          <AnimatePresence initial={false}>
            {!data.collapsed && (
              <motion.div
                key="expanded-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="mt-2 space-y-2 overflow-hidden"
              >
                {data.description && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">{data.description}</p>
                )}

                {data.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {data.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-0.5 rounded bg-black/5 px-1.5 py-0.5 text-[10px] font-medium dark:bg-white/10"
                      >
                        <Tag className="size-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Paperclip className="size-3" />
                    0
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="size-3" />
                    {data.commentCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="size-3" />
                    {data.reactionCount}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {data.collapsed && data.childCount > 0 && (
          <div
            className="absolute bottom-2 right-2 flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: data.color }}
          >
            {data.childCount}
          </div>
        )}

        {data.locked && (
          <div className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-black/10 backdrop-blur-[2px]">
            <Lock className="size-5 text-white drop-shadow" />
          </div>
        )}
      </div>
    </div>
  )
}

export const MindMapNode = memo(MindMapNodeComponent)
