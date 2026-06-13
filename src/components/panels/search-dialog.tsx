'use client'

import { useCallback, useMemo, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, MessageSquare, Tags, Hash } from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useCanvasStore } from '@/stores/canvas-store'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Node } from '@/types'

interface SearchResult {
  type: 'node' | 'comment' | 'tag'
  id: string
  title: string
  parentPath: string
  matchText: string
  node: Node
}

export function SearchDialog() {
  const router = useRouter()
  const searchOpen = useUIStore((s) => s.searchOpen)
  const searchQuery = useUIStore((s) => s.searchQuery)
  const openSearch = useUIStore((s) => s.openSearch)
  const closeSearch = useUIStore((s) => s.closeSearch)
  const setSearchQuery = useUIStore((s) => s.setSearchQuery)
  const nodes = useCanvasStore((s) => s.nodes)
  const selectNode = useCanvasStore((s) => s.selectNode)

  const [filterType, setFilterType] = useState<'all' | 'nodes' | 'comments' | 'tags'>('all')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        openSearch()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openSearch])

  const getNodePath = useCallback(
    (nodeId: string): string => {
      const parts: string[] = []
      let current = nodes.find((n) => n.id === nodeId)
      while (current) {
        parts.unshift(current.title)
        current = current.parentId ? nodes.find((n) => n.id === current!.parentId) : undefined
      }
      return parts.join(' / ')
    },
    [nodes],
  )

  const results = useMemo<SearchResult[]>(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    const results: SearchResult[] = []

    for (const node of nodes) {
      if (node.title.toLowerCase().includes(q)) {
        results.push({
          type: 'node',
          id: node.id,
          title: node.title,
          parentPath: getNodePath(node.id),
          matchText: node.description,
          node,
        })
      }
      if (node.description.toLowerCase().includes(q)) {
        results.push({
          type: 'node',
          id: `desc-${node.id}`,
          title: node.title,
          parentPath: getNodePath(node.id),
          matchText: node.description,
          node,
        })
      }
      const matchingTags = node.tags.filter((t) => t.toLowerCase().includes(q))
      for (const tag of matchingTags) {
        results.push({
          type: 'tag',
          id: `tag-${node.id}-${tag}`,
          title: tag,
          parentPath: node.title,
          matchText: `Tag in "${node.title}"`,
          node,
        })
      }
    }

    if (filterType === 'nodes') return results.filter((r) => r.type === 'node')
    if (filterType === 'tags') return results.filter((r) => r.type === 'tag')
    if (filterType === 'comments') return []
    return results
  }, [searchQuery, nodes, filterType, getNodePath])

  const handleSelect = useCallback(
    (result: SearchResult) => {
      selectNode(result.node.id)
      closeSearch()
    },
    [selectNode, closeSearch],
  )

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) closeSearch()
    },
    [closeSearch],
  )

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark className="rounded bg-yellow-200/60 px-0.5 text-foreground dark:bg-yellow-500/30">
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    )
  }

  return (
    <CommandDialog
      open={searchOpen}
      onOpenChange={handleOpenChange}
      title="Search"
      description="Search nodes, comments, and tags"
    >
      <CommandInput
        value={searchQuery}
        onValueChange={setSearchQuery}
        placeholder="Search nodes, comments, tags..."
      />
      <div className="flex gap-1 px-3 pb-1.5">
        {(['all', 'nodes', 'tags'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={cn(
              'rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors capitalize',
              filterType === type
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {type === 'nodes' ? 'Nodes' : type === 'tags' ? 'Tags' : 'All'}
          </button>
        ))}
      </div>
      <CommandList>
        <CommandEmpty>No results found</CommandEmpty>
        <CommandGroup heading="Results">
          {results.map((result) => (
            <CommandItem
              key={result.id}
              onSelect={() => handleSelect(result)}
              value={`${result.title} ${result.matchText}`}
              className="flex items-start gap-2.5"
            >
              <div className="mt-0.5 shrink-0">
                {result.type === 'tag' ? (
                  <Hash className="size-4 text-muted-foreground" />
                ) : (
                  <FileText className="size-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">
                    {highlightMatch(result.title, searchQuery)}
                  </span>
                  <Badge variant="outline" className="h-4 text-[10px] capitalize">
                    {result.type === 'tag' ? 'Tag' : 'Node'}
                  </Badge>
                </div>
                {result.parentPath && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                    {result.parentPath}
                  </p>
                )}
                {result.matchText && result.type !== 'tag' && (
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                    {highlightMatch(result.matchText, searchQuery)}
                  </p>
                )}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
