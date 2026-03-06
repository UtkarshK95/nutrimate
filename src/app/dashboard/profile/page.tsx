import { Header } from "@/components/header";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <>
      <Header title="Health Profile" />
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="rounded-full bg-muted p-4">
          <User className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Set up your health profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your profile helps the AI personalise responses to your health goals
            and conditions.
          </p>
        </div>
      </div>
    </>
  );
}
