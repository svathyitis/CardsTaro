'use client'

import React from 'react'

interface HeroHeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
  loading: boolean
  totalLoaded: number
  totalWeeks: number
}

const tabs = [
  { id: 'knowledge', label: 'Knowledge Cards' },
  { id: 'tarot', label: 'Tarot Cards' },
  { id: 'quotes', label: 'Quotes' },
]

export default function HeroHeader({ activeTab, onTabChange, loading, totalLoaded, totalWeeks }: HeroHeaderProps) {
  return (
    <header className="border-b border-border">
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-6">
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-xs font-light tracking-widest text-muted-foreground uppercase mb-3">Sri Sri Ravi Shankar</p>
            <h1 className="text-4xl md:text-5xl font-medium tracking-widest font-serif text-foreground leading-tight">Knowledge Cards</h1>
            <p className="mt-3 text-sm font-light tracking-widest text-muted-foreground leading-relaxed max-w-lg">365 points of wisdom, distilled into cards, tarot interpretations, and quotes.</p>
          </div>
          {totalLoaded > 0 && (
            <div className="text-right pt-2">
              <p className="text-xs tracking-widest text-muted-foreground uppercase mb-1">{totalLoaded} / {totalWeeks}</p>
              <div className="w-32 h-1 bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${Math.round((totalLoaded / totalWeeks) * 100)}%` }} />
              </div>
              <p className="text-xs font-light text-muted-foreground mt-1 tracking-wider">cards loaded</p>
            </div>
          )}
        </div>

        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`pb-3 text-xs font-light tracking-widest uppercase transition-all duration-300 border-b-2 ${activeTab === tab.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {loading && (
        <div className="h-0.5 w-full overflow-hidden">
          <div className="h-full bg-primary animate-pulse" />
        </div>
      )}
    </header>
  )
}
