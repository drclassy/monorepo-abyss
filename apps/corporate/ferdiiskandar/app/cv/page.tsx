import type { Metadata } from 'next'

import CVPage from '@/components/CVPage'

export const metadata: Metadata = {
  title: 'CV — dr. Ferdi Iskandar',
  description:
    'Curriculum vitae — dr. Ferdi Iskandar: professional profile at the intersection of law, code, and cognition; multidisciplinary builder and AI-regulated enterprise leadership.',
}

export default function Page() {
  return <CVPage />
}
