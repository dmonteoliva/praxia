import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'

// ── Tipos ────────────────────────────────────────────────────────────────────

type InlineSpan =
  | { type: 'text';       content: string }
  | { type: 'bold';       content: string }
  | { type: 'italic';     content: string }
  | { type: 'boldItalic'; content: string }

type Block =
  | { type: 'h1' | 'h2' | 'h3'; spans: InlineSpan[] }
  | { type: 'paragraph';         spans: InlineSpan[] }
  | { type: 'bulletItem';        spans: InlineSpan[] }
  | { type: 'orderedItem';       spans: InlineSpan[]; number: number }
  | { type: 'blockquote';        spans: InlineSpan[] }
  | { type: 'rule' }
  | { type: 'table';             headers: string[]; rows: string[][] }

// ── Parser inline ─────────────────────────────────────────────────────────────

function parseInline(text: string): InlineSpan[] {
  const spans: InlineSpan[] = []
  // Ordem: boldItalic (***) > bold (**) > italic (*)
  const regex = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      spans.push({ type: 'text', content: text.slice(last, match.index) })
    }
    if (match[1] !== undefined) {
      spans.push({ type: 'boldItalic', content: match[1] })
    } else if (match[2] !== undefined) {
      spans.push({ type: 'bold', content: match[2] })
    } else if (match[3] !== undefined) {
      spans.push({ type: 'italic', content: match[3] })
    }
    last = match.index + match[0].length
  }

  if (last < text.length) {
    spans.push({ type: 'text', content: text.slice(last) })
  }

  return spans.length > 0 ? spans : [{ type: 'text', content: text }]
}

// ── Parser de blocos ──────────────────────────────────────────────────────────

function parseTableRow(line: string): string[] {
  return line
    .split('|')
    .map((c) => c.trim())
    .filter((c) => c.length > 0)
}

function isSeparatorRow(line: string): boolean {
  return /^[|\s:|-]+$/.test(line.trim())
}

function parseBlocks(content: string): Block[] {
  const lines = content.split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // Linha vazia
    if (!trimmed) { i++; continue }

    // Tabela (linha começa e termina com |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim())
        i++
      }
      if (tableLines.length >= 2) {
        const headers = parseTableRow(tableLines[0])
        const dataLines = tableLines.slice(1).filter((l) => !isSeparatorRow(l))
        const rows = dataLines.map(parseTableRow)
        blocks.push({ type: 'table', headers, rows })
      }
      continue
    }

    // Régua horizontal
    if (/^[-*_]{3,}$/.test(trimmed)) {
      blocks.push({ type: 'rule' })
      i++; continue
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', spans: parseInline(trimmed.slice(4)) })
      i++; continue
    }
    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', spans: parseInline(trimmed.slice(3)) })
      i++; continue
    }
    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'h1', spans: parseInline(trimmed.slice(2)) })
      i++; continue
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      blocks.push({ type: 'blockquote', spans: parseInline(trimmed.slice(2)) })
      i++; continue
    }

    // Lista não-ordenada
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      blocks.push({ type: 'bulletItem', spans: parseInline(trimmed.slice(2)) })
      i++; continue
    }

    // Lista ordenada
    const orderedMatch = trimmed.match(/^(\d+)\.\s(.*)/)
    if (orderedMatch) {
      blocks.push({ type: 'orderedItem', number: parseInt(orderedMatch[1]), spans: parseInline(orderedMatch[2]) })
      i++; continue
    }

    // Parágrafo
    blocks.push({ type: 'paragraph', spans: parseInline(trimmed) })
    i++
  }

  return blocks
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 60,
    color: '#1a1a1a',
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 60,
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: 'contain',
    marginBottom: 40,
  },
  coverTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#111827',
  },
  coverSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 4,
  },
  coverDate: {
    fontSize: 10,
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: 40,
  },
  section: {
    marginBottom: 16,
  },
  heading1: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    marginTop: 16,
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
  },
  heading2: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    marginTop: 12,
    color: '#374151',
  },
  heading3: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    marginTop: 8,
    color: '#4b5563',
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 6,
    color: '#374151',
  },
  listRow: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingLeft: 12,
  },
  listBullet: {
    fontSize: 11,
    color: '#374151',
    width: 14,
  },
  listText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#374151',
    flex: 1,
  },
  rule: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginVertical: 8,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: '#9ca3af',
    paddingLeft: 12,
    marginVertical: 4,
  },
  blockquoteText: {
    color: '#6b7280',
    fontFamily: 'Helvetica-Oblique',
    fontSize: 11,
    lineHeight: 1.6,
  },
  table: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
  },
  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    color: '#111827',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    fontSize: 10,
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    color: '#374151',
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 60,
    right: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 9,
    color: '#9ca3af',
  },
})

