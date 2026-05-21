import AboutPage from '@/components/AboutPage'
import { buildPageMetadata } from '@/lib/site-metadata'

export const metadata = buildPageMetadata({
  title: 'About',
  description:
    'Professional positioning dan worldview dr. Ferdi Iskandar sebagai physician-founder yang membangun applied intelligence di sektor healthcare, education, workforce, dan digital experience.',
  pathname: '/about',
})

export default function AboutRoute() {
  return <AboutPage />
}
