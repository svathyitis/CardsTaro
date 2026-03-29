'use client'

import React, { useState, useEffect } from 'react'
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
  {
    id: 'light',
    name: 'Light',
    desc: 'Clean white with warm accents',
    preview: { bg: '#FDFCFB', text: '#2D2A26', accent: '#8C7A5E', border: '#E0DAD0', muted: '#7A7060' },
  },
  {
    id: 'dark',
    name: 'Dark',
    desc: 'Deep midnight with soft golds',
    preview: { bg: '#1A1A2E', text: '#E8E4DC', accent: '#C9A96E', border: '#2D2D44', muted: '#9A9488' },
  },
  {
    id: 'neon',
    name: 'Neon',
    desc: 'Vibrant electric on black',
    preview: { bg: '#0A0A0A', text: '#00FFD0', accent: '#FF006E', border: '#00FFD033', muted: '#00FFD088' },
  },
]

const tabLabels: Record<string, string> = {
  knowledge: 'Knowledge Cards',
  tarot: 'Tarot Cards',
  quotes: 'Quotes',
}

export default function PdfThemeModal({ open, onOpenChange, selectedTheme, onSelectTheme, onDownload, downloading, activeTab }: PdfThemeModalProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-none border-border">
        <DialogHeader>
          <DialogTitle className="text-base font-normal tracking-widest">Download PDF</DialogTitle>
          <DialogDescription className="text-xs tracking-widest">Select a visual theme for your {tabLabels[activeTab] ?? 'content'} PDF</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 my-4">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              className={`relative border p-4 transition-all duration-300 text-left ${selectedTheme === theme.id ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
            >
              <div
                className="w-full h-20 mb-3 border flex flex-col items-center justify-center gap-1"
                style={{ backgroundColor: theme.preview.bg, borderColor: theme.preview.border }}
              >
                <span className="text-sm tracking-widest font-serif" style={{ color: theme.preview.text }}>Aa</span>
                <div className="w-8 h-0.5" style={{ backgroundColor: theme.preview.accent }} />
                <span className="text-[8px] tracking-widest" style={{ color: theme.preview.muted }}>wisdom</span>
              </div>
              <p className="text-xs font-normal tracking-widest text-foreground">{theme.name}</p>
              <p className="text-xs font-light text-muted-foreground mt-1">{theme.desc}</p>
            </button>
          ))}
        </div>

        <Button onClick={onDownload} disabled={!selectedTheme || downloading} className="w-full rounded-none tracking-widest text-xs font-light gap-2">
          {downloading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Generating PDF...</>
          ) : (
            <><Download className="h-4 w-4" /> Download PDF</>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export { themes }
