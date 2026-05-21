import WorksPage from '@/components/WorksPage'
import { buildPageMetadata } from '@/lib/site-metadata'

export const metadata = buildPageMetadata({
  title: 'Works',
  description:
    'Karya-karya dr. Ferdi Iskandar — applied systems yang dibangun di pertemuan antara healthcare, law, dan intelligence.',
  pathname: '/works',
})

export default function WorksRoute() {
  return <WorksPage />
}
