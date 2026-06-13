'use client'

import { useState, useCallback } from 'react'
import {
  Sparkles,
  Wand2,
  Expand,
  LayoutDashboard,
  RotateCcw,
  Plus,
  FileText,
  Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type AiMode = 'generate' | 'expand' | 'summarize'

const MODE_OPTIONS: { id: AiMode; label: string; icon: typeof Sparkles; description: string }[] = [
  { id: 'generate', label: 'Generate Mind Map', icon: Wand2, description: 'Create a new mind map from a prompt' },
  { id: 'expand', label: 'Expand Node', icon: Expand, description: 'Add child nodes to the selected node' },
  { id: 'summarize', label: 'Summarize Board', icon: LayoutDashboard, description: 'Get a summary of the current board' },
]

interface TreeNode {
  id: string
  label: string
  children: TreeNode[]
}

function generateMockTree(mode: AiMode, prompt: string): TreeNode[] {
  const root: TreeNode = {
    id: 'root',
    label: mode === 'summarize' ? 'Board Summary' : prompt || 'New Mind Map',
    children: [
      {
        id: 'c1',
        label: 'Topic 1',
        children: [
          { id: 'c1a', label: 'Subtopic 1.1', children: [] },
          { id: 'c1b', label: 'Subtopic 1.2', children: [] },
        ],
      },
      {
        id: 'c2',
        label: 'Topic 2',
        children: [
          { id: 'c2a', label: 'Subtopic 2.1', children: [] },
        ],
      },
      {
        id: 'c3',
        label: 'Topic 3',
        children: [],
      },
    ],
  }
  return [root]
}

export function AiAssistantDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [mode, setMode] = useState<AiMode>('generate')
  const [prompt, setPrompt] = useState('')
  const [generated, setGenerated] = useState<TreeNode[] | null>(null)
  const [generating, setGenerating] = useState(false)

  const handleGenerate = useCallback(() => {
    if (!prompt.trim() && mode !== 'summarize') return
    setGenerating(true)
    setTimeout(() => {
      setGenerated(generateMockTree(mode, prompt))
      setGenerating(false)
    }, 1500)
  }, [mode, prompt])

  const handleRegenerate = useCallback(() => {
    handleGenerate()
  }, [handleGenerate])

  const handleInsert = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const renderTree = (nodes: TreeNode[], level = 0) => (
    <ul className={cn('space-y-1', level > 0 && 'ml-4 border-l border-border pl-3')}>
      {nodes.map((node) => (
        <li key={node.id}>
          <div className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted/50">
            <FileText className="size-3.5 shrink-0 text-muted-foreground" />
            <span>{node.label}</span>
          </div>
          {node.children.length > 0 && renderTree(node.children, level + 1)}
        </li>
      ))}
    </ul>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-purple-500" />
            AI Assistant
          </DialogTitle>
          <DialogDescription>
            Generate, expand, or summarize your mind map with AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {MODE_OPTIONS.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    setMode(option.id)
                    setGenerated(null)
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-lg border p-2.5 text-center transition-all hover:bg-muted',
                    mode === option.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border',
                  )}
                >
                  <Icon className={cn('size-4', mode === option.id ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="text-[11px] font-medium leading-tight">{option.label}</span>
                </button>
              )
            })}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              {mode === 'generate'
                ? 'Describe the mind map you want to create'
                : mode === 'expand'
                  ? 'Describe how to expand the selected node'
                  : 'Get a summary of the current board'}
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === 'generate'
                  ? 'e.g., A mind map about renewable energy sources...'
                  : mode === 'expand'
                    ? 'e.g., Add subtopics about implementation strategies...'
                    : 'Press generate to summarize the board...'
              }
              rows={3}
              className="text-sm"
            />
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleGenerate}
              disabled={generating || (!prompt.trim() && mode !== 'summarize')}
              className="gap-2"
            >
              {generating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          </div>

          {generated && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Preview</span>
                  <Badge variant="outline" className="text-[10px]">
                    {generated.flatMap((n) => [n, ...n.children.flatMap((c) => [c, ...c.children])]).length} nodes
                  </Badge>
                </div>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-muted/20 p-3">
                  {renderTree(generated)}
                </div>
              </div>
            </>
          )}
        </div>

        {generated && (
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleRegenerate} className="gap-2">
              <RotateCcw className="size-3.5" />
              Regenerate
            </Button>
            <Button onClick={handleInsert} className="gap-2">
              <Plus className="size-3.5" />
              Insert into Board
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
