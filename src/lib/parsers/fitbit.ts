import type { FitnessEntry } from "@/types/fitness";

interface FitbitRecord {
  dateTime: string;
  value: string | number;
}

type FitbitFile =
  | FitbitRecord[]
  | { [key: string]: FitbitRecord[] };

/**
 * Parse a Fitbit export JSON file.
 *
 * Supports:
 *   - Single metric array: [{dateTime, value}, ...]
 *   - Combined object: {"activities-steps": [...], "activities-calories": [...], ...}
 *
 * Metric is inferred from filename (e.g. "activities-steps.json" → steps).
 */
export function parseFitbitJson(json: unknown, fileName: string): FitnessEntry[] {
  const map = new Map<string, FitnessEntry>();

  function applyRecords(records: FitbitRecord[], metric: string) {
    for (const r of records) {
      const date = r.dateTime?.slice(0, 10);
      if (!date || date < "2000-01-01") continue;
      const value = parseFloat(String(r.value));
      if (isNaN(value)) continue;

      if (!map.has(date)) map.set(date, { date });
      const entry = map.get(date)!;

      if (metric === "steps") entry.steps = Math.round(value);
      else if (metric === "calories") entry.calories = Math.round(value);
      else if (metric === "active" || metric === "minutesactive") entry.activeMinutes = Math.round(value);
      else if (metric === "heart" || metric === "heartrate") entry.heartRateAvg = Math.round(value);
      else if (metric === "sleep") entry.sleepHours = parseFloat((value / 60).toFixed(1)); // Fitbit reports sleep in minutes
    }
  }

  function inferMetric(key: string): string {
    const k = key.toLowerCase();
    if (k.includes("step")) return "steps";
    if (k.includes("calorie")) return "calories";
    if (k.includes("active") || k.includes("exercise")) return "active";
    if (k.includes("heart")) return "heart";
    if (k.includes("sleep")) return "sleep";
    return "unknown";
  }

  if (Array.isArray(json)) {
    // Single-metric array — infer metric from filename
    const metric = inferMetric(fileName);
    applyRecords(json as FitbitRecord[], metric);
  } else if (json && typeof json === "object") {
    // Combined object with multiple metric keys
    for (const [key, records] of Object.entries(json as Record<string, unknown>)) {
      if (!Array.isArray(records)) continue;
      applyRecords(records as FitbitRecord[], inferMetric(key));
    }
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}
