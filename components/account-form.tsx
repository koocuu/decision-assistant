"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AccountMode = "login" | "register";

export function AccountForm({ mode }: { mode: AccountMode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(isRegister ? "/api/account/register" : "/api/account/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "操作失败，请稍后再试。");
      }

      router.push("/");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "操作失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>{isRegister ? "创建账号" : "登录账号"}</CardTitle>
        <CardDescription>
          {isRegister ? "匿名生成的记录会自动认领到这个账号。" : "登录后只查看属于你的决策记录。"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={submit}>
          {error ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}
          <label className="grid gap-2">
            <span className="text-sm font-medium">邮箱</span>
            <input
              autoComplete="email"
              className="h-12 rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium">密码</span>
            <input
              autoComplete={isRegister ? "new-password" : "current-password"}
              className="h-12 rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              minLength={8}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <Button className="h-12 rounded-xl" disabled={isSubmitting} type="submit">
            {isSubmitting ? "处理中..." : isRegister ? "注册并登录" : "登录"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
