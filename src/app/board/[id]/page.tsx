'use client'

import { useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useCanvasStore } from '@/stores/canvas-store'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { useUIStore } from '@/stores/ui-store'
import { WorkspaceShell } from '@/components/workspace-shell'

export default function BoardPage() {
  const params = useParams()
  const boardId = params.id as string
  const loaded = useRef(false)

  const boards = useWorkspaceStore((s) => s.boards)
  const currentBoard = useWorkspaceStore((s) => s.currentBoard)

  const setBoard = useCanvasStore((s) => s.setBoard)
  const loadBoard = useCanvasStore((s) => s.loadBoard)
  const clearBoard = useCanvasStore((s) => s.clearBoard)

  const sidebarOpen = useUIStore((s) => s.sidebarOpen)

  useEffect(() => {
    if (!boardId || loaded.current) return
    loaded.current = true

    const board = currentBoard?.id === boardId ? currentBoard : boards.find((b) => b.id === boardId)
    if (board) {
      setBoard(board.id, board.title)
      loadBoard(board.nodes ?? [], board.edges ?? [])
    } else {
      setBoard(boardId, 'Untitled Board')
      loadBoard([], [])
    }

    return () => {
      clearBoard()
    }
  }, [boardId, currentBoard, boards, setBoard, loadBoard, clearBoard])

  useEffect(() => {
    if (currentBoard?.id === boardId) {
      setBoard(boardId, currentBoard.title)
    }
  }, [currentBoard, boardId, setBoard])

  return (
    <div className="h-dvh w-dvw overflow-hidden">
      <WorkspaceShell />
    </div>
  )
}
