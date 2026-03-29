'use client'

import React, { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Search, Download, Shuffle } from 'lucide-react'

interface CardItem {
  week_number?: number
  title?: string
  content?: string
  tarot_front?: string
  tarot_back?: string
  quote?: string
  theme?: string
}

interface TarotCardsTabProps {
  cards: CardItem[]
  loading: boolean
  onDownloadPdf: () => void
}

export default function TarotCardsTab({ cards, loading, onDownloadPdf }: TarotCardsTabProps) {
  const [weekFilter, setWeekFilter] = useState<number | null>(null)
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [shuffled, setShuffled] = useState(false)
  const [shuffleKey, setShuffleKey] = useState(0)

  const safeCards = Array.isArray(cards) ? cards : []

  const weekNumbers = useMemo(() => {
    const nums = safeCards.map(c => c?.week_number).filter((n): n is number => typeof n === 'number')
    return [...new Set(nums)].sort((a, b) => a - b)
  }, [safeCards])

  const filtered = useMemo(() => {
    let result = safeCards.filter(card => weekFilter === null || card?.week_number === weekFilter)
    if (shuffled) {
      result = [...result].sort(() => Math.random() - 0.5)
    }
    return result
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeCards, weekFilter, shuffleKey])

  const toggleFlip = (idx: number) => {
    setFlippedCards(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const handleShuffle = () => {
    setShuffled(true)
    setShuffleKey(prev => prev + 1)
    setFlippedCards(new Set())
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs tracking-widest text-muted-foreground uppercase">Loading tarot cards...</p>
      </div>
    )
  }

  if (safeCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-sm tracking-widest text-muted-foreground">No tarot cards loaded yet.</p>
        <p className="text-xs text-muted-foreground font-light">Enable Sample Data or wait for the agent to respond.</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <select value={weekFilter ?? ''} onChange={(e) => setWeekFilter(e.target.value ? Number(e.target.value) : null)} className="h-10 px-4 border border-border bg-card text-foreground text-sm font-light tracking-wider focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">All Weeks</option>
            {weekNumbers.map(w => <option key={w} value={w}>Week {w}</option>)}
          </select>
          <Button variant="outline" onClick={handleShuffle} className="rounded-none tracking-widest text-xs font-light gap-2">
            <Shuffle className="h-3.5 w-3.5" /> Shuffle
          </Button>
        </div>

        <p className="text-xs text-muted-foreground tracking-widest mb-6 uppercase">{filtered.length} tarot card{filtered.length !== 1 ? 's' : ''}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((card, idx) => {
            const isFlipped = flippedCards.has(idx)
            return (
              <button key={`${shuffleKey}-${idx}`} onClick={() => toggleFlip(idx)} className="w-full" style={{ perspective: '1000px' }}>
                <div className="relative w-full transition-transform duration-700" style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)', minHeight: '360px' }}>
                  {/* Front */}
                  <div className="absolute inset-0 border border-border bg-card p-6 flex flex-col items-center justify-center text-center" style={{ backfaceVisibility: 'hidden' }}>
                    <div className="border-2 border-primary/30 p-6 w-full h-full flex flex-col items-center justify-center gap-4">
                      <div className="w-12 h-12 border border-primary text-primary flex items-center justify-center text-xs font-light tracking-widest rounded-full">
                        {card?.week_number ?? '?'}
                      </div>
                      <h3 className="text-sm font-normal tracking-widest text-foreground leading-relaxed">{card?.title ?? 'Untitled'}</h3>
                      <div className="w-8 h-px bg-primary/40 my-1" />
                      <p className="text-xs font-light text-muted-foreground leading-relaxed">{card?.tarot_front ?? 'Click to reveal'}</p>
                      <p className="text-xs text-muted-foreground/50 tracking-widest uppercase mt-auto">Click to flip</p>
                    </div>
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 border border-primary/40 bg-card p-6 flex flex-col items-center justify-center text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                    <div className="border border-primary/20 p-6 w-full h-full flex flex-col items-center justify-center gap-4 bg-secondary/30">
                      <p className="text-xs tracking-widest text-primary uppercase mb-2">Week {card?.week_number ?? '?'}</p>
                      <p className="text-sm font-light text-foreground leading-relaxed">{card?.tarot_back ?? 'No interpretation available'}</p>
                      {card?.theme && <p className="text-xs tracking-widest text-muted-foreground uppercase mt-auto">Theme: {card.theme}</p>}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <button onClick={onDownloadPdf} className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-primary-foreground flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 z-40 rounded-full" aria-label="Download PDF">
        <Download className="h-5 w-5" />
      </button>
    </div>
  )
}
