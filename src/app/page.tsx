"use client";

import { useState } from "react";
import {
  Salad,
  MessageSquare,
  User,
  BookOpen,
  FlaskConical,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DisclaimerModal } from "@/components/disclaimer-modal";
import { PasswordModal } from "@/components/password-modal";

const features = [
  {
    icon: User,
    title: "Health Profile",
    description:
      "Store your medications, conditions, allergies, and goals. The AI uses your profile to personalise every response.",
  },
  {
    icon: BookOpen,
    title: "Research Library",
    description:
      "Upload PubMed or NIH papers. The AI simplifies and embeds them so your chat is grounded in real science.",
  },
  {
    icon: FlaskConical,
    title: "Lab Reports",
    description:
      "Upload blood reports as PDFs. AI extracts biomarkers and tracks them over time.",
  },
  {
    icon: Activity,
    title: "Fitness Data",
    description:
      "Import exports from Fitbit, Apple Health, or any CSV tracker. See weekly aggregates at a glance.",
  },
  {
    icon: MessageSquare,
    title: "AI Chat",
    description:
      "Ask health questions and get answers grounded in your data — not generic internet advice.",
  },
  {
    icon: ShieldCheck,
    title: "100% Local",
    description:
      "All data lives in a /data folder on your machine. No accounts, no cloud database, no data harvesting.",
  },
];

export default function Home() {
  const [pwOpen, setPwOpen] = useState(false);

  return (
    <>
      <DisclaimerModal />
      <PasswordModal open={pwOpen} onOpenChange={setPwOpen} />

      <div className="flex min-h-screen flex-col bg-background">
        {/* Nav */}
        <header className="flex h-16 items-center justify-between border-b px-6 md:px-12">
          <div className="flex items-center gap-2">
            <Salad className="h-6 w-6 text-emerald-500" aria-hidden="true" />
            <span className="text-lg font-semibold tracking-tight">
              Nutrimate
            </span>
          </div>
          <Button size="sm" onClick={() => setPwOpen(true)} aria-label="Open dashboard">
            Open App
          </Button>
        </header>

        {/* Hero */}
        <main className="flex-1">
          <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-24 text-center md:py-32">
            <Badge variant="secondary" className="text-xs">
              Local-first · No account required
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Your personal{" "}
              <span className="text-emerald-500">health AI</span>,
              <br />
              running on your machine
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Nutrimate combines your health profile, lab reports, fitness data,
              and medical research to give you deeply personalised insights —
              privately, with no data leaving your device.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setPwOpen(true)}
                aria-label="Get started with Nutrimate"
              >
                Get started
              </Button>
              <Button asChild variant="outline" size="lg">
                <a
                  href="https://github.com/yourusername/nutrimate"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View source code on GitHub"
                >
                  View source
                </a>
              </Button>
            </div>
          </section>

          {/* Features grid */}
          <section
            className="mx-auto max-w-5xl px-6 pb-24"
            aria-label="Features"
          >
            <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight">
              Everything in one place
            </h2>
            <ul
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              role="list"
            >
              {features.map(({ icon: Icon, title, description }) => (
                <li
                  key={title}
                  className="rounded-lg border bg-card p-5 text-card-foreground shadow-sm"
                >
                  <div className="mb-3 inline-flex rounded-md bg-emerald-50 p-2 dark:bg-emerald-950">
                    <Icon
                      className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mb-1 font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </li>
              ))}
            </ul>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t px-6 py-4" role="contentinfo">
          <p className="text-center text-xs text-muted-foreground">
            ⚠️ Nutrimate is not a medical device. AI-generated insights are for
            informational purposes only and do not constitute medical advice,
            diagnosis, or treatment. Always consult a qualified healthcare
            professional.
          </p>
        </footer>
      </div>
    </>
  );
}
