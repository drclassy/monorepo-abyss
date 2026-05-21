'use client'

import { Libre_Baskerville, Source_Sans_3 } from 'next/font/google'
import { createContext, useContext, type ReactNode } from 'react'

import { news } from './newspaper-design'

const serif = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-portal-serif',
})

const sans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-portal-sans',
})

const NewspaperContext = createContext(true)

export function useNewspaperTheme() {
  return useContext(NewspaperContext)
}

export function NewspaperProvider({ children }: { children: ReactNode }) {
  return (
    <NewspaperContext.Provider value={true}>
      <div
        className={`${serif.variable} ${sans.variable} min-h-full antialiased`}
        style={{ fontFamily: 'var(--font-portal-sans), system-ui, sans-serif' }}
      >
        {children}
      </div>
    </NewspaperContext.Provider>
  )
}

export function NewspaperMasthead({ tagline }: { tagline?: string }) {
  return (
    <header>
      <h1 className={news.mast} style={{ fontFamily: 'var(--font-portal-serif), Georgia, serif' }}>
        The PORTAL Tribune
      </h1>
      {tagline ? <p className={news.edition}>{tagline}</p> : null}
    </header>
  )
}
