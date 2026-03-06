import { Header } from "@/components/header";
import { Activity } from "lucide-react";

export default function FitnessPage() {
  return (
    <>
      <Header title="Fitness Data" />
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="rounded-full bg-muted p-4">
          <Activity
            className="h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold">No fitness data yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Import exports from Fitbit, Apple Health, or any CSV-based fitness
            tracker.
          </p>
        </div>
      </div>
    </>
  );
}
