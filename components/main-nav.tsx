"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavItemActive, type NavItem } from "@/lib/nav-active";
import { cn } from "@/lib/utils";

export function MainNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 overflow-x-auto md:flex">
      {items.map((item) => {
        const active = isNavItemActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground",
              active ? "bg-primary-soft text-primary" : ""
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
