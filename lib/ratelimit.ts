import { db } from "@/lib/db";
import type { Identity } from "@/lib/identity";

type LimitResult = {
  allowed: boolean;
  remaining: number;
  limit: number;
  reason?: string;
};

const anonymousDailyLimit = 8;
const userDailyLimit = 50;
const ipDailyLimit = 80;
const globalDailyLimit = 500;

function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function windowStart(date = new Date()) {
  return new Date(`${dayKey(date)}T00:00:00.000Z`);
}

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

async function increment(key: string) {
  const start = windowStart();
  const current = await db.rateLimit.findUnique({ where: { key } });

  if (!current || current.windowStart.getTime() !== start.getTime()) {
    return db.rateLimit.upsert({
      where: { key },
      create: { key, windowStart: start, count: 1 },
      update: { windowStart: start, count: 1 }
    });
  }

  return db.rateLimit.update({
    where: { key },
    data: {
      count: {
        increment: 1
      }
    }
  });
}

async function check(key: string, limit: number, reason: string): Promise<LimitResult> {
  const entry = await increment(key);
  const remaining = Math.max(0, limit - entry.count);
  return {
    allowed: entry.count <= limit,
    remaining,
    limit,
    reason: entry.count > limit ? reason : undefined
  };
}

export async function consumeAiQuota(identity: Identity, request: Request): Promise<LimitResult> {
  const today = dayKey();
  const identityKey =
    identity.kind === "user" ? `ai:user:${identity.userId}:${today}` : `ai:anon:${identity.anonId}:${today}`;
  const identityLimit = identity.kind === "user" ? userDailyLimit : anonymousDailyLimit;

  const checks = [
    await check(`ai:global:${today}`, globalDailyLimit, "今天全站 AI 额度已用完，请明天再试。"),
    await check(`ai:ip:${clientIp(request)}:${today}`, ipDailyLimit, "当前网络今天调用较多，请稍后再试。"),
    await check(
      identityKey,
      identityLimit,
      identity.kind === "user" ? "今天账号 AI 额度已用完，请明天再试。" : "匿名额度已用完，登录后可获得更多额度。"
    )
  ];

  return checks.find((item) => !item.allowed) ?? checks[checks.length - 1];
}
