import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RightPanelTab, Toast } from '@/types'
import { generateId } from '@/lib/utils'
import { THEME_STORAGE_KEY } from '@/lib/constants'

export interface UIStore {
  sidebarOpen: boolean
  sidebarWidth: number
  rightPanelOpen: boolean
  rightPanelTab: RightPanelTab
  activeModal: string | null
  modalData: unknown
  searchOpen: boolean
  searchQuery: string
  theme: 'light' | 'dark' | 'system'
  effectiveTheme: 'light' | 'dark'
  toasts: Toast[]

  toggleSidebar: () => void
  setSidebarWidth: (width: number) => void
  openRightPanel: (tab?: RightPanelTab) => void
  closeRightPanel: () => void
  openModal: (name: string, data?: unknown) => void
  closeModal: () => void
  openSearch: () => void
  closeSearch: () => void
  setSearchQuery: (query: string) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      sidebarWidth: 320,
      rightPanelOpen: false,
      rightPanelTab: 'none' as RightPanelTab,
      activeModal: null,
      modalData: null,
      searchOpen: false,
      searchQuery: '',
      theme: 'system',
      effectiveTheme: 'light',
      toasts: [] as Toast[],

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarWidth: (width) => set({ sidebarWidth: width }),

      openRightPanel: (tab) => set({
        rightPanelOpen: true,
        rightPanelTab: tab ?? 'properties',
      }),

      closeRightPanel: () => set({
        rightPanelOpen: false,
        rightPanelTab: 'none',
      }),

      openModal: (name, data) => set({
        activeModal: name,
        modalData: data,
      }),

      closeModal: () => set({
        activeModal: null,
        modalData: null,
      }),

      openSearch: () => set({ searchOpen: true }),

      closeSearch: () => set({
        searchOpen: false,
        searchQuery: '',
      }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setTheme: (theme) => {
        const effectiveTheme = theme === 'system' ? getSystemTheme() : theme
        set({ theme, effectiveTheme })
      },

      addToast: (toast) => {
        const id = generateId()
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }))
        if (toast.duration > 0) {
          setTimeout(() => {
            const current = get().toasts
            if (current.some((t) => t.id === id)) {
              get().removeToast(id)
            }
          }, toast.duration)
        }
      },

      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      })),
    }),
    {
      name: THEME_STORAGE_KEY,
      partialize: (state) => ({
        theme: state.theme,
        sidebarWidth: state.sidebarWidth,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<UIStore>),
        effectiveTheme:
          (persisted as Partial<UIStore>).theme === 'system'
            ? getSystemTheme()
            : ((persisted as Partial<UIStore>).theme as 'light' | 'dark') ?? 'light',
      }),
    },
  ),
)
