import type { Chunk } from "@/types/chunks";
import { readChunks } from "@/lib/store/chunks";
import { embedText } from "@/lib/ai/embed";

const TOP_K = 3;
const MAX_CHUNK_CHARS = 300 * 4; // ~300 tokens per chunk in context

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface RetrievedChunk {
  chunk: Chunk;
  score: number;
  /** Text truncated to MAX_CHUNK_CHARS for token efficiency */
  contextText: string;
}

/**
 * Embed the query, compute cosine similarity against all stored chunks,
 * and return the top-K results.
 *
 * Optionally filter by source type(s).
 */
export async function retrieve(
  query: string,
  sources?: Chunk["source"][]
): Promise<RetrievedChunk[]> {
  const [queryEmbedding, allChunks] = await Promise.all([
    embedText(query),
    readChunks(),
  ]);

  const candidates = sources
    ? allChunks.filter((c) => sources.includes(c.source))
    : allChunks;

  if (candidates.length === 0) return [];

  const scored = candidates.map((chunk) => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
    contextText: chunk.text.slice(0, MAX_CHUNK_CHARS),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, TOP_K);
}
