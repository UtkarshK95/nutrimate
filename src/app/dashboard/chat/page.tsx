"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

        // Heading ## or ###
        if (/^#{2,3}\s/.test(line)) {
          return (
            <p key={i} className="font-semibold text-foreground mt-2 first:mt-0">
              {line.replace(/^#{2,3}\s/, "")}
            </p>
          );
        }
        // **bold heading** (standalone line)
        if (/^\*\*(.+)\*\*$/.test(line.trim())) {
          return (
            <p key={i} className="font-semibold text-foreground mt-2 first:mt-0">
              {line.trim().replace(/^\*\*|\*\*$/g, "")}
            </p>
          );
        }
        // Bullet - or *
        if (/^[-*]\s/.test(line.trim())) {
          const content = line.trim().replace(/^[-*]\s/, "");
          return (
            <div key={i} className="flex gap-2">
              <span className="mt-[0.35rem] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />
              <span dangerouslySetInnerHTML={{ __html: inlineBold(content) }} />
            </div>
          );
        }
        // Numbered list
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
        return (
          <p key={i} dangerouslySetInnerHTML={{ __html: inlineBold(line) }} />
        );
      })}
    </div>
  );
}

/** Convert **bold** to <strong> in a line */
function inlineBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function HistorySkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading chat history" aria-busy="true">
      {/* Model message skeleton */}
      <div className="flex gap-3">
        <Skeleton className="mt-0.5 h-7 w-7 shrink-0 rounded-full" />
        <Skeleton className="h-16 w-64 rounded-2xl rounded-tl-sm" />
      </div>
      {/* User message skeleton */}
      <div className="flex gap-3 flex-row-reverse">
        <Skeleton className="h-10 w-48 rounded-2xl rounded-tr-sm" />
      </div>
      {/* Model message skeleton */}
      <div className="flex gap-3">
        <Skeleton className="mt-0.5 h-7 w-7 shrink-0 rounded-full" />
        <Skeleton className="h-20 w-72 rounded-2xl rounded-tl-sm" />
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load history on mount
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

  // Auto-scroll to bottom when messages change
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

      // Persist history (fire-and-forget)
      fetch("/api/chat/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: withReply }),
      }).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      // Remove the user message that failed
      setMessages(messages);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function handleClearHistory() {
    if (!window.confirm("Clear all chat history? This cannot be undone.")) return;
    try {
      await fetch("/api/chat/history", { method: "DELETE" });
      setMessages([]);
    } catch {
      setError("Failed to clear history.");
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
            onClick={handleClearHistory}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
            aria-label="Clear chat history"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Clear history
          </Button>
        )}
      </Header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-6">

          {/* History loading skeleton */}
          {historyLoading && <HistorySkeleton />}

          {/* Empty state */}
          {isEmpty && (
            <div className="flex flex-col items-center gap-6 pt-8 text-center">
              <div className="rounded-full bg-emerald-50 p-4 dark:bg-emerald-950">
                <Salad className="h-8 w-8 text-emerald-500" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Ask Nutrimate anything</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your questions are answered using your profile, lab reports, research papers, and fitness data.
                </p>
              </div>
              <div className="grid w-full gap-2 sm:grid-cols-2" role="list" aria-label="Suggested questions">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="rounded-lg border bg-card px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-foreground dark:hover:bg-emerald-950 focus:outline-none focus:ring-1 focus:ring-ring"
                    aria-label={`Ask: ${s}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
            >
              {/* Avatar */}
              {msg.role === "model" && (
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900" aria-hidden="true">
                  <Salad className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              )}

              {/* Bubble */}
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3",
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-tr-sm"
                    : "bg-muted rounded-tl-sm"
                )}
              >
                {msg.role === "user" ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <MarkdownMessage text={msg.content} />
                )}
              </div>
            </div>
          ))}

          {/* Loading bubble */}
          {loading && (
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900" aria-hidden="true">
                <Salad className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3" aria-live="polite" aria-label="AI is thinking">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
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
      <div className="border-t bg-background px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-end gap-2 rounded-xl border bg-muted/30 px-4 py-2 focus-within:ring-1 focus-within:ring-ring">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your health data… (Enter to send, Shift+Enter for new line)"
              rows={1}
              disabled={loading || historyLoading}
              aria-label="Chat message input"
              className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50 max-h-40 py-1.5"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={loading || historyLoading || !input.trim()}
              size="icon"
              className="mb-0.5 h-8 w-8 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
              aria-label="Send message"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
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
