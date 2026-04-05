"use client"

// Claudesy CTE V2 — Pricing Section (Dark Sentra Theme)

import { useState } from "react"

const T = {
  bg: '#0d0d0d',
  bg2: '#111111',
  bg3: '#161616',
  fg: '#b7ab98',
  fgDim: '#6b6257',
  fgBright: '#d4ccc0',
  accent: '#eb5939',
  line: 'rgba(183, 171, 152, 0.08)',
  mono: "var(--font-plus-jakarta, 'Plus Jakarta Sans', sans-serif)",
  serif: "var(--font-instrument-serif, 'Instrument Serif', serif)",
  display: "var(--font-plus-jakarta, 'Plus Jakarta Sans', sans-serif)",
}

export default function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("annually")

  const pricing = {
    gratis: { monthly: "Gratis", annually: "Gratis" },
    pro: { monthly: "Rp 49.000", annually: "Rp 399.000" },
    tim: { monthly: "Rp 149.000", annually: "Rp 1.249.000" },
  }

  return (
    <div className="w-full flex flex-col justify-center items-center gap-2 px-6 lg:px-12">
      {/* Header */}
      <div className="self-stretch py-12 md:py-16 flex justify-center items-center" style={{ borderBottom: `1px solid ${T.line}` }}>
        <div className="w-full max-w-[586px] flex flex-col items-center gap-4">
          <span className="px-3.5 py-1.5 rounded-full flex items-center gap-2" style={{ border: `1px solid ${T.line}`, background: T.bg2 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1V11M8.5 3H4.75C4.28587 3 3.84075 3.18437 3.51256 3.51256C3.18437 3.84075 3 4.28587 3 4.75C3 5.21413 3.18437 5.65925 3.51256 5.98744C3.84075 6.31563 4.28587 6.5 4.75 6.5H7.25C7.71413 6.5 8.15925 6.68437 8.48744 7.01256C8.81563 7.34075 9 7.78587 9 8.25C9 8.71413 8.81563 9.15925 8.48744 9.48744C8.15925 9.81563 7.71413 10 7.25 10H3.5" stroke={T.accent} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span style={{ fontFamily: T.mono, fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: T.accent }}>Paket & Harga</span>
          </span>
          <h2 className="text-center" style={{ fontFamily: T.display, fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, color: T.fgBright, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
            Paket yang berkembang dengan ambisi Anda
          </h2>
          <p className="text-center" style={{ color: T.fgDim, fontSize: '0.95rem', lineHeight: 1.7 }}>
            Dari pengembang individu hingga tim enterprise, CTE2 menyesuaikan dengan kebutuhan Anda.<br/>Mulai optimalkan prompt secara instan—tanpa kartu kredit diperlukan.
          </p>
        </div>
      </div>

      {/* Toggle */}
      <div className="self-stretch py-9 relative flex justify-center items-center">
        <div className="w-full max-w-[1060px] h-0 absolute left-1/2 -translate-x-1/2 top-[63px] z-0" style={{ borderTop: `1px solid ${T.line}` }} />
        <div className="p-3 relative z-20 rounded-lg flex justify-center items-center" style={{ background: T.bg2, border: `1px solid ${T.line}` }}>
          <div className="p-[2px] rounded-full flex items-center gap-[2px] relative" style={{ background: 'rgba(183,171,152,0.08)', border: `0.5px solid ${T.line}` }}>
            <div className={`absolute top-[2px] w-[calc(50%-1px)] h-[calc(100%-4px)] rounded-full transition-all duration-300 ease-in-out ${billingPeriod === "annually" ? "left-[2px]" : "right-[2px]"}`} style={{ background: T.bg3, boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} />
            {['annually', 'monthly'].map(period => (
              <button key={period} onClick={() => setBillingPeriod(period as "monthly" | "annually")} className="px-4 py-1 rounded-full flex justify-center items-center transition-colors duration-300 relative z-10 flex-1">
                <span className="text-[13px] font-medium leading-5 transition-colors duration-300" style={{ color: billingPeriod === period ? T.fgBright : T.fgDim }}>
                  {period === 'annually' ? 'Tahunan' : 'Bulanan'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="self-stretch flex justify-center" style={{ borderTop: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
        <div className="flex-1 flex flex-col md:flex-row justify-center items-stretch gap-0 max-w-[1200px]">

          {/* Gratis */}
          <PricingCard
            name="Gratis"
            desc="Untuk individu yang mulai menjelajahi kekuatan SuperPrompt Artificial Intelligence."
            price="Rp 0"
            priceNote="selamanya gratis"
            cta="Mulai Gratis"
            features={["20 transform/hari", "3 optimisasi/hari", "2 model: GPT-4o & Claude Sonnet", "5 mode transformasi", "Template standar", "Dukungan komunitas"]}
          />

          {/* Pro */}
          <PricingCard
            name="Pro"
            desc="Untuk profesional yang butuh akses penuh ke semua model Artificial Intelligence generasi terbaru."
            price={pricing.pro[billingPeriod]}
            priceNote={`per ${billingPeriod === "monthly" ? "bulan" : "tahun"}, per pengguna.`}
            cta="Coba 7 Hari Gratis"
            features={["Unlimited transform/hari", "50 optimisasi/hari", "Semua 7 provider Artificial Intelligence terbaru", "Cloud history & saved prompts", "20 custom presets", "Dukungan prioritas via email"]}
            animated
            billingPeriod={billingPeriod}
            prices={pricing.pro}
          />

          {/* Tim (Featured) */}
          <PricingCard
            name="Tim"
            desc="Untuk tim yang membangun aplikasi Artificial Intelligence bersama dalam skala besar."
            price={pricing.tim[billingPeriod]}
            priceNote={`per ${billingPeriod === "monthly" ? "bulan" : "tahun"}, per tim (maks 10 anggota).`}
            cta="Coba 14 Hari Gratis"
            features={["Semua fitur Pro", "Hingga 10 anggota tim", "200 optimisasi/hari", "100 custom presets bersama", "Team workspace & kolaborasi", "Dukungan prioritas SLA 24 jam"]}
            featured
            animated
            billingPeriod={billingPeriod}
            prices={pricing.tim}
          />

          {/* Enterprise */}
          <PricingCard
            name="Enterprise"
            desc="Solusi Artificial Intelligence skala penuh dengan infrastruktur dan keamanan khusus."
            price="Custom"
            priceNote="harga sesuai kebutuhan."
            cta="Hubungi Penjualan"
            features={["Semua fitur Tim", "Hingga 100 anggota", "Unlimited Artificial Intelligence calls", "Akses API penuh", "Single Sign-On (SSO/SAML)", "Self-hosted atau VPC deployment", "Kepatuhan SOC 2 & enkripsi enterprise", "Spesialis Artificial Intelligence khusus + SLA kustom"]}
          />

        </div>
      </div>
    </div>
  )
}

function PricingCard({
  name, desc, price, priceNote, cta, features,
  featured, animated, billingPeriod, prices,
}: {
  name: string; desc: string; price: string; priceNote: string; cta: string; features: string[];
  featured?: boolean; animated?: boolean; billingPeriod?: string; prices?: { monthly: string; annually: string };
}) {
  const bg = featured ? T.accent : T.bg2
  const textPrimary = featured ? '#fff' : T.fgBright
  const textSecondary = featured ? 'rgba(255,255,255,0.7)' : T.fgDim
  const featureText = featured ? 'rgba(255,255,255,0.9)' : T.fg
  const checkColor = featured ? '#fff' : T.fgDim
  const ctaBg = featured ? '#fff' : T.accent
  const ctaText = featured ? T.accent : '#fff'
  const border = featured ? 'transparent' : T.line

  return (
    <div className="flex-1 px-6 py-8 flex flex-col gap-12" style={{ background: bg, borderRight: `1px solid ${border}` }}>
      <div className="flex flex-col gap-9">
        <div className="flex flex-col gap-2">
          <div style={{ color: textPrimary, fontSize: '1.1rem', fontWeight: 600 }}>{name}</div>
          <div className="max-w-[242px]" style={{ color: textSecondary, fontSize: '0.85rem', lineHeight: 1.5 }}>{desc}</div>
        </div>
        <div className="flex flex-col gap-1">
          {animated && prices && billingPeriod ? (
            <div className="relative h-[60px] flex items-center" style={{ fontFamily: T.serif, fontSize: '2.5rem', fontWeight: 500, color: textPrimary }}>
              <span className="invisible">{prices[billingPeriod as keyof typeof prices]}</span>
              {['annually', 'monthly'].map(p => (
                <span key={p} className="absolute inset-0 flex items-center transition-all duration-500" style={{ opacity: billingPeriod === p ? 1 : 0, transform: `scale(${billingPeriod === p ? 1 : 0.8})`, filter: `blur(${billingPeriod === p ? 0 : 4}px)` }}>
                  {prices[p as keyof typeof prices]}
                </span>
              ))}
            </div>
          ) : (
            <div className="h-[60px] flex items-center" style={{ fontFamily: T.serif, fontSize: price === 'Custom' ? '2.8rem' : '2.5rem', fontWeight: 500, color: textPrimary }}>{price}</div>
          )}
          <div style={{ color: textSecondary, fontSize: '0.85rem', fontWeight: 500 }}>{priceNote}</div>
        </div>
        <div className="px-4 py-2.5 rounded-full flex justify-center items-center transition-opacity duration-200 hover:opacity-90 cursor-pointer" style={{ background: ctaBg }}>
          <span style={{ color: ctaText, fontSize: '0.8rem', fontWeight: 600 }}>{cta}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 8.5L2 6" stroke={checkColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span style={{ color: featureText, fontSize: '0.78rem', lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
