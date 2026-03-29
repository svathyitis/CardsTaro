'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Download } from 'lucide-react'

interface PdfThemeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedTheme: string | null
  onSelectTheme: (theme: string) => void
  onDownload: () => void
  downloading: boolean
  activeTab: string
}

const themes = [
  { id: 'neon-glow', name: 'Neon Glow', desc: 'Vibrant glowing borders on dark', bg: 'bg-gray-900', accent: 'shadow-lg shadow-cyan-500/30 border-cyan-400/60', textColor: 'text-cyan-300' },
  { id: 'minimal-zen', name: 'Minimal Zen', desc: 'Clean white with soft accents', bg: 'bg-white', accent: 'border-gray-200 shadow-sm', textColor: 'text-gray-600' },
  { id: 'golden-classic', name: 'Golden Classic', desc: 'Warm gold and cream tones', bg: 'bg-amber-50', accent: 'border-amber-300 shadow-sm', textColor: 'text-amber-700' },
  { id: 'mystic-violet', name: 'Mystic Violet', desc: 'Deep purple and silver', bg: 'bg-purple-950', accent: 'border-purple-400/50 shadow-lg shadow-purple-500/20', textColor: 'text-purple-300' },
]

const tabLabels: Record<string, string> = {
  knowledge: 'Knowledge Cards',
  tarot: 'Tarot Cards',
  quotes: 'Quotes',
}

export default function PdfThemeModal({ open, onOpenChange, selectedTheme, onSelectTheme, onDownload, downloading, activeTab }: PdfThemeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-none border-border">
        <DialogHeader>
          <DialogTitle className="text-base font-normal tracking-widest">Download PDF</DialogTitle>
          <DialogDescription className="text-xs tracking-widest">Select a visual theme for your {tabLabels[activeTab] ?? 'content'} PDF</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 my-4">
          {themes.map((theme) => (
            <button key={theme.id} onClick={() => onSelectTheme(theme.id)} className={`relative border p-4 transition-all duration-300 text-left ${selectedTheme === theme.id ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}>
              <div className={`w-full h-16 mb-3 ${theme.bg} border ${theme.accent} flex items-center justify-center`}>
                <span className={`text-xs tracking-widest ${theme.textColor}`}>Aa</span>
              </div>
              <p className="text-xs font-normal tracking-widest text-foreground">{theme.name}</p>
              <p className="text-xs font-light text-muted-foreground mt-1">{theme.desc}</p>
            </button>
          ))}
        </div>

        <Button onClick={onDownload} disabled={!selectedTheme || downloading} className="w-full rounded-none tracking-widest text-xs font-light gap-2">
          {downloading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Compiling PDF...</>
          ) : (
            <><Download className="h-4 w-4" /> Download</>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
