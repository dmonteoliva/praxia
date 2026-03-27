'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function saveExpertPrompt(formData: FormData) {
  const prompt = formData.get('expert_prompt') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('specialists')
    .update({ expert_prompt: prompt.trim() })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { success: true }
}

export async function saveSpecialistProfile(formData: FormData) {
  const name = formData.get('name') as string
  const logoUrl = formData.get('logo_url') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase
    .from('specialists')
    .update({
      name: name.trim(),
      logo_url: logoUrl?.trim() || null,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { success: true }
}
