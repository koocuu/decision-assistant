"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavItemActive, type NavItem } from "@/lib/nav-active";
import { cn } from "@/lib/utils";

export function MainNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const optimisticTimer = useRef<number | null>(null);
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);
  const activePath = optimisticPath ?? pathname;

  useEffect(() => {
    return () => {
      if (optimisticTimer.current) {
        window.clearTimeout(optimisticTimer.current);
      }
    };
  }, []);

  function markOptimistic(path: string) {
    if (optimisticTimer.current) {
      window.clearTimeout(optimisticTimer.current);
    }

    setOptimisticPath(path);
    optimisticTimer.current = window.setTimeout(() => setOptimisticPath(null), 900);
  }

  return (
    <nav className="hidden items-center gap-1 overflow-x-auto md:flex">
      {items.map((item) => {
        const active = isNavItemActive(activePath, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground",
              active ? "bg-primary-soft text-primary" : ""
            )}
            onClick={() => markOptimistic(item.href)}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
