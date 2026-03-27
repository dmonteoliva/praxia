import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { DossierPDF } from './template'

interface GeneratePDFParams {
  specialistName: string
  logoUrl?: string | null
  studentName: string
  content: string
}

export async function generatePDFBuffer(params: GeneratePDFParams): Promise<Buffer> {
  const element = React.createElement(DossierPDF, {
    ...params,
    generatedAt: new Date(),
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any)
  return Buffer.from(buffer)
}
