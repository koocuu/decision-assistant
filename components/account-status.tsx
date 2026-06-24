"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type User = {
  id: string;
  email: string;
};

export function AccountStatus() {
  const [user, setUser] = useState<User | null>(null);

  const refreshSession = useCallback(() => {
    fetch("/api/account/session")
      .then((response) => response.json())
      .then((data: { user?: User | null }) => setUser(data.user ?? null))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    refreshSession();

    function handleSessionChange(event: Event) {
      const nextUser = (event as CustomEvent<{ user?: User | null }>).detail?.user;
      if (nextUser !== undefined) {
        setUser(nextUser);
        return;
      }

      refreshSession();
    }

    window.addEventListener("decision-account-session-change", handleSessionChange);
    window.addEventListener("focus", refreshSession);

    return () => {
      window.removeEventListener("decision-account-session-change", handleSessionChange);
      window.removeEventListener("focus", refreshSession);
    };
  }, [refreshSession]);

  async function logout() {
    await fetch("/api/account/logout", { method: "POST" });
    setUser(null);
    window.dispatchEvent(new CustomEvent("decision-account-session-change", { detail: { user: null } }));
    window.location.assign("/");
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="hidden max-w-44 truncate sm:inline">{user.email}</span>
        <span className="sm:hidden">已登录</span>
        <button className="rounded-md px-2 py-1 text-primary transition hover:bg-accent" type="button" onClick={logout}>
          退出
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link className="rounded-md px-2.5 py-2 text-sm text-muted-foreground transition hover:bg-accent" href="/login">
        登录
      </Link>
      <Link className="hidden rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground sm:inline-flex" href="/register">
        注册
      </Link>
    </div>
  );
}
