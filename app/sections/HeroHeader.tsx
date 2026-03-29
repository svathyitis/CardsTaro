'use client'

import React from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface HeroHeaderProps {
  sampleMode: boolean
  onSampleToggle: (val: boolean) => void
  activeTab: string
  onTabChange: (tab: string) => void
  loading: boolean
}

const tabs = [
  { id: 'knowledge', label: 'Knowledge Cards' },
  { id: 'tarot', label: 'Tarot Cards' },
  { id: 'quotes', label: 'Quotes' },
]

export default function HeroHeader({ sampleMode, onSampleToggle, activeTab, onTabChange, loading }: HeroHeaderProps) {
  return (
    <header className="border-b border-border">
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-6">
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-xs font-light tracking-widest text-muted-foreground uppercase mb-3">Sri Sri Ravi Shankar</p>
            <h1 className="text-4xl md:text-5xl font-medium tracking-widest font-serif text-foreground leading-tight">Knowledge Cards</h1>
            <p className="mt-3 text-sm font-light tracking-widest text-muted-foreground leading-relaxed max-w-lg">365 points of wisdom, distilled into cards, tarot interpretations, and quotes.</p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Label htmlFor="sample-toggle" className="text-xs tracking-widest text-muted-foreground uppercase">Sample Data</Label>
            <Switch id="sample-toggle" checked={sampleMode} onCheckedChange={onSampleToggle} />
          </div>
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
