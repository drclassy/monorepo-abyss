/**
 * PORTAL Sentra — Environment Variable Card Component
 * Displays and controls an environment variable
 */

'use client'

import { Check, Copy, Edit2, Eye, EyeOff, Lock, Trash2, Unlock, X } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { EnvVariable } from '@/types/vault'

// ============================================================================
// Props
// ============================================================================

interface EnvVariableCardProps {
  variable: EnvVariable
  decryptedValue?: string
  onUpdate?: (id: string, value: string, description?: string) => void
  onDelete?: (id: string) => void
  onReveal?: (id: string) => void
}

// ============================================================================
// Component
// ============================================================================

export function EnvVariableCard({
  variable,
  decryptedValue,
  onUpdate,
  onDelete,
  onReveal,
}: EnvVariableCardProps): React.JSX.Element {
  const [isEditing, setIsEditing] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const [editValue, setEditValue] = useState(decryptedValue || '')
  const [editDescription, setEditDescription] = useState(variable.description || '')
  const [copied, setCopied] = useState(false)

  const handleReveal = async (): Promise<void> => {
    if (!isRevealed) {
      await onReveal?.(variable.id)
    }
    setIsRevealed(!isRevealed)
  }

  const handleCopy = async (): Promise<void> => {
    const valueToCopy = isRevealed && decryptedValue ? decryptedValue : variable.value
    try {
      await navigator.clipboard.writeText(valueToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleSave = (): void => {
    onUpdate?.(variable.id, editValue, editDescription)
    setIsEditing(false)
  }

  const handleCancel = (): void => {
    setEditValue(decryptedValue || '')
    setEditDescription(variable.description || '')
    setIsEditing(false)
  }

  const displayValue =
    isRevealed && decryptedValue
      ? decryptedValue
      : variable.isEncrypted
        ? '•'.repeat(20)
        : variable.value

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <code className="text-sm font-semibold bg-muted px-2 py-1 rounded">
                {variable.key}
              </code>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={handleSave}>
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Value</label>
              <Input
                type="text"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Description</label>
              <Input
                type="text"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                className="mt-1"
                placeholder="Optional description"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <code className="text-sm font-semibold bg-muted px-2 py-1 rounded">
                  {variable.key}
                </code>
                {variable.isEncrypted ? (
                  <Badge variant="default" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Encrypted
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    <Unlock className="h-3 w-3 mr-1" />
                    Plain
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1">
                {variable.isEncrypted && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReveal}
                    title={isRevealed ? 'Hide' : 'Reveal'}
                  >
                    {isRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleCopy} title="Copy">
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} title="Edit">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(variable.id)}
                  title="Delete"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-muted rounded font-mono text-sm">
              <span className="truncate flex-1">{displayValue}</span>
            </div>

            {variable.description && (
              <p className="text-xs text-muted-foreground">{variable.description}</p>
            )}

            <div className="text-xs text-muted-foreground">
              Updated: {new Date(variable.updatedAt).toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
