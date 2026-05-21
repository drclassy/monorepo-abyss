// Architected and built by dr Classy

import ClassyNewsPage from '@/components/ClassyNewsPage'
import { buildPageMetadata } from '@/lib/site-metadata'

export const metadata = buildPageMetadata({
  title: 'Classy News',
  description:
    'Halaman editorial khusus Classy News di dalam ferdiiskandar: signal AI, open-source watch, dan jembatan terkurasi ke notes, works, speaking, serta contact surface.',
  pathname: '/classy-news',
})

export default function ClassyNewsRoute() {
  return <ClassyNewsPage />
}
