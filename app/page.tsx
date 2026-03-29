'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import HeroHeader from './sections/HeroHeader'
import KnowledgeCardsTab from './sections/KnowledgeCardsTab'
import TarotCardsTab from './sections/TarotCardsTab'
import QuotesTab from './sections/QuotesTab'
import PdfThemeModal from './sections/PdfThemeModal'
import { Badge } from '@/components/ui/badge'

const AGENT_ID = '69c919d3a534bb15fd3fc879'
const RAG_ID = '69c919bb58da8006ab0d8d49'

const BATCH_SIZE = 15
const TOTAL_WEEKS = 365

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
  const [cards, setCards] = useState<CardItem[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('knowledge')
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  const [pdfTheme, setPdfTheme] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [nextStart, setNextStart] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalLoaded, setTotalLoaded] = useState(0)
  const initialFetchDone = useRef(false)

  const fetchBatch = useCallback(async (startWeek: number, isInitial: boolean) => {
    if (isInitial) setLoading(true)
    else setLoadingMore(true)
    setError(null)
    setActiveAgentId(AGENT_ID)

    const endWeek = Math.min(startWeek + BATCH_SIZE - 1, TOTAL_WEEKS)
    const prompt = `From the Sri Sri Ravi Shankar knowledge base, retrieve the knowledge points for weeks ${startWeek} to ${endWeek}. For each knowledge point, return: week_number, title (the main topic), content (the full teaching text), tarot_front (a mystical card title for the teaching), tarot_back (a mystical interpretation of the teaching in 2-3 sentences), quote (the most powerful single quote or sentence from the teaching), and theme (a one or two word theme category). Return them as a JSON object with a "cards" array.`

    try {
      const result = await callAIAgent(prompt, AGENT_ID)
      if (result?.success) {
        const parsed = result?.response?.result ?? result?.response ?? null
        if (parsed && typeof parsed === 'object') {
          const agentCards = Array.isArray(parsed?.cards) ? parsed.cards : []
          if (agentCards.length > 0) {
            setCards(prev => {
              const existingWeeks = new Set(prev.map(c => c.week_number))
              const newCards = agentCards.filter((c: CardItem) => !existingWeeks.has(c.week_number))
              return [...prev, ...newCards].sort((a, b) => (a.week_number ?? 0) - (b.week_number ?? 0))
            })
            setTotalLoaded(prev => prev + agentCards.length)
          }
        }
        const newStart = endWeek + 1
        setNextStart(newStart)
        setHasMore(newStart <= TOTAL_WEEKS)
      } else {
        const errMsg = result?.error || result?.response?.message || 'Failed to retrieve knowledge cards.'
        setError(`Batch ${startWeek}-${endWeek}: ${errMsg}`)
      }
    } catch (err) {
      setError(`Error fetching weeks ${startWeek}-${endWeek}. Please try again.`)
    } finally {
      if (isInitial) setLoading(false)
      else setLoadingMore(false)
      setActiveAgentId(null)
    }
  }, [])

  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true
      fetchBatch(1, true)
    }
  }, [fetchBatch])

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchBatch(nextStart, false)
    }
  }

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
        <HeroHeader activeTab={activeTab} onTabChange={setActiveTab} loading={loading || downloading} totalLoaded={totalLoaded} totalWeeks={TOTAL_WEEKS} />

        {error && (
          <div className="max-w-7xl mx-auto px-6 pt-4">
            <div className="border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700 font-light tracking-wider">{error}</p>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setError(null)} className="text-xs text-red-500 underline tracking-widest">Dismiss</button>
                <button onClick={() => { setError(null); fetchBatch(nextStart > 1 ? nextStart - BATCH_SIZE : 1, cards.length === 0); }} className="text-xs text-red-600 underline tracking-widest">Retry</button>
              </div>
            </div>
          </div>
        )}

        <main className="pb-24">
          {activeTab === 'knowledge' && (
            <KnowledgeCardsTab cards={cards} loading={loading} onDownloadPdf={() => setPdfModalOpen(true)} hasMore={hasMore} loadingMore={loadingMore} onLoadMore={handleLoadMore} />
          )}
          {activeTab === 'tarot' && (
            <TarotCardsTab cards={cards} loading={loading} onDownloadPdf={() => setPdfModalOpen(true)} hasMore={hasMore} loadingMore={loadingMore} onLoadMore={handleLoadMore} />
          )}
          {activeTab === 'quotes' && (
            <QuotesTab cards={cards} loading={loading} onDownloadPdf={() => setPdfModalOpen(true)} hasMore={hasMore} loadingMore={loadingMore} onLoadMore={handleLoadMore} />
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
            {totalLoaded > 0 && (
              <p className="text-xs font-light text-muted-foreground mt-2 tracking-wider">{totalLoaded} of {TOTAL_WEEKS} cards loaded</p>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
