import Link from "next/link";
import { ArrowRight, Layers3, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheep } from "@/components/sheep";
import { db } from "@/lib/db";
import { decisionStatusLabels } from "@/lib/decision-status";
import { decisionOwnerWhere, profileOwnerWhere, resolveIdentity } from "@/lib/identity";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function formatAverage(value: number | null) {
  return typeof value === "number" ? value.toFixed(1) : "-";
}

export default async function HomePage() {
  const identity = await resolveIdentity();
  const decisionWhere = decisionOwnerWhere(identity);
  const profileWhere = profileOwnerWhere(identity);
  const [totalDecisions, reviewedDecisions, pendingReviews, regretAggregate, recentDecisions, profile] =
    await Promise.all([
      db.decision.count({
        where: decisionWhere
      }),
      db.decision.count({
        where: {
          ...decisionWhere,
          status: "REVIEWED"
        }
      }),
      db.decision.count({
        where: {
          ...decisionWhere,
          aiAnalysis: {
            not: null
          },
          review: null
        }
      }),
      db.decisionReview.aggregate({
        where: identity.kind === "user" ? { userId: identity.userId } : { anonId: identity.anonId },
        _avg: {
          regretScore: true
        }
      }),
      db.decision.findMany({
        where: decisionWhere,
        take: 5,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          review: {
            select: {
              regretScore: true
            }
          }
        }
      }),
      db.userProfile.findFirst({
        where: profileWhere,
        orderBy: {
          updatedAt: "desc"
        }
      })
    ]);

  const pendingReviewList = await db.decision.findMany({
    where: {
      ...decisionWhere,
      aiAnalysis: {
        not: null
      },
      review: null
    },
    take: 5,
    orderBy: {
      updatedAt: "desc"
    }
  });

  const stats = [
    { label: "总决策数", value: String(totalDecisions) },
    { label: "已复盘数", value: String(reviewedDecisions) },
    { label: "平均后悔分", value: formatAverage(regretAggregate._avg.regretScore) },
    { label: "待复盘数", value: String(pendingReviews) }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-[0_1px_2px_rgba(11,14,20,0.03),0_8px_24px_-12px_rgba(11,14,20,0.08)] sm:p-8">
        <span className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden="true" />
        <div className="flex items-center justify-between gap-4 sm:gap-6">
          <div className="min-w-0 flex-1 sm:max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              低后悔决策 · 个人决策控制台
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-normal sm:text-4xl">
              今天有什么纠结，说给我听？
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:mt-4 sm:text-base">
              不是替你做选择，而是帮你少内耗、少后悔。现在也可以添加到主屏，像 App 一样打开。
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/decisions/new"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98] sm:h-11 sm:w-fit"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                整理一次纠结
              </Link>
              <Link
                href="/decisions"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border bg-card px-5 text-sm font-medium transition hover:bg-accent active:scale-[0.98] sm:h-11 sm:w-fit"
              >
                <Layers3 className="h-4 w-4" aria-hidden="true" />
                查看记录
              </Link>
            </div>
          </div>
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl sm:h-[108px] sm:w-[108px]"
            style={{ background: "var(--warm-soft)" }}
          >
            <Sheep size={68} float className="sm:hidden" />
            <Sheep size={84} float className="hidden sm:block" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className={stat.label === "平均后悔分" ? "hidden sm:block" : ""}>
            <div className="flex min-h-24 flex-col justify-center gap-2 p-4 sm:p-5">
              <span className="text-[11px] font-medium tracking-wide text-muted-foreground sm:text-xs">
                {stat.label}
              </span>
              <span className="tabular text-2xl font-semibold tracking-normal sm:text-3xl">{stat.value}</span>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_360px] lg:gap-6">
        <Card>
          <CardHeader className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>最近 5 条决策</CardTitle>
                <CardDescription>最新记录的决策和当前状态。</CardDescription>
              </div>
              <Link
                href="/decisions"
                className="inline-flex items-center gap-1 text-sm text-primary transition hover:underline"
              >
                全部
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
            {recentDecisions.length > 0 ? (
              <div className="divide-y">
                {recentDecisions.map((decision) => (
                  <Link
                    key={decision.id}
                    href={`/decisions/${decision.id}`}
                    className="grid gap-3 py-4 first:pt-0 last:pb-0 md:grid-cols-[1fr_auto] md:items-center"
                  >
                    <div>
                      <p className="font-medium">{decision.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {decision.category || "未分类"} · {formatDate(decision.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {decision.review ? (
                        <span className="rounded-md border px-2 py-1 text-sm">
                          后悔分 {decision.review.regretScore}
                        </span>
                      ) : null}
                      <span className="rounded-md bg-accent px-2 py-1 text-sm text-accent-foreground">
                        {decisionStatusLabels[decision.status]}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center rounded-xl border border-dashed p-8 text-center">
                <div
                  className="flex items-center justify-center rounded-3xl"
                  style={{ width: 76, height: 76, background: "var(--warm-soft)" }}
                >
                  <Sheep size={60} />
                </div>
                <p className="mt-3 text-sm font-medium">还没有决策记录</p>
                <p className="mt-1 text-sm text-muted-foreground">写下第一个纠结，小羊帮你理</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="p-5 sm:p-6">
              <CardTitle>用户画像摘要</CardTitle>
              <CardDescription>来自复盘后的画像更新。</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
              <p className="text-sm leading-6 text-muted-foreground">
                {profile?.summary?.trim() || "完成几次决策复盘后，这里会出现你的决策模式摘要。"}
              </p>
              <Link
                href="/profile"
                className="mt-4 inline-flex items-center gap-1 text-sm text-primary transition hover:underline"
              >
                查看画像
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-5 sm:p-6">
              <CardTitle>待复盘提醒</CardTitle>
              <CardDescription>已经生成建议，但还没有完成复盘。</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
              {pendingReviewList.length > 0 ? (
                <div className="space-y-3">
                  {pendingReviewList.map((decision) => (
                    <Link
                      key={decision.id}
                      href={`/decisions/${decision.id}`}
                      className="block rounded-md border p-3 transition hover:border-primary/50"
                    >
                      <p className="text-sm font-medium">{decision.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {decision.category || "未分类"} · 更新于 {formatDate(decision.updatedAt)}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">当前没有待复盘决策。</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
