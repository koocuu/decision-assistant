"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers3, PlusCircle, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

const icons = {
  "/": Home,
  "/decisions": Layers3,
  "/decisions/new": PlusCircle,
  "/profile": UserRound
};

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileTabNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/96 px-2 pb-[calc(env(safe-area-inset-bottom)+6px)] pt-1.5 shadow-[0_-8px_24px_-18px_rgba(11,14,20,0.25)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {items.map((item) => {
          const Icon = icons[item.href as keyof typeof icons] ?? Home;
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium text-muted-foreground transition",
                active ? "bg-primary-soft text-primary" : "active:bg-muted"
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.href === "/decisions/new" ? "整理" : item.label.replace("历史决策", "记录").replace("用户画像", "我的")}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
