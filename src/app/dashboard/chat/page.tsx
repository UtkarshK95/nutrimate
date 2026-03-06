import { Header } from "@/components/header";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <>
      <Header title="AI Chat" />
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="rounded-full bg-muted p-4">
          <MessageSquare
            className="h-8 w-8 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Start a conversation</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Chat will be available once your health profile and data are set up.
          </p>
        </div>
      </div>
    </>
  );
}
