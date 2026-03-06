export interface FitnessEntry {
  date: string; // YYYY-MM-DD
  steps?: number;
  calories?: number;
  activeMinutes?: number;
  heartRateAvg?: number;
  sleepHours?: number;
}

export interface WeeklyAggregate {
  weekStart: string; // YYYY-MM-DD (Monday)
  daysWithData: number;
  avgSteps: number | null;
  avgCalories: number | null;
  avgActiveMinutes: number | null;
  avgHeartRate: number | null;
  avgSleepHours: number | null;
}

export type FitnessFileType = "csv" | "apple-health" | "fitbit";

export interface FitnessImport {
  id: string;
  fileName: string;
  fileType: FitnessFileType;
  uploadedAt: string;
  dateRange: { from: string; to: string };
  recordCount: number;
  weeklyAggregates: WeeklyAggregate[];
}
