import fs from "fs/promises";
import path from "path";
import type { ResearchDocument } from "@/types/documents";

const DATA_DIR = path.join(process.cwd(), "data");
const RESEARCH_PATH = path.join(DATA_DIR, "research.json");

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readResearchDocs(): Promise<ResearchDocument[]> {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(RESEARCH_PATH, "utf-8");
    const parsed = JSON.parse(raw) as { documents: ResearchDocument[] };
    return parsed.documents ?? [];
  } catch {
    return [];
  }
}

async function writeResearchDocs(docs: ResearchDocument[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(
    RESEARCH_PATH,
    JSON.stringify({ documents: docs }, null, 2),
    "utf-8"
  );
}

export async function addResearchDoc(doc: ResearchDocument): Promise<void> {
  const docs = await readResearchDocs();
  await writeResearchDocs([...docs, doc]);
}

export async function deleteResearchDoc(id: string): Promise<void> {
  const docs = await readResearchDocs();
  await writeResearchDocs(docs.filter((d) => d.id !== id));
}
