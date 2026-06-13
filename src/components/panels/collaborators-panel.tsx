'use client'

import { Users, Circle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface Collaborator {
  id: string
  name: string
  avatar: string
  status: 'online' | 'idle'
  cursorColor: string
}

const MOCK_COLLABORATORS: Collaborator[] = [
  { id: 'u1', name: 'Alice Chen', avatar: '', status: 'online', cursorColor: '#4F46E5' },
  { id: 'u2', name: 'Bob Martinez', avatar: '', status: 'online', cursorColor: '#22C55E' },
  { id: 'u3', name: 'Carol Smith', avatar: '', status: 'idle', cursorColor: '#F97316' },
  { id: 'u4', name: 'David Kim', avatar: '', status: 'online', cursorColor: '#EC4899' },
]

export function CollaboratorsPanel() {
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  if (MOCK_COLLABORATORS.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <Users className="size-8 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">No one else is here</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {MOCK_COLLABORATORS.map((collaborator) => (
        <div
          key={collaborator.id}
          className="flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/50"
        >
          <div className="relative">
            <Avatar size="sm">
              <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
              <AvatarFallback>{getInitials(collaborator.name)}</AvatarFallback>
            </Avatar>
            <span
              className={cn(
                'absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-background',
                collaborator.status === 'online' ? 'bg-green-500' : 'bg-yellow-500',
              )}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{collaborator.name}</p>
            <p className="text-[11px] text-muted-foreground capitalize">{collaborator.status}</p>
          </div>
          <Circle
            className="size-3 shrink-0"
            style={{ color: collaborator.cursorColor }}
            fill={collaborator.cursorColor}
          />
        </div>
      ))}
    </div>
  )
}
