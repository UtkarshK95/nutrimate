import { NextResponse } from "next/server";
import { readChatHistory, saveChatHistory, clearChatHistory, type PersistedMessage } from "@/lib/store/chat-history";
import { z } from "zod";

const saveSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "model"]),
      content: z.string(),
      timestamp: z.string(),
    })
  ),
});

export async function GET() {
  try {
    const messages = await readChatHistory();
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: "Failed to load history" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    await saveChatHistory(parsed.data.messages as PersistedMessage[]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save history" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearChatHistory();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to clear history" }, { status: 500 });
  }
}
