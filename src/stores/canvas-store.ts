import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Node, Edge, Viewport, CanvasSnapshot, InteractionMode } from '@/types'
import { generateId, getDefaultNodePosition } from '@/lib/utils'
import { ZOOM_DEFAULT, ZOOM_MIN, ZOOM_MAX, DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT } from '@/lib/constants'

export interface CanvasStore {
  nodes: Node[]
  edges: Edge[]
  viewport: Viewport
  selectedNodeIds: string[]
  selectedEdgeIds: string[]
  interactionMode: InteractionMode
  isPanning: boolean
  isDragging: boolean
  boardId: string | null
  boardTitle: string

  addNode: (node?: Partial<Node>) => Node
  updateNode: (id: string, updates: Partial<Node>) => void
  removeNode: (id: string) => void
  moveNode: (id: string, x: number, y: number) => void
  resizeNode: (id: string, width: number, height: number) => void
  duplicateNodes: (ids: string[]) => void
  setNodes: (nodes: Node[]) => void
  toggleCollapse: (id: string) => void
  toggleLock: (id: string) => void
  reparentNode: (nodeId: string, newParentId: string | null) => void

  addEdge: (edge?: Partial<Edge>) => Edge
  updateEdge: (id: string, updates: Partial<Edge>) => void
  removeEdge: (id: string) => void
  setEdges: (edges: Edge[]) => void

  setViewport: (viewport: Partial<Viewport>) => void
  zoomIn: () => void
  zoomOut: () => void
  zoomToFit: () => void
  zoomTo: (zoom: number) => void

  selectNode: (id: string, addToSelection?: boolean) => void
  selectEdge: (id: string, addToSelection?: boolean) => void
  selectAll: () => void
  clearSelection: () => void
  selectNodesInRect: (rect: { x: number; y: number; width: number; height: number }) => void

  pushSnapshot: () => void
  undo: () => void
  redo: () => void
  undoStack: CanvasSnapshot[]
  redoStack: CanvasSnapshot[]

  setInteractionMode: (mode: InteractionMode) => void
  setPanning: (isPanning: boolean) => void
  setDragging: (isDragging: boolean) => void

  setBoard: (id: string, title: string) => void
  clearBoard: () => void

  loadBoard: (nodes: Node[], edges: Edge[]) => void
}

function generateEdgeId(): string {
  return `edge_${generateId()}`
}

