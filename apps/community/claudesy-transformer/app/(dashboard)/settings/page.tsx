// Claudesy CTE V2 — Settings Page (Providers + Subscription)
"use client"

import { useSearchParams } from "next/navigation"
import { GearSix } from "@phosphor-icons/react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useLLMConfig } from "@/hooks/use-llm-config"
import { ProviderConfig } from "@/components/settings/provider-config"
import { PricingTable } from "@/components/billing/pricing-table"
import { useSubscription } from "@/components/providers/subscription-provider"
import { Badge } from "@/components/ui/badge"
import { TIER_LABELS } from "@/lib/billing/plans"

export default function SettingsPage() {
  const { providers, saveApiKey, removeApiKey, isLoading: isProviderConfigLoading, error } = useLLMConfig()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") ?? "providers"
  const { tier, tierLabel, usage, isLoading } = useSubscription()

  async function handleSelectTier(tierId: string) {
    if (tierId === "GRATIS" || tierId === tier) return

    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierId, interval: "MONTHLY" }),
      })

      const data = await res.json()

      if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl
      }
    } catch {
      // Error handling via toast in production
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-primary)]/10">
          <GearSix className="h-5 w-5 text-[var(--accent-primary)]" weight="duotone" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            Pengaturan
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Kelola akun, provider AI, dan langganan Anda
          </p>
        </div>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="providers">Provider AI</TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-1.5">
            Langganan
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {tierLabel}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="mt-6 space-y-3">
          <h2 className="text-sm font-medium text-[var(--text-primary)]">
            LLM Providers
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Tambahkan API key untuk menggunakan provider AI yang berbeda. Key
            pribadi Anda akan disimpan terenkripsi di server.
          </p>
          {error ? (
            <div className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </div>
          ) : null}
          {providers.map((p) => (
            <ProviderConfig
              key={p.provider}
              provider={p.provider}
              hasKey={p.hasKey}
              source={p.source}
              isBusy={isProviderConfigLoading}
              onSave={saveApiKey}
              onRemove={removeApiKey}
            />
          ))}
        </TabsContent>

        <TabsContent value="subscription" className="mt-6 space-y-6">
          {/* Current plan summary */}
          <div className="rounded-lg border border-[var(--border-medium)] bg-[var(--surface-primary)] p-4">
            <h2 className="text-sm font-medium text-[var(--text-primary)]">
              Paket saat ini: {TIER_LABELS[tier]}
            </h2>
            {!isLoading && usage && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(["TRANSFORM", "OPTIMIZE", "EVALUATE", "RECOMMEND"] as const).map((type) => {
                  const q = usage[type]
                  if (!q) return null
                  const label = {
                    TRANSFORM: "Transform",
                    OPTIMIZE: "Optimisasi",
                    EVALUATE: "Evaluasi",
                    RECOMMEND: "Rekomendasi",
                  }[type]
                  return (
                    <div key={type} className="text-center">
                      <p className="text-xs text-[var(--text-muted)]">{label}</p>
                      <p className="font-mono text-sm font-bold text-[var(--text-primary)]">
                        {q.limit === -1
                          ? `${q.used} / ∞`
                          : `${q.used} / ${q.limit}`}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Pricing table */}
          <div>
            <h2 className="mb-4 text-sm font-medium text-[var(--text-primary)]">
              Pilih paket
            </h2>
            <PricingTable onSelectTier={handleSelectTier} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
