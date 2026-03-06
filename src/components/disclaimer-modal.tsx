"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

const STORAGE_KEY = "nutrimate_disclaimer_accepted";

export function DisclaimerModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(STORAGE_KEY);
      if (!accepted) {
        setOpen(true);
      }
    } catch {
      // localStorage unavailable — just don't show modal
    }
  }, []);

  function handleAccept() {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-md"
        // Prevent closing by clicking the overlay — user must explicitly accept
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        aria-describedby="disclaimer-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert
              className="h-5 w-5 text-amber-500"
              aria-hidden="true"
            />
            <DialogTitle>Medical Disclaimer</DialogTitle>
          </div>
          <DialogDescription id="disclaimer-description" className="pt-2 text-left leading-relaxed">
            Nutrimate is a{" "}
            <strong>personal hobby project, not a medical device</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            AI-generated insights provided by this app are for{" "}
            <strong className="text-foreground">
              informational purposes only
            </strong>{" "}
            and do not constitute medical advice, diagnosis, or treatment.
          </p>
          <p>
            Always consult a qualified healthcare professional before making any
            decisions about your health, medications, or treatment plans.
          </p>
          <p>
            Your health data is processed locally on your machine and is never
            sent to any external server (except the Gemini API for AI
            responses).
          </p>
        </div>

        <DialogFooter>
          <Button
            onClick={handleAccept}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            aria-label="Accept disclaimer and continue to Nutrimate"
          >
            I understand — take me to Nutrimate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
