import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { parseCsv } from "@/lib/parsers/csv";
import { parseAppleHealthXml } from "@/lib/parsers/xml";
import { parseFitbitJson } from "@/lib/parsers/fitbit";
import {
  aggregateToWeekly,
  addFitnessImport,
  fitnessToText,
} from "@/lib/store/fitness";
import { embedText } from "@/lib/ai/embed";
import { upsertChunks } from "@/lib/store/chunks";
import type { FitnessEntry, FitnessFileType } from "@/types/fitness";
import type { Chunk } from "@/types/chunks";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB (Apple Health exports can be large)

function detectType(fileName: string): FitnessFileType {
  const name = fileName.toLowerCase();
  if (name.endsWith(".xml")) return "apple-health";
  if (name.endsWith(".json")) return "fitbit";
  return "csv";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 50 MB)" }, { status: 400 });
    }

    const fileType = detectType(file.name);
    const text = await file.text();
    let entries: FitnessEntry[] = [];

    if (fileType === "csv") {
      entries = parseCsv(text);
    } else if (fileType === "apple-health") {
      entries = parseAppleHealthXml(text);
    } else {
      try {
        const json: unknown = JSON.parse(text);
        entries = parseFitbitJson(json, file.name);
      } catch {
        return NextResponse.json({ error: "Invalid JSON file" }, { status: 422 });
      }
    }

    if (entries.length === 0) {
      return NextResponse.json(
        { error: "No recognisable fitness data found in this file. Check the format guide below." },
        { status: 422 }
      );
    }

    const sorted = entries.sort((a, b) => a.date.localeCompare(b.date));
    const weeklyAggregates = aggregateToWeekly(sorted);
    const documentId = randomUUID();
    const now = new Date().toISOString();

    const fitnessImport = {
      id: documentId,
      fileName: file.name,
      fileType,
      uploadedAt: now,
      dateRange: { from: sorted[0].date, to: sorted[sorted.length - 1].date },
      recordCount: entries.length,
      weeklyAggregates,
    };

    // Embed a plain-text summary for RAG
    const summaryText = fitnessToText(fitnessImport);
    const embedding = await embedText(summaryText);
    const chunk: Chunk = {
      id: randomUUID(),
      documentId,
      documentTitle: file.name,
      source: "fitness",
      text: summaryText,
      embedding,
      createdAt: now,
    };

    await Promise.all([
      upsertChunks([chunk]),
      addFitnessImport(fitnessImport),
    ]);

    return NextResponse.json({
      ok: true,
      recordCount: entries.length,
      weeksIndexed: weeklyAggregates.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Upload failed", detail: message }, { status: 500 });
  }
}
