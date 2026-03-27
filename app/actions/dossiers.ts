'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function deleteDossier(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Busca o registro para obter a URL do PDF
  const { data: dossier } = await supabase
    .from('dossiers')
    .select('id, pdf_url')
    .eq('id', id)
    .eq('specialist_id', user.id)
    .single()

  if (!dossier) return { error: 'Dossiê não encontrado' }

  // Remove arquivo do Storage
  if (dossier.pdf_url) {
    const serviceClient = await createServiceClient()
    const url = new URL(dossier.pdf_url)
    // Extrai o path dentro do bucket: /storage/v1/object/public/dossiers/{path}
    const pathMatch = url.pathname.match(/\/dossiers\/(.+)$/)
    if (pathMatch) {
      await serviceClient.storage.from('dossiers').remove([pathMatch[1]])
    }
  }

  // Remove registro
  const { error } = await supabase.from('dossiers').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/dossiers')
}
