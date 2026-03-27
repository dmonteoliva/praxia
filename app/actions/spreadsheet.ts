'use server'

import { createClient } from '@/lib/supabase/server'
import { parseSpreadsheet, suggestMapping } from '@/lib/spreadsheet'

export async function parseUploadedSpreadsheet(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) return { error: 'Nenhum arquivo enviado' }

  const allowedTypes = [
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ]
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
    return { error: 'Formato inválido. Use CSV ou Excel (.xlsx)' }
  }

  const buffer = await file.arrayBuffer()
  const { columns, rows } = parseSpreadsheet(buffer)

  if (columns.length === 0) return { error: 'Planilha vazia ou sem colunas' }

  const suggestedMapping = suggestMapping(columns)

  return { columns, rows: rows.slice(0, 3), totalRows: rows.length, suggestedMapping }
}

export async function saveColumnMapping(formData: FormData) {
  const mappingJson = formData.get('mapping') as string
  if (!mappingJson) return { error: 'Mapeamento inválido' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const mapping = JSON.parse(mappingJson)

  const { error } = await supabase
    .from('column_mappings')
    .upsert(
      { specialist_id: user.id, mapping, updated_at: new Date().toISOString() },
      { onConflict: 'specialist_id' }
    )

  if (error) return { error: error.message }
  return { success: true }
}

export async function getSavedMapping() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('column_mappings')
    .select('mapping')
    .eq('specialist_id', user.id)
    .single()

  return data?.mapping ?? null
}
