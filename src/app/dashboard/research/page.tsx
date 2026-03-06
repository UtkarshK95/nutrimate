"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ResearchDocument } from "@/types/documents";
import {
  BookOpen,
  Loader2,
  Trash2,
  UploadCloud,
  AlertCircle,
  FileText,
  ExternalLink,
} from "lucide-react";

const RESEARCH_LINKS = [
  { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/", desc: "NIH biomedical literature", color: "text-blue-600 dark:text-blue-400" },
  { name: "NIH NLM", url: "https://www.nlm.nih.gov/", desc: "National Library of Medicine", color: "text-emerald-600 dark:text-emerald-400" },
  { name: "Cochrane Library", url: "https://www.cochranelibrary.com/", desc: "Systematic reviews", color: "text-violet-600 dark:text-violet-400" },
  { name: "bioRxiv", url: "https://www.biorxiv.org/", desc: "Biology preprints", color: "text-orange-600 dark:text-orange-400" },
  { name: "Semantic Scholar", url: "https://www.semanticscholar.org/", desc: "AI-powered research search", color: "text-pink-600 dark:text-pink-400" },
  { name: "ResearchGate", url: "https://www.researchgate.net/", desc: "Papers & author profiles", color: "text-teal-600 dark:text-teal-400" },
];

/** Renders the structured markdown summary from Gemini. */
function SummaryBlock({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-2 text-sm text-muted-foreground">
      {lines.map((line, i) => {
        if (!line.trim()) return null;
        // Bold heading: **Heading**
        if (/^\*\*(.+)\*\*$/.test(line.trim())) {
          return (
            <p key={i} className="font-semibold text-foreground mt-3 first:mt-0">
              {line.trim().replace(/^\*\*|\*\*$/g, "")}
            </p>
          );
        }
        // Bullet point
        if (/^[-*]\s/.test(line.trim())) {
          return (
            <div key={i} className="flex gap-2">
              <span className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
              <span>{line.trim().replace(/^[-*]\s/, "")}</span>
            </div>
          );
        }
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

type UploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "error"; message: string };

export default function ResearchPage() {
  const [docs, setDocs] = useState<ResearchDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle" });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadDocs() {
    try {
      const res = await fetch("/api/research");
      if (!res.ok) throw new Error();
      const data = await res.json() as { documents: ResearchDocument[] };
      setDocs(data.documents);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDocs(); }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadState({ status: "uploading" });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name.replace(/\.pdf$/i, ""));

      const res = await fetch("/api/research/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Upload failed");

      setUploadState({ status: "idle" });
      const listRes = await fetch("/api/research");
      const listData = await listRes.json() as { documents: ResearchDocument[] };
      setDocs(listData.documents);
    } catch (err) {
      setUploadState({
        status: "error",
        message: err instanceof Error ? err.message : "Upload failed",
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch("/api/research", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch {
      // Silent — doc stays in list
    } finally {
      setDeletingId(null);
    }
  }

  const isUploading = uploadState.status === "uploading";

  return (
    <>
      <Header title="Research Library" />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Upload card */}
        <Card className="border-dashed border-2 border-border/60">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-sm shadow-emerald-200 dark:shadow-emerald-900/40">
                <BookOpen className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Upload Research Paper</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  PDF only · max 20 MB · the AI will summarise and index it for chat
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                aria-label="Select PDF file"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="shrink-0 bg-linear-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm"
                aria-label="Upload a research PDF"
              >
                {isUploading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Processing…</>
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

        {/* Research quick links */}
        <div className="rounded-xl border bg-card px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-950/60">
              <ExternalLink className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold">Find Research Papers</p>
            <span className="ml-auto text-xs text-muted-foreground">Opens external site</span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {RESEARCH_LINKS.map(({ name, url, desc, color }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-lg border bg-muted/40 px-3 py-2.5 transition-all hover:bg-muted hover:shadow-sm"
              >
                <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${color.replace("text-", "bg-")}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-semibold ${color}`}>{name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{desc}</p>
                </div>
                <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {/* Document list */}
        {loading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading documents">
            {[1, 2].map((n) => (
              <div key={n} className="rounded-xl border bg-card p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/6" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center" role="alert">
            <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Couldn&apos;t load documents.</p>
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <div className="rounded-2xl bg-muted p-5">
              <BookOpen className="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
            </div>
            <p className="font-medium text-foreground">No research papers yet</p>
            <p className="text-sm max-w-xs">Upload a PDF above and the AI will summarise and index it for your chats.</p>
          </div>
        ) : (
          <ul className="space-y-4" role="list" aria-label="Research documents">
            {docs.map((doc) => (
              <li key={doc.id}>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <FileText
                          className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <CardTitle className="text-base truncate">
                            {doc.title}
                          </CardTitle>
                          <CardDescription className="mt-0.5 text-xs">
                            {doc.fileName} &middot;{" "}
                            {new Date(doc.uploadedAt).toLocaleDateString(
                              undefined,
                              { dateStyle: "medium" }
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="text-xs">
                          {doc.chunkCount} chunk{doc.chunkCount !== 1 ? "s" : ""}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${doc.title}`}
                          onClick={() => handleDelete(doc.id)}
                          disabled={deletingId === doc.id}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          {deletingId === doc.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {doc.summary && (
                    <CardContent className="pt-0">
                      <SummaryBlock text={doc.summary} />
                    </CardContent>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
