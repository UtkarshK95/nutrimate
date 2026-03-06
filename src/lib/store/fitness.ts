import fs from "fs/promises";
import path from "path";
import type { FitnessEntry, FitnessImport, WeeklyAggregate } from "@/types/fitness";

const DATA_DIR = path.join(process.cwd(), "data");
const FITNESS_PATH = path.join(DATA_DIR, "fitness.json");

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readFitnessImports(): Promise<FitnessImport[]> {
  try {
    await ensureDataDir();
    const raw = await fs.readFile(FITNESS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as { imports: FitnessImport[] };
    return parsed.imports ?? [];
  } catch {
    return [];
  }
}

async function writeFitnessImports(imports: FitnessImport[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(FITNESS_PATH, JSON.stringify({ imports }, null, 2), "utf-8");
}

export async function addFitnessImport(imp: FitnessImport): Promise<void> {
  const imports = await readFitnessImports();
  await writeFitnessImports([imp, ...imports]);
}

export async function deleteFitnessImport(id: string): Promise<void> {
  const imports = await readFitnessImports();
  await writeFitnessImports(imports.filter((i) => i.id !== id));
}

/** ISO Monday for a given date string */
function weekStart(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function avgFloat(values: number[]): number | null {
  if (values.length === 0) return null;
  return parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1));
}

export function aggregateToWeekly(entries: FitnessEntry[]): WeeklyAggregate[] {
  const weeks = new Map<string, FitnessEntry[]>();

  for (const entry of entries) {
    const ws = weekStart(entry.date);
    if (!weeks.has(ws)) weeks.set(ws, []);
    weeks.get(ws)!.push(entry);
  }

  return Array.from(weeks.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ws, days]) => ({
      weekStart: ws,
      daysWithData: days.length,
      avgSteps: avg(days.flatMap((d) => (d.steps != null ? [d.steps] : []))),
      avgCalories: avg(days.flatMap((d) => (d.calories != null ? [d.calories] : []))),
      avgActiveMinutes: avg(days.flatMap((d) => (d.activeMinutes != null ? [d.activeMinutes] : []))),
      avgHeartRate: avg(days.flatMap((d) => (d.heartRateAvg != null ? [d.heartRateAvg] : []))),
      avgSleepHours: avgFloat(days.flatMap((d) => (d.sleepHours != null ? [d.sleepHours] : []))),
    }));
}

/** Generate a plain-text summary of recent weekly aggregates for RAG embedding */
export function fitnessToText(imp: FitnessImport): string {
  const recent = imp.weeklyAggregates.slice(-8); // last 8 weeks
  const lines = [
    `Fitness data from ${imp.fileName} (${imp.fileType}), covering ${imp.dateRange.from} to ${imp.dateRange.to}.`,
    `Weekly averages (most recent ${recent.length} weeks):`,
  ];
  for (const w of recent) {
    const parts: string[] = [`Week of ${w.weekStart} (${w.daysWithData} days)`];
    if (w.avgSteps != null) parts.push(`${w.avgSteps} steps/day`);
    if (w.avgCalories != null) parts.push(`${w.avgCalories} cal/day`);
    if (w.avgActiveMinutes != null) parts.push(`${w.avgActiveMinutes} active min/day`);
    if (w.avgHeartRate != null) parts.push(`HR avg ${w.avgHeartRate} bpm`);
    if (w.avgSleepHours != null) parts.push(`${w.avgSleepHours}h sleep/night`);
    lines.push(parts.join(", "));
  }
  return lines.join("\n");
}