// ── Renderizadores ────────────────────────────────────────────────────────────

function renderSpan(span: InlineSpan, i: number): React.ReactElement {
  if (span.type === 'bold') {
    return <Text key={i} style={{ fontFamily: 'Helvetica-Bold' }}>{span.content}</Text>
  }
  if (span.type === 'italic') {
    return <Text key={i} style={{ fontFamily: 'Helvetica-Oblique' }}>{span.content}</Text>
  }
  if (span.type === 'boldItalic') {
    return <Text key={i} style={{ fontFamily: 'Helvetica-BoldOblique' }}>{span.content}</Text>
  }
  return <Text key={i}>{span.content}</Text>
}

function renderSpans(spans: InlineSpan[], baseStyle: Style | Style[]): React.ReactElement {
  return (
    <Text style={baseStyle}>
      {spans.map((span, i) => renderSpan(span, i))}
    </Text>
  )
}

function renderBlock(block: Block, index: number): React.ReactElement {
  if (block.type === 'rule') {
    return <View key={index} style={styles.rule} />
  }

  if (block.type === 'h1') {
    return <Text key={index} style={styles.heading1}>{block.spans.map((s, i) => renderSpan(s, i))}</Text>
  }
  if (block.type === 'h2') {
    return <Text key={index} style={styles.heading2}>{block.spans.map((s, i) => renderSpan(s, i))}</Text>
  }
  if (block.type === 'h3') {
    return <Text key={index} style={styles.heading3}>{block.spans.map((s, i) => renderSpan(s, i))}</Text>
  }

  if (block.type === 'paragraph') {
    return <Text key={index} style={styles.paragraph}>{block.spans.map((s, i) => renderSpan(s, i))}</Text>
  }

  if (block.type === 'bulletItem') {
    return (
      <View key={index} style={styles.listRow}>
        <Text style={styles.listBullet}>{'• '}</Text>
        {renderSpans(block.spans, styles.listText)}
      </View>
    )
  }

  if (block.type === 'orderedItem') {
    return (
      <View key={index} style={styles.listRow}>
        <Text style={styles.listBullet}>{block.number}. </Text>
        {renderSpans(block.spans, styles.listText)}
      </View>
    )
  }

  if (block.type === 'blockquote') {
    return (
      <View key={index} style={styles.blockquote}>
        {renderSpans(block.spans, styles.blockquoteText)}
      </View>
    )
  }

  if (block.type === 'table') {
    const colWidth = 475 / Math.max(block.headers.length, 1)
    return (
      <View key={index} style={styles.table}>
        <View style={styles.tableHeaderRow}>
          {block.headers.map((cell, ci) => (
            <Text key={ci} style={[styles.tableHeaderCell, { width: colWidth }]}>{cell}</Text>
          ))}
        </View>
        {block.rows.map((row, ri) => (
          <View key={ri} style={ri % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            {row.map((cell, ci) => (
              <Text key={ci} style={[styles.tableCell, { width: colWidth }]}>{cell}</Text>
            ))}
          </View>
        ))}
      </View>
    )
  }

  return <View key={index} />
}

function renderContent(content: string): React.ReactElement[] {
  return parseBlocks(content).map((block, i) => renderBlock(block, i))
}

// ── Componente principal ──────────────────────────────────────────────────────

interface DossierPDFProps {
  specialistName: string
  logoUrl?: string | null
  studentName: string
  content: string
  generatedAt: Date
}

export function DossierPDF({
  specialistName,
  logoUrl,
  studentName,
  content,
  generatedAt,
}: DossierPDFProps) {
  return (
    <Document>
      {/* Capa */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          {logoUrl && <Image src={logoUrl} style={styles.logo} />}
          <Text style={styles.coverTitle}>Plano de Ação</Text>
          <Text style={styles.coverSubtitle}>{studentName}</Text>
          <Text style={styles.coverSubtitle}>{specialistName}</Text>
          <Text style={styles.coverDate}>
            Gerado em {generatedAt.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>
      </Page>

      {/* Conteúdo */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>{renderContent(content)}</View>
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{specialistName}</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  )
}
