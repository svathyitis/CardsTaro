'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { KNOWLEDGE_SHEETS } from '@/lib/knowledgeData'
import HeroHeader from './sections/HeroHeader'
import KnowledgeCardsTab from './sections/KnowledgeCardsTab'
import TarotCardsTab from './sections/TarotCardsTab'
import QuotesTab from './sections/QuotesTab'
import PdfThemeModal from './sections/PdfThemeModal'
import { Badge } from '@/components/ui/badge'

const TOTAL_WEEKS = KNOWLEDGE_SHEETS.length

const THEME_VARS = {
  '--background': '0 0% 99%',
  '--foreground': '30 5% 15%',
  '--card': '0 0% 100%',
  '--card-foreground': '30 5% 15%',
  '--primary': '40 30% 45%',
  '--primary-foreground': '0 0% 100%',
  '--secondary': '30 10% 95%',
  '--secondary-foreground': '30 5% 15%',
  '--accent': '40 40% 50%',
  '--accent-foreground': '30 5% 15%',
  '--muted': '30 8% 92%',
  '--muted-foreground': '30 5% 50%',
  '--border': '30 10% 88%',
  '--ring': '40 30% 45%',
  '--radius': '0rem',
} as React.CSSProperties

interface CardItem {
  week_number?: number
  title?: string
  content?: string
  tarot_front?: string
  tarot_back?: string
  quote?: string
  theme?: string
}

const PDF_THEMES: Record<string, { bg: string; text: string; accent: string; border: string; muted: string; cardBg: string; frontBg: string; frontText: string; frontAccent: string; frontBorder: string; backBg: string }> = {
  light: { bg: '#FDFCFB', text: '#2D2A26', accent: '#8C7A5E', border: '#E0DAD0', muted: '#7A7060', cardBg: '#FFFFFF', frontBg: 'linear-gradient(145deg, #1a1520, #2d1f3d, #1a1520)', frontText: '#E8D5A3', frontAccent: '#C9A96E', frontBorder: 'rgba(201,169,110,0.3)', backBg: '#FDFAF5' },
  dark: { bg: '#1A1A2E', text: '#E8E4DC', accent: '#C9A96E', border: '#2D2D44', muted: '#9A9488', cardBg: '#16213E', frontBg: 'linear-gradient(145deg, #0a0a1a, #1a1040, #0a0a1a)', frontText: '#C9A96E', frontAccent: '#E8D5A3', frontBorder: 'rgba(201,169,110,0.4)', backBg: '#16213E' },
  neon: { bg: '#0A0A0A', text: '#00FFD0', accent: '#FF006E', border: '#00FFD033', muted: '#00FFD088', cardBg: '#111111', frontBg: 'linear-gradient(145deg, #050510, #0a0a2a, #050510)', frontText: '#00FFD0', frontAccent: '#FF006E', frontBorder: 'rgba(0,255,208,0.3)', backBg: '#0D0D0D' },
}

const ROMAN_MAP = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII']
function pdfRoman(n: number): string { return n <= 22 ? (ROMAN_MAP[n] || String(n)) : String(n) }

