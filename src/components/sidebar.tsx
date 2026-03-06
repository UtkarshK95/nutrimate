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
      className="flex h-full w-60 flex-col border-r bg-card"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-400 to-teal-500 shadow-sm shadow-emerald-200 dark:shadow-emerald-900/40">
          <Salad className="h-4 w-4 text-white" aria-hidden="true" />
        </div>
        <span className="text-lg font-bold tracking-tight">Nutrimate</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Menu
        </p>
        <ul className="space-y-0.5" role="list">
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
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-sm"
                      : "text-muted-foreground hover:bg-teal-50 hover:text-teal-800 dark:hover:bg-teal-950/30 dark:hover:text-teal-300"
                  )}
                >
                  <div className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                    isActive
                      ? "bg-emerald-100 dark:bg-emerald-900/60"
                      : ""
                  )}>
                    <Icon className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      isActive ? "text-emerald-600 dark:text-emerald-400" : ""
                    )} aria-hidden="true" />
                  </div>
                  {label}
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
