import type { AiDecisionAnalysis, DecisionDraft } from "../types/decision";
import { loadAiAuth } from "../storage/auth";

const fallbackBaseUrl = "https://decision.koocuu.com";

function utf8Bytes(input: string) {
  const encoded = encodeURIComponent(input);
  const bytes: number[] = [];

  for (let index = 0; index < encoded.length; index += 1) {
    const char = encoded[index];

    if (char === "%") {
      bytes.push(Number.parseInt(encoded.slice(index + 1, index + 3), 16));
      index += 2;
    } else {
      bytes.push(char.charCodeAt(0));
    }
  }

  return bytes;
}

function base64(input: string) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  let index = 0;
  const bytes = utf8Bytes(input);

  while (index < bytes.length) {
    const chr1 = bytes[index++];
    const chr2 = bytes[index++];
    const chr3 = bytes[index++];
    const enc1 = chr1 >> 2;
    const enc2 = ((chr1 & 3) << 4) | ((chr2 ?? 0) >> 4);
    const enc3 = chr2 === undefined ? 64 : ((chr2 & 15) << 2) | ((chr3 ?? 0) >> 6);
    const enc4 = chr3 === undefined ? 64 : chr3 & 63;

    output +=
      chars.charAt(enc1) +
      chars.charAt(enc2) +
      (enc3 === 64 ? "=" : chars.charAt(enc3)) +
      (enc4 === 64 ? "=" : chars.charAt(enc4));
  }

  return output;
}

function apiUrl(path: string) {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || fallbackBaseUrl;
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

async function headers(isAi = false) {
  const nextHeaders: Record<string, string> = {
    "Content-Type": "application/json"
  };

  const auth = isAi ? await loadAiAuth() : null;
  if (isAi && !auth) {
    throw new Error("请先在设置页保存 AI 访问用户名和密码。");
  }

  if (auth) {
    nextHeaders.Authorization = `Basic ${base64(`${auth.username}:${auth.password}`)}`;
  }

  return nextHeaders;
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
    headers: await headers(true),
    body: JSON.stringify({ rawText })
  });

  return readJson<DecisionDraft>(response);
}

export async function createDecision(draft: DecisionDraft) {
  const response = await fetch(apiUrl("/api/decisions"), {
    method: "POST",
    headers: await headers(),
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
    headers: await headers(true),
    body: JSON.stringify({ decisionId })
  });

  return readJson<{ aiAnalysis: AiDecisionAnalysis }>(response);
}

export function getApiBaseUrl() {
  return process.env.EXPO_PUBLIC_API_BASE_URL || fallbackBaseUrl;
}

export function hasAiAuthConfigured() {
  return Boolean(process.env.EXPO_PUBLIC_AI_AUTH);
}
