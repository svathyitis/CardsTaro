import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const PageClient = dynamic(() => import('./PageClient'), { ssr: false })

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm tracking-widest text-gray-500">Loading...</p>
      </div>
    }>
      <PageClient />
    </Suspense>
  )
}
