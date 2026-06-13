'use client'

import { useState, useCallback } from 'react'
import {
  Link,
  Copy,
  Check,
  X,
  Mail,
  Globe,
  Users,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Person {
  id: string
  name: string
  avatar: string
  role: 'Viewer' | 'Commenter' | 'Editor'
}

const SHARE_LINK = 'https://mindflow.app/board/abc123'

const MOCK_PEOPLE: Person[] = [
  { id: 'u1', name: 'Alice Chen', avatar: '', role: 'Editor' },
  { id: 'u2', name: 'Bob Martinez', avatar: '', role: 'Commenter' },
  { id: 'u3', name: 'Carol Smith', avatar: '', role: 'Viewer' },
]

export function ShareDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [linkCopied, setLinkCopied] = useState(false)
  const [linkSharing, setLinkSharing] = useState(true)
  const [defaultRole, setDefaultRole] = useState<'Viewer' | 'Commenter' | 'Editor'>('Editor')
  const [inviteEmail, setInviteEmail] = useState('')
  const [people, setPeople] = useState<Person[]>(MOCK_PEOPLE)

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SHARE_LINK)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      // fallback
    }
  }, [])

  const handleInvite = useCallback(() => {
    if (!inviteEmail.trim()) return
    const newPerson: Person = {
      id: `p${Date.now()}`,
      name: inviteEmail.trim(),
      avatar: '',
      role: defaultRole,
    }
    setPeople((prev) => [...prev, newPerson])
    setInviteEmail('')
  }, [inviteEmail, defaultRole])

  const handleRemovePerson = useCallback((id: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const handleRoleChange = useCallback((id: string, role: 'Viewer' | 'Commenter' | 'Editor') => {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, role } : p)))
  }, [])

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Board</DialogTitle>
          <DialogDescription>
            Invite people to collaborate on this board
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Link sharing</span>
              </div>
              <Switch
                checked={linkSharing}
                onCheckedChange={setLinkSharing}
                size="sm"
              />
            </div>
            {linkSharing && (
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 text-sm">
                  <Link className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate text-xs text-muted-foreground">{SHARE_LINK}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleCopyLink} className="shrink-0 gap-1.5">
                  {linkCopied ? (
                    <Check className="size-3.5 text-green-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  {linkCopied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            )}
            {linkSharing && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground shrink-0">Default role:</span>
                <Select value={defaultRole} onValueChange={(v) => setDefaultRole(v as 'Viewer' | 'Commenter' | 'Editor')}>
                  <SelectTrigger size="sm" className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                    <SelectItem value="Commenter">Commenter</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Invite by email</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@example.com"
                className="h-8 text-xs"
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
              />
              <Button variant="default" size="sm" onClick={handleInvite} disabled={!inviteEmail.trim()}>
                Invite
              </Button>
            </div>
          </div>

          {people.length > 0 && (
            <>
              <Separator />
              <div className="space-y-1">
                <div className="flex items-center gap-2 pb-1">
                  <Users className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">People with access</span>
                  <Badge variant="outline" className="ml-auto text-xs">{people.length}</Badge>
                </div>
                {people.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/50"
                  >
                    <Avatar size="sm">
                      <AvatarImage src={person.avatar} alt={person.name} />
                      <AvatarFallback className="text-[10px]">{getInitials(person.name)}</AvatarFallback>
                    </Avatar>
                    <span className="flex-1 truncate text-sm">{person.name}</span>
                    <Select
                      value={person.role}
                      onValueChange={(v) => handleRoleChange(person.id, v as 'Viewer' | 'Commenter' | 'Editor')}
                    >
                      <SelectTrigger size="sm" className="h-7 w-24 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                        <SelectItem value="Commenter">Commenter</SelectItem>
                        <SelectItem value="Editor">Editor</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleRemovePerson(person.id)}
                      aria-label={`Remove ${person.name}`}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