function generatePdfHtml(cards: CardItem[], activeTab: string, theme: string): string {
  const t = PDF_THEMES[theme] || PDF_THEMES.light
  const tabTitles: Record<string, string> = { knowledge: 'Knowledge Cards', tarot: 'Tarot Cards', quotes: 'Quotes' }
  const title = tabTitles[activeTab] || 'Knowledge Cards'

  let contentHtml = ''

  if (activeTab === 'knowledge') {
    contentHtml = cards.map(card => `
      <div style="border: 1px solid ${t.border}; background: ${t.cardBg}; padding: 28px 32px; margin-bottom: 20px; page-break-inside: avoid;">
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
          <div style="width: 40px; height: 40px; border: 1px solid ${t.accent}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: ${t.accent}; flex-shrink: 0;">
            ${card.week_number ?? '?'}
          </div>
          <div>
            <h3 style="margin: 0; font-size: 14px; letter-spacing: 2px; color: ${t.text};">${card.title ?? ''}</h3>
            <p style="margin: 4px 0 0; font-size: 10px; letter-spacing: 2px; color: ${t.muted}; text-transform: uppercase;">${card.theme ?? ''}</p>
          </div>
        </div>
        <div style="font-size: 13px; line-height: 1.8; color: ${t.text}; white-space: pre-line; font-weight: 300;">${(card.content ?? '').slice(0, 1500)}</div>
        ${card.quote ? `<div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid ${t.border}; font-style: italic; font-size: 12px; color: ${t.accent};">"${card.quote}"</div>` : ''}
      </div>
    `).join('')
  } else if (activeTab === 'tarot') {
    contentHtml = cards.map(card => {
      const wn = card.week_number ?? 0
      const roman = pdfRoman(wn)
      return `
      <div style="display: flex; gap: 20px; margin-bottom: 28px; page-break-inside: avoid;">
        <!-- FRONT -->
        <div style="flex: 1; min-width: 0; aspect-ratio: 2.5/4; background: ${t.frontBg}; border: 1px solid ${t.frontBorder}; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.2);">
          <!-- Inner border -->
          <div style="position: absolute; inset: 8px; border: 1px solid ${t.frontAccent}33;"></div>
          <div style="position: absolute; inset: 12px; border: 1px solid ${t.frontAccent}15;"></div>
          <!-- Roman numeral -->
          <p style="color: ${t.frontAccent}88; font-size: 9px; letter-spacing: 5px; margin-bottom: 8px;">${roman}</p>
          <!-- Diamond -->
          <div style="width: 8px; height: 8px; border: 1px solid ${t.frontAccent}66; transform: rotate(45deg); margin-bottom: 16px;"></div>
          <!-- Name -->
          <h3 style="color: ${t.frontText}; font-size: 16px; font-family: 'Playfair Display', serif; letter-spacing: 4px; text-transform: uppercase; margin: 0; text-shadow: 0 0 15px ${t.frontAccent}33;">${card.tarot_front ?? ''}</h3>
          <!-- Divider -->
          <div style="display: flex; align-items: center; gap: 6px; margin: 16px 0;">
            <div style="width: 20px; height: 1px; background: ${t.frontAccent}44;"></div>
            <div style="width: 4px; height: 4px; border: 1px solid ${t.frontAccent}55; transform: rotate(45deg);"></div>
            <div style="width: 20px; height: 1px; background: ${t.frontAccent}44;"></div>
          </div>
          <!-- Week -->
          <p style="color: ${t.frontAccent}55; font-size: 8px; letter-spacing: 4px; text-transform: uppercase;">Week ${wn}</p>
          <!-- Bottom dots -->
          <div style="position: absolute; bottom: 16px; display: flex; gap: 4px;">
            <div style="width: 3px; height: 3px; border-radius: 50%; background: ${t.frontAccent}33;"></div>
            <div style="width: 4px; height: 4px; border-radius: 50%; background: ${t.frontAccent}55;"></div>
            <div style="width: 3px; height: 3px; border-radius: 50%; background: ${t.frontAccent}33;"></div>
          </div>
        </div>
        <!-- BACK -->
        <div style="flex: 1; min-width: 0; background: ${t.backBg}; border: 1px solid ${t.border}; padding: 20px; display: flex; flex-direction: column; box-shadow: 0 2px 12px rgba(0,0,0,0.1);">
          <!-- Inner border -->
          <div style="border: 1px solid ${t.accent}15; padding: 16px; flex: 1; display: flex; flex-direction: column;">
            <p style="color: ${t.accent}; font-size: 8px; letter-spacing: 4px; text-transform: uppercase; text-align: center; margin-bottom: 4px;">${roman} — Week ${wn}</p>
            <h4 style="color: ${t.text}; font-size: 13px; font-family: 'Playfair Display', serif; letter-spacing: 2px; text-align: center; margin: 4px 0 8px;">${card.title ?? ''}</h4>
            <div style="display: flex; align-items: center; justify-content: center; gap: 4px; margin-bottom: 10px;">
              <div style="width: 12px; height: 1px; background: ${t.accent}33;"></div>
              <div style="width: 3px; height: 3px; border: 1px solid ${t.accent}44; transform: rotate(45deg);"></div>
              <div style="width: 12px; height: 1px; background: ${t.accent}33;"></div>
            </div>
            <p style="color: ${t.text}; font-size: 11px; line-height: 1.7; font-weight: 300; flex: 1;">${card.tarot_back ?? ''}</p>
            ${card.quote ? `<div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid ${t.border};">
              <p style="color: ${t.accent}; font-size: 10px; font-style: italic; line-height: 1.5;">&ldquo;${card.quote}&rdquo;</p>
            </div>` : ''}
          </div>
        </div>
      </div>`
    }).join('')
  } else {
    const withQuotes = cards.filter(c => c.quote && c.quote.trim().length > 0)
    contentHtml = withQuotes.map((card, i) => `
      <div style="text-align: center; padding: 32px 16px; page-break-inside: avoid;">
        <p style="font-size: 10px; letter-spacing: 3px; color: ${t.accent}; text-transform: uppercase; margin-bottom: 12px;">Week ${card.week_number ?? '?'}</p>
        <blockquote style="font-size: 17px; font-style: italic; line-height: 1.7; color: ${t.text}; max-width: 500px; margin: 0 auto; font-weight: 300;">"${card.quote}"</blockquote>
        ${card.title ? `<p style="margin-top: 12px; font-size: 10px; letter-spacing: 2px; color: ${t.muted}; text-transform: uppercase;">${card.title}</p>` : ''}
      </div>
      ${i < withQuotes.length - 1 ? `<div style="text-align: center; margin: 8px 0;"><span style="display: inline-block; width: 4px; height: 4px; border: 1px solid ${t.accent}44; transform: rotate(45deg);"></span></div>` : ''}
    `).join('')
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title} — Sri Sri Ravi Shankar</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: ${t.bg}; color: ${t.text}; font-family: 'Inter', sans-serif; padding: 40px; }
    h1, h2, h3 { font-family: 'Playfair Display', serif; }
    @media print {
      body { padding: 20px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
      div[style*="display: flex"] { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div style="text-align: center; margin-bottom: 48px; padding-bottom: 32px; border-bottom: 1px solid ${t.border};">
    <p style="font-size: 10px; letter-spacing: 4px; color: ${t.muted}; text-transform: uppercase; margin-bottom: 8px;">Sri Sri Ravi Shankar</p>
    <h1 style="font-size: 28px; letter-spacing: 4px; color: ${t.text}; font-weight: 500;">${title}</h1>
    <p style="font-size: 11px; color: ${t.muted}; margin-top: 8px; letter-spacing: 2px;">365 Points of Wisdom</p>
  </div>
  ${contentHtml}
  <div style="text-align: center; margin-top: 48px; padding-top: 24px; border-top: 1px solid ${t.border};">
    <p style="font-size: 9px; letter-spacing: 3px; color: ${t.muted}; text-transform: uppercase;">Generated from Weekly Knowledge Sheets</p>
  </div>
</body>
</html>`
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-medium mb-2 tracking-widest">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm font-light">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-4 py-2 bg-primary text-primary-foreground text-sm tracking-widest font-light">Try again</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function Page() {
  const [activeTab, setActiveTab] = useState('knowledge')
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  const [pdfTheme, setPdfTheme] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Static knowledge cards - loaded directly from embedded data
  const cards: CardItem[] = useMemo(() => KNOWLEDGE_SHEETS.map(sheet => ({
    week_number: sheet.week_number,
    title: sheet.title,
    content: sheet.content,
    theme: sheet.country,
    quote: sheet.quote,
    tarot_front: sheet.tarot_front,
    tarot_back: sheet.tarot_back,
  })), [])

  const handleDownloadPdf = useCallback(() => {
    if (!pdfTheme) return
    setDownloading(true)

    try {
      const html = generatePdfHtml(cards, activeTab, pdfTheme)
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        setError('Please allow popups to download the PDF.')
        setDownloading(false)
        return
      }
      printWindow.document.write(html)
      printWindow.document.close()

      // Give fonts time to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
        }, 500)
      }
      // Fallback if onload doesn't fire
      setTimeout(() => {
        try { printWindow.print() } catch {}
      }, 2000)
    } catch {
      setError('Failed to generate PDF. Please try again.')
    } finally {
      setDownloading(false)
      setPdfModalOpen(false)
    }
  }, [pdfTheme, cards, activeTab])

  return (
    <ErrorBoundary>
      <div style={THEME_VARS} className="min-h-screen bg-background text-foreground font-serif">
        <HeroHeader activeTab={activeTab} onTabChange={setActiveTab} loading={downloading} totalLoaded={cards.length} totalWeeks={TOTAL_WEEKS} />

        {error && (
          <div className="max-w-7xl mx-auto px-6 pt-4">
            <div className="border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700 font-light tracking-wider">{error}</p>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setError(null)} className="text-xs text-red-500 underline tracking-widest">Dismiss</button>
              </div>
            </div>
          </div>
        )}

        <main className="pb-24">
          {activeTab === 'knowledge' && (
            <KnowledgeCardsTab cards={cards} loading={false} onDownloadPdf={() => setPdfModalOpen(true)} />
          )}
          {activeTab === 'tarot' && (
            <TarotCardsTab cards={cards} loading={false} onDownloadPdf={() => setPdfModalOpen(true)} />
          )}
          {activeTab === 'quotes' && (
            <QuotesTab cards={cards} loading={false} onDownloadPdf={() => setPdfModalOpen(true)} />
          )}
        </main>

        <PdfThemeModal open={pdfModalOpen} onOpenChange={setPdfModalOpen} selectedTheme={pdfTheme} onSelectTheme={setPdfTheme} onDownload={handleDownloadPdf} downloading={downloading} activeTab={activeTab} />

        {/* Status */}
        <div className="fixed bottom-8 left-8 z-40">
          <div className="border border-border bg-card p-4 shadow-sm max-w-xs">
            <p className="text-xs tracking-widest text-muted-foreground uppercase mb-2">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-light tracking-wider text-foreground">All Data Loaded</span>
            </div>
            <p className="text-xs font-light text-muted-foreground mt-2 tracking-wider">{cards.length} knowledge sheets</p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
