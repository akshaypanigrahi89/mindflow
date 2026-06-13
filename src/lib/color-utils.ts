export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  const num = parseInt(clean, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function lightenColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex)
  const factor = percent / 100
  const lighten = (v: number) => Math.min(255, Math.round(v + (255 - v) * factor))
  return rgbToHex(lighten(r), lighten(g), lighten(b))
}

export function darkenColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex)
  const factor = percent / 100
  const darken = (v: number) => Math.max(0, Math.round(v * (1 - factor)))
  return rgbToHex(darken(r), darken(g), darken(b))
}

export function getContrastColor(hex: string): '#000000' | '#FFFFFF' {
  const { r, g, b } = hexToRgb(hex)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

export interface GradientPreset {
  name: string
  from: string
  to: string
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  { name: 'Sunset', from: '#FF6B6B', to: '#FFD93D' },
  { name: 'Ocean', from: '#4FACFE', to: '#00F2FE' },
  { name: 'Forest', from: '#43E97B', to: '#38F9D7' },
  { name: 'Midnight', from: '#667EEA', to: '#764BA2' },
  { name: 'Fire', from: '#F12711', to: '#F5AF19' },
  { name: 'Rose', from: '#FF0844', to: '#FFB199' },
  { name: 'Lavender', from: '#B224EF', to: '#7579FF' },
  { name: 'Peach', from: '#F09819', to: '#EDDE5D' },
  { name: 'Frost', from: '#004FF9', to: '#FFF94C' },
  { name: 'Mint', from: '#11998E', to: '#38EF7D' },
]
