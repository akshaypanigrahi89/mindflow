'use client'

import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Settings, MessageSquare, Activity } from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { NodeProperties } from './node-properties'
import { CommentsPanel } from './comments-panel'

const tabs = [
  { id: 'properties', label: 'Properties', icon: Settings },
  { id: 'comments', label: 'Comments', icon: MessageSquare },
  { id: 'history', label: 'Activity', icon: Activity },
] as const

export function RightPanel() {
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen)
  const rightPanelTab = useUIStore((s) => s.rightPanelTab)
  const openRightPanel = useUIStore((s) => s.openRightPanel)
  const closeRightPanel = useUIStore((s) => s.closeRightPanel)

  const activeTab = rightPanelTab === 'none' ? 'properties' : rightPanelTab

  const handleTabChange = useCallback(
    (value: string) => {
      openRightPanel(value as 'properties' | 'comments' | 'history')
    },
    [openRightPanel],
  )

  return (
    <AnimatePresence>
      {rightPanelOpen && (
        <motion.aside
          key="right-panel"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="fixed right-0 top-0 z-40 flex h-full flex-col border-l border-border/50 bg-background/80 backdrop-blur-xl overflow-hidden"
        >
          <div className="flex shrink-0 items-center px-3 py-2.5">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1">
              <TabsList className="w-full">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <TabsTrigger key={tab.id} value={tab.id} className="flex-1 gap-1.5">
                      <Icon className="size-3.5" />
                      <span className="text-xs">{tab.label}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={closeRightPanel}
              className="ml-1 shrink-0"
              aria-label="Close panel"
            >
              <X className="size-4" />
            </Button>
          </div>

          <Separator />

          <ScrollArea className="flex-1">
            <div className="p-3 pt-3">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsContent value="properties" className="m-0">
                  <NodeProperties />
                </TabsContent>
                <TabsContent value="comments" className="m-0">
                  <CommentsPanel />
                </TabsContent>
                <TabsContent value="history" className="m-0">
                  <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <Activity className="size-8 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground">No recent activity</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
