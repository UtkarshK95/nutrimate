import type { FitnessEntry } from "@/types/fitness";

// Apple Health Record types we care about
const STEP_TYPE = "HKQuantityTypeIdentifierStepCount";
const CALORIE_TYPE = "HKQuantityTypeIdentifierActiveEnergyBurned";
const ACTIVE_MIN_TYPE = "HKQuantityTypeIdentifierAppleExerciseTime";
const HR_TYPE = "HKQuantityTypeIdentifierHeartRate";
const SLEEP_TYPE = "HKCategoryTypeIdentifierSleepAnalysis";

function getAttribute(tag: string, attr: string): string {
  const match = new RegExp(`${attr}="([^"]*)"`, "i").exec(tag);
  return match?.[1] ?? "";
}

function dateOnly(dateTime: string): string {
  return dateTime.slice(0, 10);
}

export function parseAppleHealthXml(xml: string): FitnessEntry[] {
  // Slice to first 5MB of content to handle large exports
  const content = xml.slice(0, 5 * 1024 * 1024);

  // Map of date → accumulated values
  const map = new Map<string, { steps: number; calories: number; activeMin: number; hrSum: number; hrCount: number; sleep: number }>();

  const recordRegex = /<Record[^>]+>/g;
  let match: RegExpExecArray | null;

  while ((match = recordRegex.exec(content)) !== null) {
    const tag = match[0];
    const type = getAttribute(tag, "type");
    const startDate = getAttribute(tag, "startDate");
    const valueStr = getAttribute(tag, "value");
    const date = dateOnly(startDate);
    if (!date || date < "2000-01-01") continue;

    if (!map.has(date)) {
      map.set(date, { steps: 0, calories: 0, activeMin: 0, hrSum: 0, hrCount: 0, sleep: 0 });
    }
    const day = map.get(date)!;
    const value = parseFloat(valueStr);
    if (isNaN(value)) continue;

    if (type === STEP_TYPE) day.steps += value;
    else if (type === CALORIE_TYPE) day.calories += value;
    else if (type === ACTIVE_MIN_TYPE) day.activeMin += value;
    else if (type === HR_TYPE) { day.hrSum += value; day.hrCount++; }
    else if (type === SLEEP_TYPE && value === 0) {
      // HKCategoryValueSleepAnalysisAsleep = 0; each record spans a duration
      const endDate = getAttribute(tag, "endDate");
      if (endDate) {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        day.sleep += (end - start) / 3_600_000; // hours
      }
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({
      date,
      ...(d.steps > 0 && { steps: Math.round(d.steps) }),
      ...(d.calories > 0 && { calories: Math.round(d.calories) }),
      ...(d.activeMin > 0 && { activeMinutes: Math.round(d.activeMin) }),
      ...(d.hrCount > 0 && { heartRateAvg: Math.round(d.hrSum / d.hrCount) }),
      ...(d.sleep > 0 && { sleepHours: parseFloat(d.sleep.toFixed(1)) }),
    }));
}
