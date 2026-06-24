"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type User = {
  id: string;
  email: string;
};

export function AccountPanel({ initialUser }: { initialUser: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function logout() {
    setIsLoggingOut(true);
    await fetch("/api/account/logout", { method: "POST" });
    setUser(null);
    window.location.assign("/profile");
  }

  if (user) {
    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">当前账号</p>
          <p className="mt-1 break-all text-base font-medium">{user.email}</p>
        </div>
        <Button className="h-11 rounded-xl sm:h-10 sm:rounded-md" disabled={isLoggingOut} onClick={logout} type="button">
          {isLoggingOut ? "退出中..." : "退出登录"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-muted-foreground">当前账号</p>
        <p className="mt-1 text-base font-medium">匿名</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Link
          className="inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition hover:bg-accent sm:h-10 sm:rounded-md"
          href="/login"
        >
          登录
        </Link>
        <Link
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 sm:h-10 sm:rounded-md"
          href="/register"
        >
          注册
        </Link>
      </div>
    </div>
  );
}
