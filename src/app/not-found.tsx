import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Salad } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="rounded-full bg-emerald-50 p-5 dark:bg-emerald-950">
        <Salad className="h-10 w-10 text-emerald-500" aria-hidden="true" />
      </div>
      <div>
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <p className="mt-2 text-lg font-medium">Page not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
      <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
