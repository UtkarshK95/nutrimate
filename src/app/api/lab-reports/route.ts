import { NextResponse } from "next/server";
import { z } from "zod";
import { readLabReports, deleteLabReport } from "@/lib/store/lab-reports";
import { deleteChunksByDocument } from "@/lib/store/chunks";

const deleteSchema = z.object({ id: z.string().min(1) });

export async function GET() {
  try {
    const reports = await readLabReports();
    return NextResponse.json({ reports });
  } catch {
    return NextResponse.json(
      { error: "Failed to load lab reports" },
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
    await Promise.all([
      deleteLabReport(parsed.data.id),
      deleteChunksByDocument(parsed.data.id),
    ]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}
