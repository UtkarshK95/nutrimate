import { NextResponse } from "next/server";
import { z } from "zod";
import { readProfile } from "@/lib/store/profile";
import { retrieve } from "@/lib/rag/retrieve";
import { chat } from "@/lib/ai/gemini";
import type { HealthProfile } from "@/types/profile";

const messageSchema = z.object({
  role: z.enum(["user", "model"]),
  content: z.string().min(1).max(10_000),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(50),
});

function buildProfileContext(profile: HealthProfile): string {
  const parts: string[] = [];
  if (profile.name) parts.push(`Name: ${profile.name}`);
  if (profile.age) parts.push(`Age: ${profile.age}`);
  if (profile.gender) parts.push(`Gender: ${profile.gender}`);
  if (profile.conditions.length) parts.push(`Health conditions: ${profile.conditions.join(", ")}`);
  if (profile.medications.length) parts.push(`Medications: ${profile.medications.join(", ")}`);
  if (profile.allergies.length) parts.push(`Allergies: ${profile.allergies.join(", ")}`);
  if (profile.goals) parts.push(`Health goals: ${profile.goals.slice(0, 200)}`);
  if (profile.personalNotes) parts.push(`Personal notes (habits/mental health/diet): ${profile.personalNotes.slice(0, 200)}`);
  return parts.length ? parts.join(". ") : "No profile set up yet.";
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { messages } = parsed.data;

    // Get the last user message for RAG retrieval
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");

    // Load profile and retrieve relevant chunks in parallel
    const [profile, chunks] = await Promise.all([
      readProfile(),
      lastUserMsg ? retrieve(lastUserMsg.content) : Promise.resolve([]),
    ]);

    const profileContext = buildProfileContext(profile);

    const ragContext = chunks.length
      ? chunks
          .map(
            (r, i) =>
              `[Source ${i + 1}: ${r.chunk.documentTitle} (${r.chunk.source})]\n${r.contextText}`
          )
          .join("\n\n")
      : "No relevant data found in your uploaded documents.";

    // System prompt — kept under 800 tokens
    const systemPrompt = [
      "You are Nutrimate, a personal health AI assistant. You speak directly to the user based on their own health data.",
      "",
      "USER PROFILE:",
      profileContext,
      "",
      "RELEVANT DATA FROM USER'S FILES:",
      ragContext,
      "",
      "INSTRUCTIONS:",
      "- Ground every answer in the user's actual data shown above.",
      "- If data is insufficient, say so and suggest what they could upload.",
      "- Never diagnose, prescribe, or replace professional medical advice.",
      "- Always recommend consulting a doctor for medical decisions.",
      "- Be concise, warm, and practical. Use bullet points where helpful.",
      "- When referencing numbers from their data, cite the source.",
    ].join("\n");

    const response = await chat(messages, systemPrompt);

    return NextResponse.json({ content: response });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Chat failed", detail: message },
      { status: 500 }
    );
  }
}
