"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type AnalyzeDecisionButtonProps = {
  decisionId: string;
};

export function AnalyzeDecisionButton({ decisionId }: AnalyzeDecisionButtonProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function analyzeDecision() {
    setIsAnalyzing(true);
    setError("");

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

      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "分析失败，请稍后重试。");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button className="w-full" disabled={isAnalyzing} onClick={analyzeDecision} type="button">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        {isAnalyzing ? "正在收敛你的决策..." : "生成低后悔建议"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
