'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  MessageSquare,
  Reply,
  CheckCircle2,
  Circle,
  Send,
} from 'lucide-react'
import { useCanvasStore } from '@/stores/canvas-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn, formatDate } from '@/lib/utils'
import type { Comment } from '@/types'

const MOCK_USERS: Record<string, { name: string; avatar: string }> = {
  user1: { name: 'Alice Chen', avatar: '' },
  user2: { name: 'Bob Martinez', avatar: '' },
  user3: { name: 'Carol Smith', avatar: '' },
}

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'c1',
    boardId: 'board1',
    nodeId: null,
    authorId: 'user1',
    content: 'What do you think about the layout of this mind map?',
    resolved: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'c2',
    boardId: 'board1',
    nodeId: null,
    authorId: 'user2',
    content: 'I think we should move the main topic to the center.',
    resolved: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'c3',
    boardId: 'board1',
    nodeId: null,
    authorId: 'user1',
    content: 'Good idea! I will update it.',
    resolved: false,
    createdAt: new Date(Date.now() - 900000).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString(),
  },
]

export function CommentsPanel() {
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds)

  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const currentSelectedId = selectedNodeIds.length === 1 ? selectedNodeIds[0] : null

  const rootComments = useMemo(
    () => comments.filter((c) => c.nodeId === null || c.nodeId === currentSelectedId),
    [comments, currentSelectedId],
  )

  const replyComments = useMemo(
    () => comments.filter((c) => !rootComments.includes(c)),
    [comments, rootComments],
  )

  const handleAddComment = useCallback(() => {
    if (!newComment.trim()) return
    const comment: Comment = {
      id: `c${Date.now()}`,
      boardId: 'board1',
      nodeId: currentSelectedId,
      authorId: 'user1',
      content: newComment.trim(),
      resolved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setComments((prev) => [...prev, comment])
    setNewComment('')
  }, [newComment, currentSelectedId])

  const handleResolve = useCallback((commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, resolved: !c.resolved } : c)),
    )
  }, [])

  const handleReply = useCallback(
    (_parentId: string) => {
      if (!replyContent.trim()) return
      const reply: Comment = {
        id: `c${Date.now()}`,
        boardId: 'board1',
        nodeId: currentSelectedId,
        authorId: 'user1',
        content: replyContent.trim(),
        resolved: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setComments((prev) => [...prev, reply])
      setReplyContent('')
      setReplyingTo(null)
    },
    [replyContent, currentSelectedId],
  )

  const getUser = (userId: string) => MOCK_USERS[userId] ?? { name: 'Unknown', avatar: '' }
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  if (rootComments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <MessageSquare className="size-8 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">No comments yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {rootComments.map((comment) => {
        const user = getUser(comment.authorId)
        return (
          <div key={comment.id}>
            <div
              className={cn(
                'rounded-lg border p-3 transition-colors',
                comment.resolved ? 'border-green-500/30 bg-green-500/5' : 'border-border',
              )}
            >
              <div className="flex items-start gap-2.5">
                <Avatar size="sm">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                    {comment.resolved && (
                      <Badge variant="outline" className="h-4 gap-0.5 border-green-500 text-[10px] text-green-600">
                        <CheckCircle2 className="size-2.5" />
                        Resolved
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{comment.content}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="gap-1 text-muted-foreground"
                    >
                      <Reply className="size-3" />
                      Reply
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleResolve(comment.id)}
                      className={cn(
                        'gap-1',
                        comment.resolved ? 'text-green-600' : 'text-muted-foreground',
                      )}
                    >
                      {comment.resolved ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <Circle className="size-3" />
                      )}
                      {comment.resolved ? 'Unresolve' : 'Resolve'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            {replyingTo === comment.id && (
              <div className="ml-8 mt-2 flex gap-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="min-h-0 h-20 text-xs"
                />
                <Button
                  variant="default"
                  size="icon-sm"
                  onClick={() => handleReply(comment.id)}
                  disabled={!replyContent.trim()}
                  className="shrink-0 self-end"
                >
                  <Send className="size-3.5" />
                </Button>
              </div>
            )}
            {replyComments.length > 0 && (
              <div className="ml-8 mt-2 space-y-2">
                {replyComments.map((reply) => {
                  const replyUser = getUser(reply.authorId)
                  return (
                    <div key={reply.id} className="rounded-lg border border-border/50 bg-muted/20 p-2.5">
                      <div className="flex items-start gap-2">
                        <Avatar size="sm">
                          <AvatarImage src={replyUser.avatar} alt={replyUser.name} />
                          <AvatarFallback className="text-[10px]">{getInitials(replyUser.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{replyUser.name}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{reply.content}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      <Separator />

      <div className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-0 h-20 text-xs"
        />
        <Button
          variant="default"
          size="icon-sm"
          onClick={handleAddComment}
          disabled={!newComment.trim()}
          className="shrink-0 self-end"
        >
          <Send className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
