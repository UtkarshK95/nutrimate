"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Moon, Sun, Salad } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  children?: ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  return (
    <header className="sticky top-0 z-10 flex h-14 sm:h-16 items-center justify-between border-b bg-background/95 backdrop-blur-sm px-4 sm:px-6">
      {/* Mobile: brand logo + section name */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-emerald-400 to-teal-500">
          <Salad className="h-3.5 w-3.5 text-white" aria-hidden="true" />
        </div>
        <span className="font-bold text-sm tracking-tight">Nutrimate</span>
        <span className="text-xs text-muted-foreground">· {title}</span>
      </div>

      {/* Desktop: section title */}
      <h1 className="hidden md:block text-lg font-semibold">{title}</h1>

      <div className="flex items-center gap-2">
        {children}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle dark mode"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {mounted && resolvedTheme === "dark" ? (
            <Moon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Sun className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </div>
    </header>
  );
}
