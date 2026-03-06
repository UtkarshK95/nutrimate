"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, User, BookOpen, FlaskConical, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/research", label: "Research", icon: BookOpen },
  { href: "/dashboard/lab-reports", label: "Labs", icon: FlaskConical },
  { href: "/dashboard/fitness", label: "Fitness", icon: Activity },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-md md:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="flex" role="list">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 px-1 text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "relative flex h-6 w-6 items-center justify-center rounded-lg transition-all",
                  isActive ? "bg-emerald-100 dark:bg-emerald-950/80" : ""
                )}>
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {isActive && (
                    <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  )}
                </div>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
