'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateDossier, type AIProvider } from '@/lib/llm'
import { formatStudentData } from '@/lib/spreadsheet'
import { generatePDFBuffer } from '@/lib/pdf/generator'

export interface GenerateResult {
  dossierId?: string
  pdfUrl?: string
  error?: string
}

export async function generateDossierAction(
  studentData: Record<string, string>
): Promise<GenerateResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Busca dados do especialista
  const { data: specialist } = await supabase
    .from('specialists')
    .select('name, logo_url, expert_prompt, ai_provider, openai_api_key, anthropic_api_key, gemini_api_key')
    .eq('id', user.id)
    .single()

  if (!specialist) return { error: 'Especialista não encontrado' }
  if (!specialist.expert_prompt) {
    return { error: 'Configure seu prompt de instrução antes de gerar dossiês.' }
  }

  const provider = (specialist.ai_provider ?? 'anthropic') as AIProvider
  const apiKeyMap: Record<AIProvider, string | null> = {
    anthropic: specialist.anthropic_api_key ?? process.env.ANTHROPIC_API_KEY ?? null,
    openai: specialist.openai_api_key ?? process.env.OPENAI_API_KEY ?? null,
    gemini: specialist.gemini_api_key ?? null,
  }
  const apiKey = apiKeyMap[provider]
  if (!apiKey) {
    return { error: `Chave de API para ${provider} não configurada. Acesse Configurações → IA.` }
  }

  const studentName = studentData['student_name'] || 'Aluno'

  // 1. Busca todos os documentos da base de conhecimento do especialista
  const { data: documents } = await supabase
    .from('documents')
    .select('title, content, knowledge_bases!inner(specialist_id)')
    .eq('knowledge_bases.specialist_id', user.id)

  const methodologyContext = documents?.length
    ? documents
        .map((doc) => (doc.title ? `## ${doc.title}\n\n${doc.content}` : doc.content))
        .join('\n\n---\n\n')
    : ''

  // 2. Formata dados do aluno
  const formattedStudentData = formatStudentData(studentData)

  // 3. Gera dossiê com Claude
  let dossierContent: string
  try {
    dossierContent = await generateDossier({
      expertPrompt: specialist.expert_prompt,
      methodologyContext,
      studentData: formattedStudentData,
      provider,
      apiKey,
    })
  } catch (err) {
    return { error: `Erro na geração: ${err instanceof Error ? err.message : 'erro desconhecido'}` }
  }

  // 4. Gera PDF
  let pdfBuffer: Buffer
  try {
    pdfBuffer = await generatePDFBuffer({
      specialistName: specialist.name || 'Especialista',
      logoUrl: specialist.logo_url,
      studentName,
      content: dossierContent,
    })
  } catch (err) {
    return { error: `Erro ao gerar PDF: ${err instanceof Error ? err.message : 'erro desconhecido'}` }
  }

  // 5. Faz upload do PDF para o Supabase Storage
  const serviceClient = await createServiceClient()
  const fileName = `${user.id}/${Date.now()}-${studentName.replace(/\s+/g, '-')}.pdf`

  const { error: uploadError } = await serviceClient.storage
    .from('dossiers')
    .upload(fileName, pdfBuffer, { contentType: 'application/pdf' })

  if (uploadError) return { error: `Erro no upload: ${uploadError.message}` }

  const { data: urlData } = serviceClient.storage
    .from('dossiers')
    .getPublicUrl(fileName)

  // 6. Salva registro na tabela dossiers
  const { data: dossier, error: dbError } = await supabase
    .from('dossiers')
    .insert({
      specialist_id: user.id,
      student_name: studentName,
      pdf_url: urlData.publicUrl,
    })
    .select('id')
    .single()

  if (dbError) return { error: dbError.message }

  return { dossierId: dossier.id, pdfUrl: urlData.publicUrl }
}
