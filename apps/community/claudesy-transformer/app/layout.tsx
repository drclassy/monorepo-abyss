import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

// Claudesy Transformer Engine V2 — Root Layout

export const metadata: Metadata = {
  title: 'CTE V2 — Prompt Transformer & Optimizer',
  description:
    'Transform raw ideas into structured, optimized Super Prompts for any LLM. Built by Sentra AI.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--surface-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-body)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
