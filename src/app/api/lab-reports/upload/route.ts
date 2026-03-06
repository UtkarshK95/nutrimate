import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { parsePdf } from "@/lib/parsers/pdf";
import { extractBiomarkers } from "@/lib/ai/gemini";
import { chunkText } from "@/lib/rag/chunk";
import { embedBatch } from "@/lib/ai/embed";
import { upsertChunks } from "@/lib/store/chunks";
import { addLabReport } from "@/lib/store/lab-reports";
import type { Chunk } from "@/types/chunks";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const text = await parsePdf(buffer);

    if (!text || text.length < 20) {
      return NextResponse.json(
        { error: "Could not extract text from this PDF" },
        { status: 422 }
      );
    }

    const documentId = randomUUID();
    const now = new Date().toISOString();

    // Extract biomarkers + chunk/embed in parallel
    const [{ biomarkers, reportDate }, textChunks] = await Promise.all([
      extractBiomarkers(text),
      Promise.resolve(chunkText(text)),
    ]);

    // Embed and store chunks for RAG (even if biomarker extraction was partial)
    if (textChunks.length > 0) {
      const embeddings = await embedBatch(textChunks);
      const chunks: Chunk[] = textChunks.map((chunkText, i) => ({
        id: randomUUID(),
        documentId,
        documentTitle: file.name,
        source: "lab-report",
        text: chunkText,
        embedding: embeddings[i],
        createdAt: now,
      }));
      await upsertChunks(chunks);
    }

    await addLabReport({
      id: documentId,
      fileName: file.name,
      reportDate: reportDate || now.slice(0, 10),
      uploadedAt: now,
      biomarkers,
    });

    return NextResponse.json({
      ok: true,
      documentId,
      biomarkersFound: biomarkers.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Upload failed", detail: message }, { status: 500 });
  }
}
