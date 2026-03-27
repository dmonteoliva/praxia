'use client'

import { useState, useTransition } from 'react'
import { parseUploadedSpreadsheet, saveColumnMapping } from '@/app/actions/spreadsheet'
import { generateDossierAction } from '@/app/actions/generate'
import { applyMapping, validateStudentData, SYSTEM_FIELDS } from '@/lib/spreadsheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, ChevronRight, FileText, Loader2, CheckCircle } from 'lucide-react'

type Step = 'upload' | 'mapping' | 'select-student' | 'generating' | 'done'

interface SpreadsheetData {
  columns: string[]
  rows: Record<string, string>[]
  totalRows: number
  suggestedMapping: Record<string, string>
}

interface Props {
  savedMapping: Record<string, string> | null
}

const UNSET = '__none__'

export function GenerateForm({ savedMapping }: Props) {
  const [step, setStep] = useState<Step>('upload')
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetData | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>(savedMapping ?? {})
  const [allRows, setAllRows] = useState<Record<string, string>[]>([])
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // ── Step 1: upload ────────────────────────────────────────────────────────
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    const formData = new FormData()
    formData.append('file', file)

    startTransition(async () => {
      const result = await parseUploadedSpreadsheet(formData)
      if (result?.error) {
        setError(result.error)
        return
      }
      setSpreadsheet(result as SpreadsheetData)
      // Aplica mapping salvo ou sugerido
      setMapping(savedMapping ?? result.suggestedMapping ?? {})
      setStep('mapping')
    })
  }

  // ── Step 2: salvar mapeamento ─────────────────────────────────────────────
  async function handleSaveMapping() {
    const validationErrors: string[] = []
    for (const field of SYSTEM_FIELDS.filter((f) => f.required)) {
      if (!mapping[field.key] || mapping[field.key] === UNSET) {
        validationErrors.push(`"${field.label}" não foi mapeado`)
      }
    }
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '))
      return
    }

    setError(null)
    const formData = new FormData()
    formData.append('mapping', JSON.stringify(mapping))
    await saveColumnMapping(formData)

    setStep('select-student')
  }

  // ── Step 3: selecionar aluno ──────────────────────────────────────────────
  async function handleGenerate() {
    if (!spreadsheet) return
    setError(null)

    // Precisa reler o arquivo completo — para o MVP, usamos as rows da prévia
    // Em produção, o arquivo ficaria em estado ou re-upload seria necessário
    const row = allRows[selectedRowIndex] ?? spreadsheet.rows[selectedRowIndex]
    if (!row) {
      setError('Selecione um aluno')
      return
    }

    const studentData = applyMapping(row, mapping)
    const validationErrors = validateStudentData(studentData, mapping)
    if (validationErrors.length > 0) {
      setError(validationErrors.join('; '))
      return
    }

    setStep('generating')
    startTransition(async () => {
      const result = await generateDossierAction(studentData)
      if (result.error) {
        setError(result.error)
        setStep('select-student')
        return
      }
      setPdfUrl(result.pdfUrl ?? null)
      setStep('done')
    })
  }

  // ── Rendering ─────────────────────────────────────────────────────────────

  if (step === 'upload') {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Upload className="h-8 w-8 text-muted-foreground mb-4" />
          <p className="font-medium mb-1">Faça upload da planilha do aluno</p>
          <p className="text-sm text-muted-foreground mb-4">
            CSV ou Excel (.xlsx) com os dados do aluno
          </p>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleUpload}
              disabled={isPending}
            />
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              {isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processando...</>
              ) : (
                <><Upload className="h-4 w-4" /> Selecionar arquivo</>
              )}
            </span>
          </label>
          {error && <p className="text-sm text-destructive mt-3">{error}</p>}
        </CardContent>
      </Card>
    )
  }

  if (step === 'mapping' && spreadsheet) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Mapear colunas</CardTitle>
            <CardDescription>
              Associe cada campo do sistema à coluna correspondente na sua planilha.
              {spreadsheet.totalRows > 3 && (
                <> Planilha com <strong>{spreadsheet.totalRows} linhas</strong> detectada.</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {SYSTEM_FIELDS.map((field) => (
              <div key={field.key} className="flex items-center gap-4">
                <div className="w-44 shrink-0">
                  <Label className="text-sm">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                </div>
                <Select
                  value={mapping[field.key] ?? UNSET}
                  onValueChange={(val) =>
                    setMapping((prev) => ({
                      ...prev,
                      [field.key]: val === UNSET ? '' : (val as string),
                    }))
                  }
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione a coluna..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNSET}>— Não mapear —</SelectItem>
                    {spreadsheet.columns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {mapping[field.key] && mapping[field.key] !== UNSET && (
                  <Badge variant="secondary" className="shrink-0">
                    auto
                  </Badge>
                )}
              </div>
            ))}

            {/* Colunas extras incluídas automaticamente */}
            {(() => {
              const mappedCols = new Set(Object.values(mapping).filter(Boolean))
              const extras = spreadsheet.columns.filter((c) => !mappedCols.has(c))
              if (extras.length === 0) return null
              return (
                <div className="rounded-md border border-dashed p-3 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    {extras.length} coluna{extras.length > 1 ? 's' : ''} incluída{extras.length > 1 ? 's' : ''} automaticamente no contexto do Claude:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {extras.map((col) => (
                      <Badge key={col} variant="secondary" className="text-xs font-normal">
                        {col}
                      </Badge>
                    ))}
                  </div>
                </div>
              )
            })()}

            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveMapping}>
                Salvar e continuar <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'select-student' && spreadsheet) {
    const rows = allRows.length > 0 ? allRows : spreadsheet.rows
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Selecionar aluno</CardTitle>
            <CardDescription>
              Escolha qual linha da planilha será usada para gerar o dossiê.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {rows.map((row, i) => {
                const studentData = applyMapping(row, mapping)
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedRowIndex(i)}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${
                      selectedRowIndex === i
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/40'
                    }`}
                  >
                    <span className="font-medium text-sm">
                      {studentData['student_name'] || `Linha ${i + 1}`}
                    </span>
                    {studentData['objective'] && (
                      <span className="block text-xs text-muted-foreground mt-0.5 truncate">
                        {studentData['objective']}
                      </span>
                    )}
                  </button>
                )
              })}
              {spreadsheet.totalRows > rows.length && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  Exibindo {rows.length} de {spreadsheet.totalRows} linhas. Re-faça o upload para ver todas.
                </p>
              )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Nova planilha
              </Button>
              <Button onClick={handleGenerate} disabled={isPending}>
                Gerar dossiê <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'generating') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="font-medium">Gerando dossiê...</p>
          <p className="text-sm text-muted-foreground mt-1">
            A IA está analisando a metodologia e os dados do aluno. Isso pode levar até 1 minuto.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (step === 'done' && pdfUrl) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle className="h-8 w-8 text-green-600 mb-4" />
          <p className="font-medium">Dossiê gerado com sucesso!</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            O PDF está pronto para download.
          </p>
          <div className="flex gap-3">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Baixar PDF
            </a>
            <Button variant="outline" onClick={() => { setStep('upload'); setPdfUrl(null); setError(null) }}>
              Gerar outro
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
