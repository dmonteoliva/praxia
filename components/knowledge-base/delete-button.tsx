'use client'

import { useState } from 'react'
import { deleteKnowledgeBase, deleteDocument } from '@/app/actions/knowledge-base'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface DeleteKbButtonProps {
  id: string
}

export function DeleteKbButton({ id }: DeleteKbButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Excluir esta base e todos os seus documentos?')) return
    setLoading(true)
    await deleteKnowledgeBase(id)
    setLoading(false)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}

interface DeleteDocButtonProps {
  id: string
}

export function DeleteDocButton({ id }: DeleteDocButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Excluir este documento e seus embeddings?')) return
    setLoading(true)
    await deleteDocument(id)
    setLoading(false)
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleDelete}
      disabled={loading}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
