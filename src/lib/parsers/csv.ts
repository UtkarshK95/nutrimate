import type { FitnessEntry } from "@/types/fitness";

const DATE_HEADERS = ["date", "day", "datetime", "date_time", "activity_date"];
const STEP_HEADERS = ["steps", "step_count", "totalsteps", "total steps"];
const CALORIE_HEADERS = ["calories", "calories_burned", "active calories", "total calories"];
const ACTIVE_HEADERS = ["activeminutes", "active_minutes", "active minutes", "minutes active", "exercise minutes"];
const HR_HEADERS = ["heartrate", "heart_rate", "avg hr", "average heart rate", "bpm", "resting hr"];
const SLEEP_HEADERS = ["sleep", "sleep hours", "hours slept", "sleep_hours", "total sleep"];

function findCol(headers: string[], keywords: string[]): number {
  return headers.findIndex((h) =>
    keywords.some((k) => h.toLowerCase().replace(/[^a-z0-9]/g, "").includes(k.replace(/[^a-z0-9]/g, "")))
  );
}

function parseDate(raw: string): string | null {
  const s = raw.trim();
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // MM/DD/YYYY or DD/MM/YYYY
  const parts = s.split(/[/\-.]/);
  if (parts.length >= 3) {
    const nums = parts.map((p) => parseInt(p, 10));
    if (nums[2] > 1900) return `${nums[2]}-${String(nums[0]).padStart(2, "0")}-${String(nums[1]).padStart(2, "0")}`;
    if (nums[0] > 1900) return `${nums[0]}-${String(nums[1]).padStart(2, "0")}-${String(nums[2]).padStart(2, "0")}`;
  }
  return null;
}

export function parseCsv(text: string): FitnessEntry[] {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

  const dateCol = findCol(headers, DATE_HEADERS);
  if (dateCol === -1) return [];

  const stepCol = findCol(headers, STEP_HEADERS);
  const calCol = findCol(headers, CALORIE_HEADERS);
  const activeCol = findCol(headers, ACTIVE_HEADERS);
  const hrCol = findCol(headers, HR_HEADERS);
  const sleepCol = findCol(headers, SLEEP_HEADERS);

  const entries: FitnessEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const date = parseDate(cols[dateCol] ?? "");
    if (!date) continue;

    const entry: FitnessEntry = { date };
    if (stepCol !== -1 && cols[stepCol]) entry.steps = parseFloat(cols[stepCol]) || undefined;
    if (calCol !== -1 && cols[calCol]) entry.calories = parseFloat(cols[calCol]) || undefined;
    if (activeCol !== -1 && cols[activeCol]) entry.activeMinutes = parseFloat(cols[activeCol]) || undefined;
    if (hrCol !== -1 && cols[hrCol]) entry.heartRateAvg = parseFloat(cols[hrCol]) || undefined;
    if (sleepCol !== -1 && cols[sleepCol]) {
      const raw = parseFloat(cols[sleepCol]);
      // Convert minutes to hours if value looks like minutes (> 24)
      entry.sleepHours = raw > 24 ? raw / 60 : raw || undefined;
    }

    if (Object.keys(entry).length > 1) entries.push(entry);
  }

  return entries;
}
