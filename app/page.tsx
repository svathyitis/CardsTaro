import dynamic from 'next/dynamic'

const PageClient = dynamic(() => import('./PageClient'), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDFCFB' }}>
      <p style={{ fontSize: 14, letterSpacing: 3, color: '#7A7060', fontWeight: 300 }}>Loading wisdom...</p>
    </div>
  ),
})

export default function Page() {
  return <PageClient />
}
