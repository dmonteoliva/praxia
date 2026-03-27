import { embed, embedMany } from 'ai'
import { openai } from '@ai-sdk/openai'

const CHUNK_SIZE = 500   // tokens aproximados por chunk
const CHUNK_OVERLAP = 50 // tokens de sobreposição entre chunks

// Divide texto em chunks com sobreposição
export function chunkText(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  const chunks: string[] = []
  let start = 0

  while (start < words.length) {
    const end = Math.min(start + CHUNK_SIZE, words.length)
    chunks.push(words.slice(start, end).join(' '))
    if (end === words.length) break
    start += CHUNK_SIZE - CHUNK_OVERLAP
  }

  return chunks
}

// Gera embedding para um único texto
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  })
  return embedding
}

// Gera embeddings para múltiplos textos (mais eficiente via batch)
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []

  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: texts,
  })
  return embeddings
}
