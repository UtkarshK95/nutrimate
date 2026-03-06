import { GoogleGenerativeAI } from "@google/generative-ai";

const CHAT_MODEL = "gemini-2.5-flash";

function getClient(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(key);
}

/**
 * Single-turn completion with an optional system prompt.
 * Used for simplification, extraction, and summarisation tasks.
 */
export async function generate(
  userPrompt: string,
  systemPrompt?: string
): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: CHAT_MODEL,
    ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
  });
  const result = await model.generateContent(userPrompt);
  return result.response.text();
}

/**
 * Simplify a research paper into a structured plain-English summary.
 * Only the first 4000 chars are passed to keep token cost low.
 * Returns markdown with short paragraphs and bullet points.
 */
export async function simplifyResearch(
  text: string,
  title: string
): Promise<string> {
  const excerpt = text.slice(0, 4000);
  const systemPrompt =
    "You are a medical research assistant helping a non-expert understand health research. " +
    "Write in clear, plain English. Avoid jargon. Be concise and structured.";
  const userPrompt =
    `Summarise this research paper for a non-expert using this exact structure:\n\n` +
    `**What was studied**\n` +
    `One or two plain sentences.\n\n` +
    `**Key findings**\n` +
    `3–5 bullet points, each one sentence.\n\n` +
    `**Why it matters**\n` +
    `One sentence on practical relevance.\n\n` +
    `Keep the whole summary under 200 words. No jargon.\n\n` +
    `Title: ${title}\n\nExcerpt:\n${excerpt}`;
  return generate(userPrompt, systemPrompt);
}

import type { Biomarker } from "@/types/documents";

/**
 * Extract biomarkers from lab report text.
 * Returns a structured array; falls back to empty array on parse failure.
 */
export async function extractBiomarkers(text: string): Promise<{ biomarkers: Biomarker[]; reportDate: string }> {
  // Pass first 6000 chars — enough for most blood panels
  const excerpt = text.slice(0, 6000);
  const systemPrompt =
    "You are a medical data extraction assistant. Extract structured data from lab reports. " +
    "Respond only with valid JSON, no markdown fences, no explanation.";
  const userPrompt =
    `Extract all biomarkers from this lab report and return JSON in this exact shape:\n` +
    `{"reportDate":"YYYY-MM-DD or empty string if not found","biomarkers":[{"name":"string","value":"string","unit":"string","referenceRange":"string","status":"normal"|"high"|"low"|"unknown"}]}\n\n` +
    `Rules:\n` +
    `- Include every test result you can find (CBC, metabolic panel, lipids, hormones, vitamins, etc.)\n` +
    `- status: compare value to referenceRange. If value is above range → "high", below → "low", within → "normal", can't tell → "unknown"\n` +
    `- If unit or referenceRange are missing, use empty string\n` +
    `- Return only the JSON object, nothing else\n\n` +
    `Lab report text:\n${excerpt}`;

  const raw = await generate(userPrompt, systemPrompt);

  try {
    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "").trim();
    const parsed = JSON.parse(cleaned) as { biomarkers: Biomarker[]; reportDate: string };
    return {
      biomarkers: Array.isArray(parsed.biomarkers) ? parsed.biomarkers : [],
      reportDate: parsed.reportDate ?? "",
    };
  } catch {
    return { biomarkers: [], reportDate: "" };
  }
}

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

/**
 * Multi-turn chat with a system prompt.
 * Passes only the last 6 messages to stay within token budget.
 */
export async function chat(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({
    model: CHAT_MODEL,
    systemInstruction: systemPrompt,
  });

  const recentMessages = messages.slice(-6);
  const history = recentMessages.slice(0, -1).map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));
  const lastMessage = recentMessages[recentMessages.length - 1];

  const chatSession = model.startChat({ history });
  const result = await chatSession.sendMessage(lastMessage.content);
  return result.response.text();
}
