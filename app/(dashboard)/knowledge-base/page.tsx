import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CreateKbDialog } from '@/components/knowledge-base/create-kb-dialog'
import { AddDocumentDialog } from '@/components/knowledge-base/add-document-dialog'
import { DeleteKbButton, DeleteDocButton } from '@/components/knowledge-base/delete-button'
import { BookOpen, FileText } from 'lucide-react'

export default async function KnowledgeBasePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: knowledgeBases } = await supabase
    .from('knowledge_bases')
    .select(`
      id, name, created_at,
      documents (id, title, created_at)
    `)
    .eq('specialist_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Base de conhecimento</h2>
          <p className="text-muted-foreground mt-1">
            Cadastre sua metodologia. Esses textos alimentam a IA na geração dos dossiês.
          </p>
        </div>
        <CreateKbDialog />
      </div>

      {!knowledgeBases || knowledgeBases.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="h-8 w-8 text-muted-foreground mb-3" />
            <p className="font-medium">Nenhuma base criada ainda</p>
            <p className="text-sm text-muted-foreground mt-1">
              Crie uma base e adicione os textos da sua metodologia.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {knowledgeBases.map((kb) => {
            const docs = kb.documents ?? []
            return (
              <Card key={kb.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base">{kb.name}</CardTitle>
                      <Badge variant="secondary">
                        {docs.length} {docs.length === 1 ? 'documento' : 'documentos'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <AddDocumentDialog knowledgeBaseId={kb.id} />
                      <DeleteKbButton id={kb.id} />
                    </div>
                  </div>
                  <CardDescription>
                    Criada em {new Date(kb.created_at).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>

                {docs.length > 0 && (
                  <>
                    <Separator />
                    <CardContent className="pt-3">
                      <div className="space-y-2">
                        {docs.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between py-1.5 px-3 rounded-md bg-muted/40 hover:bg-muted/60"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-sm truncate">
                                {doc.title || 'Documento sem título'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-muted-foreground">
                                {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                              </span>
                              <DeleteDocButton id={doc.id} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
