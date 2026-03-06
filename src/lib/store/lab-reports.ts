import fs from "fs/promises";
import path from "path";
import type { LabReport } from "@/types/documents";

const DATA_DIR = path.join(process.cwd(), "data");
const LAB_REPORTS_PATH = path.join(DATA_DIR, "lab-reports.json");

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readLabReports(): Promise<LabReport[]> {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(LAB_REPORTS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as { reports: LabReport[] };
    return parsed.reports ?? [];
  } catch {
    return [];
  }
}

async function writeLabReports(reports: LabReport[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(
    LAB_REPORTS_PATH,
    JSON.stringify({ reports }, null, 2),
    "utf-8"
  );
}

export async function addLabReport(report: LabReport): Promise<void> {
  const reports = await readLabReports();
  // Most recent first
  await writeLabReports([report, ...reports]);
}

export async function deleteLabReport(id: string): Promise<void> {
  const reports = await readLabReports();
  await writeLabReports(reports.filter((r) => r.id !== id));
}
