import { createClient } from '@/lib/supabase/server'
import { getSavedMapping } from '@/app/actions/spreadsheet'
import { GenerateForm } from '@/components/generate/generate-form'
import { buttonVariants } from '@/lib/button-variants'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

export default async function GeneratePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: specialist } = await supabase
    .from('specialists')
    .select('expert_prompt')
    .eq('id', user!.id)
    .single()

  const { count: docCount } = await supabase
    .from('documents')
    .select('*, knowledge_bases!inner(specialist_id)', { count: 'exact', head: true })
    .eq('knowledge_bases.specialist_id', user!.id)

  const savedMapping = await getSavedMapping()

  const missingSetup: string[] = []
  if (!specialist?.expert_prompt) missingSetup.push('prompt de instrução')
  if (!docCount) missingSetup.push('base de conhecimento')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gerar dossiê</h2>
        <p className="text-muted-foreground mt-1">
          Faça upload da planilha do aluno e gere o plano de ação personalizado.
        </p>
      </div>

      {missingSetup.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl border bg-muted/50">
          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Setup incompleto</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Configure {missingSetup.join(' e ')} antes de gerar dossiês.{' '}
              {missingSetup.includes('prompt de instrução') && (
                <Link href="/settings" className="underline underline-offset-4 hover:text-foreground">
                  Ir para configurações
                </Link>
              )}
              {missingSetup.includes('base de conhecimento') && (
                <>
                  {' · '}
                  <Link href="/knowledge-base" className="underline underline-offset-4 hover:text-foreground">
                    Ir para base de conhecimento
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      )}

      <GenerateForm savedMapping={savedMapping} />
    </div>
  )
}
