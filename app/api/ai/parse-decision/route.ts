import { NextResponse } from "next/server";
import { extractJsonText } from "@/lib/ai-analysis";
import { callDeepSeek } from "@/lib/deepseek";
import { decisionCategories, decisionEmotions } from "@/lib/decision-constants";
import { resolveIdentityFromRequest } from "@/lib/identity";
import { buildParseDecisionMessages } from "@/lib/prompts";
import { consumeAiQuota } from "@/lib/ratelimit";

type ParsePayload = {
  rawText?: unknown;
};

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function parseDraft(content: string) {
  const parsed = JSON.parse(extractJsonText(content)) as Record<string, unknown>;
  const rawOptions = Array.isArray(parsed.options) ? parsed.options : [];
  const category = asString(parsed.category);

  return {
    title: asString(parsed.title),
    category: (decisionCategories as readonly string[]).includes(category) ? category : "其他",
    background: asString(parsed.background),
    options: rawOptions
      .map((item) => {
        const option = item as Record<string, unknown>;
        return {
          label: asString(option.label),
          description: asString(option.description)
        };
      })
      .filter((option) => option.label.length > 0)
      .slice(0, 4),
    concern: asString(parsed.concern),
    fear: asString(parsed.fear),
    emotions: stringArray(parsed.emotions)
      .filter((emotion) => (decisionEmotions as readonly string[]).includes(emotion))
      .slice(0, 4)
  };
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ParsePayload;
    const rawText = asString(payload.rawText);

    if (!rawText) {
      return NextResponse.json({ error: "请先写下你正在纠结的事。" }, { status: 400 });
    }

    const quota = await consumeAiQuota(await resolveIdentityFromRequest(request), request);
    if (!quota.allowed) {
      return NextResponse.json({ error: quota.reason }, { status: 429 });
    }

    const rawDraft = await callDeepSeek(buildParseDecisionMessages(rawText));
    const draft = parseDraft(rawDraft);

    if (!draft.title || !draft.background || draft.options.length < 2) {
      return NextResponse.json({ error: "整理失败，可以重试，或者使用手动填写模式。" }, { status: 422 });
    }

    return NextResponse.json(draft);
  } catch (error) {
    console.error("Failed to parse decision", error);
    return NextResponse.json({ error: "整理失败，可以重试，或者使用手动填写模式。" }, { status: 500 });
  }
}
