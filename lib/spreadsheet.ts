import * as XLSX from 'xlsx'

export interface ParsedSpreadsheet {
  columns: string[]
  rows: Record<string, string>[]
}

// Campos do sistema que o especialista deve mapear
export const SYSTEM_FIELDS = [
  { key: 'student_name', label: 'Nome do aluno', required: true },
  { key: 'objective', label: 'Objetivo principal', required: true },
  { key: 'context', label: 'Contexto / Histórico', required: false },
  { key: 'extra_1', label: 'Campo extra 1', required: false },
  { key: 'extra_2', label: 'Campo extra 2', required: false },
  { key: 'extra_3', label: 'Campo extra 3', required: false },
]

// Palavras-chave para auto-detecção de colunas
const AUTO_DETECT_HINTS: Record<string, string[]> = {
  student_name: ['nome', 'name', 'aluno', 'cliente', 'paciente', 'student'],
  objective: ['objetivo', 'meta', 'goal', 'objective', 'proposito', 'propósito'],
  context: ['contexto', 'histórico', 'historico', 'context', 'background', 'observação', 'observacao', 'obs'],
}

export function parseSpreadsheet(buffer: ArrayBuffer): ParsedSpreadsheet {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

  if (json.length === 0) return { columns: [], rows: [] }

  const columns = Object.keys(json[0]).map(String)
  const rows = json.map((row) =>
    Object.fromEntries(Object.entries(row).map(([k, v]) => [String(k), String(v)]))
  )

  return { columns, rows }
}

// Sugere mapeamento automático baseado nos nomes das colunas
export function suggestMapping(columns: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}

  for (const [fieldKey, hints] of Object.entries(AUTO_DETECT_HINTS)) {
    for (const col of columns) {
      const colLower = col.toLowerCase().trim()
      if (hints.some((hint) => colLower.includes(hint))) {
        mapping[fieldKey] = col
        break
      }
    }
  }

  return mapping
}

// Aplica mapeamento a uma linha e retorna dados estruturados do aluno
export function applyMapping(
  row: Record<string, string>,
  mapping: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [fieldKey, colName] of Object.entries(mapping)) {
    if (colName && row[colName] !== undefined) {
      result[fieldKey] = row[colName]
    }
  }
  return result
}

// Valida se os campos obrigatórios estão preenchidos
export function validateStudentData(
  data: Record<string, string>,
  mapping: Record<string, string>
): string[] {
  const errors: string[] = []
  for (const field of SYSTEM_FIELDS.filter((f) => f.required)) {
    if (!mapping[field.key]) {
      errors.push(`Campo "${field.label}" não foi mapeado`)
    } else if (!data[field.key]?.trim()) {
      errors.push(`Campo "${field.label}" está vazio para este aluno`)
    }
  }
  return errors
}

// Formata dados do aluno como texto estruturado para o LLM
export function formatStudentData(data: Record<string, string>): string {
  const lines: string[] = []
  for (const field of SYSTEM_FIELDS) {
    const value = data[field.key]
    if (value?.trim()) {
      lines.push(`${field.label}: ${value.trim()}`)
    }
  }
  return lines.join('\n')
}
