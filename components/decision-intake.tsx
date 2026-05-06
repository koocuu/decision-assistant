"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createDecision, DecisionForm, type DecisionDraft } from "@/components/decision-form";
import { decisionCategories, decisionEmotions } from "@/lib/decision-constants";

const emptyDraft: DecisionDraft = {
  title: "",
  category: "",
  background: "",
  options: [
    { label: "", description: "" },
    { label: "", description: "" }
  ],
  concern: "",
  fear: "",
  emotions: []
};

function normalizeDraft(value: Partial<DecisionDraft>): DecisionDraft {
  return {
    title: value.title || "",
    category:
      value.category && (decisionCategories as readonly string[]).includes(value.category)
        ? value.category
        : "其他",
    background: value.background || "",
    options:
      value.options?.filter((option) => option.label?.trim()).slice(0, 4) ?? emptyDraft.options,
    concern: value.concern || "",
    fear: value.fear || "",
    emotions:
      value.emotions?.filter((emotion) => (decisionEmotions as readonly string[]).includes(emotion)).slice(0, 4) ?? []
  };
}

export function DecisionIntake() {
  const [rawText, setRawText] = useState("");
  const [draft, setDraft] = useState<DecisionDraft | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDraftEditor, setShowDraftEditor] = useState(false);
  const [error, setError] = useState("");

  async function parseDecision() {
    if (!rawText.trim()) {
      setError("先写下你正在纠结的事。");
      return;
    }

    setIsParsing(true);
    setError("");

    try {
      const response = await fetch("/api/ai/parse-decision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ rawText })
      });
      const data = (await response.json()) as Partial<DecisionDraft> & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "整理失败，可以重试，或者使用手动填写模式。");
      }

      setDraft(normalizeDraft(data));
      setShowAdvanced(false);
      setShowDraftEditor(false);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "整理失败，可以重试，或者使用手动填写模式。");
    } finally {
      setIsParsing(false);
    }
  }

  async function confirmDraft() {
    if (!draft) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const id = await createDecision(draft);
      window.location.assign(`/decisions/${id}`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "创建决策失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>你现在在纠结什么？</CardTitle>
          <CardDescription>随便写，不用整理。AI 会先帮你拆成一个决策草稿。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            className="min-h-56 w-full rounded-md border bg-background px-4 py-3 text-base leading-7 outline-none focus:ring-2 focus:ring-ring"
            placeholder={`随便写，不用整理。比如：\n我在纠结要不要每天训练小太阳定点排便。我有点洁癖，怕它到处拉屎，但又怕训练太麻烦，最后变成讨厌宠物。`}
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
          />
          {error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button disabled={isParsing} type="button" onClick={parseDecision}>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {isParsing ? "正在帮你整理纠结..." : "AI 帮我整理"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowAdvanced((current) => !current)}>
              {showAdvanced ? "收起高级模式" : "手动填写 / 高级模式"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {draft ? (
        <Card>
          <CardHeader>
            <CardTitle>决策草稿</CardTitle>
            <CardDescription>AI 已帮你整理成下面这个决策草稿，你可以直接确认，也可以展开修改。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">标题</p>
                <p className="mt-1 font-medium">{draft.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">分类</p>
                <p className="mt-1 font-medium">{draft.category}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">选项</p>
              <div className="mt-2 grid gap-2">
                {draft.options.map((option, index) => (
                  <div key={`${option.label}-${index}`} className="rounded-md border p-3">
                    <p className="text-sm font-medium">{option.label}</p>
                    {option.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">最纠结的点</p>
                <p className="mt-1 text-sm leading-6">{draft.concern || "未提取到明确纠结点"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">最害怕的结果</p>
                <p className="mt-1 text-sm leading-6">{draft.fear || "未提取到明确担忧"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">当前情绪</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {draft.emotions.length ? (
                  draft.emotions.map((emotion) => (
                    <span key={emotion} className="rounded-md border bg-accent px-2.5 py-1 text-sm">
                      {emotion}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">未提取到明确情绪</span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button disabled={isSubmitting} type="button" onClick={confirmDraft}>
                {isSubmitting ? "正在创建..." : "确认并生成分析"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowDraftEditor((current) => !current)}>
                {showDraftEditor ? (
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                )}
                编辑详细信息
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {showDraftEditor && draft ? <DecisionForm initialDraft={draft} submitLabel="确认并生成分析" /> : null}
      {showAdvanced && !draft ? <DecisionForm /> : null}
    </div>
  );
}
