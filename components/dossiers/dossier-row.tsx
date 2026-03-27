'use client'

import { useState } from 'react'
import { deleteDossier } from '@/app/actions/dossiers'
import { Button, buttonVariants } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Download, Trash2 } from 'lucide-react'

interface Props {
  id: string
  studentName: string | null
  pdfUrl: string | null
  createdAt: string
}

export function DossierRow({ id, studentName, pdfUrl, createdAt }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`Excluir dossiê de "${studentName ?? 'Aluno'}"?`)) return
    setLoading(true)
    await deleteDossier(id)
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{studentName ?? '—'}</TableCell>
      <TableCell className="text-muted-foreground">
        {new Date(createdAt).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Baixar PDF"
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }))}
            >
              <Download className="h-4 w-4" />
            </a>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDelete}
            disabled={loading}
            className="text-destructive hover:text-destructive"
            title="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
