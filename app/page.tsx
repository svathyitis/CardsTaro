'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import HeroHeader from './sections/HeroHeader'
import KnowledgeCardsTab from './sections/KnowledgeCardsTab'
import TarotCardsTab from './sections/TarotCardsTab'
import QuotesTab from './sections/QuotesTab'
import PdfThemeModal from './sections/PdfThemeModal'
import { Badge } from '@/components/ui/badge'

const AGENT_ID = '69c919d3a534bb15fd3fc879'
const RAG_ID = '69c919bb58da8006ab0d8d49'

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

const SAMPLE_CARDS: CardItem[] = [
  { week_number: 1, title: 'The Nature of the Self', content: 'The self is neither the body nor the mind. It is the witness of both. When you rest in the self, you find that nothing can disturb you.\n\n### Key Insight\n- Awareness is your true nature\n- The mind is an instrument, not the master\n- Stillness reveals the self', tarot_front: 'The Witness Within', tarot_back: 'In the silence between thoughts, the eternal observer awaits. Release identification with the transient and discover the unchanging presence that has always been your foundation.', quote: 'You are not the wave, you are the ocean.', theme: 'Self-Awareness' },
  { week_number: 2, title: 'Breath and Being', content: 'The breath is the link between the body and the mind. When the breath is calm, the mind is calm. When the breath is agitated, the mind is agitated.\n\n### Practice\n- Observe the natural rhythm\n- Let go of control\n- Simply witness', tarot_front: 'The Sacred Breath', tarot_back: 'Each inhalation is a gift from the cosmos, each exhalation a surrender to the infinite. The breath bridges the mortal and the divine, the seen and the unseen.', quote: 'The breath is the bridge between the visible and the invisible.', theme: 'Pranayama' },
  { week_number: 3, title: 'Love Without Conditions', content: 'True love asks for nothing in return. It is not a transaction. It is a state of being. When you are in love, you are in the most natural state.\n\n### Reflection\n- Love is not an emotion, it is your nature\n- Conditions limit love\n- Unconditional love liberates', tarot_front: 'The Boundless Heart', tarot_back: 'The heart that loves without walls becomes a vessel for the divine. In giving everything and expecting nothing, you discover that you are everything.', quote: 'Love is not what you do. Love is what you are.', theme: 'Love' },
  { week_number: 4, title: 'The Power of Silence', content: 'Silence is not the absence of sound. It is the presence of awareness. In silence, creativity is born. In silence, solutions appear.\n\n### Benefits\n- Mental clarity\n- Emotional balance\n- Deeper intuition', tarot_front: 'The Still Point', tarot_back: 'At the center of all creation lies a silence so profound that within it, every answer already exists. Seek the stillness, and the universe speaks.', quote: 'Silence is the language of the divine.', theme: 'Meditation' },
  { week_number: 5, title: 'Letting Go of Worry', content: 'Worry is a misuse of imagination. The mind projects fear onto the future, creating suffering that does not yet exist.\n\n### Wisdom\n- This moment is all that is real\n- Worry solves nothing\n- Trust the flow of life', tarot_front: 'The Surrendered Mind', tarot_back: 'When the grip of worry loosens, the hands open to receive grace. The future is not yours to control — it is yours to trust.', quote: 'Whatever has happened, has happened for the best. Whatever is happening, is happening for the best.', theme: 'Surrender' },
]

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
  const [sampleMode, setSampleMode] = useState(false)
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  const [pdfTheme, setPdfTheme] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)

  const fetchCards = useCallback(async () => {
    if (hasFetched) return
    setLoading(true)
    setError(null)
    setActiveAgentId(AGENT_ID)
    try {
      const result = await callAIAgent('Retrieve all 365 knowledge cards with week_number, title, and content', AGENT_ID)
      if (result?.success) {
        const parsed = result?.response?.result ?? result?.response ?? null
        if (parsed && typeof parsed === 'object') {
          const agentCards = Array.isArray(parsed?.cards) ? parsed.cards : []
          if (agentCards.length > 0) {
            setCards(agentCards)
            setHasFetched(true)
          }
        }
      } else {
        setError('Failed to retrieve knowledge cards. Try enabling Sample Data.')
      }
    } catch (err) {
      setError('An error occurred while fetching cards.')
    } finally {
      setLoading(false)
      setActiveAgentId(null)
    }
  }, [hasFetched])

  useEffect(() => {
    if (!sampleMode && !hasFetched) {
      fetchCards()
    }
  }, [sampleMode, hasFetched, fetchCards])

  const displayCards = sampleMode ? SAMPLE_CARDS : cards

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

  const handleSampleToggle = (val: boolean) => {
    setSampleMode(val)
  }

  return (
    <ErrorBoundary>
      <div style={THEME_VARS} className="min-h-screen bg-background text-foreground font-serif">
        <HeroHeader sampleMode={sampleMode} onSampleToggle={handleSampleToggle} activeTab={activeTab} onTabChange={setActiveTab} loading={loading || downloading} />

        {error && (
          <div className="max-w-7xl mx-auto px-6 pt-4">
            <div className="border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700 font-light tracking-wider">{error}</p>
              <button onClick={() => setError(null)} className="text-xs text-red-500 underline mt-1 tracking-widest">Dismiss</button>
            </div>
          </div>
        )}

        <main className="pb-24">
          {activeTab === 'knowledge' && (
            <KnowledgeCardsTab cards={displayCards} loading={loading} onDownloadPdf={() => setPdfModalOpen(true)} />
          )}
          {activeTab === 'tarot' && (
            <TarotCardsTab cards={displayCards} loading={loading} onDownloadPdf={() => setPdfModalOpen(true)} />
          )}
          {activeTab === 'quotes' && (
            <QuotesTab cards={displayCards} loading={loading} onDownloadPdf={() => setPdfModalOpen(true)} />
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
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
