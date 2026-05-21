'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { PromptInputBox } from '@/components/ui/ai-prompt-box'

type HeroChatMessage = {
  role: 'user' | 'assistant'
  text: string
}

export default function HeroChatColumn() {
  const [messages, setMessages] = useState<HeroChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom, error])

  const handleSend = async (message: string) => {
    const trimmed = message.trim()
    if (!trimmed || loading) return

    setError(null)
    setMessages((current) => [...current, { role: 'user', text: trimmed }])
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghubungi layanan AI.')
      }

      setMessages((current) => [...current, { role: 'assistant', text: data.reply }])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan. Silakan coba lagi beberapa saat lagi.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section aria-label="Hero chat column" className="fi-hero-chat-shell">
      <div
        aria-live="polite"
        className={`fi-hero-chat-body${messages.length === 0 && !loading && !error ? ' is-idle' : ''}`}
      >
        {messages.map((message, index) => (
          <article
            className={`fi-hero-chat-bubble fi-hero-chat-bubble-${message.role}`}
            key={`${message.role}-${index}-${message.text.slice(0, 24)}`}
          >
            <p>{message.text}</p>
          </article>
        ))}
        {loading ? (
          <div className="fi-hero-chat-bubble fi-hero-chat-bubble-assistant">
            <p className="fi-hero-chat-typing">
              <span />
              <span />
              <span />
            </p>
          </div>
        ) : null}
        {error ? (
          <div className="fi-hero-chat-error">
            <p>{error}</p>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <PromptInputBox
        className="fi-hero-chat-input"
        isLoading={loading}
        onSend={(message) => {
          void handleSend(message)
        }}
        placeholder="Tanyakan profil, systems, atau visi kerja..."
      />
    </section>
  )
}
