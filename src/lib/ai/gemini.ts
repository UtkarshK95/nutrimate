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
