// Claudesy Transformer Engine V2 — Copy Button
'use client'

import { useState, useCallback } from 'react'
import { Check, CopySimple } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  text: string
  className?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'icon'
}

export function CopyButton({
  text,
  className,
  variant = 'ghost',
  size = 'sm',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text])

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn('gap-1.5', className)}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-500" />
          <span className="text-xs">Copied</span>
        </>
      ) : (
        <>
          <CopySimple className="h-3.5 w-3.5" />
          <span className="text-xs">Copy</span>
        </>
      )}
    </Button>
  )
}
