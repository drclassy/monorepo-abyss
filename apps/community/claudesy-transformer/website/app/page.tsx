"use client"

// Claudesy CTE V2 — Landing Page
// Dark Sentra Design · Built by Claudesy

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { HeroNodeGraph } from "../components/hero-node-graph"
import PricingSection from "../components/pricing-section"
import FAQSection from "../components/faq-section"

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS (inline for colocation with JSX)
   ═══════════════════════════════════════════════════════════════ */
const T = {
  bg: '#0d0d0d',
  bg2: '#111111',
  bg3: '#161616',
  fg: '#b7ab98',
  fgDim: '#6b6257',
  fgBright: '#d4ccc0',
  accent: '#eb5939',
  accentDim: '#8a2e1a',
  accentGlow: 'rgba(235, 89, 57, 0.15)',
  line: 'rgba(183, 171, 152, 0.08)',
  display: "var(--font-plus-jakarta, 'Plus Jakarta Sans', sans-serif)",
  mono: "var(--font-plus-jakarta, 'Plus Jakarta Sans', sans-serif)",
  serif: "var(--font-instrument-serif, 'Instrument Serif', serif)",
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [activeCard, setActiveCard] = useState(0)
  const [progress, setProgress] = useState(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    const interval = setInterval(() => {
      if (!mountedRef.current) return
      setProgress((prev) => {
        if (prev >= 100) {
          if (mountedRef.current) setActiveCard((c) => (c + 1) % 3)
          return 0
        }
        return prev + 2
      })
    }, 100)
    return () => { clearInterval(interval); mountedRef.current = false }
  }, [])

  useEffect(() => { return () => { mountedRef.current = false } }, [])

  const handleCardClick = (i: number) => {
    if (!mountedRef.current) return
    setActiveCard(i)
    setProgress(0)
  }

  return (
    <div className="w-full min-h-screen overflow-x-hidden" style={{ background: T.bg, color: T.fg }}>

      {/* ═══ NAV ═══ */}
      <nav
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 lg:px-12 py-5"
        style={{ borderBottom: `1px solid ${T.line}`, backdropFilter: 'blur(12px)', background: 'rgba(13,13,13,0.85)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8" style={{ background: T.accent, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', animation: 'spin-slow 8s linear infinite' }} />
          <span className="text-base font-extrabold tracking-[0.1em] uppercase" style={{ fontFamily: T.display, color: T.fgBright }}>
            Claudesy <span style={{ color: T.accent }}>/</span> V2
          </span>
        </div>
        <ul className="hidden md:flex items-center gap-10 list-none">
          {['Fitur', 'Provider', 'Cara Kerja', 'Evaluator'].map(link => (
            <li key={link}>
              <a href={`#${link.toLowerCase().replace(/ /g, '-')}`} className="no-underline transition-colors duration-200 hover:text-[#d4ccc0]" style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.fgDim }}>
                {link}
              </a>
            </li>
          ))}
          <li>
            <a href="#start" className="no-underline px-5 py-2 text-white transition-opacity duration-200 hover:opacity-85" style={{ background: T.accent, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', borderRadius: '2px' }}>
              Mulai Gratis
            </a>
          </li>
        </ul>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="min-h-screen flex flex-col justify-center px-6 lg:px-12 pt-32 pb-16 relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(${T.line} 1px, transparent 1px), linear-gradient(90deg, ${T.line} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 0%, black 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 0%, black 30%, transparent 100%)',
        }} />
        {/* Accent glow */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none" style={{ background: `radial-gradient(circle, ${T.accentGlow} 0%, transparent 70%)` }} />

        <p className="relative z-10 mb-6" style={{ fontFamily: T.mono, fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: T.accent, animation: 'fade-up 0.8s 0.2s forwards', opacity: 0 }}>
          Sentra Healthcare Artificial Intelligence — Prompt Engine V2
        </p>
        <h1 className="relative z-10 max-w-[14ch]" style={{ fontFamily: T.display, fontSize: 'clamp(3.5rem, 8vw, 7.5rem)', fontWeight: 800, lineHeight: 0.95, letterSpacing: '-0.03em', color: T.fgBright, animation: 'fade-up 0.8s 0.4s forwards', opacity: 0 }}>
          Ubah Ide Mentah Jadi <em style={{ fontFamily: T.serif, fontStyle: 'italic', fontWeight: 400, color: T.accent }}>Super&nbsp;Prompt</em>
        </h1>
        <p className="relative z-10 mt-8 max-w-[50ch]" style={{ fontSize: '1.1rem', fontWeight: 400, color: T.fgDim, lineHeight: 1.75, animation: 'fade-up 0.8s 0.6s forwards', opacity: 0 }}>
          Claudesy adalah mesin Transformer Prompt universal — pikiran kasar, arahan setengah jadi, dan ide spontan Anda diubah menjadi prompt berstruktur presisi yang mengekstrak kecerdasan maksimal dari LLM mana pun.
        </p>

        {/* CTA Buttons */}
        <div className="relative z-10 mt-12 flex flex-wrap gap-4" style={{ animation: 'fade-up 0.8s 0.8s forwards', opacity: 0 }}>
          <a href="#start" className="inline-flex items-center gap-2.5 no-underline text-white px-8 py-3.5 transition-all duration-200 hover:-translate-y-0.5" style={{ background: T.accent, fontFamily: T.display, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            ⟶ &nbsp;Buka Aplikasi
          </a>
          <a href="#cara-kerja" className="inline-flex items-center gap-2.5 no-underline px-8 py-3.5 transition-all duration-200 hover:border-[#6b6257] hover:text-[#d4ccc0]" style={{ background: 'transparent', color: T.fg, fontFamily: T.display, fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', border: `1px solid ${T.line}` }}>
            Lihat Cara Kerja
          </a>
        </div>

        {/* Stats */}
        <div className="relative z-10 mt-20 grid grid-cols-2 lg:grid-cols-4" style={{ borderTop: `1px solid ${T.line}`, borderLeft: `1px solid ${T.line}`, animation: 'fade-up 0.8s 1s forwards', opacity: 0 }}>
          {[
            ['50+', 'Template Prompt'],
            ['7×', 'Provider LLM'],
            ['4', 'Dimensi Evaluasi'],
            ['AES‑256', 'Enkripsi Kunci'],
          ].map(([num, label]) => (
            <div key={label} className="p-8" style={{ borderRight: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: T.fgBright, lineHeight: 1, letterSpacing: '-0.04em' }}>
                {num.includes('+') || num.includes('×') || num.includes('‑')
                  ? <>{num.replace(/[+×‑].*/, '')}<span style={{ color: T.accent }}>{num.match(/[+×‑].*/)?.[0]}</span></>
                  : num
                }
              </div>
              <div style={{ fontFamily: T.mono, fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: T.fgDim, marginTop: '0.5rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ TICKER ═══ */}
      <div className="overflow-hidden py-3" style={{ borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`, background: T.bg2 }}>
        <div className="flex whitespace-nowrap" style={{ animation: 'ticker-scroll 30s linear infinite' }}>
          {[...Array(2)].map((_, rep) => (
            <div key={rep} className="flex">
              {['Routing Multi-Provider LLM', 'Mesin Optimasi Prompt', 'Evaluator 4 Dimensi', 'Pencarian Semantik Embedding', 'Ekstensi Chrome Sidepanel', 'Brankas Kunci API AES-256-GCM', 'Backend Supabase + pgvector'].map(item => (
                <div key={`${rep}-${item}`} className="flex items-center gap-6 px-8" style={{ fontFamily: T.mono, fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: T.fgDim }}>
                  <span style={{ color: T.accent, fontSize: '1.2em' }}>◆</span> {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ PROBLEM / VALUE PROP ═══ */}
      <section className="px-6 lg:px-12 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center" style={{ borderTop: `1px solid ${T.line}` }}>
        <div>
          <p style={{ fontFamily: T.mono, fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: T.accent, marginBottom: '1rem' }}>// Masalahnya</p>
          <h2 style={{ fontFamily: T.display, fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, color: T.fgBright, lineHeight: 1.05, letterSpacing: '-0.03em', maxWidth: '20ch' }}>
            Sebagian Besar Prompt Menyia-nyiakan 70% Potensi LLM Anda
          </h2>
          <p className="mt-6" style={{ color: T.fgDim, fontSize: '1rem', lineHeight: 1.8, maxWidth: '48ch' }}>Anda punya ide. Model punya kapabilitas. Namun di antara niat mentah Anda dan output yang andal, ada celah tak kasat mata — rekayasa prompt.</p>
          <p className="mt-4" style={{ color: T.fgDim, fontSize: '1rem', lineHeight: 1.8, maxWidth: '48ch' }}>Claudesy menutup celah itu. Otomatis. Di seluruh LLM. Untuk setiap jenis tugas.</p>
        </div>
        <div className="relative">
          {/* Before card */}
          <div className="relative p-8" style={{ background: T.bg3, border: `1px solid ${T.line}` }}>
            <span className="absolute -top-2.5 left-6 px-2" style={{ background: T.bg3, fontFamily: T.mono, fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: T.fgDim }}>Sebelum — Input Mentah</span>
            <p style={{ fontFamily: T.mono, fontSize: '0.78rem', lineHeight: 1.8, color: T.fgDim }}>buatkan sesuatu tentang resume discharge pasien untuk puskesmas</p>
          </div>
          <div className="text-center py-3 ml-8 text-2xl" style={{ color: T.accent }}>↓</div>
          {/* After card */}
          <div className="relative p-8 -mt-4 ml-8" style={{ background: T.bg3, border: `1px solid rgba(235, 89, 57, 0.3)`, boxShadow: '0 0 40px rgba(235, 89, 57, 0.08)' }}>
            <span className="absolute -top-2.5 left-6 px-2" style={{ background: T.bg3, fontFamily: T.mono, fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: T.accent }}>Sesudah — Super Prompt</span>
            <p style={{ fontFamily: T.mono, fontSize: '0.78rem', lineHeight: 1.8, color: T.fg }}>
              <span style={{ color: T.accent }}>ROLE:</span> Spesialis Dokumentasi Klinis Senior di Puskesmas Indonesia<br/>
              <span style={{ color: T.accent }}>TASK:</span> Buat template resume discharge terstandarisasi sesuai KMK No. HK.01.07/MENKES/1186/2022<br/>
              <span style={{ color: T.accent }}>FORMAT:</span> JSON terstruktur dengan narasi (Bahasa Indonesia + kode ICD-10)<br/>
              <span style={{ color: T.accent }}>CONSTRAINTS:</span> Maksimal 1 halaman A4, sertakan kondisi pemicu rujukan, rekonsiliasi obat<br/>
              <span style={{ color: T.accent }}>OUTPUT:</span> Template + 2 contoh terisi untuk Diabetes Mellitus Tipe 2 dan Hipertensi
            </p>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="fitur" className="px-6 lg:px-12 py-24" style={{ borderTop: `1px solid ${T.line}` }}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div>
            <p style={{ fontFamily: T.mono, fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: T.accent, marginBottom: '1rem' }}>// Fitur Utama</p>
            <h2 style={{ fontFamily: T.display, fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, color: T.fgBright, lineHeight: 1.05, letterSpacing: '-0.03em', maxWidth: '20ch' }}>
              Semua yang Anda Butuhkan untuk Merekayasa Prompt <em style={{ fontFamily: T.serif, fontStyle: 'italic', fontWeight: 400, color: T.fgDim }}>Berkualitas Tinggi</em>
            </h2>
          </div>
          <p style={{ maxWidth: '38ch', color: T.fgDim, fontSize: '0.95rem', lineHeight: 1.7 }}>Sistem kecerdasan prompt full-stack — optimizer, evaluator, pustaka, dan mesin rekomendasi — terpadu dalam satu platform siap produksi.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ borderLeft: `1px solid ${T.line}`, borderTop: `1px solid ${T.line}` }}>
          {[
            { icon: '⚡', title: 'Mesin Optimizer', body: 'Ubah ide mentah apa pun menjadi Super Prompt terstruktur dalam hitungan detik. Optimasi berbasis strategi khusus untuk tugas Coding, Email, Analisis, Kreatif, Riset, Bisnis, Pendidikan, dan Pemasaran.', tag: 'Fase 6' },
            { icon: '◎', title: 'Evaluator 4 Dimensi', body: 'Beri skor setiap prompt di empat dimensi: Struktur, Kejelasan, Kelengkapan, dan Spesifisitas. Dapatkan skor ternormalisasi, visualisasi, dan saran perbaikan konkret langsung dari LLM.', tag: 'Fase 7' },
            { icon: '▤', title: 'Pustaka Prompt', body: 'Simpan, cari, dan temukan kembali prompt terbaik Anda. Operasi CRUD penuh dengan pencarian semantik berbasis embedding pgvector — temukan prompt serupa berdasarkan makna, bukan sekadar kata kunci.', tag: 'Fase 9' },
            { icon: '◈', title: '50+ Sistem Template', body: 'Template bervalidasi Zod yang type-safe untuk setiap kategori. Matcher mendeteksi intensi Anda secara otomatis dan memilih template optimal. Renderer menyuntikkan variabel Anda ke dalam struktur yang telah terbukti.', tag: 'Fase 5' },
            { icon: '◐', title: 'Mesin Rekomendasi', body: 'Pencarian kesamaan semantik via embedding OpenAI + cosine distance pgvector. Menampilkan prompt paling relevan dari pustaka Anda bahkan sebelum Anda selesai mengetik.', tag: 'Fase 10' },
            { icon: '⬡', title: 'Ekstensi Chrome', body: 'Akses optimizer penuh dari tab browser mana pun via sidepanel bertenaga WXT. Kompatibel dengan ChatGPT, Claude.ai, Gemini, dan input teks apa pun di web. React + TypeScript, hot-reload.', tag: 'Fase 13' },
          ].map(f => (
            <div key={f.title} className="feature-card-hover p-10 relative overflow-hidden transition-colors duration-300 hover:bg-[#111111]" style={{ borderRight: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
              <div className="mb-6 text-2xl">{f.icon}</div>
              <div className="mb-3" style={{ fontSize: '1rem', fontWeight: 700, color: T.fgBright, letterSpacing: '-0.01em' }}>{f.title}</div>
              <div style={{ fontSize: '0.85rem', color: T.fgDim, lineHeight: 1.75 }}>{f.body}</div>
              <span className="inline-block mt-4 px-2.5 py-0.5" style={{ fontFamily: T.mono, fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: T.accent, border: `1px solid ${T.accentDim}` }}>{f.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ PROVIDERS ═══ */}
      <section id="provider" className="px-6 lg:px-12 py-24" style={{ borderTop: `1px solid ${T.line}` }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24 items-center mb-16">
          <div>
            <p style={{ fontFamily: T.mono, fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: T.accent, marginBottom: '1rem' }}>// Provider LLM</p>
            <h2 style={{ fontFamily: T.display, fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, color: T.fgBright, lineHeight: 1.05, letterSpacing: '-0.03em' }}>Satu Antarmuka. Tujuh Provider.</h2>
          </div>
          <p className="lg:col-span-2" style={{ color: T.fgDim, fontSize: '0.95rem', lineHeight: 1.8 }}>Claudesy mengimplementasikan pola Strategy + Registry — satu antarmuka terpadu merutekan prompt teroptimasi Anda ke provider mana pun. Ganti model tanpa menulis ulang apa pun. Kunci API Anda tersimpan terenkripsi (AES-256-GCM) per-pengguna di database kami, tidak pernah terekspos ke lapisan frontend.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: T.line }}>
          {[
            { logo: 'Anthropic', name: 'Claude', model: 'Claude 4 Sonnet' },
            { logo: 'OpenAI', name: 'GPT-5', model: 'gpt-5 + o-Series' },
            { logo: 'Google', name: 'Gemini', model: 'Gemini 3 Pro' },
            { logo: 'Meta', name: 'Llama', model: 'Llama 4' },
            { logo: 'xAI', name: 'Grok', model: 'Grok-4' },
            { logo: 'DeepSeek', name: 'DeepSeek', model: 'V3.2' },
            { logo: 'Moonshot', name: 'Kimi', model: 'Kimi K2' },
            { logo: 'Strategy', name: 'Registry', model: 'getProvider(name, key)' },
          ].map(p => (
            <div key={p.name} className="flex flex-col items-center gap-3 py-8 px-6 transition-colors duration-200 hover:bg-[#161616]" style={{ background: T.bg2 }}>
              <span style={{ fontFamily: T.mono, fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: T.accent, fontWeight: 400 }}>{p.logo}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: T.fgBright, letterSpacing: '-0.01em' }}>{p.name}</span>
              <span style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.fgDim, textAlign: 'center' }}>{p.model}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ PIPELINE ═══ */}
      <section id="cara-kerja" className="px-6 lg:px-12 py-24" style={{ borderTop: `1px solid ${T.line}` }}>
        <p style={{ fontFamily: T.mono, fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: T.accent, marginBottom: '1rem' }}>// Optimizer Pipeline</p>
        <h2 style={{ fontFamily: T.display, fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, color: T.fgBright, lineHeight: 1.05, letterSpacing: '-0.03em', maxWidth: '20ch' }}>
          From Raw Thought to <em style={{ fontFamily: T.serif, fontStyle: 'italic', fontWeight: 400, color: T.fgDim }}>Production Prompt</em> in 5 Steps
        </h2>
        <div className="mt-14 flex flex-col lg:flex-row" style={{ border: `1px solid ${T.line}` }}>
          {[
            { num: '01 / INTENT', title: 'Capture Raw Input', body: 'Write your idea in plain language. No prompt engineering knowledge required — that\'s the whole point.' },
            { num: '02 / CLASSIFY', title: 'Detect Task Type', body: 'The matcher analyses intent and maps it to a TaskType (Coding, Email, Analysis, Creative, Research, Business, Education, Marketing).' },
            { num: '03 / SELECT', title: 'Load Best Template', body: 'From 50+ Zod-typed templates, the renderer selects the highest-relevance match and injects your variables into the structure.' },
            { num: '04 / OPTIMIZE', title: 'LLM Refinement', body: 'The engine calls your chosen provider with a task-specific optimization strategy, producing the final Super Prompt.' },
            { num: '05 / DELIVER', title: 'Score + Export', body: 'Receive your Super Prompt with a 4-dimension quality score, improvement suggestions, and one-click copy or library save.' },
          ].map((step, i, arr) => (
            <div key={step.num} className="flex-1 p-8 lg:p-10 relative" style={{ borderRight: i < arr.length - 1 ? `1px solid ${T.line}` : 'none', borderBottom: i < arr.length - 1 ? `1px solid ${T.line}` : 'none' }}>
              <div style={{ fontFamily: T.mono, fontSize: '0.6rem', letterSpacing: '0.2em', color: T.fgDim, marginBottom: '0.75rem' }}>{step.num}</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: T.fgBright, marginBottom: '0.75rem' }}>{step.title}</div>
              <div style={{ fontSize: '0.8rem', color: T.fgDim, lineHeight: 1.7 }}>{step.body}</div>
              {i < arr.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-[2] w-6 h-6" style={{ background: T.accent, clipPath: 'polygon(0 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)' }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SUPER PROMPT FORMAT ═══ */}
      <section className="px-6 lg:px-12 py-24" style={{ borderTop: `1px solid ${T.line}` }}>
        <p style={{ fontFamily: T.mono, fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: T.accent, marginBottom: '1rem' }}>// Output Format</p>
        <h2 style={{ fontFamily: T.display, fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, color: T.fgBright, lineHeight: 1.05, letterSpacing: '-0.03em', maxWidth: '20ch' }}>
          The Anatomy of a <em style={{ fontFamily: T.serif, fontStyle: 'italic', fontWeight: 400, color: T.fgDim }}>Super Prompt</em>
        </h2>
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <p style={{ color: T.fgDim, fontSize: '0.95rem', lineHeight: 1.8, marginTop: '1.5rem' }}>Every optimized output follows a consistent, LLM-agnostic structure designed for maximum clarity, reproducibility, and reuse. The Super Prompt format is the contract between your intent and the model&apos;s output.</p>
            <ul className="mt-8 flex flex-col gap-3 list-none p-0">
              {[
                ['ROLE', 'Assign expert identity and domain context to the model'],
                ['TASK', 'State the precise objective with measurable completion criteria'],
                ['CONTEXT', 'Embed relevant background, constraints, and domain knowledge'],
                ['FORMAT', 'Specify output structure, length, language, and schema'],
                ['CONSTRAINTS', 'Define explicit rules, exclusions, and quality bars'],
                ['EXAMPLES', 'Few-shot demonstrations for complex task types'],
                ['OUTPUT', 'Declare exactly what the final deliverable must contain'],
              ].map(([key, desc]) => (
                <li key={key} className="flex gap-4 items-start" style={{ fontSize: '0.88rem', color: T.fgDim, lineHeight: 1.6 }}>
                  <span style={{ color: T.accent, fontWeight: 700, flexShrink: 0 }}>→</span>
                  <span><strong>{key}</strong> — {desc}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-8" style={{ background: T.bg3, border: `1px solid ${T.line}`, borderLeft: `3px solid ${T.accent}`, fontFamily: T.mono, fontSize: '0.75rem', lineHeight: 2, color: T.fgDim }}>
            <span style={{ color: '#3d3733' }}>{"// Super Prompt — Generated by Claudesy V2"}</span><br/>
            <span style={{ color: '#3d3733' }}>{"// TaskType: ANALYSIS | Provider: CLAUDE | Score: 94/100"}</span><br/><br/>
            <span style={{ color: T.accent }}>ROLE:</span> <span style={{ color: T.fgBright }}>Senior Health Informatics Analyst specializing</span><br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;in Indonesian primary healthcare data (Puskesmas)<br/><br/>
            <span style={{ color: T.accent }}>TASK:</span> <span style={{ color: T.fgBright }}>Analyze patient visit patterns from ePuskesmas</span><br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;EMR export and identify top-10 disease burden<br/><br/>
            <span style={{ color: T.accent }}>CONTEXT:</span> <span style={{ color: '#7ec8a4' }}>KMK No. HK.01.07/MENKES/1186/2022</span> — 144<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;designated diseases for primary care intervention<br/><br/>
            <span style={{ color: T.accent }}>FORMAT:</span> <span style={{ color: T.fgBright }}>Markdown report + JSON summary object</span><br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;with ICD-10 codes, prevalence %, trend delta<br/><br/>
            <span style={{ color: T.accent }}>CONSTRAINTS:</span> <span style={{ color: T.fgBright }}>Use only provided data. Flag anomalies.</span><br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Exclude incomplete records &lt;6-month window<br/><br/>
            <span style={{ color: T.accent }}>OUTPUT:</span> <span style={{ color: T.fgBright }}>Executive summary + ranked disease table</span><br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ 3 actionable recommendations for Chief
          </div>
        </div>
      </section>

      {/* ═══ EVALUATOR ═══ */}
      <section id="evaluator" className="px-6 lg:px-12 py-24" style={{ borderTop: `1px solid ${T.line}` }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p style={{ fontFamily: T.mono, fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: T.accent, marginBottom: '1rem' }}>// Prompt Evaluator</p>
            <h2 style={{ fontFamily: T.display, fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, color: T.fgBright, lineHeight: 1.05, letterSpacing: '-0.03em', maxWidth: '20ch' }}>
              Know Exactly How Good Your Prompt <em style={{ fontFamily: T.serif, fontStyle: 'italic', fontWeight: 400, color: T.fgDim }}>Actually Is</em>
            </h2>
            <p className="mt-6" style={{ color: T.fgDim, fontSize: '0.95rem', lineHeight: 1.8 }}>Stop guessing. The Evaluator sends your prompt to the LLM itself for structured assessment across four critical dimensions. Every score comes with a specific rationale and targeted improvement suggestion — not generic advice.</p>
            <p className="mt-4" style={{ color: T.fgDim, fontSize: '0.95rem', lineHeight: 1.8 }}>Scoring is normalized 0–100 per dimension, with a weighted overall score. Track improvement across iterations and build a quality baseline for your prompt library.</p>
          </div>
          <div className="flex flex-col gap-5">
            {[
              { name: '◈ Structure', score: 92 },
              { name: '◎ Clarity', score: 88 },
              { name: '▤ Completeness', score: 95 },
              { name: '⬡ Specificity', score: 79 },
            ].map(dim => (
              <div key={dim.name} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: T.fgBright, letterSpacing: '0.02em' }}>{dim.name}</span>
                  <span style={{ fontFamily: T.mono, fontSize: '0.7rem', color: T.accent }}>{dim.score} / 100</span>
                </div>
                <div className="h-[3px] relative overflow-hidden" style={{ background: T.line }}>
                  <div className="absolute inset-y-0 left-0 transition-all duration-1000" style={{ width: `${dim.score}%`, background: T.accent }} />
                </div>
              </div>
            ))}
            {/* Overall score card */}
            <div className="mt-6 p-6" style={{ border: `1px solid ${T.line}`, background: T.bg3 }}>
              <div style={{ fontFamily: T.mono, fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: T.fgDim, marginBottom: '0.5rem' }}>Overall Score</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: T.accent, letterSpacing: '-0.04em', lineHeight: 1 }}>
                88.5<span style={{ fontSize: '1rem', color: T.fgDim, fontWeight: 400 }}> /100</span>
              </div>
              <div className="mt-2" style={{ fontFamily: T.mono, fontSize: '0.7rem', color: T.fgDim }}>→ Add 2 concrete output examples to boost Specificity score to 90+</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECURITY ═══ */}
      <section className="px-6 lg:px-12 py-24" style={{ borderTop: `1px solid ${T.line}`, background: T.bg2 }}>
        <p style={{ fontFamily: T.mono, fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: T.accent, marginBottom: '1rem' }}>// Security Architecture</p>
        <h2 style={{ fontFamily: T.display, fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, color: T.fgBright, lineHeight: 1.05, letterSpacing: '-0.03em', maxWidth: '22ch' }}>
          Enterprise-Grade Security. <em style={{ fontFamily: T.serif, fontStyle: 'italic', fontWeight: 400, color: T.fgDim }}>Zero Compromise.</em>
        </h2>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '🔐', title: 'AES-256-GCM Key Encryption', body: 'Every API key is encrypted with AES-256-GCM before storage. Keys are per-user, never shared across accounts, and never exposed to the frontend layer. Decryption happens server-side only at the moment of the API call.' },
            { icon: '🛡', title: 'Supabase Auth + Row-Level Security', body: 'Authentication is handled by Supabase with JWT-based sessions. PostgreSQL Row-Level Security policies ensure users can only access their own prompts, evaluations, and API keys — enforced at the database level.' },
            { icon: '⚙', title: 'Extension → API (Never Direct)', body: 'The Chrome Extension never calls LLM providers directly. All requests route through the Next.js API layer, enabling centralized rate limiting, caching, and usage tracking.' },
          ].map(card => (
            <div key={card.title} className="p-8 transition-colors duration-200" style={{ border: `1px solid ${T.line}` }}>
              <div className="text-2xl mb-4">{card.icon}</div>
              <div className="mb-2" style={{ fontSize: '0.95rem', fontWeight: 700, color: T.fgBright }}>{card.title}</div>
              <div style={{ fontSize: '0.82rem', color: T.fgDim, lineHeight: 1.7 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="py-24" style={{ borderTop: `1px solid ${T.line}` }}>
        <PricingSection />
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-24" style={{ borderTop: `1px solid ${T.line}` }}>
        <FAQSection />
      </section>

      {/* ═══ CTA ═══ */}
      <section id="start" className="px-6 lg:px-12 py-24 text-center relative overflow-hidden" style={{ borderTop: `1px solid ${T.line}` }}>
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 80% at 50% 100%, ${T.accentGlow}, transparent)` }} />
        <p className="relative z-10" style={{ fontFamily: T.mono, fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: T.accent, marginBottom: '1rem' }}>// Get Started</p>
        <h2 className="relative z-10 mx-auto" style={{ fontFamily: T.display, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 800, color: T.fgBright, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
          Stop Writing. <em style={{ fontFamily: T.serif, fontStyle: 'italic', fontWeight: 400, color: T.fgDim }}>Start Engineering.</em>
        </h2>
        <p className="relative z-10 mt-6 mx-auto max-w-[46ch]" style={{ color: T.fgDim, fontSize: '1rem', lineHeight: 1.8 }}>
          Every great Artificial Intelligence output starts with a great prompt. Claudesy V2 gives your team the infrastructure to engineer prompts at scale — across every LLM, every task type, every workflow.
        </p>
        <div className="relative z-10 mt-10 flex justify-center gap-4 flex-wrap">
          <a href="#" className="inline-flex items-center gap-2.5 no-underline text-white px-8 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(235,89,57,0.4)]" style={{ background: T.accent, fontFamily: T.display, fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            ⟶ &nbsp;Launch Claudesy V2
          </a>
          <a href="#" className="inline-flex items-center gap-2.5 no-underline px-8 py-3.5 transition-all duration-200 hover:border-[#6b6257] hover:text-[#d4ccc0]" style={{ background: 'transparent', color: T.fg, fontFamily: T.display, fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', border: `1px solid ${T.line}` }}>
            View Documentation
          </a>
        </div>
        <p className="relative z-10 mt-8" style={{ fontFamily: T.mono, fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: T.fgDim }}>
          Next.js 15 · React 19 · TypeScript Strict · Supabase · pgvector · WXT · Sentra Healthcare Artificial Intelligence
        </p>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="px-6 lg:px-12 py-12 flex flex-col md:flex-row justify-between items-center gap-6" style={{ borderTop: `1px solid ${T.line}` }}>
        <span style={{ fontFamily: T.mono, fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: T.fgDim }}>
          © 2025 Sentra Healthcare Artificial Intelligence — Claudesy Transformer Prompt Engine V2
        </span>
        <ul className="flex gap-8 list-none p-0">
          {['Documentation', 'API Reference', 'GitHub', 'Privacy'].map(link => (
            <li key={link}>
              <a href="#" className="no-underline transition-colors duration-200 hover:text-[#d4ccc0]" style={{ fontFamily: T.mono, fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: T.fgDim }}>{link}</a>
            </li>
          ))}
        </ul>
      </footer>

    </div>
  )
}
