export type NodeShape =
  | 'roundedRectangle'
  | 'rectangle'
  | 'circle'
  | 'ellipse'
  | 'diamond'
  | 'hexagon'
  | 'triangle'
  | 'star'
  | 'stickyNote'
  | 'cloud'

export type EdgeType = 'straight' | 'curved' | 'orthogonal' | 'bezier'

export type EdgeStyle = 'solid' | 'dashed' | 'dotted'

export type WorkspaceRole = 'owner' | 'editor' | 'viewer' | 'commenter'

export type InteractionMode = 'select' | 'pan' | 'connect' | 'draw'

export type RightPanelTab = 'none' | 'properties' | 'comments' | 'history' | 'sharing'

export interface Viewport {
  x: number
  y: number
  zoom: number
}

export interface Node {
  id: string
  boardId: string
  parentId: string | null
  title: string
  description: string
  emoji: string | null
  icon: string | null
  color: string
  shape: NodeShape
  collapsed: boolean
  locked: boolean
  x: number
  y: number
  width: number
  height: number
  rotation: number
  zIndex: number
  tags: string[]
  metadata: Record<string, unknown>
}

export interface Edge {
  id: string
  boardId: string
  sourceId: string
  targetId: string
  type: EdgeType
  style: EdgeStyle
  arrowEnd: boolean
  arrowStart: boolean
  label: string
  color: string
  animated: boolean
  metadata: Record<string, unknown>
}

export interface Board {
  id: string
  workspaceId: string
  title: string
  description: string
  viewport: Viewport
  nodes: Node[]
  edges: Edge[]
  createdAt: string
  updatedAt: string
}

export interface Workspace {
  id: string
  name: string
  description: string
  boards: Board[]
  members: WorkspaceMember[]
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  boardId: string
  nodeId: string | null
  authorId: string
  content: string
  resolved: boolean
  createdAt: string
  updatedAt: string
}

export interface Activity {
  id: string
  boardId: string
  userId: string
  action: string
  targetType: string
  targetId: string
  details: Record<string, unknown>
  createdAt: string
}

export interface Snapshot {
  id: string
  boardId: string
  label: string
  nodes: Node[]
  edges: Edge[]
  viewport: Viewport
  createdAt: string
}

export interface WorkspaceMember {
  id: string
  workspaceId: string
  userId: string
  role: WorkspaceRole
  joinedAt: string
}

export interface CursorData {
  x: number
  y: number
  userId: string
  userName: string
  userColor: string
  lastUpdated: number
}

export interface OtherUser {
  id: string
  name: string
  color: string
  cursor: CursorData | null
}

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration: number
}

export interface SharingSettings {
  linkAccess: 'restricted' | 'anyone' | 'workspace'
  allowEditing: boolean
  allowComments: boolean
  allowCopy: boolean
  expiresAt: string | null
  password: string | null
}

export interface CanvasSnapshot {
  nodes: Node[]
  edges: Edge[]
  viewport: Viewport
}
