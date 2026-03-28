import { createClient } from '@/lib/supabase/server'
import { DossierRow } from '@/components/dossiers/dossier-row'
import { buttonVariants } from '@/lib/button-variants'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { FileText, Plus } from 'lucide-react'

export default async function DossiersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: dossiers } = await supabase
    .from('dossiers')
    .select('id, student_name, pdf_url, created_at')
    .eq('specialist_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dossiês</h2>
          <p className="text-muted-foreground mt-1">
            Todos os planos de ação gerados.
          </p>
        </div>
        <Link href="/generate" className={cn(buttonVariants({ size: 'sm' }))}>
          <Plus className="h-4 w-4 mr-1" />
          Novo dossiê
        </Link>
      </div>

      {!dossiers || dossiers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="font-medium">Nenhum dossiê gerado ainda</p>
            <p className="text-sm text-muted-foreground mt-1">
              Gere seu primeiro dossiê na página de geração.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Gerado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dossiers.map((dossier) => (
                <DossierRow
                  key={dossier.id}
                  id={dossier.id}
                  studentName={dossier.student_name}
                  pdfUrl={dossier.pdf_url}
                  createdAt={dossier.created_at}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
