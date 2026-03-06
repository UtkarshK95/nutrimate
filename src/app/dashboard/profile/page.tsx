"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { TagInput } from "@/components/tag-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EMPTY_PROFILE, type HealthProfile } from "@/types/profile";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";

type SaveState = "idle" | "saving" | "success" | "error";

const GENDER_OPTIONS = [
  { value: "", label: "Prefer not to say" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "other", label: "Other" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<HealthProfile>({ ...EMPTY_PROFILE });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to load");
        const data: HealthProfile = await res.json();
        setProfile(data);
      } catch {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function updateField<K extends keyof HealthProfile>(
    key: K,
    value: HealthProfile[K]
  ) {
    setProfile((prev) => ({ ...prev, [key]: value }));
    if (saveState === "success" || saveState === "error") setSaveState("idle");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveState("saving");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaveState("success");
    } catch {
      setSaveState("error");
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Health Profile" />
        <div className="mx-auto max-w-2xl px-6 py-8 space-y-6" aria-busy="true" aria-label="Loading profile">
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Skeleton className="h-4 w-12" /><Skeleton className="h-9 w-full" /></div>
              <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-9 w-full" /></div>
            </div>
            <div className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-9 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-9 w-full" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-20 w-full" /></div>
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <Header title="Health Profile" />
        <div className="flex flex-col items-center gap-3 p-16 text-center" role="alert">
          <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
          <p className="font-medium">Couldn&apos;t load your profile</p>
          <p className="text-sm text-muted-foreground">
            Make sure the app is running correctly and try refreshing.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Health Profile" />
      <div className="mx-auto max-w-2xl px-6 py-8">
        <form onSubmit={handleSubmit} noValidate aria-label="Health profile form">
          <div className="space-y-6">
            {/* Basic info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Used to personalise AI responses.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="Your name"
                    maxLength={100}
                    aria-label="Your name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min={1}
                      max={120}
                      value={profile.age ?? ""}
                      onChange={(e) =>
                        updateField(
                          "age",
                          e.target.value === ""
                            ? null
                            : parseInt(e.target.value, 10)
                        )
                      }
                      placeholder="e.g. 34"
                      aria-label="Your age"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      value={profile.gender}
                      onChange={(e) => updateField("gender", e.target.value)}
                      aria-label="Your gender"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {GENDER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical */}
            <Card>
              <CardHeader>
                <CardTitle>Medical Details</CardTitle>
                <CardDescription>
                  Type an item and press{" "}
                  <kbd className="rounded border px-1 text-xs">Enter</kbd> or{" "}
                  <kbd className="rounded border px-1 text-xs">,</kbd> to add.
                  Click the × to remove.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="medications">Current Medications</Label>
                  <TagInput
                    id="medications"
                    value={profile.medications}
                    onChange={(tags) => updateField("medications", tags)}
                    placeholder="e.g. Metformin 500mg…"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="conditions">Health Conditions</Label>
                  <TagInput
                    id="conditions"
                    value={profile.conditions}
                    onChange={(tags) => updateField("conditions", tags)}
                    placeholder="e.g. Type 2 Diabetes…"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="allergies">Allergies</Label>
                  <TagInput
                    id="allergies"
                    value={profile.allergies}
                    onChange={(tags) => updateField("allergies", tags)}
                    placeholder="e.g. Penicillin, Peanuts…"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Health Goals</CardTitle>
                <CardDescription>
                  Describe what you&apos;re working towards. The AI uses this
                  to keep responses focused.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  id="goals"
                  value={profile.goals}
                  onChange={(e) => updateField("goals", e.target.value)}
                  placeholder="e.g. Lose 10 kg, improve HbA1c below 6.5%, build more muscle…"
                  rows={4}
                  maxLength={2000}
                  aria-label="Your health goals"
                />
                <p className="mt-1.5 text-right text-xs text-muted-foreground">
                  {profile.goals.length}/2000
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between">
              {profile.updatedAt && (
                <p className="text-xs text-muted-foreground">
                  Last saved{" "}
                  {new Date(profile.updatedAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              )}
              <div className="ml-auto flex items-center gap-3">
                {saveState === "success" && (
                  <span
                    className="flex items-center gap-1.5 text-sm text-emerald-600"
                    role="status"
                    aria-live="polite"
                  >
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                    Saved
                  </span>
                )}
                {saveState === "error" && (
                  <span
                    className="flex items-center gap-1.5 text-sm text-destructive"
                    role="alert"
                    aria-live="assertive"
                  >
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    Save failed — please try again
                  </span>
                )}
                <Button
                  type="submit"
                  disabled={saveState === "saving"}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  aria-label="Save health profile"
                >
                  {saveState === "saving" ? (
                    <>
                      <Loader2
                        className="mr-2 h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      Saving…
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
