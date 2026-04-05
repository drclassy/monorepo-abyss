import type React from "react"
import type { Metadata } from "next"
import { Plus_Jakarta_Sans, Instrument_Serif } from "next/font/google"
import "./globals.css"

// Claudesy CTE V2 — Layout with Sentra Design Typography
// Plus Jakarta Sans (UI sans-serif) + Instrument Serif (accent italic only)

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: ["400"],
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "Claudesy CTE V2 — Transformer Prompt Artificial Intelligence",
  description:
    "Ubah prompt mentah menjadi SuperPrompt terstruktur untuk OpenAI, Anthropic, Gemini, Mistral, dan lebih banyak model Artificial Intelligence. Dibangun oleh Sentra Artificial Intelligence.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="id"
      className={`${plusJakarta.variable} ${instrumentSerif.variable} antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased bg-[#0d0d0d] text-[#b7ab98]" style={{ fontFamily: "var(--font-plus-jakarta, 'Plus Jakarta Sans', sans-serif)" }}>
        {/* Grain overlay — Sentra signature texture */}
        <div
          className="fixed inset-0 pointer-events-none z-[9999] opacity-50"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          }}
        />
        {children}
      </body>
    </html>
  )
}
