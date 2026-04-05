// Claudesy CTE V2 — Pricing Table Component

"use client"

import { Check, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSubscription } from "@/components/providers/subscription-provider"

interface PricingTier {
  id: string
  name: string
  price: string
  priceAnnual: string
  description: string
  features: { label: string; included: boolean }[]
  cta: string
  highlighted: boolean
}

const TIERS: PricingTier[] = [
  {
    id: "GRATIS",
    name: "Gratis",
    price: "Rp 0",
    priceAnnual: "Rp 0",
    description: "Mulai eksplorasi prompt engineering",
    features: [
      { label: "20 transform/hari", included: true },
      { label: "3 optimisasi AI/hari", included: true },
      { label: "3 evaluasi/hari", included: true },
      { label: "2 model (GPT-4o, Claude Sonnet)", included: true },
      { label: "Riwayat lokal (50 item)", included: true },
      { label: "Preset kustom", included: false },
      { label: "Akses API", included: false },
    ],
    cta: "Paket saat ini",
    highlighted: false,
  },
  {
    id: "PRO",
    name: "Pro",
    price: "Rp 49.000",
    priceAnnual: "Rp 399.000",
    description: "Untuk profesional & kreator konten",
    features: [
      { label: "Transform unlimited", included: true },
      { label: "50 optimisasi AI/hari", included: true },
      { label: "30 evaluasi/hari", included: true },
      { label: "Semua 7 model AI", included: true },
      { label: "Riwayat cloud (unlimited)", included: true },
      { label: "20 preset kustom", included: true },
      { label: "Akses API", included: false },
    ],
    cta: "Upgrade ke Pro",
    highlighted: true,
  },
  {
    id: "TIM",
    name: "Tim",
    price: "Rp 149.000",
    priceAnnual: "Rp 1.249.000",
    description: "Untuk tim & kolaborasi",
    features: [
      { label: "Transform unlimited", included: true },
      { label: "200 optimisasi AI/hari (shared)", included: true },
      { label: "100 evaluasi/hari (shared)", included: true },
      { label: "Semua 7 model AI", included: true },
      { label: "Riwayat cloud (shared)", included: true },
      { label: "100 preset kustom (shared)", included: true },
      { label: "Hingga 10 anggota tim", included: true },
    ],
    cta: "Upgrade ke Tim",
    highlighted: false,
  },
]

interface PricingTableProps {
  onSelectTier?: (tierId: string) => void
}

export function PricingTable({ onSelectTier }: PricingTableProps) {
  const { tier: currentTier } = useSubscription()

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {TIERS.map((t) => {
        const isCurrent = t.id === currentTier
        return (
          <div
            key={t.id}
            className={`relative rounded-xl border p-6 ${
              t.highlighted
                ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]/5"
                : "border-[var(--border-medium)] bg-[var(--surface-primary)]"
            }`}
          >
            {t.highlighted && (
              <Badge className="absolute -top-2.5 left-4 bg-[var(--accent-primary)] text-white">
                Paling Populer
              </Badge>
            )}

            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {t.name}
            </h3>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{t.description}</p>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[var(--text-primary)]">
                {t.price}
              </span>
              {t.id !== "GRATIS" && (
                <span className="text-sm text-[var(--text-muted)]">/bulan</span>
              )}
            </div>
            {t.id !== "GRATIS" && (
              <p className="text-xs text-[var(--text-muted)]">
                {t.priceAnnual}/tahun (hemat lebih banyak)
              </p>
            )}

            <ul className="mt-4 space-y-2">
              {t.features.map((f) => (
                <li key={f.label} className="flex items-center gap-2 text-sm">
                  {f.included ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Minus className="h-4 w-4 text-[var(--text-muted)]" />
                  )}
                  <span className={f.included ? "text-[var(--text-body)]" : "text-[var(--text-muted)]"}>
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              className={`mt-6 w-full ${
                t.highlighted
                  ? "bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)]"
                  : ""
              }`}
              variant={t.highlighted ? "default" : "outline"}
              disabled={isCurrent}
              onClick={() => onSelectTier?.(t.id)}
            >
              {isCurrent ? "Paket saat ini" : t.cta}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
