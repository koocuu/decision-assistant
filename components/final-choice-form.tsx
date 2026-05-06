"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type FinalChoiceFormProps = {
  decisionId: string;
  initialFinalChoice: string | null;
};

export function FinalChoiceForm({ decisionId, initialFinalChoice }: FinalChoiceFormProps) {
  const router = useRouter();
  const [finalChoice, setFinalChoice] = useState(initialFinalChoice ?? "");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!finalChoice.trim()) {
      setError("请填写最终选择。");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/decisions/${decisionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          finalChoice
        })
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "保存最终选择失败，请稍后再试。");
      }

      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "保存最终选择失败，请稍后再试。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <textarea
        className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        placeholder="写下你的最终选择，例如：选择 B，先试运行三个月。"
        value={finalChoice}
        onChange={(event) => setFinalChoice(event.target.value)}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button disabled={isSaving} type="submit">
        {isSaving ? "保存中..." : "保存最终选择"}
      </Button>
    </form>
  );
}
