import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface GenerateDossierParams {
  expertPrompt: string
  methodologyContext: string
  studentData: string
}

// Gera dossiê via Claude (streaming)
export async function generateDossierStream(params: GenerateDossierParams) {
  const { expertPrompt, methodologyContext, studentData } = params

  const systemPrompt = expertPrompt.trim() ||
    'Você é um especialista e vai gerar um plano de ação personalizado e detalhado para o aluno com base na sua metodologia.'

  const userMessage = `
<metodologia_do_especialista>
${methodologyContext}
</metodologia_do_especialista>

<dados_do_aluno>
${studentData}
</dados_do_aluno>

Com base nas informações acima, gere um plano de ação completo e personalizado para este aluno seguindo todas as instruções do sistema.
`.trim()

  const stream = anthropic.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  return stream
}

// Gera dossiê completo (sem streaming, para uso na geração de PDF)
export async function generateDossier(params: GenerateDossierParams): Promise<string> {
  const { expertPrompt, methodologyContext, studentData } = params

  const systemPrompt = expertPrompt.trim() ||
    'Você é um especialista e vai gerar um plano de ação personalizado e detalhado para o aluno com base na sua metodologia.'

  const userMessage = `
<metodologia_do_especialista>
${methodologyContext}
</metodologia_do_especialista>

<dados_do_aluno>
${studentData}
</dados_do_aluno>

Com base nas informações acima, gere um plano de ação completo e personalizado para este aluno seguindo todas as instruções do sistema.
`.trim()

  const MAX_RETRIES = 2
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const message = await anthropic.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      })

      const content = message.content[0]
      if (content.type !== 'text') throw new Error('Resposta inesperada do modelo')
      return content.text
    } catch (err: unknown) {
      const isOverloaded =
        err instanceof Error &&
        (err.message.includes('overloaded') || err.message.includes('529'))

      if (isOverloaded && attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)))
        continue
      }

      lastError = err instanceof Error ? err : new Error(String(err))

      if (isOverloaded) {
        throw new Error('A API do Claude está sobrecarregada no momento. Tente novamente em alguns instantes.')
      }

      throw lastError
    }
  }

  throw lastError ?? new Error('Falha na geração')
}