export const useCanvasStore = create<CanvasStore>()(
  devtools(
    immer((set, get) => ({
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: ZOOM_DEFAULT },
      selectedNodeIds: [],
      selectedEdgeIds: [],
      interactionMode: 'select' as InteractionMode,
      isPanning: false,
      isDragging: false,
      boardId: null,
      boardTitle: '',
      undoStack: [] as CanvasSnapshot[],
      redoStack: [] as CanvasSnapshot[],

      addNode: (node) => {
        const state = get()
        const position = node?.x !== undefined && node?.y !== undefined
          ? { x: node.x, y: node.y }
          : getDefaultNodePosition(state.viewport, state.nodes)
        const newNode: Node = {
          id: node?.id ?? generateId(),
          boardId: node?.boardId ?? state.boardId ?? '',
          parentId: node?.parentId ?? null,
          title: node?.title ?? 'New Node',
          description: node?.description ?? '',
          emoji: node?.emoji ?? null,
          icon: node?.icon ?? null,
          color: node?.color ?? '#4F46E5',
          shape: node?.shape ?? 'roundedRectangle',
          collapsed: node?.collapsed ?? false,
          locked: node?.locked ?? false,
          x: position.x,
          y: position.y,
          width: node?.width ?? DEFAULT_NODE_WIDTH,
          height: node?.height ?? DEFAULT_NODE_HEIGHT,
          rotation: node?.rotation ?? 0,
          zIndex: node?.zIndex ?? state.nodes.length,
          tags: node?.tags ?? [],
          metadata: node?.metadata ?? {},
        }
        set((draft) => {
          draft.nodes.push(newNode)
        })
        return newNode
      },

      updateNode: (id, updates) => set((draft) => {
        const idx = draft.nodes.findIndex((n) => n.id === id)
        if (idx !== -1) {
          Object.assign(draft.nodes[idx], updates)
        }
      }),

      removeNode: (id) => set((draft) => {
        draft.nodes = draft.nodes.filter((n) => n.id !== id)
        draft.edges = draft.edges.filter((e) => e.sourceId !== id && e.targetId !== id)
        draft.selectedNodeIds = draft.selectedNodeIds.filter((nid) => nid !== id)
        draft.selectedEdgeIds = draft.selectedEdgeIds.filter((eid) => {
          const edge = draft.edges.find((e) => e.id === eid)
          return edge !== undefined
        })
      }),

      moveNode: (id, x, y) => set((draft) => {
        const node = draft.nodes.find((n) => n.id === id)
        if (node) {
          node.x = x
          node.y = y
        }
      }),

      resizeNode: (id, width, height) => set((draft) => {
        const node = draft.nodes.find((n) => n.id === id)
        if (node) {
          node.width = width
          node.height = height
        }
      }),

      duplicateNodes: (ids) => set((draft) => {
        const originals = draft.nodes.filter((n) => ids.includes(n.id))
        const copies: Node[] = originals.map((n) => ({
          ...n,
          id: generateId(),
          title: `${n.title} (copy)`,
          x: n.x + 50,
          y: n.y + 50,
          zIndex: draft.nodes.length,
          locked: false,
        }))
        draft.nodes.push(...copies)
        draft.selectedNodeIds = copies.map((n) => n.id)
        draft.selectedEdgeIds = []
      }),

      setNodes: (nodes) => set((draft) => {
        draft.nodes = nodes
      }),

      toggleCollapse: (id) => set((draft) => {
        const node = draft.nodes.find((n) => n.id === id)
        if (node) {
          node.collapsed = !node.collapsed
        }
      }),

      toggleLock: (id) => set((draft) => {
        const node = draft.nodes.find((n) => n.id === id)
        if (node) {
          node.locked = !node.locked
        }
      }),

      reparentNode: (nodeId, newParentId) => set((draft) => {
        const node = draft.nodes.find((n) => n.id === nodeId)
        if (node) {
          node.parentId = newParentId
        }
      }),

      addEdge: (edge) => {
        const state = get()
        const newEdge: Edge = {
          id: edge?.id ?? generateEdgeId(),
          boardId: edge?.boardId ?? state.boardId ?? '',
          sourceId: edge?.sourceId ?? '',
          targetId: edge?.targetId ?? '',
          type: edge?.type ?? 'bezier',
          style: edge?.style ?? 'solid',
          arrowEnd: edge?.arrowEnd ?? true,
          arrowStart: edge?.arrowStart ?? false,
          label: edge?.label ?? '',
          color: edge?.color ?? '#64748B',
          animated: edge?.animated ?? false,
          metadata: edge?.metadata ?? {},
        }
        set((draft) => {
          draft.edges.push(newEdge)
        })
        return newEdge
      },

      updateEdge: (id, updates) => set((draft) => {
        const idx = draft.edges.findIndex((e) => e.id === id)
        if (idx !== -1) {
          Object.assign(draft.edges[idx], updates)
        }
      }),

      removeEdge: (id) => set((draft) => {
        draft.edges = draft.edges.filter((e) => e.id !== id)
        draft.selectedEdgeIds = draft.selectedEdgeIds.filter((eid) => eid !== id)
      }),

      setEdges: (edges) => set((draft) => {
        draft.edges = edges
      }),

      setViewport: (viewport) => set((draft) => {
        Object.assign(draft.viewport, viewport)
      }),

      zoomIn: () => set((draft) => {
        const z = Math.min(draft.viewport.zoom * 1.2, ZOOM_MAX)
        draft.viewport.zoom = z
      }),

      zoomOut: () => set((draft) => {
        const z = Math.max(draft.viewport.zoom / 1.2, ZOOM_MIN)
        draft.viewport.zoom = z
      }),

      zoomTo: (zoom) => set((draft) => {
        draft.viewport.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoom))
      }),

      zoomToFit: () => set((draft) => {
        if (draft.nodes.length === 0) {
          draft.viewport = { x: 0, y: 0, zoom: ZOOM_DEFAULT }
          return
        }
        const minX = Math.min(...draft.nodes.map((n) => n.x))
        const minY = Math.min(...draft.nodes.map((n) => n.y))
        const maxX = Math.max(...draft.nodes.map((n) => n.x + n.width))
        const maxY = Math.max(...draft.nodes.map((n) => n.y + n.height))
        const width = maxX - minX
        const height = maxY - minY
        const centerX = (minX + maxX) / 2
        const centerY = (minY + maxY) / 2
        const containerWidth = 1200
        const containerHeight = 800
        const padding = 100
        const zoom = Math.min(
          (containerWidth - padding * 2) / (width || 1),
          (containerHeight - padding * 2) / (height || 1),
          ZOOM_MAX,
        )
        draft.viewport = {
          x: -centerX * zoom + containerWidth / 2,
          y: -centerY * zoom + containerHeight / 2,
          zoom: Math.max(ZOOM_MIN, zoom),
        }
      }),

      selectNode: (id, addToSelection = false) => set((draft) => {
        if (addToSelection) {
          const idx = draft.selectedNodeIds.indexOf(id)
          if (idx === -1) {
            draft.selectedNodeIds.push(id)
          } else {
            draft.selectedNodeIds.splice(idx, 1)
          }
        } else {
          draft.selectedNodeIds = [id]
        }
        draft.selectedEdgeIds = []
      }),

      selectEdge: (id, addToSelection = false) => set((draft) => {
        if (addToSelection) {
          const idx = draft.selectedEdgeIds.indexOf(id)
          if (idx === -1) {
            draft.selectedEdgeIds.push(id)
          } else {
            draft.selectedEdgeIds.splice(idx, 1)
          }
        } else {
          draft.selectedEdgeIds = [id]
        }
        draft.selectedNodeIds = []
      }),

      selectAll: () => set((draft) => {
        draft.selectedNodeIds = draft.nodes.map((n) => n.id)
        draft.selectedEdgeIds = draft.edges.map((e) => e.id)
      }),

      clearSelection: () => set((draft) => {
        draft.selectedNodeIds = []
        draft.selectedEdgeIds = []
      }),

      selectNodesInRect: (rect) => set((draft) => {
        draft.selectedNodeIds = draft.nodes
          .filter((n) => {
            const overlap = !(
              n.x + n.width < rect.x ||
              n.x > rect.x + rect.width ||
              n.y + n.height < rect.y ||
              n.y > rect.y + rect.height
            )
            return overlap
          })
          .map((n) => n.id)
        draft.selectedEdgeIds = []
      }),

      pushSnapshot: () => {
        const state = get()
        const snapshot: CanvasSnapshot = {
          nodes: JSON.parse(JSON.stringify(state.nodes)),
          edges: JSON.parse(JSON.stringify(state.edges)),
          viewport: { ...state.viewport },
        }
        set((draft) => {
          draft.undoStack.push(snapshot)
          if (draft.undoStack.length > 50) {
            draft.undoStack.shift()
          }
          draft.redoStack = []
        })
      },

      undo: () => {
        const state = get()
        if (state.undoStack.length === 0) return
        const snapshot = state.undoStack[state.undoStack.length - 1]
        const currentSnapshot: CanvasSnapshot = {
          nodes: JSON.parse(JSON.stringify(state.nodes)),
          edges: JSON.parse(JSON.stringify(state.edges)),
          viewport: { ...state.viewport },
        }
        set((draft) => {
          draft.redoStack.push(currentSnapshot)
          draft.undoStack.pop()
          draft.nodes = JSON.parse(JSON.stringify(snapshot.nodes))
          draft.edges = JSON.parse(JSON.stringify(snapshot.edges))
          draft.viewport = { ...snapshot.viewport }
          draft.selectedNodeIds = []
          draft.selectedEdgeIds = []
        })
      },

      redo: () => {
        const state = get()
        if (state.redoStack.length === 0) return
        const snapshot = state.redoStack[state.redoStack.length - 1]
        const currentSnapshot: CanvasSnapshot = {
          nodes: JSON.parse(JSON.stringify(state.nodes)),
          edges: JSON.parse(JSON.stringify(state.edges)),
          viewport: { ...state.viewport },
        }
        set((draft) => {
          draft.undoStack.push(currentSnapshot)
          draft.redoStack.pop()
          draft.nodes = JSON.parse(JSON.stringify(snapshot.nodes))
          draft.edges = JSON.parse(JSON.stringify(snapshot.edges))
          draft.viewport = { ...snapshot.viewport }
          draft.selectedNodeIds = []
          draft.selectedEdgeIds = []
        })
      },

      setInteractionMode: (mode) => set((draft) => {
        draft.interactionMode = mode
      }),

      setPanning: (isPanning) => set((draft) => {
        draft.isPanning = isPanning
      }),

      setDragging: (isDragging) => set((draft) => {
        draft.isDragging = isDragging
      }),

      setBoard: (id, title) => set((draft) => {
        draft.boardId = id
        draft.boardTitle = title
      }),

      clearBoard: () => set((draft) => {
        draft.nodes = []
        draft.edges = []
        draft.viewport = { x: 0, y: 0, zoom: ZOOM_DEFAULT }
        draft.selectedNodeIds = []
        draft.selectedEdgeIds = []
        draft.boardId = null
        draft.boardTitle = ''
        draft.undoStack = []
        draft.redoStack = []
      }),

      loadBoard: (nodes, edges) => set((draft) => {
        draft.nodes = nodes
        draft.edges = edges
        draft.selectedNodeIds = []
        draft.selectedEdgeIds = []
        draft.undoStack = []
        draft.redoStack = []
      }),
    })),
    { name: 'canvas-store' },
  ),
)
