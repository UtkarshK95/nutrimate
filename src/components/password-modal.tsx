"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Unlock, Sparkles, Eye, EyeOff } from "lucide-react";

interface PasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PasswordModal({ open, onOpenChange }: PasswordModalProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPassword("");
      setError("");
      setUnlocked(false);
      setShowPassword(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

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
          onOpenChange(false);
          router.push("/dashboard/chat");
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm border-0 bg-transparent shadow-none p-0">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 right-0 h-32 w-32 rounded-full bg-emerald-700/10 blur-2xl" />

          {/* Dot grid background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          <div className="relative p-7">
            <DialogHeader className="mb-6 items-center text-center">
              {/* Lock icon */}
              <div
                className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 transition-all duration-300 ${
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

              <DialogTitle className="text-xl font-bold text-white">
                {unlocked ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    Welcome back
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                  </span>
                ) : (
                  "Psst… password?"
                )}
              </DialogTitle>
              <DialogDescription className="text-zinc-500 text-sm">
                {unlocked
                  ? "Redirecting you to your dashboard…"
                  : "This is a private health assistant. Authorised humans only."}
              </DialogDescription>
            </DialogHeader>

            {!unlocked && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Input
                    ref={inputRef}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="shhh…"
                    required
                    aria-label="Site password"
                    className="border-white/10 bg-zinc-900 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/50 pr-10"
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
                  <p
                    role="alert"
                    className="text-center text-xs font-medium text-red-400"
                  >
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
      </DialogContent>
    </Dialog>
  );
}

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
