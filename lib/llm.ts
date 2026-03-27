export type AIProvider = 'anthropic' | 'openai' | 'gemini'

export interface GenerateDossierParams {
  expertPrompt: string
  methodologyContext: string
  studentData: string
  provider: AIProvider
  apiKey: string
}

function buildMessages(methodologyContext: string, studentData: string) {
  const userMessage = `
<metodologia_do_especialista>
${methodologyContext}
</metodologia_do_especialista>

<dados_do_aluno>
${studentData}
</dados_do_aluno>

Com base nas informações acima, gere um plano de ação completo e personalizado para este aluno seguindo todas as instruções do sistema.
`.trim()

  return userMessage
}

function buildSystemPrompt(expertPrompt: string) {
  return expertPrompt.trim() ||
    'Você é um especialista e vai gerar um plano de ação personalizado e detalhado para o aluno com base na sua metodologia.'
}

async function generateWithAnthropic(params: GenerateDossierParams): Promise<string> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey: params.apiKey })

  const MAX_RETRIES = 2
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: buildSystemPrompt(params.expertPrompt),
        messages: [{ role: 'user', content: buildMessages(params.methodologyContext, params.studentData) }],
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

async function generateWithOpenAI(params: GenerateDossierParams): Promise<string> {
  const OpenAI = (await import('openai')).default
  const client = new OpenAI({ apiKey: params.apiKey })

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 4096,
    messages: [
      { role: 'system', content: buildSystemPrompt(params.expertPrompt) },
      { role: 'user', content: buildMessages(params.methodologyContext, params.studentData) },
    ],
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Resposta vazia do modelo')
  return content
}

async function generateWithGemini(params: GenerateDossierParams): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const client = new GoogleGenerativeAI(params.apiKey)
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = `${buildSystemPrompt(params.expertPrompt)}\n\n${buildMessages(params.methodologyContext, params.studentData)}`

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  if (!text) throw new Error('Resposta vazia do modelo')
  return text
}

export async function generateDossier(params: GenerateDossierParams): Promise<string> {
  switch (params.provider) {
    case 'anthropic':
      return generateWithAnthropic(params)
    case 'openai':
      return generateWithOpenAI(params)
    case 'gemini':
      return generateWithGemini(params)
    default:
      throw new Error(`Provedor de IA desconhecido: ${params.provider}`)
  }
}
