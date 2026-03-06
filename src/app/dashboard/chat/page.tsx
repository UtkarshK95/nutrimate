"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Send, Loader2, Salad, AlertCircle, Trash2 } from "lucide-react";

interface Message {
  role: "user" | "model";
  content: string;
  timestamp: string;
}

const STARTERS = [
  "Summarise my recent lab results",
  "How are my fitness trends looking?",
  "What does my health profile say about my goals?",
  "Are any of my biomarkers outside the normal range?",
];

/** Renders AI markdown responses: bold, bullets, headings, plain text */
function MarkdownMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;

        if (/^#{2,3}\s/.test(line)) {
          return (
            <p key={i} className="font-semibold text-foreground mt-2 first:mt-0">
              {line.replace(/^#{2,3}\s/, "")}
            </p>
          );
        }
        if (/^\*\*(.+)\*\*$/.test(line.trim())) {
          return (
            <p key={i} className="font-semibold text-foreground mt-2 first:mt-0">
              {line.trim().replace(/^\*\*|\*\*$/g, "")}
            </p>
          );
        }
        if (/^[-*]\s/.test(line.trim())) {
          const content = line.trim().replace(/^[-*]\s/, "");
          return (
            <div key={i} className="flex gap-2">
              <span className="mt-[0.35rem] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />
              <span dangerouslySetInnerHTML={{ __html: inlineBold(content) }} />
            </div>
          );
        }
        if (/^\d+\.\s/.test(line.trim())) {
          const num = line.match(/^(\d+)\./)?.[1];
          const content = line.trim().replace(/^\d+\.\s/, "");
          return (
            <div key={i} className="flex gap-2">
              <span className="shrink-0 font-medium text-emerald-500 tabular-nums">{num}.</span>
              <span dangerouslySetInnerHTML={{ __html: inlineBold(content) }} />
            </div>
          );
        }
        return <p key={i} dangerouslySetInnerHTML={{ __html: inlineBold(line) }} />;
      })}
    </div>
  );
}

function inlineBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function HistorySkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading chat history" aria-busy="true">
      <div className="flex gap-3">
        <Skeleton className="mt-0.5 h-7 w-7 shrink-0 rounded-full" />
        <Skeleton className="h-16 w-64 rounded-2xl rounded-tl-sm" />
      </div>
      <div className="flex gap-3 flex-row-reverse">
        <Skeleton className="h-10 w-48 rounded-2xl rounded-tr-sm" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="mt-0.5 h-7 w-7 shrink-0 rounded-full" />
        <Skeleton className="h-20 w-72 rounded-2xl rounded-tl-sm" />
      </div>
    </div>
  );
}

/** Format ISO timestamp to readable time */
function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(iso));
  } catch {
    return "";
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/chat/history");
        if (!res.ok) throw new Error();
        const data = await res.json() as { messages: Message[] };
        setMessages(data.messages ?? []);
      } catch {
        // Silent — start with empty state
      } finally {
        setHistoryLoading(false);
      }
    }
    loadHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(content: string) {
    if (!content.trim() || loading || historyLoading) return;
    setError(null);

    const now = new Date().toISOString();
    const userMsg: Message = { role: "user", content: content.trim(), timestamp: now };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json() as { content?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Chat failed");

      const modelMsg: Message = {
        role: "model",
        content: data.content!,
        timestamp: new Date().toISOString(),
      };
      const withReply = [...newMessages, modelMsg];
      setMessages(withReply);

      fetch("/api/chat/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: withReply }),
      }).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setMessages(messages);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function confirmClearHistory() {
    setClearing(true);
    try {
      await fetch("/api/chat/history", { method: "DELETE" });
      setMessages([]);
      setClearDialogOpen(false);
    } catch {
      setError("Failed to clear history.");
    } finally {
      setClearing(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const isEmpty = !historyLoading && messages.length === 0;

  return (
    <div className="flex h-full flex-col">
      <Header title="AI Chat">
        {messages.length > 0 && !historyLoading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setClearDialogOpen(true)}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            aria-label="Clear chat history"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Clear history
          </Button>
        )}
      </Header>

      {/* Clear history confirmation dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Clear chat history?</DialogTitle>
            <DialogDescription>
              This will permanently delete all your conversation history. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" disabled={clearing}>Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={confirmClearHistory}
              disabled={clearing}
            >
              {clearing ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Clearing…</> : "Clear history"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="mx-auto max-w-2xl space-y-5">

          {historyLoading && <HistorySkeleton />}

          {isEmpty && (
            <div className="flex flex-col items-center gap-6 pt-8 text-center">
              <div className="rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 p-4 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40">
                <Salad className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Ask Nutrimate anything</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Answers grounded in your profile, lab reports, research, and fitness data.
                </p>
              </div>
              <div className="grid w-full gap-2 sm:grid-cols-2" role="list" aria-label="Suggested questions">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="group relative rounded-xl border bg-card px-4 py-3 text-left text-sm text-muted-foreground transition-all hover:border-emerald-300 hover:bg-emerald-50/60 hover:text-foreground hover:shadow-sm dark:hover:bg-emerald-950/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                    aria-label={`Ask: ${s}`}
                  >
                    <span className="font-medium">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn("flex gap-3 group", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              {msg.role === "model" && (
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-teal-500 shadow-sm" aria-hidden="true">
                  <Salad className="h-3.5 w-3.5 text-white" />
                </div>
              )}

              <div className="flex flex-col gap-1 max-w-[80%]">
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 shadow-sm",
                    msg.role === "user"
                      ? "bg-linear-to-br from-emerald-500 to-teal-600 text-white rounded-tr-sm"
                      : "bg-card border rounded-tl-sm"
                  )}
                >
                  {msg.role === "user" ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <MarkdownMessage text={msg.content} />
                  )}
                </div>
                {msg.timestamp && (
                  <span className={cn(
                    "text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity px-1",
                    msg.role === "user" ? "text-right" : "text-left"
                  )}>
                    {formatTime(msg.timestamp)}
                  </span>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-teal-500 shadow-sm" aria-hidden="true">
                <Salad className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-card border px-4 py-3 shadow-sm" aria-live="polite" aria-label="AI is thinking">
                <div className="flex gap-1 items-center h-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div
              className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t bg-background/80 backdrop-blur-sm px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-end gap-2 rounded-2xl border bg-card px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-emerald-400/50 focus-within:border-emerald-300 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your health data… (Enter to send, Shift+Enter for new line)"
              rows={1}
              disabled={loading || historyLoading}
              aria-label="Chat message input"
              className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50 max-h-40 py-1"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={loading || historyLoading || !input.trim()}
              size="icon"
              className="mb-0.5 h-8 w-8 shrink-0 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm disabled:opacity-40 disabled:shadow-none transition-all"
              aria-label="Send message"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </div>
          <p className="mt-1.5 text-center text-xs text-muted-foreground">
            AI responses are informational only — not medical advice. Always consult a healthcare professional.
          </p>
        </div>
      </div>
    </div>
  );
}
