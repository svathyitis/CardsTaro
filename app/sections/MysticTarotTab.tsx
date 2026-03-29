'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Shuffle, Download, Pencil } from 'lucide-react'
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

interface MysticTarotTabProps {
  cards: CardItem[]
  loading: boolean
  onDownloadPdf: () => void
  isAdmin: boolean
  onEditCard?: (index: number, card: CardItem) => void
}

// Theme-based color palettes for each card - derived from tarot_front keyword
const MYSTIC_PALETTES = [
  { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', accent: '#e0c3fc', text: '#fff', glow: 'rgba(102,126,234,0.4)' },
  { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', accent: '#ffd6e0', text: '#fff', glow: 'rgba(240,147,251,0.4)' },
  { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', accent: '#c2f0fc', text: '#fff', glow: 'rgba(79,172,254,0.4)' },
  { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', accent: '#c6ffe2', text: '#1a3c34', glow: 'rgba(67,233,123,0.4)' },
  { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', accent: '#ffe8cc', text: '#4a2020', glow: 'rgba(250,112,154,0.4)' },
  { bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', accent: '#edd6ff', text: '#3a2060', glow: 'rgba(161,140,209,0.4)' },
  { bg: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', accent: '#f5d5ff', text: '#3a1a50', glow: 'rgba(213,126,235,0.4)' },
  { bg: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', accent: '#d0e8ff', text: '#2a2060', glow: 'rgba(142,197,252,0.4)' },
  { bg: 'linear-gradient(135deg, #f5576c 0%, #ff6b6b 100%)', accent: '#ffd4d4', text: '#fff', glow: 'rgba(245,87,108,0.4)' },
  { bg: 'linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)', accent: '#c8d8f0', text: '#fff', glow: 'rgba(12,52,131,0.4)' },
  { bg: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)', accent: '#fcd6f5', text: '#fff', glow: 'rgba(196,113,245,0.4)' },
  { bg: 'linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)', accent: '#d0e4ff', text: '#fff', glow: 'rgba(72,198,239,0.4)' },
]

// SVG symbols mapped to common tarot themes
const MYSTIC_SYMBOLS: Record<string, string> = {
  'flame': 'M12 2C8 8 4 12 4 16c0 4.4 3.6 8 8 8s8-3.6 8-8c0-4-4-8-8-14zm0 20c-3.3 0-6-2.7-6-6 0-2.5 2-5.5 6-10.5 4 5 6 8 6 10.5 0 3.3-2.7 6-6 6z',
  'eye': 'M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5c-1.7-4.4-6-7.5-11-7.5zM12 17c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z',
  'star': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  'moon': 'M12 2a10 10 0 000 20 10 10 0 008-16 8 8 0 11-8 16V2z',
  'sun': 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z',
  'heart': 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  'lotus': 'M12 2C9.5 5 7 8 7 12c0 3 2 5.5 5 6 3-.5 5-3 5-6 0-4-2.5-7-5-10zM5 10c-1 2-2 4-2 6 0 2.5 1.5 4 3 4.5C4.5 19 3.5 17 3.5 15c0-2 .5-3.5 1.5-5zm14 0c1 1.5 1.5 3 1.5 5 0 2-1 4-2.5 5.5 1.5-.5 3-2 3-4.5 0-2-1-4-2-6z',
  'infinity': 'M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L12 10.66 9.17 8.15C8.2 7.18 6.84 6.62 5.4 6.62 2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53L12 13.34l2.83 2.51c.97.97 2.33 1.53 3.77 1.53C21.58 17.38 24 14.96 24 12s-2.42-5.38-5.4-5.38z',
  'diamond': 'M12 2L2 12l10 10 10-10L12 2zm0 3l7 7-7 7-7-7 7-7z',
  'tree': 'M12 2L8 9h3v4H8l4 7 4-7h-3V9h3L12 2zm-5 18h10v2H7v-2z',
  'wave': 'M2 12c2-3 4-4 6-4s4 4 6 4 4-4 6-4 4 1 6 4M2 18c2-3 4-4 6-4s4 4 6 4 4-4 6-4 4 1 6 4',
  'key': 'M12.65 10A6 6 0 004 12a6 6 0 006 6 5.93 5.93 0 003.19-.92L15 19h2v2h2v2h3v-3.28l-5.35-5.35A5.94 5.94 0 0012.65 10zM7 13.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z',
}

// Map tarot_front keywords to symbol keys
function getSymbolForCard(tarotFront: string): string {
  const lower = (tarotFront || '').toLowerCase()
  if (lower.includes('flame') || lower.includes('fire') || lower.includes('light')) return 'flame'
  if (lower.includes('eye') || lower.includes('seer') || lower.includes('vision') || lower.includes('witness')) return 'eye'
  if (lower.includes('star') || lower.includes('celestial') || lower.includes('heaven')) return 'star'
  if (lower.includes('moon') || lower.includes('shadow') || lower.includes('night') || lower.includes('dark')) return 'moon'
  if (lower.includes('sun') || lower.includes('dawn') || lower.includes('radian')) return 'sun'
  if (lower.includes('heart') || lower.includes('love') || lower.includes('devotion') || lower.includes('beloved')) return 'heart'
  if (lower.includes('lotus') || lower.includes('bloom') || lower.includes('flower') || lower.includes('blossom')) return 'lotus'
  if (lower.includes('infini') || lower.includes('eternal') || lower.includes('wheel') || lower.includes('cycle')) return 'infinity'
  if (lower.includes('jewel') || lower.includes('diamond') || lower.includes('crystal') || lower.includes('gem')) return 'diamond'
  if (lower.includes('tree') || lower.includes('root') || lower.includes('nature') || lower.includes('seed')) return 'tree'
  if (lower.includes('wave') || lower.includes('ocean') || lower.includes('water') || lower.includes('flow') || lower.includes('river')) return 'wave'
  if (lower.includes('key') || lower.includes('gate') || lower.includes('door') || lower.includes('path') || lower.includes('secret')) return 'key'
  // fallback based on hash
  const symbols = Object.keys(MYSTIC_SYMBOLS)
  let hash = 0
  for (let i = 0; i < lower.length; i++) hash = ((hash << 5) - hash) + lower.charCodeAt(i)
  return symbols[Math.abs(hash) % symbols.length]
}

function MysticSymbol({ name, size = 48, color = '#fff' }: { name: string; size?: number; color?: string }) {
  const path = MYSTIC_SYMBOLS[name] || MYSTIC_SYMBOLS.star
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} opacity={0.85} xmlns="http://www.w3.org/2000/svg">
      <path d={path} />
    </svg>
  )
}

export default function MysticTarotTab({ cards, loading, onDownloadPdf, isAdmin, onEditCard }: MysticTarotTabProps) {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [shuffled, setShuffled] = useState(false)
  const [shuffleKey, setShuffleKey] = useState(0)
  const [selectedCard, setSelectedCard] = useState<{ card: CardItem; index: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  useEffect(() => { setMounted(true) }, [])

  const safeCards = Array.isArray(cards) ? cards : []

  const filtered = useMemo(() => {
    let result = safeCards.filter(card => {
      if (!searchTerm) return true
      const s = searchTerm.toLowerCase()
      return (card?.tarot_front?.toLowerCase()?.includes(s) || card?.title?.toLowerCase()?.includes(s) || card?.tarot_back?.toLowerCase()?.includes(s))
    })
    if (shuffled) {
      result = [...result].sort(() => Math.random() - 0.5)
    }
    return result
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeCards, searchTerm, shuffleKey])

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
        <p className="text-xs tracking-widest text-muted-foreground uppercase">Summoning the mystic deck...</p>
      </div>
    )
  }

  if (safeCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-sm tracking-widest text-muted-foreground">The mystic deck awaits...</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name or theme..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-4 pr-4 border border-border bg-card text-foreground text-sm font-light tracking-wider focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <Button variant="outline" onClick={handleShuffle} className="rounded-none tracking-widest text-xs font-light gap-2">
            <Shuffle className="h-3.5 w-3.5" /> Shuffle Deck
          </Button>
        </div>

        <p className="text-xs text-muted-foreground tracking-widest mb-6 uppercase">
          {filtered.length} mystic card{filtered.length !== 1 ? 's' : ''}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filtered.map((card, idx) => {
            const isFlipped = flippedCards.has(idx)
            const palette = MYSTIC_PALETTES[idx % MYSTIC_PALETTES.length]
            const symbolName = getSymbolForCard(card?.tarot_front || '')
            const originalIndex = safeCards.indexOf(card)

            return (
              <div key={`${shuffleKey}-${idx}`} className="w-full">
                <div className="relative">
                  {isAdmin && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditCard?.(originalIndex, card) }}
                      className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
                      title="Edit card"
                    >
                      <Pencil className="h-3 w-3 text-gray-700" />
                    </button>
                  )}
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
                          background: palette.bg,
                          border: '2px solid rgba(255,255,255,0.2)',
                          boxShadow: `0 8px 32px ${palette.glow}, inset 0 0 80px rgba(255,255,255,0.1)`,
                          borderRadius: '12px',
                        }}
                      >
                        {/* Decorative border */}
                        <div style={{ position: 'absolute', inset: '8px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px' }} />
                        <div style={{ position: 'absolute', inset: '12px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px' }} />

                        {/* Top sparkle */}
                        <div className="absolute top-4" style={{ width: 6, height: 6, background: palette.accent, borderRadius: '50%', boxShadow: `0 0 12px ${palette.accent}` }} />

                        {/* Symbol */}
                        <div className="mb-4" style={{ filter: `drop-shadow(0 0 15px ${palette.accent})` }}>
                          <MysticSymbol name={symbolName} size={56} color={palette.accent} />
                        </div>

                        {/* Card name */}
                        <h3
                          className="text-base sm:text-lg font-serif tracking-[4px] uppercase leading-tight px-4"
                          style={{ color: palette.text, textShadow: `0 0 20px ${palette.glow}` }}
                        >
                          {card?.tarot_front ?? 'Unknown'}
                        </h3>

                        {/* Decorative divider */}
                        <div className="flex items-center gap-2 my-4">
                          <div style={{ width: 20, height: 1, background: `${palette.accent}88` }} />
                          <div style={{ width: 6, height: 6, border: `1px solid ${palette.accent}66`, transform: 'rotate(45deg)' }} />
                          <div style={{ width: 20, height: 1, background: `${palette.accent}88` }} />
                        </div>

                        {/* Theme text */}
                        {card?.theme && (
                          <p className="text-[9px] tracking-[4px] uppercase" style={{ color: `${palette.accent}aa` }}>
                            {card.theme}
                          </p>
                        )}

                        {/* Bottom decoration */}
                        <div className="absolute bottom-4 flex items-center gap-2">
                          <div style={{ width: 4, height: 4, borderRadius: '50%', background: `${palette.accent}55` }} />
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: `${palette.accent}77` }} />
                          <div style={{ width: 4, height: 4, borderRadius: '50%', background: `${palette.accent}55` }} />
                        </div>
                      </div>

                      {/* ===== BACK ===== */}
                      <div
                        className="absolute inset-0 flex flex-col overflow-hidden"
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                          background: '#fdfaf5',
                          border: '2px solid rgba(140,122,94,0.3)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                          borderRadius: '12px',
                        }}
                      >
                        <div style={{ position: 'absolute', inset: '6px', border: '1px solid rgba(140,122,94,0.12)', borderRadius: '8px' }} />

                        <div className="flex flex-col h-full p-4 sm:p-5">
                          <div className="text-center mb-3">
                            <div className="flex justify-center mb-2" style={{ opacity: 0.2 }}>
                              <MysticSymbol name={symbolName} size={24} color="#8C7A5E" />
                            </div>
                            <h4 className="text-xs sm:text-sm font-serif tracking-wider text-amber-900">
                              {card?.title ?? ''}
                            </h4>
                            <div className="flex items-center justify-center gap-1.5 mt-2">
                              <div className="w-4 h-px bg-amber-700/20" />
                              <div className="w-1 h-1 border border-amber-700/30 rotate-45" />
                              <div className="w-4 h-px bg-amber-700/20" />
                            </div>
                          </div>

                          <div className="flex-1 overflow-y-auto min-h-0">
                            <p className="text-amber-950/80 text-[11px] sm:text-xs font-light leading-relaxed">
                              {card?.tarot_back ?? ''}
                            </p>
                          </div>

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
                </div>

                {isFlipped && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedCard({ card, index: originalIndex })
                    }}
                    className="mt-2 w-full text-[10px] tracking-widest uppercase font-light py-1.5 border border-purple-300 text-purple-600 hover:bg-purple-50 transition-colors rounded-md"
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
      {mounted && <Dialog open={!!selectedCard} onOpenChange={(open) => { if (!open) setSelectedCard(null) }}>
        <DialogContent className="max-w-2xl rounded-none border-border">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-12 h-12 flex items-center justify-center rounded-lg"
              style={{
                background: MYSTIC_PALETTES[(selectedCard?.index ?? 0) % MYSTIC_PALETTES.length].bg,
              }}
            >
              <MysticSymbol
                name={getSymbolForCard(selectedCard?.card?.tarot_front || '')}
                size={24}
                color={MYSTIC_PALETTES[(selectedCard?.index ?? 0) % MYSTIC_PALETTES.length].accent}
              />
            </div>
            <div>
              <p className="text-xs tracking-widest text-muted-foreground uppercase">
                {selectedCard?.card?.tarot_front}
              </p>
              <h3 className="text-base font-normal tracking-widest text-foreground">
                {selectedCard?.card?.title}
              </h3>
            </div>
          </div>
          <ScrollArea className="max-h-[60vh]">
            <div className="pr-4 text-sm font-light text-foreground leading-relaxed whitespace-pre-line">
              {selectedCard?.card?.content}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>}

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
