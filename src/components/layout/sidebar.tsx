'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Layout,
  History,
  Share2,
  Trash2,
  Plus,
  PanelLeft,
  ChevronDown,
  Smartphone,
} from 'lucide-react'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { useUIStore } from '@/stores/ui-store'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn, formatDate, generateId } from '@/lib/utils'

const navItems = [
  { href: '/boards', label: 'Boards', icon: Layout },
  { href: '/recent', label: 'Recent', icon: History },
  { href: '/shared', label: 'Shared', icon: Share2 },
  { href: '/trash', label: 'Trash', icon: Trash2 },
]

export function Sidebar() {
  const { isSignedIn } = useUser()
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const pathname = usePathname()
  const router = useRouter()

  const {
    workspaces,
    currentWorkspace,
    boards,
    setCurrentWorkspace,
    addBoard,
    setCurrentBoard,
  } = useWorkspaceStore()

  const [workspaceOpen, setWorkspaceOpen] = useState(false)

  const handleNewBoard = () => {
    if (!currentWorkspace) return
    const board = {
      id: generateId(),
      workspaceId: currentWorkspace.id,
      title: 'Untitled Board',
      description: '',
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: [],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    addBoard(board)
    router.push(`/board/${board.id}`)
  }

  const handleBoardClick = (boardId: string) => {
    const board = boards.find((b) => b.id === boardId)
    if (board) {
      setCurrentBoard(board)
      router.push(`/board/${boardId}`)
    }
  }

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <>
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="fixed left-0 top-0 z-40 flex h-full flex-col border-r border-border/50 bg-background/80 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex shrink-0 items-center gap-2 px-4 py-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Smartphone className="size-4" />
              </div>
              <span className="text-base font-semibold tracking-tight">MindFlow</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="ml-auto size-6 shrink-0"
                aria-label="Close sidebar"
              >
                <PanelLeft className="size-4" />
              </Button>
            </div>

            <div className="px-2 pb-2">
              <Button
                variant="outline"
                onClick={() => setWorkspaceOpen(!workspaceOpen)}
                className="w-full justify-between"
              >
                <span className="truncate text-sm">
                  {currentWorkspace?.name ?? 'Select Workspace'}
                </span>
                <ChevronDown
                  className={cn(
                    'size-3.5 transition-transform',
                    workspaceOpen && 'rotate-180',
                  )}
                />
              </Button>
              <AnimatePresence>
                {workspaceOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden rounded-lg border border-border/50 mt-1"
                  >
                    {workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => {
                          setCurrentWorkspace(ws)
                          setWorkspaceOpen(false)
                        }}
                        className={cn(
                          'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted',
                          currentWorkspace?.id === ws.id && 'bg-muted font-medium',
                        )}
                      >
                        <div className="flex size-5 items-center justify-center rounded bg-muted-foreground/20 text-[10px] font-bold text-muted-foreground">
                          {ws.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{ws.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <nav className="px-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted',
                      isActive(item.href)
                        ? 'bg-muted font-medium text-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </button>
                )
              })}
            </nav>

            <Separator className="my-2" />

            <div className="flex items-center justify-between px-4 py-1.5">
              <span className="text-xs font-medium text-muted-foreground">Boards</span>
              <span className="text-xs text-muted-foreground">{boards.length}</span>
            </div>

            <ScrollArea className="flex-1 px-2">
              {boards.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-3 py-8 text-center">
                  <Layout className="size-8 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">No boards yet</p>
                </div>
              ) : (
                <div className="space-y-0.5 pb-2">
                  {boards.map((board) => (
                    <button
                      key={board.id}
                      onClick={() => handleBoardClick(board.id)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                    >
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs">
                        {'📋'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{board.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {formatDate(board.updatedAt)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="shrink-0 border-t border-border/50 px-2 py-2">
              <Button
                variant="ghost"
                onClick={handleNewBoard}
                className="w-full justify-start gap-2"
              >
                <Plus className="size-4" />
                New Board
              </Button>
            </div>

            <div className="flex shrink-0 items-center gap-3 border-t border-border/50 px-4 py-3">
              {isSignedIn ? (
                <>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: 'size-8',
                        userButtonOuterIdentifier: 'text-sm font-medium truncate',
                        userButtonTrigger: 'focus:shadow-none',
                      },
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">Account</p>
                  </div>
                </>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <Button variant="default" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button variant="outline" size="sm" className="w-full">
                      Sign Up
                    </Button>
                  </SignUpButton>
                </>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {!sidebarOpen && (
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="fixed left-3 top-3 z-40 size-8"
          aria-label="Open sidebar"
        >
          <PanelLeft className="size-4" />
        </Button>
      )}
    </>
  )
}
