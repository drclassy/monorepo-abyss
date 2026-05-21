'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

export default function ChatGuide() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (open) {
      scrollToBottom()
      inputRef.current?.focus()
    }
  }, [open, scrollToBottom])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || loading) return

    setError(null)
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghubungi layanan AI.')
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        aria-expanded={open}
        aria-label={open ? 'Tutup chat AI guide' : 'Buka chat AI guide'}
        className="fi-chat-toggle"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        {open ? (
          <svg
            fill="none"
            height="22"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
            width="22"
          >
            <line x1="18" x2="6" y1="6" y2="18" />
            <line x1="6" x2="18" y1="6" y2="18" />
          </svg>
        ) : (
          <svg
            fill="none"
            height="22"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
            width="22"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          aria-label="AI Guide chat panel"
          className="fi-chat-panel"
          onKeyDown={handleKeyDown}
          role="dialog"
        >
          <header className="fi-chat-header">
            <div>
              <strong>AI Guide</strong>
              <span>dr. Ferdi Iskandar</span>
            </div>
            <span className="fi-chat-header-badge">Beta</span>
          </header>

          <div className="fi-chat-body" aria-live="polite">
            {messages.map((msg, i) => (
              <div
                className={`fi-chat-bubble ${
                  msg.role === 'user' ? 'fi-chat-bubble-user' : 'fi-chat-bubble-assistant'
                }`}
                key={i}
              >
                <p>{msg.text}</p>
              </div>
            ))}
            {loading && (
              <div className="fi-chat-bubble fi-chat-bubble-assistant">
                <p className="fi-chat-typing">
                  <span />
                  <span />
                  <span />
                </p>
              </div>
            )}
            {error && (
              <div className="fi-chat-error">
                <p>{error}</p>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form className="fi-chat-form" onSubmit={handleSubmit}>
            <input
              aria-label="Ketik pesan"
              className="fi-chat-input"
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan tentang Ferdi, Sentra, atau visi..."
              ref={inputRef}
              type="text"
              value={input}
            />
            <button
              aria-label="Kirim pesan"
              className="fi-chat-send"
              disabled={loading || input.trim().length === 0}
              type="submit"
            >
              <svg
                fill="none"
                height="18"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="18"
              >
                <line x1="22" x2="11" y1="2" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}
