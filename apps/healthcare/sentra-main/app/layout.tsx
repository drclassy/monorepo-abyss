// Architected and built by Claudesy.
// [APPROVED]
import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://sentrahai.com'),
  title: {
    default: 'Sentra AI — Clinical Decision Support Powered by Artificial Intelligence',
    template: '%s | Sentra Healthcare AI',
  },
  description:
    'Sentra AI transforms fragmented patient data into real-time diagnostic clarity. AI-powered clinical decision support reducing misdiagnosis by 40% in Indonesia.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Sentra AI — Clinical Decision Support for Healthcare',
    description:
      'AI-powered clinical decision support reducing misdiagnosis by 40%. Built by Indonesian physicians, for Indonesian healthcare.',
    url: 'https://sentrahai.com',
    siteName: 'Sentra Healthcare AI',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Sentra AI clinical decision support for Indonesian healthcare',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sentra AI — Clinical Decision Support for Healthcare',
    description:
      'AI-powered clinical decision support reducing misdiagnosis by 40%. Built by Indonesian physicians.',
    images: ['/opengraph-image'],
  },
  verification: {
    google: '_Ha7v-xuoFfZ-vq7kkYBy5MOO83iO0gWV7uisS89rFs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Organization', 'MedicalOrganization'],
      '@id': 'https://sentrahai.com/#organization',
      name: 'Sentra Healthcare Solutions',
      alternateName: 'Sentra AI',
      url: 'https://sentrahai.com',
      logo: 'https://sentrahai.com/icon.png',
      description:
        'AI-powered Clinical Decision Support transforming healthcare diagnostics in Indonesia. Reducing misdiagnosis by 40% through real-time clinical intelligence.',
      foundingDate: '2025-03',
      founder: {
        '@type': 'Person',
        '@id': 'https://sentrahai.com/#founder',
        name: 'Dr. Ferdi Iskandar',
        jobTitle: 'Founder, CEO & Clinical Steward',
        description:
          'Licensed physician with 15+ years of clinical experience. Former hospital CEO for 10+ years. Civil law expert specializing in medical malpractice analysis.',
        sameAs: ['https://linkedin.com/company/sentra-ai'],
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Laboratorium Technology RSIA Melinda DHAI',
        addressLocality: 'Kediri',
        addressRegion: 'Jawa Timur',
        addressCountry: 'ID',
      },
      email: 'drferdiiskandar@melinda.co.id',
      sameAs: [
        'https://linkedin.com/company/sentra-ai',
        'https://github.com/sentraai',
        'https://x.com/sentraai',
        'https://instagram.com/sentraai',
      ],
      knowsAbout: [
        'Clinical Decision Support',
        'Healthcare AI',
        'Medical Diagnostics',
        'Patient Safety',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://sentrahai.com/#website',
      url: 'https://sentrahai.com',
      name: 'Sentra Healthcare AI',
      publisher: { '@id': 'https://sentrahai.com/#organization' },
      inLanguage: 'id-ID',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Sentra Clinical Decision Support',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web',
      description:
        'AI-powered diagnostic engine with 7 clinical protocols: NLP synthesis, Bayesian algorithms, trajectory analysis, OCR, pharmaceutical guidance, referral automation, and prognostic modeling.',
      provider: { '@id': 'https://sentrahai.com/#organization' },
      featureList: [
        'Real-time Clinical Decision Support',
        'Audrey AI Voice Assistant',
        'Clinical Trajectory Analysis',
        'Prognosis Intelligence',
        'Patient Risk Scoring',
        'EMR Integration',
        'Immutable Audit Trail',
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={`${plusJakartaSans.variable} ${inter.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  )
}
