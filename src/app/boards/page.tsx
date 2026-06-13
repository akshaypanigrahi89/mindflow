'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { Layout, Plus } from 'lucide-react'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { useUIStore } from '@/stores/ui-store'
import { Sidebar } from '@/components/layout/sidebar'
import { ThemeToggle } from '@/components/panels/theme-toggle'
import { Button } from '@/components/ui/button'
import { cn, formatDate, generateId } from '@/lib/utils'
import { createDefaultWorkspace, createDemoBoard } from '@/lib/seed-data'

export default function BoardsPage() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const seeded = useRef(false)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)

  const { workspaces, currentWorkspace, boards, setWorkspaces, setCurrentWorkspace, addBoard } =
    useWorkspaceStore()

  useEffect(() => {
    if (seeded.current) return
    seeded.current = true

    if (workspaces.length === 0) {
      const workspace = createDefaultWorkspace()
      workspace.id = generateId()
      const demoBoard = createDemoBoard(workspace.id)
      workspace.boards = [demoBoard]

      setWorkspaces([workspace])
      setCurrentWorkspace(workspace)
      addBoard(demoBoard)
    }
  }, [workspaces, setWorkspaces, setCurrentWorkspace, addBoard])

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
    router.push(`/board/${boardId}`)
  }

  return (
    <div className="flex h-dvh w-dvw">
      <Sidebar />
      <main
        className={cn(
          'flex flex-1 flex-col transition-all duration-200',
          sidebarOpen ? 'ml-[320px]' : 'ml-0',
        )}
      >
        <header className="flex items-center justify-between border-b border-border/50 px-6 py-3">
          <div>
            <h1 className="text-lg font-semibold">Boards</h1>
            <p className="text-sm text-muted-foreground">
              {currentWorkspace?.name ?? 'Select a workspace'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'size-8',
                    userButtonTrigger: 'focus:shadow-none',
                  },
                }}
              />
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button variant="default" size="sm">Sign Up</Button>
                </SignUpButton>
              </>
            )}
            <Button onClick={handleNewBoard} size="sm" className="gap-1.5">
              <Plus className="size-4" />
              New Board
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {boards.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <Layout className="size-12 text-muted-foreground/30" />
              <div className="text-center">
                <h2 className="text-lg font-medium">No boards yet</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first board to get started
                </p>
              </div>
              <Button onClick={handleNewBoard} className="gap-1.5">
                <Plus className="size-4" />
                Create Board
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {boards.map((board) => (
                <button
                  key={board.id}
                  onClick={() => handleBoardClick(board.id)}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card/50 p-4 text-left transition-all hover:border-accent/50 hover:shadow-md hover:bg-accent/5"
                >
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-muted text-lg">
                    📋
                  </div>
                  <h3 className="truncate text-sm font-medium">{board.title}</h3>
                  {board.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {board.description}
                    </p>
                  )}
                  <div className="mt-auto pt-3">
                    <p className="text-[11px] text-muted-foreground">
                      {formatDate(board.updatedAt)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {board.nodes.length} nodes
                    </p>
                  </div>
                </button>
              ))}
              <button
                onClick={handleNewBoard}
                className="flex items-center justify-center rounded-xl border-2 border-dashed border-border/50 p-8 transition-colors hover:border-accent/50 hover:bg-accent/5"
              >
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Plus className="size-8" />
                  <span className="text-sm font-medium">New Board</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
