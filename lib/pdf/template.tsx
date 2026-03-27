import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: 60,
    color: '#1a1a1a',
  },
  // Capa
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
  // Conteúdo
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
  listItem: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 3,
    paddingLeft: 12,
    color: '#374151',
  },
  // Rodapé
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

interface DossierPDFProps {
  specialistName: string
  logoUrl?: string | null
  studentName: string
  content: string
  generatedAt: Date
}

// Converte markdown simples para elementos PDF
function renderContent(content: string) {
  const lines = content.split('\n')
  const elements: React.ReactElement[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) continue

    if (trimmed.startsWith('### ')) {
      elements.push(
        <Text key={i} style={styles.heading3}>
          {trimmed.slice(4)}
        </Text>
      )
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <Text key={i} style={styles.heading2}>
          {trimmed.slice(3)}
        </Text>
      )
    } else if (trimmed.startsWith('# ')) {
      elements.push(
        <Text key={i} style={styles.heading1}>
          {trimmed.slice(2)}
        </Text>
      )
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <Text key={i} style={styles.listItem}>
          {'• ' + trimmed.slice(2)}
        </Text>
      )
    } else if (/^\d+\.\s/.test(trimmed)) {
      elements.push(
        <Text key={i} style={styles.listItem}>
          {trimmed}
        </Text>
      )
    } else {
      elements.push(
        <Text key={i} style={styles.paragraph}>
          {trimmed}
        </Text>
      )
    }
  }

  return elements
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
