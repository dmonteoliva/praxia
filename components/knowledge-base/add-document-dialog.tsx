'use client'

import { useState } from 'react'
import { addDocument } from '@/app/actions/knowledge-base'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'

interface Props {
  knowledgeBaseId: string
}

export function AddDocumentDialog({ knowledgeBaseId }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await addDocument(formData)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))}>
        <Plus className="h-4 w-4 mr-1" />
        Adicionar documento
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar documento</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="knowledge_base_id" value={knowledgeBaseId} />
          <div className="space-y-2">
            <Label htmlFor="title">Título (opcional)</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ex: Protocolo de anamnese"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Cole aqui o texto da sua metodologia, protocolo, material de referência..."
              rows={10}
              required
            />
            <p className="text-xs text-muted-foreground">
              O sistema vai dividir este texto em trechos e indexar cada um para busca semântica.
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Indexando...' : 'Adicionar e indexar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
