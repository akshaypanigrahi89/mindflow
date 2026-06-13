import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { nanoid } from 'nanoid'
import type { Viewport, Node, NodeShape } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return nanoid()
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= ms) {
      lastTime = now
      fn(...args)
    }
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function getShapePath(shape: NodeShape, width: number, height: number): string {
  const w = width
  const h = height
  const cx = w / 2
  const cy = h / 2
  const r = Math.min(cx, cy)

  switch (shape) {
    case 'roundedRectangle': {
      const r2 = Math.min(w, h) * 0.2
      return `M ${r2} 0 L ${w - r2} 0 Q ${w} 0 ${w} ${r2} L ${w} ${h - r2} Q ${w} ${h} ${w - r2} ${h} L ${r2} ${h} Q 0 ${h} 0 ${h - r2} L 0 ${r2} Q 0 0 ${r2} 0 Z`
    }
    case 'rectangle':
      return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`
    case 'circle':
      return `M ${cx} 0 A ${r} ${r} 0 1 1 ${cx - 0.001} 0 Z`
    case 'ellipse':
      return `M ${cx} 0 C ${cx + r * 1.2} 0 ${w} ${cy - r * 0.6} ${w} ${cy} C ${w} ${cy + r * 0.6} ${cx + r * 1.2} ${h} ${cx} ${h} C ${cx - r * 1.2} ${h} 0 ${cy + r * 0.6} 0 ${cy} C 0 ${cy - r * 0.6} ${cx - r * 1.2} 0 ${cx} 0 Z`
    case 'diamond':
      return `M ${cx} 0 L ${w} ${cy} L ${cx} ${h} L 0 ${cy} Z`
    case 'hexagon': {
      const hx = w * 0.25
      return `M ${hx} 0 L ${w - hx} 0 L ${w} ${cy} L ${w - hx} ${h} L ${hx} ${h} L 0 ${cy} Z`
    }
    case 'triangle':
      return `M ${cx} 0 L ${w} ${h} L 0 ${h} Z`
    case 'star': {
      const outerR = r
      const innerR = r * 0.4
      const points: string[] = []
      for (let i = 0; i < 5; i++) {
        const outerAngle = (Math.PI / 2) * 3 + (i * 2 * Math.PI) / 5
        points.push(`${cx + outerR * Math.cos(outerAngle)},${cy + outerR * Math.sin(outerAngle)}`)
        const innerAngle = (Math.PI / 2) * 3 + ((i + 0.5) * 2 * Math.PI) / 5
        points.push(`${cx + innerR * Math.cos(innerAngle)},${cy + innerR * Math.sin(innerAngle)}`)
      }
      return `M ${points.join(' L ')} Z`
    }
    case 'stickyNote': {
      const fold = Math.min(w, h) * 0.2
      return `M 0 0 L ${w - fold} 0 L ${w} ${fold} L ${w} ${h} L 0 ${h} Z`
    }
    case 'cloud': {
      const cScale = 0.3
      const cR = r * cScale
      return `M ${cx + r * 0.2} ${cy - r * 0.7} C ${cx + r * 0.6} ${cy - r * 0.8} ${cx + r * 0.8} ${cy - r * 0.4} ${cx + r * 0.7} ${cy - r * 0.1} C ${w - cR * 0.5} ${cy - r * 0.3} ${w} ${cy + r * 0.1} ${w - cR} ${cy + r * 0.3} C ${w - cR * 0.3} ${cy + r * 0.7} ${cx + r * 0.5} ${cy + r * 0.8} ${cx + r * 0.2} ${cy + r * 0.6} C ${cx + r * 0.3} ${cy + r * 0.9} ${cx - r * 0.3} ${cy + r * 0.9} ${cx - r * 0.2} ${cy + r * 0.6} C ${cx - r * 0.7} ${cy + r * 0.8} ${w * -0.1} ${cy + r * 0.5} ${cR * 0.5} ${cy + r * 0.3} C ${w * -0.1} ${cy + r * 0.1} ${cx - r * 0.5} ${cy - r * 0.3} ${cx - r * 0.4} ${cy - r * 0.1} C ${cx - r * 0.7} ${cy - r * 0.4} ${cx - r * 0.4} ${cy - r * 0.8} ${cx - r * 0.1} ${cy - r * 0.7} Z`
    }
    default:
      return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`
  }
}

export function getDefaultNodePosition(
  viewport: Viewport,
  nodes: Node[]
): { x: number; y: number } {
  const offset = nodes.length * 40
  const x = (-viewport.x + viewport.zoom * 400) / viewport.zoom + offset
  const y = (-viewport.y + viewport.zoom * 300) / viewport.zoom + offset
  return { x, y }
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
