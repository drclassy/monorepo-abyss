import type { Metadata } from 'next'
import { Inter, IBM_Plex_Mono } from 'next/font/google'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sentra UNICOM',
  description: 'Chief cockpit for room-based agent communication, policy, and audit.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${plexMono.variable}`}>
      <body className="bg-[var(--bg)] font-sans text-[var(--text)]">{children}</body>
    </html>
  )
}
