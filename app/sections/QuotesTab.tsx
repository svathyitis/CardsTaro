'use client'

import React, { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Loader2, Search, Download } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface CardItem {
  week_number?: number
  title?: string
  content?: string
  tarot_front?: string
  tarot_back?: string
  quote?: string
  theme?: string
}

interface QuotesTabProps {
  cards: CardItem[]
  loading: boolean
  onDownloadPdf: () => void
}

export default function QuotesTab({ cards, loading, onDownloadPdf }: QuotesTabProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const safeCards = Array.isArray(cards) ? cards : []

  const quotesWithData = useMemo(() => {
    return safeCards.filter(card => card?.quote && card.quote.trim().length > 0)
  }, [safeCards])

  const filtered = useMemo(() => {
    if (!searchTerm) return quotesWithData
    return quotesWithData.filter(card => card?.quote?.toLowerCase()?.includes(searchTerm.toLowerCase()) || card?.title?.toLowerCase()?.includes(searchTerm.toLowerCase()))
  }, [quotesWithData, searchTerm])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs tracking-widest text-muted-foreground uppercase">Loading quotes...</p>
      </div>
    )
  }

  if (quotesWithData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-sm tracking-widest text-muted-foreground">No quotes loaded yet.</p>
        <p className="text-xs text-muted-foreground font-light">Enable Sample Data or wait for the agent to respond.</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search quotes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 rounded-none border-border text-sm font-light tracking-wider" />
        </div>

        <p className="text-xs text-muted-foreground tracking-widest mb-8 uppercase text-center">{filtered.length} quote{filtered.length !== 1 ? 's' : ''}</p>

        <div className="space-y-0">
          {filtered.map((card, idx) => (
            <React.Fragment key={idx}>
              <div className="py-10 text-center">
                <p className="text-xs tracking-widest text-primary uppercase mb-4">Week {card?.week_number ?? '?'}</p>
                <blockquote className="text-lg font-light leading-relaxed text-foreground font-serif italic max-w-lg mx-auto">&ldquo;{card?.quote}&rdquo;</blockquote>
                {card?.title && <p className="mt-4 text-xs tracking-widest text-muted-foreground uppercase">{card.title}</p>}
              </div>
              {idx < filtered.length - 1 && (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-px bg-border" />
                  <div className="w-1.5 h-1.5 border border-primary/40 rotate-45" />
                  <div className="w-8 h-px bg-border" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <button onClick={onDownloadPdf} className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-primary-foreground flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 z-40 rounded-full" aria-label="Download PDF">
        <Download className="h-5 w-5" />
      </button>
    </div>
  )
}
