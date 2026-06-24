"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { decisionCategories, decisionEmotions } from "@/lib/decision-constants";

type OptionInput = {
  label: string;
  description: string;
};

export type DecisionDraft = {
  title: string;
  category: string;
  background: string;
  options: OptionInput[];
  concern: string;
  fear: string;
  emotions: string[];
  deadline?: string;
};

type DecisionFormProps = {
  initialDraft?: DecisionDraft;
  redirectToAnalyze?: boolean;
  submitLabel?: string;
};

const emptyOptions: OptionInput[] = [
  { label: "", description: "" },
  { label: "", description: "" }
];

const inputClass =
  "h-12 rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:h-10 sm:rounded-md";

const textareaClass =
  "min-h-28 rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring sm:rounded-md";

export async function createDecision(draft: DecisionDraft) {
  const response = await fetch("/api/decisions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: draft.title,
      category: draft.category,
      background: draft.background,
      concern: draft.concern,
      fear: draft.fear,
      emotions: draft.emotions,
      deadline: draft.deadline || null,
      options: draft.options
        .map((option) => ({
          label: option.label.trim(),
          description: option.description.trim()
        }))
        .filter((option) => option.label.length > 0)
    })
  });

  const data = (await response.json()) as { id?: string; error?: string };

  if (!response.ok || !data.id) {
    throw new Error(data.error || "创建决策失败，请稍后再试。");
  }

  return data.id;
}

export function DecisionForm({ initialDraft, redirectToAnalyze = false, submitLabel = "保存决策" }: DecisionFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialDraft?.title ?? "");
  const [category, setCategory] = useState(initialDraft?.category ?? "");
  const [background, setBackground] = useState(initialDraft?.background ?? "");
  const [concern, setConcern] = useState(initialDraft?.concern ?? "");
  const [fear, setFear] = useState(initialDraft?.fear ?? "");
  const [deadline, setDeadline] = useState(initialDraft?.deadline ?? "");
  const [emotions, setEmotions] = useState<string[]>(initialDraft?.emotions ?? []);
  const [options, setOptions] = useState<OptionInput[]>(
    initialDraft?.options?.length ? initialDraft.options : emptyOptions
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validOptionCount = useMemo(
    () => options.filter((option) => option.label.trim().length > 0).length,
    [options]
  );

  const draft: DecisionDraft = {
    title,
    category,
    background,
    concern,
    fear,
    emotions,
    deadline,
    options
  };

  function updateOption(index: number, field: keyof OptionInput, value: string) {
    setOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? { ...option, [field]: value } : option
      )
    );
  }

  function addOption() {
    setOptions((current) => [...current, { label: "", description: "" }]);
  }

  function removeOption(index: number) {
    setOptions((current) =>
      current.length <= 2 ? current : current.filter((_, optionIndex) => optionIndex !== index)
    );
  }

  function toggleEmotion(emotion: string) {
    setEmotions((current) =>
      current.includes(emotion) ? current.filter((item) => item !== emotion) : [...current, emotion]
    );
  }

  function validate() {
    if (!title.trim()) {
      return "请填写标题。";
    }
    if (!category) {
      return "请选择分类。";
    }
    if (!background.trim()) {
      return "请填写背景描述。";
    }
    if (validOptionCount < 2) {
      return "请至少填写两个选项。";
    }
    return "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const id = await createDecision(draft);
      router.push(redirectToAnalyze ? `/decisions/${id}/analyzing` : `/decisions/${id}`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "创建决策失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader className="p-5 sm:p-6">
        <CardTitle>手动填写 / 高级模式</CardTitle>
        <CardDescription>需要精确记录时，可以展开这些结构化字段。</CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
        <form className="grid gap-6" onSubmit={handleSubmit}>
          {error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">标题 *</span>
              <input
                className={inputClass}
                placeholder="例如：是否接受新的工作机会"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">分类 *</span>
              <select
                className={inputClass}
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">请选择分类</option>
                {decisionCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium">背景描述 *</span>
            <textarea
              className={textareaClass}
              placeholder="这件事为什么重要？有什么限制、上下文或不可忽略的信息？"
              value={background}
              onChange={(event) => setBackground(event.target.value)}
            />
          </label>

          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">选项 *</span>
              <Button className="rounded-xl sm:rounded-md" type="button" variant="outline" size="sm" onClick={addOption}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                增加选项
              </Button>
            </div>

            <div className="grid gap-3">
              {options.map((option, index) => (
                <div key={index} className="grid gap-3 rounded-xl border p-4 md:grid-cols-[0.8fr_1fr_auto]">
                  <label className="grid gap-2">
                    <span className="text-sm text-muted-foreground">选项 {index + 1}</span>
                    <input
                      className={inputClass}
                      placeholder="例如：接受"
                      value={option.label}
                      onChange={(event) => updateOption(index, "label", event.target.value)}
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm text-muted-foreground">说明</span>
                    <input
                      className={inputClass}
                      placeholder="可选，补充这个选项意味着什么"
                      value={option.description}
                      onChange={(event) => updateOption(index, "description", event.target.value)}
                    />
                  </label>
                  <Button
                    aria-label={`删除选项 ${index + 1}`}
                    className="self-end"
                    disabled={options.length <= 2}
                    type="button"
                    variant="ghost"
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">最纠结的点</span>
              <textarea
                className={textareaClass}
                placeholder="真正卡住你的核心矛盾是什么？"
                value={concern}
                onChange={(event) => setConcern(event.target.value)}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">最害怕的结果</span>
              <textarea
                className={textareaClass}
                placeholder="如果选错，你最怕发生什么？"
                value={fear}
                onChange={(event) => setFear(event.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-3">
            <span className="text-sm font-medium">当前情绪</span>
            <div className="flex flex-wrap gap-2">
              {decisionEmotions.map((emotion) => (
                <label
                  key={emotion}
                  className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition hover:bg-accent sm:rounded-md"
                >
                  <input
                    checked={emotions.includes(emotion)}
                    className="h-4 w-4 accent-[var(--primary)]"
                    type="checkbox"
                    onChange={() => toggleEmotion(emotion)}
                  />
                  {emotion}
                </label>
              ))}
            </div>
          </div>

          <label className="grid max-w-sm gap-2">
            <span className="text-sm font-medium">截止日期</span>
            <input
              className={inputClass}
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
            />
          </label>

          <div className="grid gap-3 sm:flex sm:items-center">
            <Button className="h-12 rounded-xl sm:h-10 sm:rounded-md" disabled={isSubmitting} type="submit">
              {isSubmitting ? "提交中..." : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
