import { getAnonId, getSessionToken, saveSessionToken, clearSessionToken } from "../storage/auth";
import type { AiDecisionAnalysis, DecisionDraft, DecisionReport, DecisionReview } from "../types/decision";

const fallbackBaseUrl = "https://decision.koocuu.com";

function apiUrl(path: string) {
  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || fallbackBaseUrl;
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

type PublicUser = {
  id: string;
  email: string;
};

type AuthResponse = {
  user: PublicUser | null;
  token?: string;
};

type ServerDecision = {
  id: string;
  title: string;
  category: string | null;
  background: string;
  concern: string | null;
  fear: string | null;
  emotions: string[];
  aiAnalysis: AiDecisionAnalysis | null;
  status: string;
  reviewDate: string | null;
  createdAt: string;
  options: Array<{
    id: string;
    label: string;
    description: string | null;
  }>;
  review?: {
    actualResult?: string | null;
    regretScore?: number | null;
    outcome?: string | null;
    lesson?: string | null;
    reviewedAt?: string | null;
  } | null;
};

async function headers() {
  const [anonId, token] = await Promise.all([getAnonId(), getSessionToken()]);
  const nextHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "x-anon-id": anonId
  };

  if (token) {
    nextHeaders.Authorization = `Bearer ${token}`;
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

async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: await headers()
  });

  return readJson<T>(response);
}

function scoreToRegretLevel(score?: number | null): DecisionReview["regretLevel"] {
  if (!score) return "unknown";
  if (score <= 1) return "none";
  if (score <= 3) return "slight";
  return "strong";
}

function regretLevelToScore(value: DecisionReview["regretLevel"]) {
  if (value === "none") return 1;
  if (value === "slight") return 3;
  if (value === "strong") return 5;
  return 3;
}

function mapDecision(decision: ServerDecision): DecisionReport | null {
  if (!decision.aiAnalysis) {
    return null;
  }

  const review: DecisionReview | undefined = decision.review
    ? {
        reviewedAt: decision.review.reviewedAt || new Date().toISOString(),
        finalChoice: "choose_other",
        regretLevel: scoreToRegretLevel(decision.review.regretScore),
        outcome:
          decision.review.outcome === "better_than_expected" ||
          decision.review.outcome === "as_expected" ||
          decision.review.outcome === "worse_than_expected"
            ? decision.review.outcome
            : "unknown",
        note: decision.review.lesson || decision.review.actualResult || undefined
      }
    : undefined;

  return {
    id: decision.id,
    title: decision.title,
    category: decision.category || "其他",
    rawText: decision.background,
    createdAt: decision.createdAt,
    draft: {
      title: decision.title,
      category: decision.category || "其他",
      background: decision.background,
      concern: decision.concern || "",
      fear: decision.fear || "",
      emotions: decision.emotions || [],
      options: decision.options.map((option) => ({
        label: option.label,
        description: option.description || ""
      }))
    },
    analysis: decision.aiAnalysis,
    review,
    reviewStatus: review || decision.status === "REVIEWED" ? "reviewed" : "pending",
    reviewDueAt: decision.reviewDate || undefined
  };
}

export async function login(email: string, password: string) {
  const data = await apiRequest<AuthResponse>("/api/account/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

  if (data.token) {
    await saveSessionToken(data.token);
  }

  return data.user;
}

export async function register(email: string, password: string) {
  const data = await apiRequest<AuthResponse>("/api/account/register", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

  if (data.token) {
    await saveSessionToken(data.token);
  }

  return data.user;
}

export async function logout() {
  await apiRequest<{ ok: true }>("/api/account/logout", {
    method: "POST"
  }).catch(() => null);
  await clearSessionToken();
}

export async function getSession() {
  const data = await apiRequest<{ user: PublicUser | null }>("/api/account/session");
  return data.user;
}

export async function listDecisionReports() {
  const data = await apiRequest<{ decisions: ServerDecision[] }>("/api/decisions");
  return data.decisions.map(mapDecision).filter((item): item is DecisionReport => Boolean(item));
}

export async function fetchDecisionReport(id: string) {
  const data = await apiRequest<{ decision: ServerDecision }>(`/api/decisions/${id}`);
  return mapDecision(data.decision);
}

export async function submitDecisionReview(decisionId: string, review: DecisionReview) {
  await apiRequest<{ review: unknown; warning?: string }>(`/api/decisions/${decisionId}/review`, {
    method: "POST",
    body: JSON.stringify({
      actualResult: review.note || "已完成移动端复盘",
      regretScore: regretLevelToScore(review.regretLevel),
      outcome: review.outcome === "unknown" ? "as_expected" : review.outcome,
      lesson: review.note
    })
  });
}

export async function parseDecision(rawText: string) {
  return apiRequest<DecisionDraft>("/api/ai/parse-decision", {
    method: "POST",
    body: JSON.stringify({ rawText })
  });
}

export async function createDecision(draft: DecisionDraft) {
  return apiRequest<{ id: string }>("/api/decisions", {
    method: "POST",
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
}

export async function analyzeDecision(decisionId: string) {
  return apiRequest<{ aiAnalysis: AiDecisionAnalysis }>("/api/ai/analyze", {
    method: "POST",
    body: JSON.stringify({ decisionId })
  });
}

export function getApiBaseUrl() {
  return process.env.EXPO_PUBLIC_API_BASE_URL || fallbackBaseUrl;
}

export function hasAiAuthConfigured() {
  return true;
}
