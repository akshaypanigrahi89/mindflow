'use client'

import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette,
  Shapes,
  Plus,
  Copy,
  Trash2,
  Lock,
  Unlock,
} from 'lucide-react'
import { useCanvasStore } from '@/stores/canvas-store'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { COLORS, SHAPES } from '@/lib/constants'
import type { NodeShape } from '@/types'

const shapeLabels: Record<NodeShape, string> = {
  roundedRectangle: 'Rounded',
  rectangle: 'Rectangle',
  circle: 'Circle',
  ellipse: 'Ellipse',
  diamond: 'Diamond',
  hexagon: 'Hexagon',
  triangle: 'Triangle',
  star: 'Star',
  stickyNote: 'Sticky',
  cloud: 'Cloud',
}

export function FloatingToolbar() {
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds)
  const nodes = useCanvasStore((s) => s.nodes)
  const removeNode = useCanvasStore((s) => s.removeNode)
  const duplicateNodes = useCanvasStore((s) => s.duplicateNodes)
  const toggleLock = useCanvasStore((s) => s.toggleLock)
  const updateNode = useCanvasStore((s) => s.updateNode)
  const addNode = useCanvasStore((s) => s.addNode)

  const selectedNodes = nodes.filter((n) => selectedNodeIds.includes(n.id))
  const isVisible = selectedNodeIds.length > 0

  const firstSelected = selectedNodes[0]

  const handleColorChange = useCallback(
    (color: string) => {
      selectedNodeIds.forEach((id) => updateNode(id, { color }))
    },
    [selectedNodeIds, updateNode],
  )

  const handleShapeChange = useCallback(
    (shape: NodeShape) => {
      selectedNodeIds.forEach((id) => updateNode(id, { shape }))
    },
    [selectedNodeIds, updateNode],
  )

  const handleDelete = useCallback(() => {
    selectedNodeIds.forEach((id) => removeNode(id))
  }, [selectedNodeIds, removeNode])

  const handleDuplicate = useCallback(() => {
    if (selectedNodeIds.length > 0) {
      duplicateNodes(selectedNodeIds)
    }
  }, [selectedNodeIds, duplicateNodes])

  const handleLockToggle = useCallback(() => {
    selectedNodeIds.forEach((id) => toggleLock(id))
  }, [selectedNodeIds, toggleLock])

  const handleAddChild = useCallback(() => {
    if (firstSelected) {
      const children = nodes.filter((n) => n.parentId === firstSelected.id)
      addNode({
        title: 'Child Node',
        parentId: firstSelected.id,
        x: firstSelected.x + firstSelected.width + 50,
        y: firstSelected.y + children.length * 80,
      })
    }
  }, [firstSelected, nodes, addNode])

  const allLocked =
    selectedNodes.length > 0 && selectedNodes.every((n) => n.locked)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 shadow-sm dark:border-neutral-600 dark:bg-neutral-800"
        >
          {firstSelected && (
            <>
              <Popover>
                <PopoverTrigger
                  render={<Button variant="ghost" size="icon" className="size-7" aria-label="Change color"><Palette className="size-3.5" /></Button>}
                />
                <PopoverContent
                  align="center"
                  side="top"
                  sideOffset={8}
                  className="w-auto p-2"
                >
                  <div className="grid grid-cols-7 gap-1">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={cn(
                          'size-5 rounded-md border border-border/50 transition-transform hover:scale-110',
                          firstSelected.color === color && 'ring-2 ring-ring ring-offset-1',
                        )}
                        style={{ backgroundColor: color }}
                        aria-label={`Color ${color}`}
                      />
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger
                  render={<Button variant="ghost" size="icon" className="size-7" aria-label="Change shape"><Shapes className="size-3.5" /></Button>}
                />
                <PopoverContent
                  align="center"
                  side="top"
                  sideOffset={8}
                  className="w-auto p-2"
                >
                  <div className="grid grid-cols-5 gap-1">
                    {SHAPES.map((shape) => (
                      <button
                        key={shape}
                        onClick={() => handleShapeChange(shape)}
                        className={cn(
                          'rounded-md px-2 py-1 text-xs transition-colors hover:bg-muted',
                          firstSelected.shape === shape && 'bg-muted font-medium text-foreground',
                        )}
                      >
                        {shapeLabels[shape]}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Separator orientation="vertical" className="mx-0.5 h-5" />

              <Button
                variant="ghost"
                size="icon"
                onClick={handleAddChild}
                className="size-7"
                aria-label="Add child node"
              >
                <Plus className="size-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDuplicate}
                className="size-7"
                aria-label="Duplicate"
              >
                <Copy className="size-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="size-7 text-destructive hover:text-destructive"
                aria-label="Delete"
              >
                <Trash2 className="size-3.5" />
              </Button>

              <Separator orientation="vertical" className="mx-0.5 h-5" />

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLockToggle}
                className="size-7"
                aria-label={allLocked ? 'Unlock' : 'Lock'}
              >
                {allLocked ? (
                  <Unlock className="size-3.5" />
                ) : (
                  <Lock className="size-3.5" />
                )}
              </Button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
