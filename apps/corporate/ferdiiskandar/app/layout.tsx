import { Fragment_Mono, Inter, JetBrains_Mono } from 'next/font/google'
import type { ReactNode } from 'react'

import { buildSiteMetadata } from '@/lib/site-metadata'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const fragmentMono = Fragment_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
  variable: '--font-fragment-mono',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
})

export const metadata = buildSiteMetadata()

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${fragmentMono.variable} ${jetBrainsMono.variable}`}
      data-theme="light"
      suppressHydrationWarning
    >
      <head />
      <body>
        <a className="fi-skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
