'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import abbyConfig from '@/src/config/abby.config.json'

type Message = { role: 'user' | 'assistant'; text: string }
type VisitorMode = (typeof abbyConfig.visitor_modes)[number]

const CTA_HREF_OVERRIDE: Record<string, string> = {
  '/media-kit': '/cv',
  '/writings': '/notes',
  '/projects': '/works',
  '/contact': '/#contact',
  '/projects/sentra': '/works',
}

const FEATURED_CTAS = abbyConfig.cta_mapping
  .filter((c) =>
    ['learn_profile', 'speaking_request', 'explore_projects', 'collaboration'].includes(c.intent),
  )
  .map((c) => ({ ...c, href: CTA_HREF_OVERRIDE[c.href] ?? c.href }))

export default function AbbyWidget() {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<'welcome' | 'chat'>('welcome')
  const [visitorMode, setVisitorMode] = useState<VisitorMode | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!open || phase !== 'chat') return
    const id = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(id)
  }, [open, phase])

  function resetChat() {
    setMessages([])
    setError(null)
    setInput('')
  }

  function handleModeSelect(mode: VisitorMode) {
    resetChat()
    setVisitorMode(mode)
    setPhase('chat')
  }

  function handleBack() {
    resetChat()
    setPhase('welcome')
    setVisitorMode(null)
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setError(null)
    const history = messages.map((m) => ({ role: m.role, content: m.text }))
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/abby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, visitorMode: visitorMode?.label, history }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail ?? 'Gagal menghubungi Abby.')
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await sendMessage(input)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        className="abby-toggle"
        aria-label={open ? 'Tutup Abby' : 'Tanya Abby'}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="abby-toggle-avatar">
          <Image
            src="/assets/abby/abby-avatar.png"
            alt="Abby"
            width={36}
            height={36}
            className="abby-toggle-img"
          />
        </span>
        {!open && <span className="abby-toggle-label">Tanya Abby</span>}
        {open && (
          <span className="abby-toggle-close" aria-hidden="true">
            ✕
          </span>
        )}
      </button>

      {open && (
        <div
          className="abby-drawer"
          role="dialog"
          aria-label="Abby — Asisten AI pribadi dr Ferdi Iskandar"
          onKeyDown={handleKeyDown}
        >
          <header className="abby-header">
            <div className="abby-header-identity">
              <Image
                src="/assets/abby/abby-avatar.png"
                alt="Abby"
                width={36}
                height={36}
                className="abby-header-avatar"
              />
              <div>
                <strong className="abby-header-name">Abby</strong>
                <span className="abby-header-sub">Asisten AI pribadi dr Ferdi Iskandar</span>
              </div>
            </div>
            <div className="abby-header-actions">
              {phase === 'chat' && (
                <button
                  type="button"
                  className="abby-back-btn"
                  onClick={handleBack}
                  aria-label="Kembali ke pilihan mode"
                >
                  ← Mode
                </button>
              )}
              <button
                type="button"
                className="abby-close-btn"
                onClick={() => setOpen(false)}
                aria-label="Tutup Abby"
              >
                ✕
              </button>
            </div>
          </header>

          {phase === 'welcome' && (
            <div className="abby-welcome">
              <div className="abby-welcome-image">
                <Image
                  src="/assets/abby/abby-main.png"
                  alt="Abby, asisten AI dr Ferdi Iskandar"
                  width={160}
                  height={220}
                  className="abby-main-img"
                />
              </div>
              <p className="abby-opening">{abbyConfig.opening_message.id}</p>
              <p className="abby-mode-prompt">Siapa Anda hari ini?</p>
              <div className="abby-modes">
                {abbyConfig.visitor_modes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    className="abby-mode-btn"
                    onClick={() => handleModeSelect(mode)}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === 'chat' && visitorMode && (
            <>
              <div className="abby-body" aria-live="polite">
                {messages.length === 0 && (
                  <div className="abby-suggestions">
                    <p className="abby-suggestions-label">Pertanyaan untuk {visitorMode.label}:</p>
                    {visitorMode.suggested_questions.map((q, i) => (
                      <button
                        key={i}
                        type="button"
                        className="abby-suggestion-btn"
                        onClick={() => sendMessage(q)}
                        disabled={loading}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`abby-bubble abby-bubble-${msg.role}`}>
                    <p>{msg.text}</p>
                  </div>
                ))}

                {loading && (
                  <div className="abby-bubble abby-bubble-assistant">
                    <p className="abby-typing-dots">
                      <span />
                      <span />
                      <span />
                    </p>
                  </div>
                )}

                {error && (
                  <div className="abby-error">
                    <p>{error}</p>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              <div className="abby-cta-row" aria-label="Tautan cepat">
                {FEATURED_CTAS.map((cta) => (
                  <Link key={cta.intent} href={cta.href} className="abby-cta-btn">
                    {cta.label}
                  </Link>
                ))}
              </div>

              <form className="abby-form" onSubmit={handleSubmit}>
                <input
                  ref={inputRef}
                  type="text"
                  className="abby-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={abbyConfig.ui.placeholder}
                  disabled={loading}
                  aria-label="Pesan untuk Abby"
                  maxLength={2000}
                />
                <button
                  type="submit"
                  className="abby-send"
                  disabled={loading || input.trim().length === 0}
                  aria-label="Kirim pesan"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}
