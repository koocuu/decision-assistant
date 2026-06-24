/**
 * P0 账号体系的 API 契约 —— 单一事实来源（M0）。
 * Web/服务端直接 import；移动端（独立 package）按本文件「镜像」一份（见 P0-PLAN.md）。
 */

/** 匿名身份请求头：App 每次请求带上；Web 用 cookie 兜底。 */
export const ANON_HEADER = "x-anon-id";
export const ANON_COOKIE = "anon_id";

/** 调用方身份：登录用户 或 匿名设备。 */
export type Identity =
  | { kind: "user"; userId: string }
  | { kind: "anon"; anonId: string };

/** AI 生成的速率限制（防刷 + DeepSeek 成本熔断）。 */
export const RATE_LIMITS = {
  /** 匿名每设备每日生成次数 */
  anonPerDay: 8,
  /** 登录用户每日生成次数 */
  userPerDay: 40,
  /** 全局每日生成上限（成本熔断） */
  globalPerDay: 2000,
  /** 同一 IP 每日上限（防匿名 token 刷量） */
  ipPerDay: 30
} as const;

/** 鉴权端点 */
export const AUTH_ROUTES = {
  register: "/api/account/register", // { email, password } -> { ok }
  login: "/api/account/login", // { email, password } -> { ok }
  logout: "/api/account/logout", // -> { ok }
  session: "/api/account/session", // -> SessionResponse
  claim: "/api/account/claim" // { anonId } (需登录) -> { claimed: number }
} as const;

export type SessionResponse =
  | { authenticated: true; user: { id: string; email: string } }
  | { authenticated: false };

export type AuthRequest = { email: string; password: string };
export type ClaimRequest = { anonId: string };
export type ClaimResponse = { claimed: number };

/** AI 端点：去掉 Basic Auth，改服务端代理 + 限流（按 Identity）。形状不变。 */
export const AI_ROUTES = {
  parseDecision: "/api/ai/parse-decision", // { rawText } -> DecisionDraft
  analyze: "/api/ai/analyze" // { decisionId } -> { aiAnalysis }
} as const;

/** 限流命中时的标准响应（429）。 */
export type RateLimitedResponse = {
  error: string;
  retryAfterSeconds: number;
  /** 匿名额度用完时为 true，前端可引导注册解锁更多。 */
  needsAccount?: boolean;
};
