import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/lib/button-variants'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { BookOpen, FileText, Settings, ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: specialist } = await supabase
    .from('specialists')
    .select('name, expert_prompt')
    .eq('id', user!.id)
    .single()

  const { count: dossierCount } = await supabase
    .from('dossiers')
    .select('*', { count: 'exact', head: true })
    .eq('specialist_id', user!.id)

  const { count: documentCount } = await supabase
    .from('documents')
    .select('*, knowledge_bases!inner(specialist_id)', { count: 'exact', head: true })
    .eq('knowledge_bases.specialist_id', user!.id)

  const hasMethodology = (documentCount ?? 0) > 0
  const hasPrompt = !!specialist?.expert_prompt

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          Olá{specialist?.name ? `, ${specialist.name.split(' ')[0]}` : ''}
        </h2>
        <p className="text-muted-foreground mt-1">
          Aqui está um resumo do seu PráxIA.
        </p>
      </div>

      {/* Cards de status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Dossiês gerados</CardDescription>
            <CardTitle className="text-3xl">{dossierCount ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Documentos na base</CardDescription>
            <CardTitle className="text-3xl">{documentCount ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Prompt configurado</CardDescription>
            <CardTitle className="text-3xl">{hasPrompt ? 'Sim' : 'Não'}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Próximos passos se onboarding incompleto */}
      {(!hasMethodology || !hasPrompt) && (
        <Card>
          <CardHeader>
            <CardTitle>Complete seu setup</CardTitle>
            <CardDescription>
              Configure esses itens antes de gerar seu primeiro dossiê.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!hasMethodology && (
              <div className="flex items-center justify-between p-3 rounded-md border bg-muted/30">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Cadastre sua metodologia na base de conhecimento</span>
                </div>
                <Link href="/knowledge-base" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                  Configurar <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            )}
            {!hasPrompt && (
              <div className="flex items-center justify-between p-3 rounded-md border bg-muted/30">
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Escreva seu prompt de instrução de geração</span>
                </div>
                <Link href="/settings" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                  Configurar <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ação principal */}
      {hasMethodology && hasPrompt && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Pronto para gerar</CardTitle>
            <CardDescription>
              Sua metodologia e prompt estão configurados. Faça upload de uma planilha para gerar um dossiê.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/generate" className={cn(buttonVariants())}>
              <FileText className="h-4 w-4 mr-2" />
              Gerar dossiê
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
