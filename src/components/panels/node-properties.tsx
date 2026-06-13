'use client'

import { useCallback, useMemo } from 'react'
import { Lock, Unlock, ChevronDown, ChevronRight, GripVertical, Move, Maximize } from 'lucide-react'
import { useCanvasStore } from '@/stores/canvas-store'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { COLORS, SHAPES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { NodeShape } from '@/types'

const EMOJIS = [
  '😀', '😎', '🚀', '💡', '⭐', '🎯', '❤️', '🔥',
  '✅', '📌', '💼', '📊', '🔧', '🎨', '📝', '🗂️',
  '👍', '👎', '💪', '🧠', '👀', '🔗', '📎', '📅',
  '💰', '📈', '🏆', '🎉', '🔒', '🔓',
]

const shapeLabels: Record<NodeShape, string> = {
  roundedRectangle: 'Rounded',
  rectangle: 'Rectangle',
  circle: 'Circle',
  ellipse: 'Ellipse',
  diamond: 'Diamond',
  hexagon: 'Hexagon',
  triangle: 'Triangle',
  star: 'Star',
  stickyNote: 'Note',
  cloud: 'Cloud',
}

export function NodeProperties() {
  const nodes = useCanvasStore((s) => s.nodes)
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds)
  const updateNode = useCanvasStore((s) => s.updateNode)
  const toggleCollapse = useCanvasStore((s) => s.toggleCollapse)
  const toggleLock = useCanvasStore((s) => s.toggleLock)

  const selectedNode = useMemo(
    () => (selectedNodeIds.length === 1 ? nodes.find((n) => n.id === selectedNodeIds[0]) : null),
    [nodes, selectedNodeIds],
  )

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (selectedNode) updateNode(selectedNode.id, { title: e.target.value })
    },
    [selectedNode, updateNode],
  )

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (selectedNode) updateNode(selectedNode.id, { description: e.target.value })
    },
    [selectedNode, updateNode],
  )

  const handleColorChange = useCallback(
    (color: string) => {
      if (selectedNode) updateNode(selectedNode.id, { color })
    },
    [selectedNode, updateNode],
  )

  const handleShapeChange = useCallback(
    (shape: NodeShape) => {
      if (selectedNode) updateNode(selectedNode.id, { shape })
    },
    [selectedNode, updateNode],
  )

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      if (selectedNode) {
        updateNode(selectedNode.id, {
          emoji: selectedNode.emoji === emoji ? null : emoji,
        })
      }
    },
    [selectedNode, updateNode],
  )

  const handleAddTag = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!selectedNode || e.key !== 'Enter') return
      const input = e.currentTarget
      const tag = input.value.trim()
      if (tag && !selectedNode.tags.includes(tag)) {
        updateNode(selectedNode.id, { tags: [...selectedNode.tags, tag] })
      }
      input.value = ''
    },
    [selectedNode, updateNode],
  )

  const handleRemoveTag = useCallback(
    (tag: string) => {
      if (selectedNode) {
        updateNode(selectedNode.id, {
          tags: selectedNode.tags.filter((t) => t !== tag),
        })
      }
    },
    [selectedNode, updateNode],
  )

  if (!selectedNode) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <GripVertical className="size-8 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">Select a node to edit properties</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Title</label>
        <Input value={selectedNode.title} onChange={handleTitleChange} placeholder="Node title" />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Description</label>
        <Textarea
          value={selectedNode.description}
          onChange={handleDescriptionChange}
          placeholder="Add a description..."
          rows={3}
        />
      </div>

      <Separator />

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Color</label>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className={cn(
                'size-6 rounded-full border-2 transition-all hover:scale-110',
                selectedNode.color === color
                  ? 'border-foreground scale-110'
                  : 'border-transparent',
              )}
              style={{ backgroundColor: color }}
              aria-label={`Color ${color}`}
            />
          ))}
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <div
            className="size-5 shrink-0 rounded border"
            style={{ backgroundColor: selectedNode.color }}
          />
          <Input
            value={selectedNode.color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="h-7 text-xs font-mono"
            placeholder="#HEX"
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Shape</label>
        <div className="grid grid-cols-5 gap-1.5">
          {SHAPES.map((shape) => (
            <button
              key={shape}
              onClick={() => handleShapeChange(shape)}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-md border p-1 transition-all hover:bg-muted',
                selectedNode.shape === shape
                  ? 'border-primary bg-primary/10'
                  : 'border-border',
              )}
              aria-label={shape}
            >
              <svg
                viewBox="0 0 24 24"
                className="size-5 fill-current text-muted-foreground"
                preserveAspectRatio="xMidYMid meet"
              >
                <path d={getShapePreviewPath(shape, 24, 24)} />
              </svg>
              <span className="text-[10px] text-muted-foreground leading-tight">
                {shapeLabels[shape]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Emoji</label>
        <div className="flex flex-wrap gap-1">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiSelect(emoji)}
              className={cn(
                'flex size-7 items-center justify-center rounded-md text-base transition-all hover:bg-muted',
                selectedNode.emoji === emoji && 'bg-muted ring-1 ring-primary',
              )}
              aria-label={`Emoji ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Tags</label>
        <div className="flex flex-wrap gap-1 mb-1.5">
          {selectedNode.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-0.5 text-muted-foreground hover:text-foreground"
                aria-label={`Remove tag ${tag}`}
              >
                ✕
              </button>
            </Badge>
          ))}
        </div>
        <Input
          placeholder="Type and press Enter to add tag"
          onKeyDown={handleAddTag}
          className="h-7 text-xs"
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">Lock</label>
          <Switch
            checked={selectedNode.locked}
            onCheckedChange={() => toggleLock(selectedNode.id)}
            size="sm"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">Collapsed</label>
          <Switch
            checked={selectedNode.collapsed}
            onCheckedChange={() => toggleCollapse(selectedNode.id)}
            size="sm"
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Position & Size</label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2 py-1">
            <Move className="size-3 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">
              X:{Math.round(selectedNode.x)} Y:{Math.round(selectedNode.y)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2 py-1">
            <Maximize className="size-3 text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">
              W:{Math.round(selectedNode.width)} H:{Math.round(selectedNode.height)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function getShapePreviewPath(shape: NodeShape, w: number, h: number): string {
  const cx = w / 2
  const cy = h / 2
  const r = Math.min(cx, cy)
  switch (shape) {
    case 'roundedRectangle': {
      const r2 = Math.min(w, h) * 0.2
      return `M ${r2} 0 L ${w - r2} 0 Q ${w} 0 ${w} ${r2} L ${w} ${h - r2} Q ${w} ${h} ${w - r2} ${h} L ${r2} ${h} Q 0 ${h} 0 ${h - r2} L 0 ${r2} Q 0 0 ${r2} 0 Z`
    }
    case 'rectangle':
      return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`
    case 'circle':
      return `M ${cx} 0 A ${r} ${r} 0 1 1 ${cx - 0.001} 0 Z`
    case 'ellipse':
      return `M ${cx} 0 C ${cx + r * 1.2} 0 ${w} ${cy - r * 0.6} ${w} ${cy} C ${w} ${cy + r * 0.6} ${cx + r * 1.2} ${h} ${cx} ${h} C ${cx - r * 1.2} ${h} 0 ${cy + r * 0.6} 0 ${cy} C 0 ${cy - r * 0.6} ${cx - r * 1.2} 0 ${cx} 0 Z`
    case 'diamond':
      return `M ${cx} 0 L ${w} ${cy} L ${cx} ${h} L 0 ${cy} Z`
    case 'hexagon': {
      const hx = w * 0.25
      return `M ${hx} 0 L ${w - hx} 0 L ${w} ${cy} L ${w - hx} ${h} L ${hx} ${h} L 0 ${cy} Z`
    }
    case 'triangle':
      return `M ${cx} 0 L ${w} ${h} L 0 ${h} Z`
    case 'star': {
      const outerR = r
      const innerR = r * 0.4
      const points: string[] = []
      for (let i = 0; i < 5; i++) {
        const outerAngle = (Math.PI / 2) * 3 + (i * 2 * Math.PI) / 5
        points.push(`${cx + outerR * Math.cos(outerAngle)},${cy + outerR * Math.sin(outerAngle)}`)
        const innerAngle = (Math.PI / 2) * 3 + ((i + 0.5) * 2 * Math.PI) / 5
        points.push(`${cx + innerR * Math.cos(innerAngle)},${cy + innerR * Math.sin(innerAngle)}`)
      }
      return `M ${points.join(' L ')} Z`
    }
    case 'stickyNote': {
      const fold = Math.min(w, h) * 0.2
      return `M 0 0 L ${w - fold} 0 L ${w} ${fold} L ${w} ${h} L 0 ${h} Z`
    }
    case 'cloud':
      return `M ${cx + r * 0.2} ${cy - r * 0.7} C ${cx + r * 0.6} ${cy - r * 0.8} ${cx + r * 0.8} ${cy - r * 0.4} ${cx + r * 0.7} ${cy - r * 0.1} C ${w} ${cy - r * 0.3} ${w} ${cy + r * 0.1} ${w - r * 0.3} ${cy + r * 0.3} C ${w} ${cy + r * 0.7} ${cx + r * 0.5} ${cy + r * 0.8} ${cx + r * 0.2} ${cy + r * 0.6} C ${cx + r * 0.3} ${cy + r * 0.9} ${cx - r * 0.3} ${cy + r * 0.9} ${cx - r * 0.2} ${cy + r * 0.6} C ${cx - r * 0.7} ${cy + r * 0.8} ${-r * 0.3} ${cy + r * 0.5} ${r * 0.2} ${cy + r * 0.3} C ${-r * 0.3} ${cy + r * 0.1} ${cx - r * 0.5} ${cy - r * 0.3} ${cx - r * 0.4} ${cy - r * 0.1} C ${cx - r * 0.7} ${cy - r * 0.4} ${cx - r * 0.4} ${cy - r * 0.8} ${cx - r * 0.1} ${cy - r * 0.7} Z`
    default:
      return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`
  }
}
