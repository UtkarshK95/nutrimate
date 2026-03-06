import { NextResponse } from "next/server";
import { z } from "zod";
import { readResearchDocs, deleteResearchDoc } from "@/lib/store/research";
import { deleteChunksByDocument } from "@/lib/store/chunks";

const deleteSchema = z.object({
  id: z.string().min(1),
});

export async function GET() {
  try {
    const docs = await readResearchDocs();
    return NextResponse.json({ documents: docs });
  } catch {
    return NextResponse.json(
      { error: "Failed to load research documents" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = deleteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { id } = parsed.data;
    // Remove metadata and all associated chunks in parallel
    await Promise.all([deleteResearchDoc(id), deleteChunksByDocument(id)]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
