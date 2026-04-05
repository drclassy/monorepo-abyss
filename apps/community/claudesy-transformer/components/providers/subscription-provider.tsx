// Claudesy CTE V2 — Subscription Context Provider

"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { SubscriptionTier, UsageType } from "@prisma/client"
import type { TierLimits } from "@/lib/billing/plans"

interface QuotaInfo {
  allowed: boolean
  used: number
  limit: number
  remaining: number
}

interface SubscriptionState {
  tier: SubscriptionTier
  tierLabel: string
  limits: TierLimits | null
  usage: Record<UsageType, QuotaInfo> | null
  isLoading: boolean
  refresh: () => Promise<void>
  canUse: (type: UsageType) => boolean
  showUpgradeModal: boolean
  setShowUpgradeModal: (show: boolean) => void
  upgradeReason: string
  promptUpgrade: (reason: string) => void
}

const SubscriptionContext = createContext<SubscriptionState>({
  tier: "GRATIS",
  tierLabel: "Gratis",
  limits: null,
  usage: null,
  isLoading: true,
  refresh: async () => {},
  canUse: () => true,
  showUpgradeModal: false,
  setShowUpgradeModal: () => {},
  upgradeReason: "",
  promptUpgrade: () => {},
})

export function useSubscription() {
  return useContext(SubscriptionContext)
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<SubscriptionTier>("GRATIS")
  const [tierLabel, setTierLabel] = useState("Gratis")
  const [limits, setLimits] = useState<TierLimits | null>(null)
  const [usage, setUsage] = useState<Record<UsageType, QuotaInfo> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState("")

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/usage")
      if (!res.ok) return
      const data = await res.json()
      setTier(data.tier)
      setTierLabel(data.tierLabel)
      setLimits(data.limits)
      setUsage(data.usage)
    } catch {
      // Silent fail — user might not be logged in
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const canUse = useCallback(
    (type: UsageType): boolean => {
      if (!usage) return true
      const quota = usage[type]
      if (!quota) return true
      return quota.allowed
    },
    [usage]
  )

  const promptUpgrade = useCallback((reason: string) => {
    setUpgradeReason(reason)
    setShowUpgradeModal(true)
  }, [])

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        tierLabel,
        limits,
        usage,
        isLoading,
        refresh,
        canUse,
        showUpgradeModal,
        setShowUpgradeModal,
        upgradeReason,
        promptUpgrade,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}
