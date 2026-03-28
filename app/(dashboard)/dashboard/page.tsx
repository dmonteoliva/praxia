import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/lib/button-variants'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { BookOpen, FileText, Settings, ArrowRight, Zap, CheckCircle2, Circle } from 'lucide-react'

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
  const isReady = hasMethodology && hasPrompt
  const firstName = specialist?.name?.split(' ')[0]

  const stats = [
    {
      label: 'Dossiês gerados',
      value: dossierCount ?? 0,
      icon: FileText,
      href: '/dossiers',
    },
    {
      label: 'Documentos na base',
      value: documentCount ?? 0,
      icon: BookOpen,
      href: '/knowledge-base',
    },
    {
      label: 'Setup',
      value: isReady ? 'Completo' : 'Incompleto',
      icon: Zap,
      href: '/settings',
      highlight: isReady,
    },
  ]

  const setupSteps = [
    {
      done: hasMethodology,
      label: 'Cadastre sua metodologia na base de conhecimento',
      href: '/knowledge-base',
      icon: BookOpen,
    },
    {
      done: hasPrompt,
      label: 'Escreva seu prompt de instrução da IA',
      href: '/settings',
      icon: Settings,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">
          Olá{firstName ? `, ${firstName}` : ''} 👋
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Aqui está um resumo do seu PráxIA.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, href, highlight }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              'group rounded-xl border p-5 transition-colors hover:border-primary/40 hover:bg-primary/5',
              highlight ? 'border-primary/30 bg-primary/5' : 'bg-card',
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg',
                highlight ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground',
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors mt-1" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Setup incompleto */}
      {!isReady && (
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div>
            <h3 className="font-semibold">Complete seu setup</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Configure esses itens antes de gerar seu primeiro dossiê.
            </p>
          </div>
          <div className="space-y-2">
            {setupSteps.map(({ done, label, href, icon: Icon }) => (
              <div
                key={href}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border transition-colors',
                  done ? 'border-primary/20 bg-primary/5' : 'bg-muted/30',
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {done
                    ? <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                  }
                  <span className={cn('text-sm truncate', done && 'line-through text-muted-foreground')}>
                    {label}
                  </span>
                </div>
                {!done && (
                  <Link
                    href={href}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'shrink-0 ml-3')}
                  >
                    Configurar
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pronto para gerar */}
      {isReady && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Pronto para gerar</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Sua metodologia e prompt estão configurados. Faça upload de uma planilha para gerar um dossiê.
              </p>
            </div>
            <Link href="/generate" className={cn(buttonVariants(), 'shrink-0')}>
              <FileText className="h-4 w-4 mr-2" />
              Gerar
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
