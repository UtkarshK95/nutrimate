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
import { Skeleton } from "@/components/ui/skeleton";
import type { LabReport, BiomarkerStatus } from "@/types/documents";
import {
  FlaskConical,
  Loader2,
  Trash2,
  UploadCloud,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

const LAB_LINKS = [
  { name: "Dr Lal PathLabs", url: "https://www.lalpathlabs.com/book-test", color: "text-red-600 dark:text-red-400" },
  { name: "Apollo Diagnostics", url: "https://www.apollodiagnostics.in/", color: "text-blue-600 dark:text-blue-400" },
  { name: "Thyrocare", url: "https://www.thyrocare.com/", color: "text-emerald-600 dark:text-emerald-400" },
  { name: "Metropolis", url: "https://www.metropolisindia.com/", color: "text-violet-600 dark:text-violet-400" },
  { name: "SRL Diagnostics", url: "https://srlworld.com/", color: "text-orange-600 dark:text-orange-400" },
  { name: "Redcliffe Labs", url: "https://redcliffelabs.com/", color: "text-pink-600 dark:text-pink-400" },
];

const STATUS_STYLES: Record<BiomarkerStatus, string> = {
  normal: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
  high:   "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300",
  low:    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
  unknown:"bg-muted text-muted-foreground border-border",
};

type UploadState = { status: "idle" } | { status: "uploading" } | { status: "error"; message: string };

export default function LabReportsPage() {
  const [reports, setReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadReports() {
    try {
      const res = await fetch("/api/lab-reports");
      if (!res.ok) throw new Error();
      const data = await res.json() as { reports: LabReport[] };
      setReports(data.reports);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReports(); }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadState({ status: "uploading" });
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/lab-reports/upload", { method: "POST", body: formData });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setUploadState({ status: "idle" });
      const listRes = await fetch("/api/lab-reports");
      const listData = await listRes.json() as { reports: LabReport[] };
      setReports(listData.reports);
      // Auto-expand the newest report
      if (listData.reports[0]) setExpandedId(listData.reports[0].id);
    } catch (err) {
      setUploadState({ status: "error", message: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch("/api/lab-reports", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setReports((prev) => prev.filter((r) => r.id !== id));
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
      <Header title="Lab Reports" />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Upload */}
        <Card className="border-dashed border-2 border-border/60">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-sm shadow-emerald-200 dark:shadow-emerald-900/40">
                <FlaskConical className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Upload Lab Report</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  PDF only · max 20 MB · AI will extract biomarkers and track them over time
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                aria-label="Select lab report PDF"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="shrink-0 bg-linear-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm"
                aria-label="Upload lab report PDF"
              >
                {isUploading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Extracting…</>
                ) : (
                  <><UploadCloud className="mr-2 h-4 w-4" aria-hidden="true" />Upload PDF</>
                )}
              </Button>
            </div>
            {uploadState.status === "error" && (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-destructive" role="alert" aria-live="assertive">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {uploadState.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Book a test */}
        <div className="rounded-xl border bg-card px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-950/60">
              <ExternalLink className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold">Book a Blood Test</p>
            <span className="ml-auto text-xs text-muted-foreground">Opens external site</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {LAB_LINKS.map(({ name, url, color }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5 text-xs font-medium transition-all hover:bg-muted hover:shadow-sm"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${color.replace("text-", "bg-")}`} aria-hidden="true" />
                <span className="flex-1 truncate">{name}</span>
                <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {/* Report list */}
        {loading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading reports">
            {[1, 2].map((n) => (
              <div key={n} className="rounded-xl border bg-card p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[1, 2, 3, 4].map((b) => <Skeleton key={b} className="h-6 w-20 rounded-md" />)}
                </div>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center" role="alert">
            <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Couldn&apos;t load reports.</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <div className="rounded-2xl bg-muted p-5">
              <FlaskConical className="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
            </div>
            <p className="font-medium text-foreground">No lab reports yet</p>
            <p className="text-sm max-w-xs">Upload a blood test PDF to start tracking your biomarkers over time.</p>
          </div>
        ) : (
          <ul className="space-y-4" role="list" aria-label="Lab reports">
            {reports.map((report) => {
              const isExpanded = expandedId === report.id;
              const abnormal = report.biomarkers.filter(
                (b) => b.status === "high" || b.status === "low"
              ).length;

              return (
                <li key={report.id}>
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <CardTitle className="text-base truncate">{report.fileName}</CardTitle>
                          <CardDescription className="mt-0.5 text-xs">
                            Report date: {report.reportDate} &middot; uploaded{" "}
                            {new Date(report.uploadedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="secondary" className="text-xs">
                            {report.biomarkers.length} markers
                          </Badge>
                          {abnormal > 0 && (
                            <Badge className="text-xs bg-red-100 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300">
                              {abnormal} abnormal
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${report.fileName}`}
                            onClick={() => handleDelete(report.id)}
                            disabled={deletingId === report.id}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            {deletingId === report.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            ) : (
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Expand toggle */}
                      {report.biomarkers.length > 0 && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : report.id)}
                          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-xs font-medium text-muted-foreground transition-all hover:border-emerald-300 hover:bg-emerald-50/60 hover:text-emerald-700 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? "Hide biomarkers" : "Show biomarkers"}
                        >
                          {isExpanded ? (
                            <><ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />Hide biomarkers</>
                          ) : (
                            <><ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />Show {report.biomarkers.length} biomarkers</>
                          )}
                        </button>
                      )}

                      {report.biomarkers.length === 0 && (
                        <p className="mt-2 text-xs text-muted-foreground italic">
                          No biomarkers could be extracted from this PDF.
                        </p>
                      )}
                    </CardHeader>

                    {isExpanded && report.biomarkers.length > 0 && (
                      <CardContent className="pt-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm" aria-label={`Biomarkers from ${report.fileName}`}>
                            <thead>
                              <tr className="border-b text-left text-xs text-muted-foreground">
                                <th className="pb-2 pr-4 font-medium">Biomarker</th>
                                <th className="pb-2 pr-4 font-medium">Value</th>
                                <th className="pb-2 pr-4 font-medium">Unit</th>
                                <th className="pb-2 pr-4 font-medium">Reference</th>
                                <th className="pb-2 font-medium">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {report.biomarkers.map((b, i) => (
                                <tr key={i} className="text-sm">
                                  <td className="py-2 pr-4 font-medium">{b.name}</td>
                                  <td className="py-2 pr-4 tabular-nums">{b.value}</td>
                                  <td className="py-2 pr-4 text-muted-foreground">{b.unit || "—"}</td>
                                  <td className="py-2 pr-4 text-muted-foreground">{b.referenceRange || "—"}</td>
                                  <td className="py-2">
                                    <span
                                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[b.status]}`}
                                    >
                                      {b.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
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
