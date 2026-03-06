import { Header } from "@/components/header";
import { FlaskConical } from "lucide-react";

export default function LabReportsPage() {
  return (
    <>
      <Header title="Lab Reports" />
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="rounded-full bg-muted p-4">
          <FlaskConical
            className="h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold">No lab reports uploaded</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload blood reports or diagnostic PDFs to track your biomarkers
            over time.
          </p>
        </div>
      </div>
    </>
  );
}
