import type { Metadata } from "next";
import Link from "next/link";
import { Sheep } from "@/components/sheep";
import "./globals.css";

export const metadata: Metadata = {
  title: "决策助手 · Decision Assistant",
  description: "不是替你做选择，而是帮你把纠结收敛成一个低后悔行动。"
};

const navItems = [
  { href: "/", label: "首页" },
  { href: "/decisions", label: "历史决策" },
  { href: "/decisions/new", label: "整理纠结" },
  { href: "/profile", label: "用户画像" }
];

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen">
          <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
              <Link href="/" className="flex items-center gap-2">
                <span
                  className="flex items-center justify-center rounded-xl"
                  style={{ width: 34, height: 34, background: "var(--warm-soft)" }}
                >
                  <Sheep size={26} />
                </span>
                <span className="text-base font-semibold tracking-tight">决策助手</span>
              </Link>
              <nav className="flex items-center gap-0.5 overflow-x-auto">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="whitespace-nowrap rounded-md px-2.5 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground sm:px-3"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
