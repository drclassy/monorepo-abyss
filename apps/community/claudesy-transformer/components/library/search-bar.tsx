// Claudesy Transformer Engine V2 — Search Bar
'use client'

import { useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function SearchBar({ onSearch, placeholder = 'Search prompts...' }: SearchBarProps) {
  const [value, setValue] = useState('')

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      onSearch(value)
    }
  }

  return (
    <div className="relative">
      <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sentra-text-muted" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="bg-surface-primary pl-9"
      />
    </div>
  )
}
