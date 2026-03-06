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
import type { LabReport, BiomarkerStatus } from "@/types/documents";
import {
  FlaskConical,
  Loader2,
  Trash2,
  UploadCloud,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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
      <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">

        {/* Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Lab Report</CardTitle>
            <CardDescription>
              PDF only · max 20 MB. AI will extract biomarkers and track them over time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              aria-label="Upload lab report PDF"
            >
              {isUploading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Extracting biomarkers…</>
              ) : (
                <><UploadCloud className="mr-2 h-4 w-4" aria-hidden="true" />Upload PDF</>
              )}
            </Button>
            {uploadState.status === "error" && (
              <p className="flex items-center gap-1.5 text-sm text-destructive" role="alert" aria-live="assertive">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {uploadState.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Report list */}
        {loading ? (
          <div className="flex justify-center py-12" aria-live="polite">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center" role="alert">
            <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Couldn&apos;t load reports.</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <FlaskConical className="h-10 w-10" aria-hidden="true" />
            <p className="font-medium">No lab reports yet</p>
            <p className="text-sm">Upload a blood report PDF to start tracking your biomarkers.</p>
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
                    <CardHeader className="pb-0">
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
                          className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          aria-expanded={isExpanded}
                          aria-label={isExpanded ? "Hide biomarkers" : "Show biomarkers"}
                        >
                          {isExpanded ? (
                            <><ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />Hide biomarkers</>
                          ) : (
                            <><ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />Show biomarkers</>
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
