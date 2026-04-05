import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Claudesy Transformer Engine V2 — Utility helpers
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
