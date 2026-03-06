"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FitnessImport, FitnessFileType } from "@/types/fitness";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Loader2,
  Trash2,
  UploadCloud,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Footprints,
  Flame,
  Timer,
  Heart,
  Moon,
} from "lucide-react";

const FILE_TYPE_LABELS: Record<FitnessFileType, string> = {
  csv: "CSV",
  "apple-health": "Apple Health",
  fitbit: "Fitbit",
};

const FILE_TYPE_COLORS: Record<FitnessFileType, string> = {
  csv: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
  "apple-health": "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300",
  fitbit: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300",
};

function fmt(val: number | null, suffix = ""): string {
  if (val == null) return "—";
  return `${val.toLocaleString()}${suffix}`;
}

type UploadState = { status: "idle" } | { status: "uploading" } | { status: "error"; message: string };

export default function FitnessPage() {
  const [imports, setImports] = useState<FitnessImport[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadImports() {
    try {
      const res = await fetch("/api/fitness");
      if (!res.ok) throw new Error();
      const data = await res.json() as { imports: FitnessImport[] };
      setImports(data.imports);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadImports(); }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadState({ status: "uploading" });
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/fitness/upload", { method: "POST", body: formData });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setUploadState({ status: "idle" });
      const listRes = await fetch("/api/fitness");
      const listData = await listRes.json() as { imports: FitnessImport[] };
      setImports(listData.imports);
      if (listData.imports[0]) setExpandedId(listData.imports[0].id);
    } catch (err) {
      setUploadState({ status: "error", message: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch("/api/fitness", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setImports((prev) => prev.filter((i) => i.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch {
      // Silent
    } finally {
      setDeletingId(null);
    }
  }

  const isUploading = uploadState.status === "uploading";

  return (
    <>
      <Header title="Fitness Data" />
      <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">

        {/* Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Import Fitness Data</CardTitle>
            <CardDescription>
              Accepts <strong>CSV</strong>, <strong>Apple Health XML</strong> (export.xml), or <strong>Fitbit JSON</strong> exports · max 50 MB
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xml,.json,text/csv,application/xml,application/json"
              className="hidden"
              aria-label="Select fitness data file"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              aria-label="Upload fitness data file"
            >
              {isUploading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Processing…</>
              ) : (
                <><UploadCloud className="mr-2 h-4 w-4" aria-hidden="true" />Upload File</>
              )}
            </Button>

            {/* Format hints */}
            <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Format guide</p>
              <p><strong>CSV</strong> — needs a date column + any of: steps, calories, active minutes, heart rate, sleep</p>
              <p><strong>Apple Health</strong> — export from Health app → Profile → Export All Health Data → share export.xml</p>
              <p><strong>Fitbit</strong> — export from fitbit.com → Settings → Data Export, upload activities-*.json</p>
            </div>

            {uploadState.status === "error" && (
              <p className="flex items-center gap-1.5 text-sm text-destructive" role="alert" aria-live="assertive">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {uploadState.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Import list */}
        {loading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading fitness data">
            {[1, 2].map((n) => (
              <div key={n} className="rounded-xl border bg-card p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((s) => <Skeleton key={s} className="h-16 rounded-lg" />)}
                </div>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center" role="alert">
            <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Couldn&apos;t load fitness data.</p>
          </div>
        ) : imports.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <Activity className="h-10 w-10" aria-hidden="true" />
            <p className="font-medium">No fitness data imported yet</p>
            <p className="text-sm">Upload a file above to start tracking your activity.</p>
          </div>
        ) : (
          <ul className="space-y-4" role="list" aria-label="Fitness imports">
            {imports.map((imp) => {
              const isExpanded = expandedId === imp.id;
              const recent = imp.weeklyAggregates.slice(-4); // show last 4 weeks by default

              return (
                <li key={imp.id}>
                  <Card>
                    <CardHeader className="pb-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-base truncate">{imp.fileName}</CardTitle>
                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${FILE_TYPE_COLORS[imp.fileType]}`}>
                              {FILE_TYPE_LABELS[imp.fileType]}
                            </span>
                          </div>
                          <CardDescription className="mt-0.5 text-xs">
                            {imp.dateRange.from} → {imp.dateRange.to} &middot; {imp.recordCount} days &middot; {imp.weeklyAggregates.length} weeks
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${imp.fileName}`}
                            onClick={() => handleDelete(imp.id)}
                            disabled={deletingId === imp.id}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            {deletingId === imp.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            ) : (
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {imp.weeklyAggregates.length > 0 && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : imp.id)}
                          className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? "Hide weekly stats" : "Show weekly stats"}
                        >
                          {isExpanded ? (
                            <><ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />Hide weekly stats</>
                          ) : (
                            <><ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />Show weekly stats ({imp.weeklyAggregates.length} weeks)</>
                          )}
                        </button>
                      )}
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-4 space-y-4">
                        {/* Summary cards for most recent week */}
                        {(() => {
                          const last = imp.weeklyAggregates[imp.weeklyAggregates.length - 1];
                          return last ? (
                            <div>
                              <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                Most recent week ({last.weekStart})
                              </p>
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                                {[
                                  { icon: Footprints, label: "Avg Steps", value: fmt(last.avgSteps) },
                                  { icon: Flame, label: "Avg Cal", value: fmt(last.avgCalories) },
                                  { icon: Timer, label: "Active Min", value: fmt(last.avgActiveMinutes, " min") },
                                  { icon: Heart, label: "Avg HR", value: fmt(last.avgHeartRate, " bpm") },
                                  { icon: Moon, label: "Avg Sleep", value: fmt(last.avgSleepHours, " hr") },
                                ].map(({ icon: Icon, label, value }) => (
                                  <div key={label} className="rounded-lg border bg-muted/30 p-3 text-center">
                                    <Icon className="mx-auto mb-1 h-4 w-4 text-emerald-500" aria-hidden="true" />
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                    <p className="mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null;
                        })()}

                        {/* Weekly table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs" aria-label="Weekly fitness averages">
                            <thead>
                              <tr className="border-b text-left text-muted-foreground">
                                <th className="pb-2 pr-3 font-medium">Week</th>
                                <th className="pb-2 pr-3 font-medium">Days</th>
                                <th className="pb-2 pr-3 font-medium">Steps</th>
                                <th className="pb-2 pr-3 font-medium">Calories</th>
                                <th className="pb-2 pr-3 font-medium">Active min</th>
                                <th className="pb-2 pr-3 font-medium">HR</th>
                                <th className="pb-2 font-medium">Sleep</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {recent.map((w) => (
                                <tr key={w.weekStart} className="tabular-nums">
                                  <td className="py-1.5 pr-3 font-medium">{w.weekStart}</td>
                                  <td className="py-1.5 pr-3 text-muted-foreground">{w.daysWithData}</td>
                                  <td className="py-1.5 pr-3">{fmt(w.avgSteps)}</td>
                                  <td className="py-1.5 pr-3">{fmt(w.avgCalories)}</td>
                                  <td className="py-1.5 pr-3">{fmt(w.avgActiveMinutes)}</td>
                                  <td className="py-1.5 pr-3">{fmt(w.avgHeartRate)}</td>
                                  <td className="py-1.5">{fmt(w.avgSleepHours, " hr")}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {imp.weeklyAggregates.length > 4 && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Showing last 4 of {imp.weeklyAggregates.length} weeks.
                            </p>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
