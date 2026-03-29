'use client'

import React, { useState, useMemo } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { KNOWLEDGE_SHEETS } from '@/lib/knowledgeData'
import HeroHeader from './sections/HeroHeader'
import KnowledgeCardsTab from './sections/KnowledgeCardsTab'
import TarotCardsTab from './sections/TarotCardsTab'
import QuotesTab from './sections/QuotesTab'
import PdfThemeModal from './sections/PdfThemeModal'
import { Badge } from '@/components/ui/badge'

const AGENT_ID = '69c919d3a534bb15fd3fc879'
const RAG_ID = '69c919bb58da8006ab0d8d49'

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

function extractQuote(content: string): string {
  const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20 && s.length < 200)
  return sentences.length > 0 ? sentences[0] + '.' : ''
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
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Static knowledge cards - loaded directly, no agent needed
  const cards: CardItem[] = useMemo(() => KNOWLEDGE_SHEETS.map(sheet => ({
    week_number: sheet.week_number,
    title: sheet.title,
    content: sheet.content,
    theme: sheet.country,
    quote: extractQuote(sheet.content),
    tarot_front: sheet.title,
    tarot_back: sheet.content.slice(0, 200),
  })), [])

  const handleDownloadPdf = async () => {
    if (!pdfTheme) return
    setDownloading(true)
    setActiveAgentId(AGENT_ID)
    const tabLabels: Record<string, string> = { knowledge: 'Knowledge Cards', tarot: 'Tarot Cards', quotes: 'Quotes' }
    const tabName = tabLabels[activeTab] ?? 'content'
    try {
      const result = await callAIAgent(`Compile ${tabName} content in ${pdfTheme} visual theme as PDF`, AGENT_ID)
      const files = Array.isArray(result?.module_outputs?.artifact_files) ? result.module_outputs.artifact_files : []
      const fileUrl = files?.[0]?.file_url
      if (fileUrl) {
        window.open(fileUrl, '_blank')
      } else {
        setError('PDF generation completed but no file was returned.')
      }
    } catch (err) {
      setError('Failed to generate PDF.')
    } finally {
      setDownloading(false)
      setActiveAgentId(null)
      setPdfModalOpen(false)
    }
  }

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

        {/* Agent Status */}
        <div className="fixed bottom-8 left-8 z-40">
          <div className="border border-border bg-card p-4 shadow-sm max-w-xs">
            <p className="text-xs tracking-widest text-muted-foreground uppercase mb-2">Agent Status</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${activeAgentId ? 'bg-primary animate-pulse' : 'bg-green-500'}`} />
              <span className="text-xs font-light tracking-wider text-foreground">Knowledge Wisdom Agent</span>
              {activeAgentId && <Badge variant="outline" className="text-xs font-light tracking-wider rounded-none ml-auto">Active</Badge>}
            </div>
            <p className="text-xs font-light text-muted-foreground mt-2 tracking-wider">{cards.length} knowledge sheets loaded</p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
