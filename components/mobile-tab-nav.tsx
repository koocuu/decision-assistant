"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers3, PlusCircle, UserRound } from "lucide-react";
import { isNavItemActive, type NavItem } from "@/lib/nav-active";
import { cn } from "@/lib/utils";

const icons = {
  "/": Home,
  "/decisions": Layers3,
  "/decisions/new": PlusCircle,
  "/profile": UserRound
};

export function MobileTabNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+14px)] z-40 rounded-2xl border bg-card/96 px-2 py-2 shadow-[0_12px_36px_-18px_rgba(11,14,20,0.38)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {items.map((item) => {
          const Icon = icons[item.href as keyof typeof icons] ?? Home;
          const active = isNavItemActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium text-muted-foreground transition active:scale-[0.98]",
                active ? "bg-primary-soft text-primary" : "active:bg-muted"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.href === "/decisions/new" ? "整理" : item.label.replace("历史决策", "记录")}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
