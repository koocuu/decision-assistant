"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type ReviewFormProps = {
  decisionId: string;
};

export function reviewMessage(regretScore: number) {
  if (regretScore >= 4) {
    return "这次后悔分较高，后面我会把它作为一个需要避开的决策模式。";
  }

  if (regretScore <= 2) {
    return "这次后悔分较低，说明这个策略对你可能有效，后面可以继续参考。";
  }

  return "这次决策已经完成。下次遇到类似问题时，我会参考这次复盘，帮你更快收敛选择。";
}

export function ReviewForm({ decisionId }: ReviewFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [actualResult, setActualResult] = useState("");
  const [regretScore, setRegretScore] = useState("3");
  const [lesson, setLesson] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!actualResult.trim()) {
      setError("请简单写一下实际结果。");
      return;
    }

    if (!lesson.trim()) {
      setError("请写一句下次会怎么做。");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/decisions/${decisionId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          actualResult,
          regretScore: Number(regretScore),
          outcome: "as_expected",
          fearHappened: false,
          wouldChooseAgain: Number(regretScore) <= 3,
          lesson
        })
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "提交复盘失败，请稍后再试。");
      }

      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "提交复盘失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <Button className="w-full" type="button" onClick={() => setIsOpen(true)}>
        完成并复盘
      </Button>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="grid gap-2">
        <span className="text-sm font-medium">这次结果怎么样？ *</span>
        <textarea
          className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="简单说说实际发生了什么。"
          value={actualResult}
          onChange={(event) => setActualResult(event.target.value)}
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium">后悔程度：{regretScore}</span>
        <input
          max="5"
          min="1"
          type="range"
          value={regretScore}
          onChange={(event) => setRegretScore(event.target.value)}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 = 完全不后悔</span>
          <span>5 = 非常后悔</span>
        </div>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium">下次遇到类似问题，你会怎么做？ *</span>
        <textarea
          className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          placeholder="比如：下次先试 7 天，不要一开始就想做到完美。"
          value={lesson}
          onChange={(event) => setLesson(event.target.value)}
        />
      </label>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "提交中..." : "提交复盘"}
        </Button>
        <Button disabled={isSubmitting} type="button" variant="outline" onClick={() => setIsOpen(false)}>
          取消
        </Button>
      </div>
    </form>
  );
}
