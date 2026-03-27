import { createClient } from '@/lib/supabase/server'
import { ExpertPromptForm } from '@/components/settings/expert-prompt-form'
import { ProfileForm } from '@/components/settings/profile-form'
import { AIProviderForm } from '@/components/settings/ai-provider-form'
import { Separator } from '@/components/ui/separator'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: specialist } = await supabase
    .from('specialists')
    .select('name, logo_url, expert_prompt, ai_provider, openai_api_key, anthropic_api_key, gemini_api_key')
    .eq('id', user!.id)
    .single()

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">Configurações</h2>
        <p className="text-muted-foreground mt-1">
          Personalize seu perfil e o comportamento da IA na geração dos dossiês.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Perfil</h3>
        <p className="text-sm text-muted-foreground">
          Seu nome e logo aparecem no PDF dos dossiês.
        </p>
        <ProfileForm
          defaultName={specialist?.name ?? ''}
          defaultLogoUrl={specialist?.logo_url ?? ''}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Inteligência Artificial</h3>
        <p className="text-sm text-muted-foreground">
          Escolha qual IA usar para gerar os dossiês e cadastre suas chaves de API.
        </p>
        <AIProviderForm
          defaultProvider={(specialist?.ai_provider ?? 'anthropic') as 'anthropic' | 'openai' | 'gemini'}
          hasAnthropicKey={!!specialist?.anthropic_api_key}
          hasOpenAIKey={!!specialist?.openai_api_key}
          hasGeminiKey={!!specialist?.gemini_api_key}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Prompt de instrução</h3>
        <p className="text-sm text-muted-foreground">
          Este é o seu &quot;manual de estilo&quot; para a IA. Ele é injetado em toda geração junto
          com sua metodologia e os dados do aluno. Quanto mais específico, melhor o output.
        </p>
        <div className="rounded-md bg-muted/40 border p-3 text-sm space-y-1">
          <p className="font-medium">Exemplos do que colocar aqui:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
            <li>Estrutura desejada do dossiê (seções obrigatórias)</li>
            <li>Tom de voz: formal, acolhedor, direto, etc.</li>
            <li>Nível de detalhamento de cada seção</li>
            <li>O que nunca deve aparecer no output</li>
            <li>Frases ou expressões que você sempre usa</li>
          </ul>
        </div>
        <ExpertPromptForm defaultPrompt={specialist?.expert_prompt ?? ''} />
      </div>
    </div>
  )
}
