import { Redis } from "@upstash/redis";

export interface PersistedMessage {
  role: "user" | "model";
  content: string;
  timestamp: string;
}

const redis = Redis.fromEnv();
const KEY = "nutrimate:chat-history";
const MAX_MESSAGES = 100;

export async function readChatHistory(): Promise<PersistedMessage[]> {
  try {
    const data = await redis.get<{ messages: PersistedMessage[] }>(KEY);
    return data?.messages ?? [];
  } catch {
    return [];
  }
}

export async function saveChatHistory(messages: PersistedMessage[]): Promise<void> {
  const trimmed = messages.slice(-MAX_MESSAGES);
  await redis.set(KEY, { messages: trimmed });
}

export async function clearChatHistory(): Promise<void> {
  await redis.set(KEY, { messages: [] });
}
