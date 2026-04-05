import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Inter Variable — Linear.app font stack
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Claudesy Memory Engine 2026',
  description: 'Claudesy Memory Engine workspace for memory, health, daemon, and recall operations.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={inter.variable}
    >
      <body className={inter.className}>{children}</body>
    </html>
  )
}
