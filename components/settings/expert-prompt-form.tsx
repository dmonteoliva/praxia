'use client'

import { useState } from 'react'
import { saveExpertPrompt } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  defaultPrompt: string
}

export function ExpertPromptForm({ defaultPrompt }: Props) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setSaved(false)
    setError(null)
    const result = await saveExpertPrompt(formData)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <Textarea
        name="expert_prompt"
        defaultValue={defaultPrompt}
        placeholder={`Exemplo:\n\nVocê é um especialista em nutrição clínica e vai gerar um plano alimentar personalizado.\n\nEstrutura do dossiê:\n1. Diagnóstico nutricional\n2. Objetivos da intervenção\n3. Protocolo alimentar (café, almoço, jantar, lanches)\n4. Orientações de estilo de vida\n5. Próximos passos\n\nTom: acolhedor e motivacional. Use frases curtas. Nunca mencione calorias exatas.`}
        rows={12}
        className="font-mono text-sm"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar prompt'}
        </Button>
        {saved && (
          <span className="text-sm text-green-600">Salvo com sucesso.</span>
        )}
      </div>
    </form>
  )
}
