// Claudesy Transformer Engine V2 — Provider Configuration
'use client'

import { useState } from 'react'
import type { LLMProviderName, ProviderKeySource } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Eye, EyeSlash, Trash } from '@phosphor-icons/react'

const PROVIDER_INFO: Record<LLMProviderName, { name: string; keyPrefix: string; docsUrl: string }> = {
  CLAUDE: { name: 'Anthropic (Claude)', keyPrefix: 'sk-ant-', docsUrl: 'https://console.anthropic.com/' },
  OPENAI: { name: 'OpenAI', keyPrefix: 'sk-', docsUrl: 'https://platform.openai.com/api-keys' },
  MISTRAL: { name: 'Mistral AI', keyPrefix: '', docsUrl: 'https://console.mistral.ai/' },
  GEMINI: { name: 'Google AI (Gemini)', keyPrefix: '', docsUrl: 'https://aistudio.google.com/apikey' },
  QWEN: { name: 'Alibaba (Qwen)', keyPrefix: '', docsUrl: 'https://dashscope.console.aliyun.com/' },
  GROK: { name: 'xAI (Grok)', keyPrefix: '', docsUrl: 'https://console.x.ai/' },
  LOCAL: { name: 'Local (Ollama)', keyPrefix: '', docsUrl: 'https://ollama.ai/' },
}

interface ProviderConfigProps {
  provider: LLMProviderName
  hasKey: boolean
  source: ProviderKeySource
  isBusy?: boolean
  onSave: (provider: LLMProviderName, key: string) => Promise<void>
  onRemove: (provider: LLMProviderName) => Promise<void>
}

export function ProviderConfig({
  provider,
  hasKey,
  source,
  isBusy = false,
  onSave,
  onRemove,
}: ProviderConfigProps) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const info = PROVIDER_INFO[provider]

  if (provider === 'LOCAL') {
    return (
      <Card className="border-sentra-border-subtle bg-surface-primary">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{info.name}</CardTitle>
            <Badge variant="outline" className="text-[10px]">No key needed</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-sentra-text-muted">
            Ollama runs locally at localhost:11434. No API key required.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-sentra-border-subtle bg-surface-primary">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{info.name}</CardTitle>
          {hasKey ? (
            source === 'ENV' ? (
              <Badge className="bg-blue-500/10 text-blue-400 text-[10px]">
                Managed by server
              </Badge>
            ) : (
              <Badge className="bg-green-500/10 text-green-400 text-[10px]">
                <Check className="mr-1 h-3 w-3" />
                Configured
              </Badge>
            )
          ) : (
            <Badge variant="outline" className="text-[10px]">Not set</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasKey ? (
          <div className="flex items-center gap-2">
            <p className="flex-1 text-xs text-sentra-text-muted">
              {source === 'ENV'
                ? 'API key tersedia dari konfigurasi server'
                : 'API key disimpan terenkripsi di server'}
            </p>
            {source === 'USER' ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void onRemove(provider)}
                disabled={isBusy}
                className="h-7 gap-1 text-xs text-red-400"
              >
                <Trash className="h-3 w-3" />
                Remove
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`${info.keyPrefix}...`}
                className="bg-surface-secondary pr-8 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sentra-text-muted"
              >
                {showKey ? <EyeSlash className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            <Button
              size="sm"
              onClick={() => {
                if (apiKey.trim()) {
                  void onSave(provider, apiKey.trim())
                  setApiKey('')
                }
              }}
              disabled={!apiKey.trim() || isBusy}
              className="bg-sentra-accent text-white hover:bg-sentra-accent-hover"
            >
              Save
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
