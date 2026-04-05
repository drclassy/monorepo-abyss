// Claudesy CTE V2 — Reusable copy-to-clipboard button

"use client"

import { useState, useCallback } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CopyButtonProps {
  text: string
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export function CopyButton({
  text,
  className,
  variant = "outline",
  size = "sm",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea")
      textarea.value = text
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [text])

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={className}
      aria-label={copied ? "Tersalin" : "Salin ke clipboard"}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-1" />
          Tersalin
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-1" />
          Salin
        </>
      )}
    </Button>
  )
}
