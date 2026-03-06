import { Redis } from "@upstash/redis";
import type { ResearchDocument } from "@/types/documents";

const redis = Redis.fromEnv();
const KEY = "nutrimate:research";

export async function readResearchDocs(): Promise<ResearchDocument[]> {
  try {
    const data = await redis.get<{ documents: ResearchDocument[] }>(KEY);
    return data?.documents ?? [];
  } catch {
    return [];
  }
}

async function writeResearchDocs(docs: ResearchDocument[]): Promise<void> {
  await redis.set(KEY, { documents: docs });
}

export async function addResearchDoc(doc: ResearchDocument): Promise<void> {
  const docs = await readResearchDocs();
  await writeResearchDocs([...docs, doc]);
}

export async function deleteResearchDoc(id: string): Promise<void> {
  const docs = await readResearchDocs();
  await writeResearchDocs(docs.filter((d) => d.id !== id));
}
