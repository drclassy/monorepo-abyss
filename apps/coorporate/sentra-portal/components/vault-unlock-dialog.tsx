/**
 * PORTAL Sentra — Vault Unlock Dialog
 * Initialize or unlock the environment vault
 */

'use client'

import { AlertCircle, Check, Loader2, Lock, Shield, Unlock } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

// ============================================================================
// Props
// ============================================================================

interface VaultUnlockDialogProps {
  isOpen: boolean
  onClose: () => void
  isInitialized: boolean
  onUnlock: () => void
}

// ============================================================================
// Component
// ============================================================================

export function VaultUnlockDialog({
  isOpen,
  onClose,
  isInitialized,
  onUnlock,
}: VaultUnlockDialogProps): React.JSX.Element {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!isInitialized && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/vault/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterPassword: password,
          initialize: !isInitialized,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPassword('')
        setConfirmPassword('')
        onUnlock()
        onClose()
      } else {
        setError(data.message || 'Failed to unlock vault')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              {isInitialized ? (
                <Unlock className="h-8 w-8 text-primary" />
              ) : (
                <Shield className="h-8 w-8 text-primary" />
              )}
            </div>
          </div>
          <DialogTitle className="text-center">
            {isInitialized ? 'Unlock Vault' : 'Initialize Vault'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isInitialized && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Create a master password to encrypt your environment variables. This password cannot
                be recovered if lost.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {isInitialized ? 'Master Password' : 'Create Master Password'}
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
          </div>

          {!isInitialized && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isInitialized ? (
                <Unlock className="h-4 w-4 mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {isInitialized ? 'Unlock' : 'Initialize'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
