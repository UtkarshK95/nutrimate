import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = "text-embedding-004";

function getClient(): GoogleGenerativeAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return new GoogleGenerativeAI(key);
}

/**
 * Embed a single text string. Returns a float array.
 */
export async function embedText(text: string): Promise<number[]> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: MODEL });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

/**
 * Embed multiple texts in sequence (free tier has no batch endpoint).
 * Returns arrays in the same order as the input.
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (const text of texts) {
    embeddings.push(await embedText(text));
  }
  return embeddings;
}
