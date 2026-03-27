'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function getSpecialistId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  return user.id
}

// ── Knowledge Bases ──────────────────────────────────────────────────────────

export async function createKnowledgeBase(formData: FormData) {
  const name = formData.get('name') as string
  if (!name?.trim()) return { error: 'Nome obrigatório' }

  const specialistId = await getSpecialistId()
  const supabase = await createClient()

  const { error } = await supabase
    .from('knowledge_bases')
    .insert({ specialist_id: specialistId, name: name.trim() })

  if (error) return { error: error.message }

  revalidatePath('/knowledge-base')
}

export async function deleteKnowledgeBase(id: string) {
  const specialistId = await getSpecialistId()
  const supabase = await createClient()

  // RLS garante que só o dono pode deletar; CASCADE remove documentos e embeddings
  const { error } = await supabase
    .from('knowledge_bases')
    .delete()
    .eq('id', id)
    .eq('specialist_id', specialistId)

  if (error) return { error: error.message }

  revalidatePath('/knowledge-base')
}

// ── Documents ────────────────────────────────────────────────────────────────

async function extractTextFromFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const name = file.name.toLowerCase()

  if (name.endsWith('.txt') || name.endsWith('.md')) {
    return buffer.toString('utf-8')
  }

  if (name.endsWith('.docx')) {
    const mammoth = (await import('mammoth')).default
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  if (name.endsWith('.pdf')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>
    const result = await pdfParse(buffer)
    return result.text
  }

  throw new Error('Formato de arquivo não suportado')
}

export async function addDocument(formData: FormData) {
  const knowledgeBaseId = formData.get('knowledge_base_id') as string
  const title = formData.get('title') as string
  const file = formData.get('file') as File | null

  let content = formData.get('content') as string

  if (file && file.size > 0) {
    try {
      content = await extractTextFromFile(file)
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : 'Erro ao ler arquivo' }
    }
  }

  if (!content?.trim()) return { error: 'Conteúdo obrigatório' }

  const specialistId = await getSpecialistId()

  // Verifica que a base pertence ao especialista
  const supabase = await createClient()
  const { data: kb } = await supabase
    .from('knowledge_bases')
    .select('id')
    .eq('id', knowledgeBaseId)
    .eq('specialist_id', specialistId)
    .single()

  if (!kb) return { error: 'Base de conhecimento não encontrada' }

  // Insere documento
  const { error: docError } = await supabase
    .from('documents')
    .insert({ knowledge_base_id: knowledgeBaseId, title: title?.trim() || null, content: content.trim() })

  if (docError) return { error: docError.message }

  revalidatePath('/knowledge-base')
}

export async function deleteDocument(id: string) {
  const specialistId = await getSpecialistId()
  const supabase = await createClient()

  // Verifica propriedade via join
  const { data: doc } = await supabase
    .from('documents')
    .select('id, knowledge_bases!inner(specialist_id)')
    .eq('id', id)
    .single()

  const kb = (doc?.knowledge_bases as unknown) as { specialist_id: string } | null
  if (!doc || kb?.specialist_id !== specialistId) {
    return { error: 'Documento não encontrado' }
  }

  // CASCADE remove embeddings
  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/knowledge-base')
}
