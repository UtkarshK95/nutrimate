import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { chunkText } from "@/lib/rag/chunk";
import { embedBatch } from "@/lib/ai/embed";
import { upsertChunks, deleteChunksByDocument } from "@/lib/store/chunks";
import type { Chunk } from "@/types/chunks";

const ingestSchema = z.object({
  documentId: z.string().min(1).max(200),
  documentTitle: z.string().min(1).max(300),
  source: z.enum(["research", "lab-report", "fitness", "profile"]),
  text: z.string().min(1).max(500_000), // ~500k chars max
});

const deleteSchema = z.object({
  documentId: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = ingestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { documentId, documentTitle, source, text } = parsed.data;

    // 1. Chunk
    const textChunks = chunkText(text);
    if (textChunks.length === 0) {
      return NextResponse.json(
        { error: "No content to ingest after chunking" },
        { status: 400 }
      );
    }

    // 2. Embed
    const embeddings = await embedBatch(textChunks);

    // 3. Build Chunk objects
    const now = new Date().toISOString();
    const chunks: Chunk[] = textChunks.map((chunkText, i) => ({
      id: randomUUID(),
      documentId,
      documentTitle,
      source,
      text: chunkText,
      embedding: embeddings[i],
      createdAt: now,
    }));

    // 4. Upsert (replace existing chunks for this document)
    await upsertChunks(chunks);

    return NextResponse.json({
      ok: true,
      documentId,
      chunksCreated: chunks.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Ingest failed", detail: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = deleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await deleteChunksByDocument(parsed.data.documentId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}
