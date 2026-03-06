"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, Unlock, Sparkles, Salad, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const wittyErrors = [
  "Nope. Try again, genius. 🙃",
  "That's not it. Nice try though.",
  "Wrong password. Are you lost?",
  "Incorrect. This isn't 'password123'.",
  "The vault remains locked. 🔒",
  "Not even close, champ.",
];

let lastIndex = -1;
function getWittyError() {
  let index;
  do {
    index = Math.floor(Math.random() * wittyErrors.length);
  } while (index === lastIndex);
  lastIndex = index;
  return wittyErrors[index];
}

export default function EnterPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading || unlocked) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/check-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setUnlocked(true);
        setTimeout(() => {
          router.push("/dashboard/chat");
          router.refresh();
        }, 900);
      } else {
        setShake(true);
        setError(getWittyError());
        setPassword("");
        setTimeout(() => setShake(false), 600);
      }
    } catch {
      setError("Something broke. Are you even real?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-emerald-700/10 blur-2xl" />

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2 text-white">
          <Salad className="h-5 w-5 text-emerald-400" />
          <span className="text-sm font-semibold tracking-tight">Nutrimate</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-6 flex flex-col items-center gap-3 text-center">
            <div
              className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-zinc-800 transition-all duration-300 ${
                shake ? "animate-[wiggle_0.4s_ease-in-out]" : ""
              } ${unlocked ? "border-emerald-500/50 bg-emerald-950" : ""}`}
            >
              {unlocked ? (
                <Unlock className="h-7 w-7 text-emerald-400" />
              ) : (
                <Lock
                  className={`h-7 w-7 transition-colors ${
                    error ? "text-red-400" : "text-zinc-400"
                  }`}
                />
              )}
            </div>

            <h1 className="text-xl font-bold text-white">
              {unlocked ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  Welcome back
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                </span>
              ) : (
                "Psst… password?"
              )}
            </h1>
            <p className="text-sm text-zinc-500">
              {unlocked
                ? "Redirecting you to your dashboard…"
                : "Authorised humans only."}
            </p>
          </div>

          {!unlocked && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="shhh…"
                  required
                  autoFocus
                  aria-label="Site password"
                  className="border-white/10 bg-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {error && (
                <p role="alert" className="text-center text-xs font-medium text-red-400">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading || !password}
                className="w-full bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 font-semibold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Checking…
                  </span>
                ) : (
                  "Unlock →"
                )}
              </Button>
            </form>
          )}

          {unlocked && (
            <div className="flex justify-center py-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
