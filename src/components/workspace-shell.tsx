'use client'

import { useState, useCallback } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { CanvasToolbar } from '@/components/layout/canvas-toolbar'
import { FloatingToolbar } from '@/components/layout/floating-toolbar'
import { ContextMenu } from '@/components/layout/context-menu'
import { Canvas } from '@/components/canvas/canvas'
import { RightPanel } from '@/components/panels/right-panel'
import { SearchDialog } from '@/components/panels/search-dialog'
import { ShareDialog } from '@/components/panels/share-dialog'
import { AiAssistantDialog } from '@/components/panels/ai-assistant-dialog'
import { useUIStore } from '@/stores/ui-store'

export function WorkspaceShell() {
  const [shareOpen, setShareOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)

  const activeModal = useUIStore((s) => s.activeModal)
  const openModal = useUIStore((s) => s.openModal)
  const closeModal = useUIStore((s) => s.closeModal)

  const handleShareOpen = useCallback(() => {
    setShareOpen(true)
  }, [])

  const handleShareClose = useCallback(
    (open: boolean) => {
      setShareOpen(open)
    },
    [],
  )

  const handleAiOpen = useCallback(() => {
    setAiOpen(true)
  }, [])

  const handleAiClose = useCallback(
    (open: boolean) => {
      setAiOpen(open)
    },
    [],
  )

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      <ContextMenu />
      <Sidebar />
      <main className="relative flex flex-1 flex-col overflow-hidden">
        <CanvasToolbar />
        <div className="flex flex-1">
          <div className="relative flex-1">
            <Canvas />
            <FloatingToolbar />
          </div>
          <RightPanel />
        </div>
      </main>
      <SearchDialog />
      <ShareDialog open={shareOpen} onOpenChange={handleShareClose} />
      <AiAssistantDialog open={aiOpen} onOpenChange={handleAiClose} />
    </div>
  )
}
