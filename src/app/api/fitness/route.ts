import { NextResponse } from "next/server";
import { z } from "zod";
import { readFitnessImports, deleteFitnessImport } from "@/lib/store/fitness";
import { deleteChunksByDocument } from "@/lib/store/chunks";

const deleteSchema = z.object({ id: z.string().min(1) });

export async function GET() {
  try {
    const imports = await readFitnessImports();
    return NextResponse.json({ imports });
  } catch {
    return NextResponse.json({ error: "Failed to load fitness data" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    await Promise.all([
      deleteFitnessImport(parsed.data.id),
      deleteChunksByDocument(parsed.data.id),
    ]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete import" }, { status: 500 });
  }
}
