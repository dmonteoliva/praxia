'use client'

import { useState, useRef } from 'react'
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
import { Plus, FileUp, AlignLeft } from 'lucide-react'

interface Props {
  knowledgeBaseId: string
}

type InputMode = 'text' | 'file'

const ACCEPTED = '.txt,.md,.docx,.pdf'

export function AddDocumentDialog({ knowledgeBaseId }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<InputMode>('text')
  const [fileName, setFileName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await addDocument(formData)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setOpen(false)
      setFileName(null)
      setMode('text')
    }
  }

  function handleClose() {
    setOpen(false)
    setError(null)
    setFileName(null)
    setMode('text')
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true) }}>
      <DialogTrigger className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))}>
        <Plus className="h-4 w-4 mr-1" />
        Adicionar documento
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Adicionar documento</DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="flex flex-col gap-4 overflow-y-auto pr-1">
          <input type="hidden" name="knowledge_base_id" value={knowledgeBaseId} />

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título (opcional)</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ex: Protocolo de anamnese"
            />
          </div>

          {/* Toggle modo */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('text')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                mode === 'text'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <AlignLeft className="h-4 w-4" />
              Colar texto
            </button>
            <button
              type="button"
              onClick={() => setMode('file')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                mode === 'file'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <FileUp className="h-4 w-4" />
              Upload de arquivo
            </button>
          </div>

          {/* Conteúdo — texto */}
          {mode === 'text' && (
            <div className="space-y-2">
              <Textarea
                id="content"
                name="content"
                placeholder="Cole aqui o texto da sua metodologia, protocolo, material de referência..."
                className="min-h-[200px] max-h-[40vh] overflow-y-auto resize-none"
              />
              <p className="text-xs text-muted-foreground">
                O sistema vai dividir o texto em trechos e indexar cada um para busca semântica.
              </p>
            </div>
          )}

          {/* Conteúdo — arquivo */}
          {mode === 'file' && (
            <div className="space-y-2">
              <input
                ref={fileRef}
                type="file"
                name="file"
                accept={ACCEPTED}
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className={cn(
                  'w-full flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-sm transition-colors',
                  fileName
                    ? 'border-primary/50 bg-primary/5 text-foreground'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                )}
              >
                <FileUp className="h-6 w-6" />
                {fileName ? (
                  <span className="font-medium">{fileName}</span>
                ) : (
                  <>
                    <span>Clique para selecionar</span>
                    <span className="text-xs opacity-70">TXT, MD, DOCX, PDF</span>
                  </>
                )}
              </button>
              <p className="text-xs text-muted-foreground">
                O texto será extraído do arquivo e indexado automaticamente.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-destructive shrink-0">{error}</p>}

          <div className="flex justify-end gap-2 shrink-0 pt-1">
            <Button type="button" variant="outline" onClick={handleClose}>
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
