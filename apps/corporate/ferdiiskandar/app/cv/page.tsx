import type { Metadata } from 'next'

import CVPage from '@/components/CVPage'

export const metadata: Metadata = {
  title: 'CV — dr. Ferdi Iskandar',
  description:
    'Curriculum vitae of dr. Ferdi Iskandar — physician, hospital CEO, and founder of Sentra Artificial Intelligence. Law before medicine. Medicine before leadership. Leadership before intelligence.',
}

export default function Page() {
  return <CVPage />
}
