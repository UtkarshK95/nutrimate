import fs from "fs/promises";
import path from "path";

export interface PersistedMessage {
  role: "user" | "model";
  content: string;
  timestamp: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const HISTORY_PATH = path.join(DATA_DIR, "chat-history.json");
const MAX_MESSAGES = 100;

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readChatHistory(): Promise<PersistedMessage[]> {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(HISTORY_PATH, "utf-8");
    const parsed = JSON.parse(raw) as { messages: PersistedMessage[] };
    return parsed.messages ?? [];
  } catch {
    return [];
  }
}

export async function saveChatHistory(messages: PersistedMessage[]): Promise<void> {
  await ensureDataDir();
  // Keep only the most recent MAX_MESSAGES
  const trimmed = messages.slice(-MAX_MESSAGES);
  await fs.writeFile(
    HISTORY_PATH,
    JSON.stringify({ messages: trimmed }, null, 2),
    "utf-8"
  );
}

export async function clearChatHistory(): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(HISTORY_PATH, JSON.stringify({ messages: [] }, null, 2), "utf-8");
}
