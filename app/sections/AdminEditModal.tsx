'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock } from 'lucide-react'

interface CardItem {
  week_number?: number
  title?: string
  content?: string
  tarot_front?: string
  tarot_back?: string
  quote?: string
  theme?: string
}

interface AdminEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: CardItem | null
  cardIndex: number
  onSave: (index: number, updated: CardItem) => void
}

export default function AdminEditModal({ open, onOpenChange, card, cardIndex, onSave }: AdminEditModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [quote, setQuote] = useState('')
  const [tarotFront, setTarotFront] = useState('')
  const [tarotBack, setTarotBack] = useState('')
  const [theme, setTheme] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (card) {
      setTitle(card.title ?? '')
      setContent(card.content ?? '')
      setQuote(card.quote ?? '')
      setTarotFront(card.tarot_front ?? '')
      setTarotBack(card.tarot_back ?? '')
      setTheme(card.theme ?? '')
    }
  }, [card])

  const handleSave = () => {
    onSave(cardIndex, {
      ...card,
      title,
      content,
      quote,
      tarot_front: tarotFront,
      tarot_back: tarotBack,
      theme,
    })
    onOpenChange(false)
  }

  if (!mounted) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-none border-border max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-normal tracking-widest flex items-center gap-2">
            <Lock className="h-4 w-4" /> Edit Card — Week {card?.week_number ?? '?'}
          </DialogTitle>
          <DialogDescription className="text-xs tracking-widest">Admin mode: editing card content</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="text-xs tracking-widest text-muted-foreground uppercase mb-1 block">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-none border-border text-sm font-light" />
          </div>

          <div>
            <label className="text-xs tracking-widest text-muted-foreground uppercase mb-1 block">Tarot Front (Mystic Name)</label>
            <Input value={tarotFront} onChange={(e) => setTarotFront(e.target.value)} className="rounded-none border-border text-sm font-light" />
          </div>

          <div>
            <label className="text-xs tracking-widest text-muted-foreground uppercase mb-1 block">Tarot Back (Interpretation)</label>
            <textarea
              value={tarotBack}
              onChange={(e) => setTarotBack(e.target.value)}
              rows={3}
              className="w-full border border-border bg-card text-foreground text-sm font-light p-3 focus:outline-none focus:ring-1 focus:ring-ring resize-y"
            />
          </div>

          <div>
            <label className="text-xs tracking-widest text-muted-foreground uppercase mb-1 block">Quote</label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows={2}
              className="w-full border border-border bg-card text-foreground text-sm font-light p-3 focus:outline-none focus:ring-1 focus:ring-ring resize-y"
            />
          </div>

          <div>
            <label className="text-xs tracking-widest text-muted-foreground uppercase mb-1 block">Theme / Country</label>
            <Input value={theme} onChange={(e) => setTheme(e.target.value)} className="rounded-none border-border text-sm font-light" />
          </div>

          <div>
            <label className="text-xs tracking-widest text-muted-foreground uppercase mb-1 block">Full Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full border border-border bg-card text-foreground text-sm font-light p-3 focus:outline-none focus:ring-1 focus:ring-ring resize-y"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} className="flex-1 rounded-none tracking-widest text-xs font-light">
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-none tracking-widest text-xs font-light">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
