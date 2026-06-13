'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Star,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Share2,
  Download,
  Bot,
  Plus,
  Layout as LayoutIcon,
  Image,
  Type,
  GitBranch,
  Circle,
  Workflow,
  IterationCcw,
  GanttChartSquare,
} from 'lucide-react'
import { useCanvasStore } from '@/stores/canvas-store'
import { UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const layoutOptions = [
  { id: 'mindmap', label: 'Mind Map', icon: GitBranch },
  { id: 'tree', label: 'Tree', icon: Type },
  { id: 'orgchart', label: 'Org Chart', icon: Circle },
  { id: 'flowchart', label: 'Flow Chart', icon: Workflow },
  { id: 'radial', label: 'Radial', icon: IterationCcw },
  { id: 'timeline', label: 'Timeline', icon: GanttChartSquare },
  { id: 'kanban', label: 'Kanban', icon: LayoutIcon },
] as const

const exportFormats = ['PNG', 'JPG', 'SVG', 'PDF', 'JSON'] as const

export function CanvasToolbar() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const boardTitle = useCanvasStore((s) => s.boardTitle)
  const undo = useCanvasStore((s) => s.undo)
  const redo = useCanvasStore((s) => s.redo)
  const zoomIn = useCanvasStore((s) => s.zoomIn)
  const zoomOut = useCanvasStore((s) => s.zoomOut)
  const viewport = useCanvasStore((s) => s.viewport)
  const addNode = useCanvasStore((s) => s.addNode)
  const viewportRef = useCanvasStore((s) => s.viewport)

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(boardTitle)
  const [isFavorited, setIsFavorited] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTitleValue(boardTitle)
  }, [boardTitle])

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [editingTitle])

  const handleTitleBlur = useCallback(() => {
    setEditingTitle(false)
    if (titleValue.trim()) {
      useCanvasStore.getState().setBoard(useCanvasStore.getState().boardId ?? '', titleValue.trim())
    } else {
      setTitleValue(boardTitle)
    }
  }, [titleValue, boardTitle])

  const handleNewNode = useCallback(() => {
    addNode({ title: 'New Node' })
  }, [addNode])

  const zoomPercent = Math.round(viewport.zoom * 100)

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed left-1/2 top-3 z-30 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-border/50 bg-background/80 px-2 py-1.5 shadow-lg backdrop-blur-xl"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="size-7 shrink-0"
        aria-label="Go back"
      >
        <ArrowLeft className="size-4" />
      </Button>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      {editingTitle ? (
        <Input
          ref={titleInputRef}
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleTitleBlur()
            if (e.key === 'Escape') {
              setTitleValue(boardTitle)
              setEditingTitle(false)
            }
          }}
          className="h-7 w-40 border-none bg-transparent px-1.5 text-sm font-medium focus-visible:ring-0"
        />
      ) : (
        <button
          onClick={() => setEditingTitle(true)}
          className="max-w-[160px] truncate rounded-md px-1.5 py-1 text-sm font-medium transition-colors hover:bg-muted"
        >
          {boardTitle || 'Untitled Board'}
        </button>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsFavorited(!isFavorited)}
        className={cn('size-7 shrink-0', isFavorited && 'text-yellow-500')}
        aria-label={isFavorited ? 'Unfavorite' : 'Favorite'}
      >
        <Star className={cn('size-3.5', isFavorited && 'fill-current')} />
      </Button>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      <Button
        variant="ghost"
        size="icon"
        onClick={undo}
        className="size-7 shrink-0"
        aria-label="Undo"
      >
        <Undo2 className="size-3.5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={redo}
        className="size-7 shrink-0"
        aria-label="Redo"
      >
        <Redo2 className="size-3.5" />
      </Button>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={zoomOut}
          className="size-7 shrink-0"
          aria-label="Zoom out"
        >
          <ZoomOut className="size-3.5" />
        </Button>
        <span className="min-w-[40px] text-center text-xs tabular-nums text-muted-foreground">
          {zoomPercent}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={zoomIn}
          className="size-7 shrink-0"
          aria-label="Zoom in"
        >
          <ZoomIn className="size-3.5" />
        </Button>
      </div>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="sm" className="h-7 gap-1 text-xs"><LayoutIcon className="size-3.5" />Layout</Button>}
        />
        <DropdownMenuContent align="start" sideOffset={6}>
          <DropdownMenuLabel>Smart Layout</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {layoutOptions.map((opt) => {
            const Icon = opt.icon
            return (
              <DropdownMenuItem key={opt.id}>
                <Icon className="size-4" />
                {opt.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      <Button
        variant="ghost"
        size="icon"
        className="size-7 shrink-0"
        aria-label="Share"
      >
        <Share2 className="size-3.5" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label="Export"><Download className="size-3.5" /></Button>}
        />
        <DropdownMenuContent align="start" sideOffset={6}>
          <DropdownMenuLabel>Export as</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {exportFormats.map((fmt) => (
            <DropdownMenuItem key={fmt}>
              {fmt}
              <DropdownMenuShortcut>{fmt.toLowerCase()}</DropdownMenuShortcut>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 text-purple-500"
        aria-label="AI Assistant"
      >
        <Bot className="size-3.5" />
      </Button>

      <Button
        variant="default"
        size="sm"
        onClick={handleNewNode}
        className="h-7 gap-1 px-2 text-xs"
      >
        <Plus className="size-3.5" />
        Node
      </Button>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      {isSignedIn && (
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'size-7',
              userButtonTrigger: 'focus:shadow-none',
            },
          }}
        />
      )}
    </motion.div>
  )
}
