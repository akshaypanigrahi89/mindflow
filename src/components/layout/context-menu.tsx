'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import {
  SquarePlus,
  Plus,
  Copy,
  Trash2,
  Lock,
  Unlock,
  GitBranch,
  Type,
  Circle,
  Workflow,
  IterationCcw,
  GanttChartSquare,
  Layout as LayoutIcon,
  Palette,
  Shapes,
  Bot,
  ChevronRight,
  Scissors,
  ClipboardPaste,
} from 'lucide-react'
import { useCanvasStore } from '@/stores/canvas-store'
import {
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu'
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

const layoutOptions = [
  { id: 'mindmap', label: 'Mind Map', icon: GitBranch },
  { id: 'tree', label: 'Tree', icon: Type },
  { id: 'orgchart', label: 'Org Chart', icon: Circle },
  { id: 'flowchart', label: 'Flow Chart', icon: Workflow },
  { id: 'radial', label: 'Radial', icon: IterationCcw },
  { id: 'timeline', label: 'Timeline', icon: GanttChartSquare },
  { id: 'kanban', label: 'Kanban', icon: LayoutIcon },
] as const

interface ContextMenuState {
  open: boolean
  x: number
  y: number
  targetType: 'node' | 'canvas'
  targetId: string | null
}

export function ContextMenu({ containerRef }: { containerRef?: React.RefObject<HTMLElement | null> }) {
  const addNode = useCanvasStore((s) => s.addNode)
  const removeNode = useCanvasStore((s) => s.removeNode)
  const duplicateNodes = useCanvasStore((s) => s.duplicateNodes)
  const toggleLock = useCanvasStore((s) => s.toggleLock)
  const updateNode = useCanvasStore((s) => s.updateNode)
  const nodes = useCanvasStore((s) => s.nodes)
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds)

  const [menu, setMenu] = useState<ContextMenuState>({
    open: false,
    x: 0,
    y: 0,
    targetType: 'canvas',
    targetId: null,
  })

  const anchorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleContextMenu = (e: Event) => {
      const me = e as MouseEvent
      me.preventDefault()
      me.stopPropagation()

      const target = me.target as HTMLElement
      const nodeElement = target.closest('.react-flow__node')
      const targetId = nodeElement?.getAttribute('data-id') ?? null
      const targetType = targetId ? 'node' : 'canvas'

      setMenu({
        open: true,
        x: me.clientX,
        y: me.clientY,
        targetType,
        targetId,
      })
    }

    const handleClick = () => {
      setMenu((prev) => ({ ...prev, open: false }))
    }

    const handleKeyDown = (e: Event) => {
      const ke = e as KeyboardEvent
      if (ke.key === 'Escape') {
        setMenu((prev) => ({ ...prev, open: false }))
      }
    }

    const container = containerRef?.current ?? document
    const target = container === document ? document : container
    target.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      target.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [containerRef])

  const handleAddNode = useCallback(() => {
    addNode({ title: 'New Node', x: menu.x, y: menu.y })
    setMenu((prev) => ({ ...prev, open: false }))
  }, [addNode, menu.x, menu.y])

  const handleAddChild = useCallback(() => {
    if (menu.targetId) {
      const parent = nodes.find((n) => n.id === menu.targetId)
      const children = nodes.filter((n) => n.parentId === menu.targetId)
      if (parent) {
        addNode({
          title: 'Child Node',
          parentId: menu.targetId,
          x: parent.x + parent.width + 50,
          y: parent.y + children.length * 80,
        })
      }
    }
    setMenu((prev) => ({ ...prev, open: false }))
  }, [addNode, nodes, menu.targetId])

  const handleDuplicate = useCallback(() => {
    const ids = menu.targetId ? [menu.targetId] : selectedNodeIds
    if (ids.length > 0) duplicateNodes(ids)
    setMenu((prev) => ({ ...prev, open: false }))
  }, [duplicateNodes, menu.targetId, selectedNodeIds])

  const handleDelete = useCallback(() => {
    const ids = menu.targetId ? [menu.targetId] : selectedNodeIds
    ids.forEach((id) => removeNode(id))
    setMenu((prev) => ({ ...prev, open: false }))
  }, [removeNode, menu.targetId, selectedNodeIds])

  const handleLockToggle = useCallback(() => {
    const id = menu.targetId
    if (id) toggleLock(id)
    setMenu((prev) => ({ ...prev, open: false }))
  }, [toggleLock, menu.targetId])

  const handleColorChange = useCallback(
    (color: string) => {
      const id = menu.targetId
      if (id) updateNode(id, { color })
      setMenu((prev) => ({ ...prev, open: false }))
    },
    [updateNode, menu.targetId],
  )

  const handleShapeChange = useCallback(
    (shape: NodeShape) => {
      const id = menu.targetId
      if (id) updateNode(id, { shape })
      setMenu((prev) => ({ ...prev, open: false }))
    },
    [updateNode, menu.targetId],
  )

  const handleClose = useCallback(() => {
    setMenu((prev) => ({ ...prev, open: false }))
  }, [])

  const isNode = menu.targetType === 'node'
  const targetNode = isNode ? nodes.find((n) => n.id === menu.targetId) : null

  if (!menu.open) return null

  return (
    <MenuPrimitive.Root open={menu.open} onOpenChange={(open) => !open && handleClose()}>
      <div
        ref={anchorRef}
        style={{
          position: 'fixed',
          left: menu.x,
          top: menu.y,
          width: 0,
          height: 0,
          pointerEvents: 'none',
        }}
      >
        <MenuPrimitive.Trigger render={<span />} />
      </div>

      <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner
          side="bottom"
          align="start"
          sideOffset={0}
          alignOffset={0}
        >
          <MenuPrimitive.Popup className="z-50 min-w-44 origin-(--transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            {isNode ? (
              <>
                <MenuPrimitive.Item
                  onClick={handleAddNode}
                  className="group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground"
                >
                  <SquarePlus className="size-4" />
                  Add Node
                  <DropdownMenuShortcut>N</DropdownMenuShortcut>
                </MenuPrimitive.Item>

                <MenuPrimitive.Item
                  onClick={handleAddChild}
                  className="group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground"
                >
                  <Plus className="size-4" />
                  Add Child Node
                  <DropdownMenuShortcut>Tab</DropdownMenuShortcut>
                </MenuPrimitive.Item>

                <DropdownMenuSeparator />

                <MenuPrimitive.SubmenuRoot>
                  <MenuPrimitive.SubmenuTrigger className="flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-popup-open:bg-accent">
                    <LayoutIcon className="size-4" />
                    Layout
                    <ChevronRight className="ml-auto size-3.5" />
                  </MenuPrimitive.SubmenuTrigger>
                  <MenuPrimitive.Portal>
                    <MenuPrimitive.Positioner side="right" align="start" sideOffset={-4}>
                      <MenuPrimitive.Popup className="z-50 min-w-36 origin-(--transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
                        {layoutOptions.map((opt) => {
                          const Icon = opt.icon
                          return (
                            <MenuPrimitive.Item
                              key={opt.id}
                              onClick={handleClose}
                              className="group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground"
                            >
                              <Icon className="size-4" />
                              {opt.label}
                            </MenuPrimitive.Item>
                          )
                        })}
                      </MenuPrimitive.Popup>
                    </MenuPrimitive.Positioner>
                  </MenuPrimitive.Portal>
                </MenuPrimitive.SubmenuRoot>

                <MenuPrimitive.SubmenuRoot>
                  <MenuPrimitive.SubmenuTrigger className="flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-popup-open:bg-accent">
                    <Shapes className="size-4" />
                    Shape
                    <ChevronRight className="ml-auto size-3.5" />
                  </MenuPrimitive.SubmenuTrigger>
                  <MenuPrimitive.Portal>
                    <MenuPrimitive.Positioner side="right" align="start" sideOffset={-4}>
                      <MenuPrimitive.Popup className="z-50 min-w-28 origin-(--transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
                        {SHAPES.map((shape) => (
                          <MenuPrimitive.Item
                            key={shape}
                            onClick={() => handleShapeChange(shape)}
                            className={cn(
                              'group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground',
                              targetNode?.shape === shape && 'bg-muted',
                            )}
                          >
                            {shapeLabels[shape]}
                          </MenuPrimitive.Item>
                        ))}
                      </MenuPrimitive.Popup>
                    </MenuPrimitive.Positioner>
                  </MenuPrimitive.Portal>
                </MenuPrimitive.SubmenuRoot>

                <MenuPrimitive.SubmenuRoot>
                  <MenuPrimitive.SubmenuTrigger className="flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-popup-open:bg-accent">
                    <Palette className="size-4" />
                    Color
                    <ChevronRight className="ml-auto size-3.5" />
                  </MenuPrimitive.SubmenuTrigger>
                  <MenuPrimitive.Portal>
                    <MenuPrimitive.Positioner side="right" align="start" sideOffset={-4}>
                      <MenuPrimitive.Popup className="z-50 p-2 origin-(--transform-origin) overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
                        <div className="grid grid-cols-7 gap-1">
                          {COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() => handleColorChange(color)}
                              className={cn(
                                'size-5 rounded-md border border-border/50 transition-transform hover:scale-110',
                                targetNode?.color === color && 'ring-2 ring-ring ring-offset-1',
                              )}
                              style={{ backgroundColor: color }}
                              aria-label={`Color ${color}`}
                            />
                          ))}
                        </div>
                      </MenuPrimitive.Popup>
                    </MenuPrimitive.Positioner>
                  </MenuPrimitive.Portal>
                </MenuPrimitive.SubmenuRoot>

                <DropdownMenuSeparator />

                <MenuPrimitive.Item
                  onClick={handleDuplicate}
                  className="group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground"
                >
                  <Copy className="size-4" />
                  Duplicate
                  <DropdownMenuShortcut>Ctrl+D</DropdownMenuShortcut>
                </MenuPrimitive.Item>

                <MenuPrimitive.Item
                  onClick={handleDelete}
                  className="group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground"
                  data-variant="destructive"
                >
                  <Trash2 className="size-4" />
                  Delete
                  <DropdownMenuShortcut>Del</DropdownMenuShortcut>
                </MenuPrimitive.Item>

                <MenuPrimitive.Item
                  onClick={handleLockToggle}
                  className="group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground"
                >
                  {targetNode?.locked ? (
                    <Unlock className="size-4" />
                  ) : (
                    <Lock className="size-4" />
                  )}
                  {targetNode?.locked ? 'Unlock' : 'Lock'}
                </MenuPrimitive.Item>

                <DropdownMenuSeparator />

                <MenuPrimitive.SubmenuRoot>
                  <MenuPrimitive.SubmenuTrigger className="flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-popup-open:bg-accent">
                    <Bot className="size-4" />
                    AI Assistant
                    <ChevronRight className="ml-auto size-3.5" />
                  </MenuPrimitive.SubmenuTrigger>
                  <MenuPrimitive.Portal>
                    <MenuPrimitive.Positioner side="right" align="start" sideOffset={-4}>
                      <MenuPrimitive.Popup className="z-50 min-w-36 origin-(--transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
                        <MenuPrimitive.Item
                          onClick={handleClose}
                          className="group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground"
                        >
                          Improve Writing
                        </MenuPrimitive.Item>
                        <MenuPrimitive.Item
                          onClick={handleClose}
                          className="group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground"
                        >
                          Generate Children
                        </MenuPrimitive.Item>
                        <MenuPrimitive.Item
                          onClick={handleClose}
                          className="group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground"
                        >
                          Summarize
                        </MenuPrimitive.Item>
                      </MenuPrimitive.Popup>
                    </MenuPrimitive.Positioner>
                  </MenuPrimitive.Portal>
                </MenuPrimitive.SubmenuRoot>
              </>
            ) : (
              <>
                <MenuPrimitive.Item
                  onClick={handleAddNode}
                  className="group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground"
                >
                  <SquarePlus className="size-4" />
                  Add Node
                  <DropdownMenuShortcut>N</DropdownMenuShortcut>
                </MenuPrimitive.Item>

                <DropdownMenuSeparator />

                <MenuPrimitive.Item
                  onClick={handleClose}
                  className="group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground"
                >
                  <ClipboardPaste className="size-4" />
                  Paste
                  <DropdownMenuShortcut>Ctrl+V</DropdownMenuShortcut>
                </MenuPrimitive.Item>

                <DropdownMenuSeparator />

                <MenuPrimitive.SubmenuRoot>
                  <MenuPrimitive.SubmenuTrigger className="flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-popup-open:bg-accent">
                    <LayoutIcon className="size-4" />
                    Smart Layout
                    <ChevronRight className="ml-auto size-3.5" />
                  </MenuPrimitive.SubmenuTrigger>
                  <MenuPrimitive.Portal>
                    <MenuPrimitive.Positioner side="right" align="start" sideOffset={-4}>
                      <MenuPrimitive.Popup className="z-50 min-w-36 origin-(--transform-origin) overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
                        {layoutOptions.map((opt) => {
                          const Icon = opt.icon
                          return (
                            <MenuPrimitive.Item
                              key={opt.id}
                              onClick={handleClose}
                              className="group/dropdown-menu-item relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground"
                            >
                              <Icon className="size-4" />
                              {opt.label}
                            </MenuPrimitive.Item>
                          )
                        })}
                      </MenuPrimitive.Popup>
                    </MenuPrimitive.Positioner>
                  </MenuPrimitive.Portal>
                </MenuPrimitive.SubmenuRoot>
              </>
            )}
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  )
}
