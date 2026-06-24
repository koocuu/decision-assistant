import type { AiDecisionAnalysis, DecisionDraft } from "../types/decision";

const fallbackBaseUrl = "https://decision.koocuu.com";

function apiUrl(path: string) {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || fallbackBaseUrl;
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

function headers() {
  return {
    "Content-Type": "application/json"
  };
}

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || `请求失败：${response.status}`);
  }
  return data;
}

export async function parseDecision(rawText: string) {
  const response = await fetch(apiUrl("/api/ai/parse-decision"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ rawText })
  });

  return readJson<DecisionDraft>(response);
}

export async function createDecision(draft: DecisionDraft) {
  const response = await fetch(apiUrl("/api/decisions"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      title: draft.title,
      category: draft.category,
      background: draft.background,
      concern: draft.concern,
      fear: draft.fear,
      emotions: draft.emotions,
      options: draft.options
    })
  });

  return readJson<{ id: string }>(response);
}

export async function analyzeDecision(decisionId: string) {
  const response = await fetch(apiUrl("/api/ai/analyze"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ decisionId })
  });

  return readJson<{ aiAnalysis: AiDecisionAnalysis }>(response);
}

export function getApiBaseUrl() {
  return process.env.EXPO_PUBLIC_API_BASE_URL || fallbackBaseUrl;
}

export function hasAiAuthConfigured() {
  return true;
}
