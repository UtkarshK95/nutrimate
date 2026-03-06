import { Redis } from "@upstash/redis";
import type { Chunk } from "@/types/chunks";

const redis = Redis.fromEnv();
const KEY = "nutrimate:chunks";

export async function readChunks(): Promise<Chunk[]> {
  try {
    const data = await redis.get<{ chunks: Chunk[] }>(KEY);
    return data?.chunks ?? [];
  } catch {
    return [];
  }
}

export async function writeChunks(chunks: Chunk[]): Promise<void> {
  await redis.set(KEY, { chunks });
}

export async function upsertChunks(newChunks: Chunk[]): Promise<void> {
  if (newChunks.length === 0) return;
  const docId = newChunks[0].documentId;
  const existing = await readChunks();
  const filtered = existing.filter((c) => c.documentId !== docId);
  await writeChunks([...filtered, ...newChunks]);
}

export async function deleteChunksByDocument(documentId: string): Promise<void> {
  const existing = await readChunks();
  await writeChunks(existing.filter((c) => c.documentId !== documentId));
}
