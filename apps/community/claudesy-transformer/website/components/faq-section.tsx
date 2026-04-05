"use client"

// Claudesy CTE V2 — FAQ Section (Dark Sentra Theme)

import { useState } from "react"

const T = {
  fgDim: '#6b6257',
  fgBright: '#d4ccc0',
  fg: '#b7ab98',
  accent: '#eb5939',
  line: 'rgba(183, 171, 152, 0.08)',
  display: "var(--font-plus-jakarta, 'Plus Jakarta Sans', sans-serif)",
  mono: "var(--font-plus-jakarta, 'Plus Jakarta Sans', sans-serif)",
}

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "Apa itu Claudesy CTE V2?",
    answer:
      "CTE V2 adalah Claudesy Transformer Prompt Engine 2 — platform optimasi prompt universal yang mengubah ide mentah menjadi SuperPrompt terstruktur untuk model Artificial Intelligence modern. CTE V2 menggunakan meta-prompting, injeksi strategi otomatis, dan rekayasa konteks berlapis untuk memastikan output Artificial Intelligence yang konsisten, dapat diprediksi, dan berkualitas tinggi.",
  },
  {
    question: "Bagaimana cara kerja transformasi prompt?",
    answer:
      "CTE V2 menerima instruksi mentah Anda beserta pilihan model Artificial Intelligence target dan mode transformasi. Secara otomatis menyuntikkan petunjuk strategi spesifik tugas (role definition, Chain-of-Thought hints, output format), lalu menghasilkan SuperPrompt terstruktur lengkap dengan blok Role, Context, Task, Constraints, dan Output Format — siap pakai tanpa editing tambahan.",
  },
  {
    question: "Model Artificial Intelligence apa saja yang didukung CTE V2?",
    answer:
      "CTE V2 mendukung 7 provider Artificial Intelligence generasi terbaru: OpenAI (GPT-5 & o-Series), Anthropic (Claude 4 Series), Google DeepMind (Gemini 3), Meta (Llama 4), xAI (Grok-4), DeepSeek (V3.2), dan Moonshot (Kimi K2). SuperPrompt yang dihasilkan dioptimasi spesifik untuk arsitektur dan kekuatan masing-masing model.",
  },
  {
    question: "Dukungan apa yang tersedia untuk setiap paket?",
    answer:
      "Paket Gratis mendapat akses dokumentasi dan komunitas. Paket Pro mendapat prioritas support via email. Paket Tim mendapat dedicated support dengan SLA respons 24 jam. Paket Enterprise mendapat spesialis Artificial Intelligence khusus, pelatihan strategi kustom, dan dukungan premium 24/7 dengan SLA yang disesuaikan.",
  },
  {
    question: "Apakah data prompt saya aman?",
    answer:
      "Ya. API key Artificial Intelligence provider Anda dienkripsi dengan AES-256-GCM sebelum disimpan. Semua data dienkripsi in-transit (TLS) dan at-rest. Paket Enterprise mendapat opsi self-hosted deployment, VPC, dan kepatuhan SOC 2 untuk kebutuhan keamanan enterprise.",
  },
  {
    question: "Bagaimana cara memulai dengan CTE V2?",
    answer:
      "Daftar paket Gratis — tidak perlu kartu kredit. Anda langsung mendapat 20 transform/hari dengan akses ke 2 model Artificial Intelligence entry-level. Upgrade ke Pro (Rp 49.000/bulan) untuk akses semua 7 provider, unlimited transform, dan cloud history.",
  },
]

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  return (
    <div className="w-full flex justify-center items-start">
      <div className="flex-1 px-6 lg:px-12 py-16 md:py-20 flex flex-col lg:flex-row justify-start items-start gap-6 lg:gap-12">
        {/* Left Column - Header */}
        <div className="w-full lg:flex-1 flex flex-col justify-center items-start gap-4 lg:py-5">
          <p style={{ fontFamily: T.mono, fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: T.accent, marginBottom: '0.5rem' }}>// FAQ</p>
          <div className="w-full font-semibold leading-tight md:leading-[44px] text-4xl tracking-tight" style={{ fontFamily: T.display, color: T.fgBright }}>
            Pertanyaan yang Sering Diajukan
          </div>
          <div className="w-full text-base font-normal leading-7" style={{ color: T.fgDim }}>
            Pelajari bagaimana CTE2 mengubah alur kerja rekayasa prompt Anda
            <br className="hidden md:block" />
            dan memberikan output terstruktur dan optimal dalam skala besar.
          </div>
        </div>

        {/* Right Column - FAQ Items */}
        <div className="w-full lg:flex-1 flex flex-col justify-center items-center">
          <div className="w-full flex flex-col">
            {faqData.map((item, index) => {
              const isOpen = openItems.includes(index)

              return (
                <div key={index} className="w-full overflow-hidden" style={{ borderBottom: `1px solid ${T.line}` }}>
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-5 py-[18px] flex justify-between items-center gap-5 text-left transition-colors duration-200"
                    style={{ background: 'transparent' }}
                    aria-expanded={isOpen}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(183,171,152,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div className="flex-1 text-base font-medium leading-6" style={{ color: T.fgBright }}>
                      {item.question}
                    </div>
                    <div className="flex justify-center items-center">
                      <ChevronDownIcon
                        className={`w-6 h-6 transition-transform duration-300 ease-in-out ${isOpen ? "rotate-180" : "rotate-0"}`}
                        style={{ color: T.fgDim } as React.CSSProperties}
                      />
                    </div>
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="px-5 pb-[18px] text-sm font-normal leading-6" style={{ color: T.fg }}>
                      {item.answer}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
