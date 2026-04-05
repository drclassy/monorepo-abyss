// Claudesy CTE V2 — Upgrade Modal

"use client"

import Link from "next/link"
import { ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSubscription } from "@/components/providers/subscription-provider"

const PRO_FEATURES = [
  "Transform unlimited per hari",
  "50 optimisasi AI per hari",
  "30 evaluasi per hari",
  "Akses semua 7 model AI",
  "Riwayat cloud (unlimited)",
  "20 preset kustom",
]

export function UpgradeModal() {
  const { showUpgradeModal, setShowUpgradeModal, upgradeReason } = useSubscription()

  return (
    <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[var(--text-primary)]">
            <Star className="h-5 w-5 text-[var(--accent-primary)]" />
            Upgrade ke Pro
          </DialogTitle>
          <DialogDescription>
            {upgradeReason || "Dapatkan akses penuh ke semua fitur Claudesy CTE"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--border-medium)] bg-[var(--surface-secondary)] p-4">
            <div className="mb-3 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[var(--text-primary)]">
                Rp 49.000
              </span>
              <span className="text-sm text-[var(--text-muted)]">/bulan</span>
            </div>
            <ul className="space-y-2">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-[var(--text-body)]">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowUpgradeModal(false)}
            >
              Nanti saja
            </Button>
            <Button
              className="flex-1 bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)]"
              asChild
            >
              <Link href="/settings?tab=subscription">
                Upgrade sekarang
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
