import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "低后悔决策助手",
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
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="border-b bg-card/80">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-lg font-semibold text-primary">
                低后悔决策助手
              </Link>
              <nav className="flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
