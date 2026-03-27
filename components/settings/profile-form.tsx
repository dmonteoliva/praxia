'use client'

import { useState } from 'react'
import { saveSpecialistProfile } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  defaultName: string
  defaultLogoUrl: string
}

export function ProfileForm({ defaultName, defaultLogoUrl }: Props) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setSaved(false)
    setError(null)
    const result = await saveSpecialistProfile(formData)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do especialista</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultName}
          placeholder="Ex: Dr. Ana Lima"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="logo_url">URL do logo (opcional)</Label>
        <Input
          id="logo_url"
          name="logo_url"
          defaultValue={defaultLogoUrl}
          placeholder="https://exemplo.com/logo.png"
          type="url"
        />
        <p className="text-xs text-muted-foreground">
          Aparece no cabeçalho do PDF. Use uma URL pública de imagem (PNG ou JPG).
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar perfil'}
        </Button>
        {saved && <span className="text-sm text-green-600">Salvo com sucesso.</span>}
      </div>
    </form>
  )
}
