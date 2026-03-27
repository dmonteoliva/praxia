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

export async function saveAISettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const provider = formData.get('ai_provider') as string
  const openaiKey = formData.get('openai_api_key') as string
  const anthropicKey = formData.get('anthropic_api_key') as string
  const geminiKey = formData.get('gemini_api_key') as string

  const updates: Record<string, string | null> = { ai_provider: provider }
  // Só atualiza a key se o usuário preencheu algo (campo vazio = não altera)
  if (openaiKey.trim()) updates.openai_api_key = openaiKey.trim()
  if (anthropicKey.trim()) updates.anthropic_api_key = anthropicKey.trim()
  if (geminiKey.trim()) updates.gemini_api_key = geminiKey.trim()

  const { error } = await supabase
    .from('specialists')
    .update(updates)
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
