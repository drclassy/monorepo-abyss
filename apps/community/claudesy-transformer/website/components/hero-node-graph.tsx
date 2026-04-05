"use client"

// Claudesy CTE V2 — Hero Node Graph
// Langflow-style pipeline — Dark Sentra theme

export function HeroNodeGraph({ activeCard }: { activeCard: number }) {
  const font = "var(--font-plus-jakarta, 'Plus Jakarta Sans', sans-serif)"

  // Dark Sentra tokens
  const bg = '#161616'
  const fg = '#b7ab98'
  const fgBright = '#d4ccc0'
  const fgDim = '#6b6257'
  const accent = '#eb5939'
  const line = 'rgba(183,171,152,0.08)'

  // Neumorphism for dark surface
  const neu = (active?: boolean) =>
    active
      ? `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(183,171,152,0.06), 0 0 24px rgba(235,89,57,0.08), 0 0 0 2px rgba(235,89,57,0.15)`
      : `0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(183,171,152,0.06)`

  const inset = 'inset 0 1px 3px rgba(0,0,0,0.4), inset 0 -1px 1px rgba(183,171,152,0.04)'

  return (
    <div className="w-full h-full relative">

      {/* ═══ SVG CABLES & PORTS (md+ only) ═══ */}
      <svg
        className="absolute inset-0 w-full h-full z-[1] hidden md:block pointer-events-none"
        viewBox="0 0 960 620"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="g" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── Cable 1: Prompt → Intent (horizontal) ── */}
        <path d="M248,68 C270,68 290,68 312,68" stroke={accent} strokeWidth="1.8" opacity="0.25" strokeLinecap="round" />
        <circle r="4" fill={accent} filter="url(#g)">
          <animateMotion dur="2s" repeatCount="indefinite" path="M248,68 C270,68 290,68 312,68" />
          <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.12;0.88;1" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* ── Cable 2: Intent → Model Router (horizontal) ── */}
        <path d="M588,72 C610,72 640,78 662,78" stroke={accent} strokeWidth="1.8" opacity="0.25" strokeLinecap="round" />
        <circle r="4" fill={accent} filter="url(#g)">
          <animateMotion dur="2s" repeatCount="indefinite" begin="0.35s" path="M588,72 C610,72 640,78 662,78" />
          <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.12;0.88;1" dur="2s" repeatCount="indefinite" begin="0.35s" />
        </circle>

        {/* ── Cable 3: Prompt → Strategy (vertical) ── */}
        <path d="M130,130 C130,160 132,190 132,218" stroke={fg} strokeWidth="1.8" opacity="0.15" strokeLinecap="round" />
        <circle r="4" fill={fg} filter="url(#g)">
          <animateMotion dur="2.2s" repeatCount="indefinite" begin="0.7s" path="M130,130 C130,160 132,190 132,218" />
          <animate attributeName="opacity" values="0;0.7;0.7;0" keyTimes="0;0.12;0.88;1" dur="2.2s" repeatCount="indefinite" begin="0.7s" />
        </circle>

        {/* ── Cable 4: Intent → Context (vertical) ── */}
        <path d="M450,140 C450,168 452,192 452,218" stroke={fg} strokeWidth="1.8" opacity="0.15" strokeLinecap="round" />
        <circle r="4" fill={fg} filter="url(#g)">
          <animateMotion dur="2.2s" repeatCount="indefinite" begin="1s" path="M450,140 C450,168 452,192 452,218" />
          <animate attributeName="opacity" values="0;0.7;0.7;0" keyTimes="0;0.12;0.88;1" dur="2.2s" repeatCount="indefinite" begin="1s" />
        </circle>

        {/* ── Cable 5: Strategy → Context (horizontal) ── */}
        <path d="M262,295 C280,295 295,292 312,292" stroke={fg} strokeWidth="1.8" opacity="0.15" strokeLinecap="round" />
        <circle r="4" fill={fg} filter="url(#g)">
          <animateMotion dur="2s" repeatCount="indefinite" begin="1.3s" path="M262,295 C280,295 295,292 312,292" />
          <animate attributeName="opacity" values="0;0.7;0.7;0" keyTimes="0;0.12;0.88;1" dur="2s" repeatCount="indefinite" begin="1.3s" />
        </circle>

        {/* ── Cable 6: Model → SuperPrompt (long curve) ── */}
        <path d="M810,168 C815,260 770,350 755,415" stroke={accent} strokeWidth="1.8" opacity="0.2" strokeLinecap="round" />
        <circle r="4" fill={accent} filter="url(#g)">
          <animateMotion dur="3s" repeatCount="indefinite" begin="0.5s" path="M810,168 C815,260 770,350 755,415" />
          <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.08;0.92;1" dur="3s" repeatCount="indefinite" begin="0.5s" />
        </circle>

        {/* ── Cable 7: Context → SuperPrompt ── */}
        <path d="M452,380 C452,395 425,405 410,415" stroke={fg} strokeWidth="1.8" opacity="0.15" strokeLinecap="round" />
        <circle r="4" fill={fg} filter="url(#g)">
          <animateMotion dur="2s" repeatCount="indefinite" begin="1.6s" path="M452,380 C452,395 425,405 410,415" />
          <animate attributeName="opacity" values="0;0.7;0.7;0" keyTimes="0;0.12;0.88;1" dur="2s" repeatCount="indefinite" begin="1.6s" />
        </circle>

        {/* ── Cable 8: Strategy → Quality (vertical) ── */}
        <path d="M132,382 C132,398 122,410 118,428" stroke={fg} strokeWidth="1.8" opacity="0.15" strokeLinecap="round" />
        <circle r="4" fill={fg} filter="url(#g)">
          <animateMotion dur="2s" repeatCount="indefinite" begin="1.9s" path="M132,382 C132,398 122,410 118,428" />
          <animate attributeName="opacity" values="0;0.7;0.7;0" keyTimes="0;0.12;0.88;1" dur="2s" repeatCount="indefinite" begin="1.9s" />
        </circle>

        {/* ── Cable 9: Quality → SuperPrompt ── */}
        <path d="M232,485 C255,485 268,502 288,502" stroke={accent} strokeWidth="1.8" opacity="0.2" strokeLinecap="round" />
        <circle r="4" fill={accent} filter="url(#g)">
          <animateMotion dur="2s" repeatCount="indefinite" begin="2.2s" path="M232,485 C255,485 268,502 288,502" />
          <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.12;0.88;1" dur="2s" repeatCount="indefinite" begin="2.2s" />
        </circle>

        {/* ── Port dots ── */}
        {([
          [248,68],[312,68],[588,72],[662,78],
          [130,130],[132,218],[450,140],[452,218],
          [262,295],[312,292],[810,168],[755,415],
          [452,380],[410,415],[132,382],[118,428],
          [232,485],[288,502],
        ] as [number, number][]).map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="5" fill={bg} stroke={accent} strokeWidth="2" opacity="0.6" />
        ))}
      </svg>

      {/* ═══ NODE CARDS ═══ */}
      <div className="absolute inset-0 z-[2] flex flex-col md:block gap-3 p-2 sm:p-3 md:p-0 overflow-y-auto md:overflow-visible">

        {/* ── Node 1: Prompt Input ── */}
        <div
          className="md:absolute md:left-[1%] md:top-[1%] md:w-[25%] rounded-2xl transition-all duration-500"
          style={{ background: bg, boxShadow: neu(activeCard === 0) }}
        >
          <div className="h-[3px] rounded-t-2xl" style={{ background: `linear-gradient(to right, ${accent}, ${accent}33)` }} />
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(235,89,57,0.1)', boxShadow: inset }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="1.5" width="11" height="11" rx="2" stroke={accent} strokeWidth="1.2" fill="none" /><line x1="4" y1="5" x2="10" y2="5" stroke={accent} strokeWidth="0.8" /><line x1="4" y1="7.5" x2="8" y2="7.5" stroke={accent} strokeWidth="0.8" /></svg>
              </div>
              <span style={{ fontFamily: font, fontSize: '13px', fontWeight: 600, color: fgBright }}>Prompt Input</span>
            </div>
            <div className="rounded-xl px-3 py-2.5" style={{ background: '#111111', boxShadow: inset }}>
              <p style={{ color: fgDim, fontSize: '12px', lineHeight: 1.6 }}>&ldquo;Buat email pemasaran untuk produk baru yang meningkatkan konversi...&rdquo;</p>
            </div>
          </div>
        </div>

        {/* ── Node 2: Intent Analyzer ── */}
        <div
          className="md:absolute md:left-[32%] md:top-[0%] md:w-[28%] rounded-2xl transition-all duration-500"
          style={{ background: bg, boxShadow: neu(activeCard === 1) }}
        >
          <div className="h-[3px] rounded-t-2xl" style={{ background: `linear-gradient(to right, ${accent}, ${accent}33)` }} />
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2.5 pb-2" style={{ borderBottom: `1px solid ${line}` }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(235,89,57,0.1)', boxShadow: inset }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="6" r="4" stroke={accent} strokeWidth="1.2" fill="none" /><line x1="10" y1="9.5" x2="12.5" y2="12" stroke={accent} strokeWidth="1.2" strokeLinecap="round" /></svg>
              </div>
              <span style={{ fontFamily: font, fontSize: '13px', fontWeight: 600, color: fgBright }}>Intent Analyzer</span>
            </div>
            <div className="space-y-2">
              {([['Tujuan', 'Konversi'], ['Konteks', 'B2C Indonesia'], ['Mode', 'Pemasaran']] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                    <span style={{ color: fgDim, fontSize: '12px' }}>{label}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md" style={{ background: '#111111', boxShadow: inset, color: fgBright, fontSize: '12px', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Node 3: Model Router ── */}
        <div
          className="md:absolute md:left-[68%] md:top-[1%] md:w-[31%] rounded-2xl transition-all duration-500 hidden md:block"
          style={{ background: bg, boxShadow: neu(activeCard === 2) }}
        >
          <div className="h-[3px] rounded-t-2xl" style={{ background: `linear-gradient(to right, ${accent}, ${accent}33)` }} />
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2.5 pb-2" style={{ borderBottom: `1px solid ${line}` }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(235,89,57,0.1)', boxShadow: inset }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2L12 5.5V9.5L7 13L2 9.5V5.5L7 2Z" stroke={accent} strokeWidth="1.2" fill="none" /></svg>
              </div>
              <span style={{ fontFamily: font, fontSize: '13px', fontWeight: 600, color: fgBright }}>Model Router</span>
            </div>
            <div className="space-y-2">
              {([['Provider', 'Anthropic'], ['Model', 'Claude 4 Sonnet'], ['Tokens', '8,192']] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                    <span style={{ color: fgDim, fontSize: '12px' }}>{label}</span>
                  </div>
                  <span style={{ color: fgBright, fontSize: '12px', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
              <div className="flex items-center justify-end gap-2 pt-1">
                <span style={{ color: fgDim, fontSize: '11px' }}>Response</span>
                <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Node 4: Strategy Injector ── */}
        <div
          className="md:absolute md:left-[1%] md:top-[35%] md:w-[27%] rounded-2xl transition-all duration-500 hidden md:block"
          style={{ background: bg, boxShadow: neu(activeCard === 0) }}
        >
          <div className="h-[3px] rounded-t-2xl" style={{ background: `linear-gradient(to right, ${fg}80, ${fg}20)` }} />
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2.5 pb-2" style={{ borderBottom: `1px solid ${line}` }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(183,171,152,0.08)', boxShadow: inset }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="1.5" width="11" height="11" rx="2" stroke={fg} strokeWidth="1.2" fill="none" /><path d="M5 5L9 5M5 7L9 7M5 9L7 9" stroke={fg} strokeWidth="0.8" strokeLinecap="round" /></svg>
              </div>
              <span style={{ fontFamily: font, fontSize: '13px', fontWeight: 600, color: fgBright }}>Strategy Injector</span>
            </div>
            <div className="space-y-2">
              {([['CoT', 'Active'], ['Role', 'Copywriter'], ['Constraints', '3 rules'], ['Format', 'Email']] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: fg }} />
                    <span style={{ color: fgDim, fontSize: '12px' }}>{label}</span>
                  </div>
                  <span style={{ color: fgBright, fontSize: '12px', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Node 5: Context Architect ── */}
        <div
          className="md:absolute md:left-[32%] md:top-[33%] md:w-[29%] rounded-2xl transition-all duration-500 hidden md:block"
          style={{ background: bg, boxShadow: neu(activeCard === 2) }}
        >
          <div className="h-[3px] rounded-t-2xl" style={{ background: `linear-gradient(to right, ${fg}80, ${fg}20)` }} />
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2.5 pb-2" style={{ borderBottom: `1px solid ${line}` }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(183,171,152,0.08)', boxShadow: inset }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="10" height="10" rx="1.5" stroke={fg} strokeWidth="1" fill="none" /><rect x="4" y="4" width="6" height="6" rx="1" stroke={fg} strokeWidth="0.8" fill="none" /><rect x="5.5" y="5.5" width="3" height="3" rx="0.5" fill={fg} opacity="0.2" /></svg>
              </div>
              <span style={{ fontFamily: font, fontSize: '13px', fontWeight: 600, color: fgBright }}>Context Architect</span>
            </div>
            <div className="space-y-2">
              {([['Layers', '4 deep'], ['Audience', 'Pelanggan B2C'], ['Tone', 'Persuasif'], ['Intent', 'Konversi']] as [string, string][]).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: fgDim }} />
                    <span style={{ color: fgDim, fontSize: '12px' }}>{label}</span>
                  </div>
                  <span style={{ color: fgBright, fontSize: '12px', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Node 6: Quality Gate ── */}
        <div
          className="md:absolute md:left-[1%] md:top-[69%] md:w-[23%] rounded-2xl transition-all duration-500 hidden md:block"
          style={{ background: bg, boxShadow: neu() }}
        >
          <div className="h-[3px] rounded-t-2xl" style={{ background: `linear-gradient(to right, ${fg}80, ${fg}20)` }} />
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(183,171,152,0.08)', boxShadow: inset }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5L8.5 5H12.5L9.5 7.5L10.5 11.5L7 9L3.5 11.5L4.5 7.5L1.5 5H5.5L7 1.5Z" stroke={fg} strokeWidth="1" fill="none" strokeLinejoin="round" /></svg>
              </div>
              <span style={{ fontFamily: font, fontSize: '13px', fontWeight: 600, color: fgBright }}>Quality Gate</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span style={{ color: fgDim, fontSize: '12px' }}>Skor</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: '#111111', boxShadow: inset }}>
                  <div className="h-full w-[94%] rounded-full" style={{ background: `linear-gradient(to right, ${accent}, #22c55e)` }} />
                </div>
                <span style={{ color: fgBright, fontSize: '12px', fontWeight: 600 }}>94</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: fgDim, fontSize: '12px' }}>Status</span>
              <span className="flex items-center gap-1" style={{ color: '#22c55e', fontSize: '12px', fontWeight: 600 }}>
                Pass
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8 3" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </div>
          </div>
        </div>

        {/* ── Node 7: SuperPrompt Output ── */}
        <div
          className="md:absolute md:left-[29%] md:top-[66%] md:w-[70%] rounded-2xl transition-all duration-500 hidden sm:block"
          style={{ background: bg, boxShadow: neu(activeCard === 1) }}
        >
          <div className="h-[3px] rounded-t-2xl" style={{ background: `linear-gradient(to right, ${accent}, ${fg}80, ${accent}33)` }} />
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2.5 pb-2" style={{ borderBottom: `1px solid ${line}` }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(235,89,57,0.1)', boxShadow: inset }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="1.5" width="11" height="11" rx="2" stroke={accent} strokeWidth="1.2" fill="none" /><path d="M4 5L6 7L10 3" stroke={accent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><line x1="4" y1="9.5" x2="10" y2="9.5" stroke={accent} strokeWidth="0.8" /></svg>
              </div>
              <span style={{ fontFamily: font, fontSize: '13px', fontWeight: 600, color: fgBright }}>SuperPrompt Output</span>
              <div className="flex items-center gap-2 ml-auto">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
                <span style={{ color: fgDim, fontSize: '11px' }}>Responding</span>
                <div className="flex gap-0.5">
                  {[0, 0.2, 0.4].map(d => (
                    <div key={d} className="w-1 h-1 rounded-full animate-pulse" style={{ background: accent, animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-xl px-4 py-3" style={{ background: '#111111', boxShadow: inset }}>
              <div style={{ fontSize: '13px', lineHeight: 1.7 }} className="space-y-1.5">
                <div style={{ color: fg }}><span style={{ color: accent, fontWeight: 600 }}>[Role]</span> Kamu adalah copywriter email pemasaran berpengalaman dengan keahlian konversi tinggi untuk audiens B2C Indonesia.</div>
                <div style={{ color: fg }}><span style={{ color: fgDim, fontWeight: 600 }}>[Task]</span> Buat email dengan subject line menarik, hook yang memancing rasa ingin tahu, dan struktur persuasif.</div>
                <div style={{ color: fg }}><span style={{ color: fgDim, fontWeight: 600 }}>[Format]</span> Subject → Hook → Value Proposition → Social Proof → CTA.</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
