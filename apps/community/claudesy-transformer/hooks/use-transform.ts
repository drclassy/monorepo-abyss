// Claudesy CTE V2 — Transform mutation hook

"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"
import type { TransformRequest, TransformResponse, TransformError } from "@/lib/transform/schemas"

interface UseTransformReturn {
  transform: (request: TransformRequest) => Promise<void>
  result: TransformResponse | null
  isLoading: boolean
  error: string | null
  reset: () => void
}

export function useTransform(): UseTransformReturn {
  const [result, setResult] = useState<TransformResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const transform = useCallback(async (request: TransformRequest) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as TransformError
        const message = errorData.error ?? "Gagal mentransformasi prompt"
        setError(message)
        toast.error(message)
        return
      }

      const data = (await response.json()) as TransformResponse
      setResult(data)
      toast.success("Prompt berhasil ditransformasi!")
    } catch {
      const message = "Gagal terhubung ke server"
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { transform, result, isLoading, error, reset }
}
