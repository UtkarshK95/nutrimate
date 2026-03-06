import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { parsePdf } from "@/lib/parsers/pdf";
import { simplifyResearch } from "@/lib/ai/gemini";
import { chunkText } from "@/lib/rag/chunk";
import { embedBatch } from "@/lib/ai/embed";
import { upsertChunks } from "@/lib/store/chunks";
import { addResearchDoc } from "@/lib/store/research";
import type { Chunk } from "@/types/chunks";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 20 MB)" },
        { status: 400 }
      );
    }

    const title =
      (formData.get("title") as string | null)?.trim() ||
      file.name.replace(/\.pdf$/i, "");

    // 1. Parse PDF
    const buffer = await file.arrayBuffer();
    const text = await parsePdf(buffer);

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: "Could not extract text from this PDF" },
        { status: 422 }
      );
    }

    const documentId = randomUUID();

    // 2. Simplify with AI (runs in parallel with chunking)
    const [summary, textChunks] = await Promise.all([
      simplifyResearch(text, title),
      Promise.resolve(chunkText(text)),
    ]);

    if (textChunks.length === 0) {
      return NextResponse.json(
        { error: "No content to index from this PDF" },
        { status: 422 }
      );
    }

    // 3. Embed all chunks
    const embeddings = await embedBatch(textChunks);

    // 4. Build Chunk objects and store
    const now = new Date().toISOString();
    const chunks: Chunk[] = textChunks.map((chunkText, i) => ({
      id: randomUUID(),
      documentId,
      documentTitle: title,
      source: "research",
      text: chunkText,
      embedding: embeddings[i],
      createdAt: now,
    }));

    await upsertChunks(chunks);

    // 5. Save document metadata
    await addResearchDoc({
      id: documentId,
      title,
      fileName: file.name,
      summary,
      chunkCount: chunks.length,
      uploadedAt: now,
    });

    return NextResponse.json({
      ok: true,
      documentId,
      title,
      summary,
      chunkCount: chunks.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Upload failed", detail: message },
      { status: 500 }
    );
  }
}
