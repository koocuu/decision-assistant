"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sheep } from "@/components/sheep";
import { Button } from "@/components/ui/button";

export function AnalyzeDecisionRunner({ decisionId }: { decisionId: string }) {
  const router = useRouter();
  const didStart = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (didStart.current) {
      return;
    }

    didStart.current = true;

    async function analyze() {
      try {
        const response = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ decisionId })
        });
        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(data.error || "分析失败，请稍后重试。");
        }

        router.replace(`/decisions/${decisionId}`);
        router.refresh();
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "分析失败，请稍后重试。");
      }
    }

    void analyze();
  }, [decisionId, router]);

  return (
    <div className="mx-auto flex min-h-[58vh] max-w-lg flex-col items-center justify-center text-center">
      <div className="relative flex h-32 w-32 items-center justify-center rounded-[2rem]" style={{ background: "var(--warm-soft)" }}>
        <div className="absolute inset-3 rounded-[1.5rem] border border-primary/20" />
        <div className="absolute h-28 w-28 animate-spin rounded-full border-2 border-transparent border-t-primary/70" />
        <Sheep size={84} float />
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-normal">小羊正在拆解你的纠结</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        先识别真正的问题，再比较选项的后悔成本，最后收敛成一个可执行的小动作。
      </p>
      {error ? (
        <div className="mt-6 w-full rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-left text-sm text-destructive">
          <p>{error}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button className="h-11 rounded-xl" type="button" onClick={() => window.location.reload()}>
              重试分析
            </Button>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium text-foreground transition hover:bg-accent"
              href={`/decisions/${decisionId}`}
            >
              回到详情
            </Link>
          </div>
        </div>
      ) : (
        <p className="mt-5 text-xs font-medium text-primary">生成中，请稍等...</p>
      )}
    </div>
  );
}
