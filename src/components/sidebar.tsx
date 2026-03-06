"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  User,
  BookOpen,
  FlaskConical,
  Activity,
  Salad,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/dashboard/profile", label: "Health Profile", icon: User },
  { href: "/dashboard/research", label: "Research", icon: BookOpen },
  { href: "/dashboard/lab-reports", label: "Lab Reports", icon: FlaskConical },
  { href: "/dashboard/fitness", label: "Fitness", icon: Activity },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex h-full w-60 flex-col border-r bg-background"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-5">
        <Salad className="h-6 w-6 text-emerald-500" aria-hidden="true" />
        <span className="text-lg font-semibold tracking-tight">Nutrimate</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1" role="list">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom badge */}
      <div className="border-t px-4 py-3">
        <p className="text-xs text-muted-foreground">
          100% local &mdash; your data stays on your machine
        </p>
      </div>
    </aside>
  );
}
