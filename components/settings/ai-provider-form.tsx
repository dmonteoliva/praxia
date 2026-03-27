'use client'

import { useState } from 'react'
import { saveAISettings } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type Provider = 'anthropic' | 'openai' | 'gemini'

interface Props {
  defaultProvider: Provider
  hasAnthropicKey: boolean
  hasOpenAIKey: boolean
  hasGeminiKey: boolean
}

const PROVIDERS: { value: Provider; label: string; model: string }[] = [
  { value: 'anthropic', label: 'Anthropic', model: 'claude-opus-4-6' },
  { value: 'openai', label: 'OpenAI', model: 'gpt-4o' },
  { value: 'gemini', label: 'Google Gemini', model: 'gemini-2.0-flash' },
]

export function AIProviderForm({ defaultProvider, hasAnthropicKey, hasOpenAIKey, hasGeminiKey }: Props) {
  const [provider, setProvider] = useState<Provider>(defaultProvider)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setSaved(false)
    setError(null)
    const result = await saveAISettings(formData)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const hasKeyMap: Record<Provider, boolean> = {
    anthropic: hasAnthropicKey,
    openai: hasOpenAIKey,
    gemini: hasGeminiKey,
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Seleção de provedor */}
      <div className="space-y-2">
        <Label>Provedor ativo</Label>
        <div className="grid grid-cols-3 gap-2">
          {PROVIDERS.map((p) => (
            <label
              key={p.value}
              className={cn(
                'flex flex-col gap-1 rounded-lg border p-3 cursor-pointer transition-colors',
                provider === p.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <input
                type="radio"
                name="ai_provider"
                value={p.value}
                checked={provider === p.value}
                onChange={() => setProvider(p.value)}
                className="sr-only"
              />
              <span className="font-medium text-sm">{p.label}</span>
              <span className="text-xs text-muted-foreground">{p.model}</span>
              {hasKeyMap[p.value] && (
                <span className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                  Chave configurada
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Campos de API key */}
      <div className="space-y-4">
        <Label>Chaves de API</Label>
        <p className="text-xs text-muted-foreground -mt-2">
          Deixe em branco para manter a chave atual. As chaves são armazenadas de forma segura e nunca expostas.
        </p>

        <div className="space-y-2">
          <Label htmlFor="anthropic_key" className="text-sm font-normal">
            Anthropic
          </Label>
          <Input
            id="anthropic_key"
            name="anthropic_api_key"
            type="password"
            placeholder={hasAnthropicKey ? '••••••••••••••••••••' : 'sk-ant-...'}
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="openai_key" className="text-sm font-normal">
            OpenAI
          </Label>
          <Input
            id="openai_key"
            name="openai_api_key"
            type="password"
            placeholder={hasOpenAIKey ? '••••••••••••••••••••' : 'sk-proj-...'}
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gemini_key" className="text-sm font-normal">
            Google Gemini
          </Label>
          <Input
            id="gemini_key"
            name="gemini_api_key"
            type="password"
            placeholder={hasGeminiKey ? '••••••••••••••••••••' : 'AIza...'}
            autoComplete="off"
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar configurações de IA'}
        </Button>
        {saved && <span className="text-sm text-green-600">Salvo com sucesso.</span>}
      </div>
    </form>
  )
}
