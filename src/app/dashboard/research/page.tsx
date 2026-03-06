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
import type { ResearchDocument } from "@/types/documents";
import {
  BookOpen,
  Loader2,
  Trash2,
  UploadCloud,
  AlertCircle,
  FileText,
} from "lucide-react";

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
      <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">

        {/* Upload card */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Research Paper</CardTitle>
            <CardDescription>
              PDF only · max 20 MB. The AI will summarise and index it for chat.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              aria-label="Upload a research PDF"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Processing… this may take a minute
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" aria-hidden="true" />
                  Upload PDF
                </>
              )}
            </Button>
            {uploadState.status === "error" && (
              <p
                className="flex items-center gap-1.5 text-sm text-destructive"
                role="alert"
                aria-live="assertive"
              >
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {uploadState.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Document list */}
        {loading ? (
          <div className="flex justify-center py-12" aria-live="polite" aria-label="Loading documents">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center" role="alert">
            <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Couldn&apos;t load documents.</p>
          </div>
        ) : docs.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <BookOpen className="h-10 w-10" aria-hidden="true" />
            <p className="font-medium">No research papers yet</p>
            <p className="text-sm">
              Upload a PDF above and the AI will summarise and index it.
            </p>
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
