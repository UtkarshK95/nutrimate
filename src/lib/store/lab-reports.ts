import { Redis } from "@upstash/redis";
import type { LabReport } from "@/types/documents";

const redis = Redis.fromEnv();
const KEY = "nutrimate:lab-reports";

export async function readLabReports(): Promise<LabReport[]> {
  try {
    const data = await redis.get<{ reports: LabReport[] }>(KEY);
    return data?.reports ?? [];
  } catch {
    return [];
  }
}

async function writeLabReports(reports: LabReport[]): Promise<void> {
  await redis.set(KEY, { reports });
}

export async function addLabReport(report: LabReport): Promise<void> {
  const reports = await readLabReports();
  await writeLabReports([report, ...reports]);
}

export async function deleteLabReport(id: string): Promise<void> {
  const reports = await readLabReports();
  await writeLabReports(reports.filter((r) => r.id !== id));
}
