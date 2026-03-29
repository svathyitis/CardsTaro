'use client'

import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Shuffle, Download } from 'lucide-react'

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
  hasMore?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII']

function toRoman(n: number): string {
  if (n <= 22) return ROMAN[n] || String(n)
  return String(n)
}

// Decorative SVG corner for tarot card feel
function CardCorner({ className }: { className?: string }) {
  return (
    <svg className={className} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 30 C2 14 14 2 30 2" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
      <path d="M6 30 C6 18 18 6 30 6" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.25" />
      <circle cx="4" cy="28" r="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export default function TarotCardsTab({ cards, loading, onDownloadPdf }: TarotCardsTabProps) {
  const [weekFilter, setWeekFilter] = useState<number | null>(null)
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [shuffled, setShuffled] = useState(false)
  const [shuffleKey, setShuffleKey] = useState(0)
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null)

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
        <p className="text-xs tracking-widest text-muted-foreground uppercase">Shuffling the deck...</p>
      </div>
    )
  }

  if (safeCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-sm tracking-widest text-muted-foreground">The deck is empty.</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <select
            value={weekFilter ?? ''}
            onChange={(e) => setWeekFilter(e.target.value ? Number(e.target.value) : null)}
            className="h-10 px-4 border border-border bg-card text-foreground text-sm font-light tracking-wider focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">All Weeks</option>
            {weekNumbers.map(w => <option key={w} value={w}>Week {w}</option>)}
          </select>
          <Button variant="outline" onClick={handleShuffle} className="rounded-none tracking-widest text-xs font-light gap-2">
            <Shuffle className="h-3.5 w-3.5" /> Shuffle Deck
          </Button>
        </div>

        <p className="text-xs text-muted-foreground tracking-widest mb-6 uppercase">
          {filtered.length} card{filtered.length !== 1 ? 's' : ''} in deck
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filtered.map((card, idx) => {
            const isFlipped = flippedCards.has(idx)
            const weekNum = card?.week_number ?? 0
            return (
              <div key={`${shuffleKey}-${idx}`} className="w-full">
                <button
                  onClick={() => toggleFlip(idx)}
                  className="w-full"
                  style={{ perspective: '1200px' }}
                >
                  <div
                    className="relative w-full transition-transform duration-700"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      aspectRatio: '2.5/4',
                    }}
                  >
                    {/* ===== FRONT ===== */}
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center text-center overflow-hidden"
                      style={{
                        backfaceVisibility: 'hidden',
                        background: 'linear-gradient(145deg, #1a1520 0%, #2d1f3d 30%, #1a1520 70%, #0f0a18 100%)',
                        border: '1px solid rgba(201, 169, 110, 0.3)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 0 60px rgba(201, 169, 110, 0.05)',
                      }}
                    >
                      {/* Corners */}
                      <CardCorner className="absolute top-1 left-1 text-amber-500/50" />
                      <CardCorner className="absolute top-1 right-1 text-amber-500/50 -scale-x-100" />
                      <CardCorner className="absolute bottom-1 left-1 text-amber-500/50 -scale-y-100" />
                      <CardCorner className="absolute bottom-1 right-1 text-amber-500/50 -scale-x-100 -scale-y-100" />

                      {/* Inner ornate border */}
                      <div className="absolute inset-3 border border-amber-600/20" />
                      <div className="absolute inset-5 border border-amber-700/10" />

                      {/* Roman numeral at top */}
                      <p className="text-amber-400/60 text-[10px] tracking-[6px] uppercase mb-2 font-light">
                        {toRoman(weekNum)}
                      </p>

                      {/* Center diamond ornament */}
                      <div className="w-3 h-3 border border-amber-500/40 rotate-45 mb-4" />

                      {/* Tarot name - short mystical label */}
                      <h3
                        className="text-amber-200 text-base sm:text-lg font-serif tracking-[4px] uppercase leading-tight px-4"
                        style={{ textShadow: '0 0 20px rgba(201, 169, 110, 0.3)' }}
                      >
                        {card?.tarot_front ?? 'Unknown'}
                      </h3>

                      {/* Divider */}
                      <div className="flex items-center gap-2 my-4">
                        <div className="w-6 h-px bg-amber-600/30" />
                        <div className="w-1.5 h-1.5 border border-amber-500/40 rotate-45" />
                        <div className="w-6 h-px bg-amber-600/30" />
                      </div>

                      {/* Week indicator */}
                      <p className="text-amber-500/40 text-[9px] tracking-[5px] uppercase">
                        Week {weekNum}
                      </p>

                      {/* Bottom decoration */}
                      <div className="absolute bottom-6 flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-amber-600/30" />
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40" />
                        <div className="w-1 h-1 rounded-full bg-amber-600/30" />
                      </div>
                    </div>

                    {/* ===== BACK ===== */}
                    <div
                      className="absolute inset-0 flex flex-col overflow-hidden"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        background: 'linear-gradient(145deg, #fdfaf5 0%, #f8f0e3 50%, #fdfaf5 100%)',
                        border: '1px solid rgba(140, 122, 94, 0.3)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      }}
                    >
                      {/* Subtle corners */}
                      <div className="absolute inset-2 border border-amber-800/10" />

                      <div className="flex flex-col h-full p-4 sm:p-5">
                        {/* Header */}
                        <div className="text-center mb-3">
                          <p className="text-amber-700/60 text-[8px] tracking-[4px] uppercase">
                            {toRoman(weekNum)} — Week {weekNum}
                          </p>
                          <h4 className="text-amber-900 text-xs sm:text-sm font-serif tracking-wider mt-1">
                            {card?.title ?? ''}
                          </h4>
                          <div className="flex items-center justify-center gap-1.5 mt-2">
                            <div className="w-4 h-px bg-amber-700/20" />
                            <div className="w-1 h-1 border border-amber-700/30 rotate-45" />
                            <div className="w-4 h-px bg-amber-700/20" />
                          </div>
                        </div>

                        {/* Interpretation text */}
                        <div className="flex-1 overflow-y-auto min-h-0">
                          <p className="text-amber-950/80 text-[11px] sm:text-xs font-light leading-relaxed">
                            {card?.tarot_back ?? ''}
                          </p>
                        </div>

                        {/* Bottom: quote */}
                        {card?.quote && (
                          <div className="mt-2 pt-2 border-t border-amber-800/10">
                            <p className="text-amber-700/70 text-[9px] sm:text-[10px] italic leading-relaxed line-clamp-2">
                              &ldquo;{card.quote}&rdquo;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Read more */}
                {isFlipped && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedCard(card)
                    }}
                    className="mt-2 w-full text-[10px] text-amber-700 tracking-widest uppercase font-light py-1.5 border border-amber-200 hover:bg-amber-50 transition-colors"
                  >
                    Read Full Teaching
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Full teaching dialog */}
      <Dialog open={!!selectedCard} onOpenChange={(open) => { if (!open) setSelectedCard(null) }}>
        <DialogContent className="max-w-2xl rounded-none border-border">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-12 h-12 flex items-center justify-center text-sm font-serif tracking-widest text-amber-300"
              style={{
                background: 'linear-gradient(145deg, #1a1520, #2d1f3d)',
                border: '1px solid rgba(201, 169, 110, 0.3)',
              }}
            >
              {toRoman(selectedCard?.week_number ?? 0)}
            </div>
            <div>
              <p className="text-xs tracking-widest text-muted-foreground uppercase">
                {selectedCard?.tarot_front} — Week {selectedCard?.week_number}
              </p>
              <h3 className="text-base font-normal tracking-widest text-foreground">
                {selectedCard?.title}
              </h3>
            </div>
          </div>
          <ScrollArea className="max-h-[60vh]">
            <div className="pr-4 text-sm font-light text-foreground leading-relaxed whitespace-pre-line">
              {selectedCard?.content}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Download FAB */}
      <button
        onClick={onDownloadPdf}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-primary-foreground flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 z-40 rounded-full"
        aria-label="Download PDF"
      >
        <Download className="h-5 w-5" />
      </button>
    </div>
  )
}
