import { createServiceClient } from '@/lib/supabase/server'
import { generateEmbedding } from '@/lib/embeddings'

export interface RagChunk {
  chunk_text: string
  similarity: number
}

// Busca os chunks mais relevantes da base de conhecimento do especialista
export async function retrieveChunks(
  query: string,
  specialistId: string,
  matchCount = 5
): Promise<RagChunk[]> {
  const supabase = await createServiceClient()

  const queryEmbedding = await generateEmbedding(query)

  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: queryEmbedding,
    specialist_id: specialistId,
    match_count: matchCount,
  })

  if (error) throw new Error(`RAG error: ${error.message}`)

  return data ?? []
}

// Formata os chunks recuperados como contexto para o LLM
export function formatChunksAsContext(chunks: RagChunk[]): string {
  if (chunks.length === 0) return ''
  return chunks.map((c) => c.chunk_text).join('\n\n---\n\n')
}
