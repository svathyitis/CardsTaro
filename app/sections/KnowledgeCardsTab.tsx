'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Loader2, Search, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CardItem {
  week_number?: number
  title?: string
  content?: string
  tarot_front?: string
  tarot_back?: string
  quote?: string
  theme?: string
}

interface KnowledgeCardsTabProps {
  cards: CardItem[]
  loading: boolean
  onDownloadPdf: () => void
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-medium text-sm mt-3 mb-1 tracking-widest">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-medium text-base mt-3 mb-1 tracking-widest">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-medium text-lg mt-4 mb-2 tracking-widest">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm font-light leading-relaxed">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm font-light leading-relaxed">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm font-light leading-relaxed">{formatInline(line)}</p>
      })}
    </div>
  )
}

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-medium">{part}</strong> : part)
}

export default function KnowledgeCardsTab({ cards, loading, onDownloadPdf, hasMore, loadingMore, onLoadMore }: KnowledgeCardsTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [weekFilter, setWeekFilter] = useState<number | null>(null)
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const safeCards = Array.isArray(cards) ? cards : []

  const weekNumbers = useMemo(() => {
    const nums = safeCards.map(c => c?.week_number).filter((n): n is number => typeof n === 'number')
    return [...new Set(nums)].sort((a, b) => a - b)
  }, [safeCards])

  const filtered = useMemo(() => {
    return safeCards.filter(card => {
      const matchesSearch = !searchTerm || (card?.title?.toLowerCase()?.includes(searchTerm.toLowerCase()) || card?.content?.toLowerCase()?.includes(searchTerm.toLowerCase()))
      const matchesWeek = weekFilter === null || card?.week_number === weekFilter
      return matchesSearch && matchesWeek
    })
  }, [safeCards, searchTerm, weekFilter])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs tracking-widest text-muted-foreground uppercase">Loading knowledge cards...</p>
      </div>
    )
  }

  if (safeCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-sm tracking-widest text-muted-foreground">No knowledge cards loaded yet.</p>
        <p className="text-xs text-muted-foreground font-light">Waiting for the agent to retrieve knowledge cards...</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by keyword..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 rounded-none border-border text-sm font-light tracking-wider" />
          </div>
          <select value={weekFilter ?? ''} onChange={(e) => setWeekFilter(e.target.value ? Number(e.target.value) : null)} className="h-10 px-4 border border-border bg-card text-foreground text-sm font-light tracking-wider focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">All Weeks</option>
            {weekNumbers.map(w => <option key={w} value={w}>Week {w}</option>)}
          </select>
        </div>

        <p className="text-xs text-muted-foreground tracking-widest mb-6 uppercase">{filtered.length} card{filtered.length !== 1 ? 's' : ''} found</p>

        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
          {filtered.map((card, idx) => (
            <button key={idx} onClick={() => setSelectedCard(card)} className="w-full mb-4 break-inside-avoid text-left border border-border bg-card p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 border border-primary text-primary flex items-center justify-center text-xs font-light tracking-widest rounded-full">
                  {card?.week_number ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-normal tracking-widest text-foreground mb-2 leading-relaxed">{card?.title ?? 'Untitled'}</h3>
                  <p className="text-xs font-light text-muted-foreground leading-relaxed line-clamp-2">{card?.content ?? ''}</p>
                  {card?.theme && <Badge variant="outline" className="mt-3 text-xs font-light tracking-wider rounded-none border-border">{card.theme}</Badge>}
                </div>
              </div>
            </button>
          ))}
        </div>

        {hasMore && onLoadMore && (
          <div className="flex justify-center mt-10">
            <button onClick={onLoadMore} disabled={loadingMore} className="px-8 py-3 border border-primary text-primary text-xs tracking-widest uppercase font-light transition-all duration-300 hover:bg-primary hover:text-primary-foreground disabled:opacity-50 flex items-center gap-3">
              {loadingMore ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Loading more...</>
              ) : (
                'Load More Cards'
              )}
            </button>
          </div>
        )}
      </div>

      <button onClick={onDownloadPdf} className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-primary-foreground flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 z-40 rounded-full" aria-label="Download PDF">
        <Download className="h-5 w-5" />
      </button>

      {mounted && <Dialog open={!!selectedCard} onOpenChange={(open) => { if (!open) setSelectedCard(null) }}>
        <DialogContent className="max-w-2xl rounded-none border-border">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 border border-primary text-primary flex items-center justify-center text-sm font-light tracking-widest rounded-full">
                {selectedCard?.week_number ?? '?'}
              </div>
              <div>
                <DialogTitle className="text-base font-normal tracking-widest">{selectedCard?.title ?? 'Untitled'}</DialogTitle>
                <DialogDescription className="text-xs tracking-widest">{selectedCard?.theme ? `Theme: ${selectedCard.theme}` : 'Knowledge Card'}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="pr-4">
              {renderMarkdown(selectedCard?.content ?? '')}
              {selectedCard?.quote && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs tracking-widest text-muted-foreground uppercase mb-2">Distilled Wisdom</p>
                  <p className="text-sm font-light italic leading-relaxed text-foreground">&ldquo;{selectedCard.quote}&rdquo;</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>}
    </div>
  )
}
