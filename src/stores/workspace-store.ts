import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Workspace, Board } from '@/types'

export interface WorkspaceStore {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  boards: Board[]
  currentBoard: Board | null

  setWorkspaces: (workspaces: Workspace[]) => void
  setCurrentWorkspace: (workspace: Workspace | null) => void
  setBoards: (boards: Board[]) => void
  setCurrentBoard: (board: Board | null) => void
  addBoard: (board: Board) => void
  removeBoard: (id: string) => void
  updateBoard: (id: string, updates: Partial<Board>) => void
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  devtools(
    (set) => ({
      workspaces: [],
      currentWorkspace: null,
      boards: [],
      currentBoard: null,

      setWorkspaces: (workspaces) => set({ workspaces }),

      setCurrentWorkspace: (workspace) => set({
        currentWorkspace: workspace,
        boards: workspace?.boards ?? [],
      }),

      setBoards: (boards) => set({ boards }),

      setCurrentBoard: (board) => set({ currentBoard: board }),

      addBoard: (board) => set((state) => ({
        boards: [...state.boards, board],
      })),

      removeBoard: (id) => set((state) => ({
        boards: state.boards.filter((b) => b.id !== id),
        currentBoard: state.currentBoard?.id === id ? null : state.currentBoard,
      })),

      updateBoard: (id, updates) => set((state) => ({
        boards: state.boards.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        currentBoard:
          state.currentBoard?.id === id
            ? { ...state.currentBoard, ...updates }
            : state.currentBoard,
      })),
    }),
    { name: 'workspace-store' },
  ),
)
