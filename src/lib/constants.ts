import type { NodeShape } from '@/types'

export const DEFAULT_NODE_WIDTH = 200
export const DEFAULT_NODE_HEIGHT = 120
export const ZOOM_MIN = 0.1
export const ZOOM_MAX = 4
export const ZOOM_DEFAULT = 1
export const GRID_SIZES = [10, 20, 40, 80, 160]
export const THEME_STORAGE_KEY = 'mindflow-theme'
export const BOARD_STORAGE_KEY = 'mindflow-board'

export const COLORS = [
  '#4F46E5',
  '#7C3AED',
  '#EC4899',
  '#EF4444',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#14B8A6',
  '#06B6D4',
  '#3B82F6',
  '#6366F1',
  '#A855F7',
  '#78716C',
  '#64748B',
] as const

export const SHAPES: NodeShape[] = [
  'roundedRectangle',
  'rectangle',
  'circle',
  'ellipse',
  'diamond',
  'hexagon',
  'triangle',
  'star',
  'stickyNote',
  'cloud',
]

export const SHORTCUTS: Record<string, string> = {
  'Space': 'Activate pan mode',
  'V': 'Select tool',
  'B': 'Draw connection',
  'D': 'Draw node',
  'Delete': 'Delete selected',
  'Backspace': 'Delete selected',
  'Escape': 'Deselect / Cancel',
  'Ctrl+Z': 'Undo',
  'Ctrl+Shift+Z': 'Redo',
  'Ctrl+C': 'Copy',
  'Ctrl+X': 'Cut',
  'Ctrl+V': 'Paste',
  'Ctrl+A': 'Select all',
  'Ctrl+D': 'Duplicate',
  'Ctrl++': 'Zoom in',
  'Ctrl+-': 'Zoom out',
  'Ctrl+0': 'Reset zoom',
  'Ctrl+S': 'Save board',
  'Ctrl+F': 'Search nodes',
  'Ctrl+Shift+L': 'Toggle sidebar',
  'Ctrl+Shift+F': 'Toggle fullscreen',
  'ArrowUp': 'Move selected up',
  'ArrowDown': 'Move selected down',
  'ArrowLeft': 'Move selected left',
  'ArrowRight': 'Move selected right',
} as const
