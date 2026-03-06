import fs from "fs/promises";
import path from "path";
import type { Chunk } from "@/types/chunks";

const DATA_DIR = path.join(process.cwd(), "data");
const CHUNKS_PATH = path.join(DATA_DIR, "chunks.json");

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readChunks(): Promise<Chunk[]> {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(CHUNKS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as { chunks: Chunk[] };
    return parsed.chunks ?? [];
  } catch {
    return [];
  }
}

export async function writeChunks(chunks: Chunk[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(
    CHUNKS_PATH,
    JSON.stringify({ chunks }, null, 2),
    "utf-8"
  );
}

/**
 * Append new chunks, replacing any existing chunks with the same documentId.
 */
export async function upsertChunks(newChunks: Chunk[]): Promise<void> {
  if (newChunks.length === 0) return;
  const docId = newChunks[0].documentId;
  const existing = await readChunks();
  const filtered = existing.filter((c) => c.documentId !== docId);
  await writeChunks([...filtered, ...newChunks]);
}

/**
 * Remove all chunks for a given documentId.
 */
export async function deleteChunksByDocument(documentId: string): Promise<void> {
  const existing = await readChunks();
  await writeChunks(existing.filter((c) => c.documentId !== documentId));
}
