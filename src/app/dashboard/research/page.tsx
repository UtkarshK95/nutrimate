import { Header } from "@/components/header";
import { BookOpen } from "lucide-react";

export default function ResearchPage() {
  return (
    <>
      <Header title="Research Library" />
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="rounded-full bg-muted p-4">
          <BookOpen
            className="h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold">No research papers yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload research PDFs (PubMed, NIH, etc.) and the AI will use them
            to ground its responses.
          </p>
        </div>
      </div>
    </>
  );
}
