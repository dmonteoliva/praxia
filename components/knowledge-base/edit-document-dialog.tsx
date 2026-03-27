'use client'

import { useState } from 'react'
import { updateDocument } from '@/app/actions/knowledge-base'
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
import { Pencil } from 'lucide-react'

interface Props {
  id: string
  title: string | null
  content: string
}

export function EditDocumentDialog({ id, title, content }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await updateDocument(formData)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }), 'text-muted-foreground hover:text-foreground')}>
        <Pencil className="h-3.5 w-3.5" />
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Editar documento</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4 overflow-y-auto pr-1">
          <input type="hidden" name="id" value={id} />
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título (opcional)</Label>
            <Input
              id="edit-title"
              name="title"
              defaultValue={title ?? ''}
              placeholder="Ex: Protocolo de anamnese"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-content">Conteúdo</Label>
            <Textarea
              id="edit-content"
              name="content"
              defaultValue={content}
              className="min-h-[300px] max-h-[50vh] overflow-y-auto resize-none font-mono text-sm"
            />
          </div>
          {error && <p className="text-sm text-destructive shrink-0">{error}</p>}
          <div className="flex justify-end gap-2 shrink-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
