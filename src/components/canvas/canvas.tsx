'use client'

import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import {
  ReactFlow,
  Controls,
  type Connection,
  type ReactFlowInstance,
  type OnNodeDrag,
  type NodeChange,
  type NodeTypes,
  SelectionMode,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { MindMapNode } from './mindmap-node'
import { ConnectionLine } from './connection-line'
import { CanvasMiniMap } from './minimap'
import { GridBackground } from './grid-background'
import { useCanvasStore } from '@/stores/canvas-store'
import { DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT } from '@/lib/constants'

const RF_NODE_TYPES: NodeTypes = {
  mindMapNode: MindMapNode as any,
}

export function Canvas() {
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<any, any> | null>(null)
  const [panOnDrag, setPanOnDrag] = useState(false)
  const spacePressed = useRef(false)
  const selectedNodeIdsRef = useRef<string[]>([])
  const nodesRef = useRef(useCanvasStore.getState().nodes)

  const nodes = useCanvasStore((s) => s.nodes)
  const edges = useCanvasStore((s) => s.edges)
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds)
  const selectedEdgeIds = useCanvasStore((s) => s.selectedEdgeIds)
  const hiddenNodeIds = useCanvasStore((s) => s.hiddenNodeIds)
  const moveNode = useCanvasStore((s) => s.moveNode)
  const resizeNode = useCanvasStore((s) => s.resizeNode)
  const removeNode = useCanvasStore((s) => s.removeNode)
  const clearSelection = useCanvasStore((s) => s.clearSelection)
  const addEdge = useCanvasStore((s) => s.addEdge)
  const addNode = useCanvasStore((s) => s.addNode)
  const toggleCollapse = useCanvasStore((s) => s.toggleCollapse)
  const duplicateNodes = useCanvasStore((s) => s.duplicateNodes)
  const undo = useCanvasStore((s) => s.undo)
  const redo = useCanvasStore((s) => s.redo)
  selectedNodeIdsRef.current = selectedNodeIds
  nodesRef.current = nodes

  const visibleNodes = useMemo(() => nodes.filter((n) => !hiddenNodeIds.includes(n.id)), [nodes, hiddenNodeIds])
  const hiddenSet = useMemo(() => new Set(hiddenNodeIds), [hiddenNodeIds])

  // Convert store nodes to React Flow nodes (only visible ones)
  const rfNodes = useMemo(
    () =>
      visibleNodes.map((n) => ({
        id: n.id,
        type: 'mindMapNode' as const,
        position: { x: n.x, y: n.y },
        data: {
          title: n.title,
          description: n.description,
          emoji: n.emoji,
          icon: n.icon,
          color: n.color,
          shape: n.shape,
          collapsed: n.collapsed,
          locked: n.locked,
          tags: n.tags,
          childCount: nodes.filter((c) => c.parentId === n.id).length,
          commentCount: 0,
          reactionCount: 0,
        },
        width: n.width,
        height: n.height,
        zIndex: n.zIndex,
        selected: selectedNodeIds.includes(n.id),
      })),
    [nodes, selectedNodeIds],
  )

  const rfEdges = useMemo(
    () =>
      edges
        .filter((e) => !hiddenSet.has(e.sourceId) && !hiddenSet.has(e.targetId))
        .map((e) => ({
          id: e.id,
          source: e.sourceId,
          target: e.targetId,
          type: e.type,
          animated: e.animated,
          style: {
            stroke: e.color,
            strokeWidth: 2,
            strokeDasharray:
              e.style === 'dashed' ? '5,5' : e.style === 'dotted' ? '2,2' : undefined,
          },
          label: e.label || undefined,
          selected: selectedEdgeIds.includes(e.id),
        })),
    [edges, selectedEdgeIds, hiddenSet],
  )

  const onNodeDrag = useCallback<OnNodeDrag>(
    (_e, node) => {
      moveNode(node.id, node.position.x, node.position.y)
    },
    [moveNode],
  )

  const onNodeDragStop = useCallback<OnNodeDrag>(
    (_e, node) => {
      moveNode(node.id, node.position.x, node.position.y)
    },
    [moveNode],
  )

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      for (const change of changes) {
        if (change.type === 'dimensions') {
          resizeNode(change.id, change.dimensions?.width ?? 0, change.dimensions?.height ?? 0)
        }
      }
    },
    [resizeNode],
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return
      addEdge({ sourceId: connection.source, targetId: connection.target })
    },
    [addEdge],
  )

  const onInit = useCallback((instance: ReactFlowInstance<any, any>) => {
    setReactFlowInstance(instance)
  }, [])

  const onDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!reactFlowInstance) return
      const target = event.target as HTMLElement
      if (target.closest('.react-flow__node')) return
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      addNode({
        title: 'New Node',
        x: position.x - DEFAULT_NODE_WIDTH / 2,
        y: position.y - DEFAULT_NODE_HEIGHT / 2,
      })
    },
    [addNode, reactFlowInstance],
  )

  useEffect(() => {
    const unsub = useCanvasStore.subscribe((s) => {
      if (s.viewport) {
        reactFlowInstance?.setViewport(
          { x: s.viewport.x, y: s.viewport.y, zoom: s.viewport.zoom },
          { duration: 0 },
        )
      }
    })
    return unsub
  }, [reactFlowInstance])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, [contenteditable]')) return

      const isMod = e.metaKey || e.ctrlKey

      if (e.code === 'Space') {
        e.preventDefault()
        spacePressed.current = true
        setPanOnDrag(true)
        return
      }

      if (e.code === 'Escape') {
        clearSelection()
        return
      }

      if (e.code === 'Delete' || e.code === 'Backspace') {
        const ids = selectedNodeIdsRef.current
        if (ids.length > 0) {
          e.preventDefault()
          ids.forEach((id) => removeNode(id))
          clearSelection()
        }
        return
      }

      if (isMod && e.code === 'KeyZ' && e.shiftKey) {
        e.preventDefault()
        redo()
        return
      }

      if (isMod && e.code === 'KeyZ') {
        e.preventDefault()
        undo()
        return
      }

      if (isMod && e.code === 'KeyD') {
        e.preventDefault()
        if (selectedNodeIdsRef.current.length > 0) {
          duplicateNodes(selectedNodeIdsRef.current)
        }
        return
      }

      if (!isMod && e.code === 'KeyN' && !e.shiftKey) {
        if (!reactFlowInstance) return
        const viewportCenter = reactFlowInstance.screenToFlowPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        })
        addNode({
          title: 'New Node',
          x: viewportCenter.x - DEFAULT_NODE_WIDTH / 2,
          y: viewportCenter.y - DEFAULT_NODE_HEIGHT / 2,
        })
        return
      }

      if (e.code === 'Tab') {
        e.preventDefault()
        const currentNodes = nodesRef.current
        const selected = selectedNodeIdsRef.current
        const parentNode = currentNodes.find((n) => selected.includes(n.id))
        if (parentNode) {
          if (parentNode.collapsed) {
            toggleCollapse(parentNode.id)
          }
          const siblings = currentNodes.filter((n) => n.parentId === parentNode.id)
          addNode({
            title: 'Child Node',
            parentId: parentNode.id,
            x: parentNode.x + 250,
            y: parentNode.y + siblings.length * 80,
          })
        }
        return
      }

      if (!isMod && e.code === 'Enter') {
        const currentNodes = nodesRef.current
        const selected = selectedNodeIdsRef.current
        const node = currentNodes.find((n) => selected.includes(n.id))
        if (node) {
          const siblings = currentNodes.filter(
            (n) => n.parentId === node.parentId && n.id !== node.id,
          )
          addNode({
            title: 'Sibling Node',
            parentId: node.parentId,
            x: node.x,
            y: node.y + 150 + siblings.length * 20,
          })
        }
        return
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spacePressed.current = false
        setPanOnDrag(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [
    clearSelection,
    removeNode,
    undo,
    redo,
    duplicateNodes,
    addNode,
    reactFlowInstance,
  ])

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={RF_NODE_TYPES}
        connectionLineComponent={ConnectionLine}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onInit={onInit}
        onDoubleClick={onDoubleClick}
        panOnDrag={panOnDrag}
        panOnScroll={false}
        zoomOnScroll
        zoomOnDoubleClick={false}
        minZoom={0.1}
        maxZoom={4}
        nodesDraggable
        selectionMode={SelectionMode.Partial}
        multiSelectionKeyCode="Shift"
        deleteKeyCode={null}
      >
        <Controls className="!rounded-lg !border !border-border !bg-background/80 !shadow-lg !backdrop-blur-md" />
        <CanvasMiniMap />
        <GridBackground />
      </ReactFlow>
    </div>
  )
}
