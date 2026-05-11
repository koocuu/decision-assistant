import Link from "next/link";
import { ArrowRight, ClipboardList, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { decisionStatusLabels } from "@/lib/decision-status";

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
  const [totalDecisions, reviewedDecisions, pendingReviews, regretAggregate, recentDecisions, profile] =
    await Promise.all([
      db.decision.count(),
      db.decision.count({
        where: {
          status: "REVIEWED"
        }
      }),
      db.decision.count({
        where: {
          aiAnalysis: {
            not: null
          },
          review: null
        }
      }),
      db.decisionReview.aggregate({
        _avg: {
          regretScore: true
        }
      }),
      db.decision.findMany({
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
        orderBy: {
          updatedAt: "desc"
        }
      })
    ]);

  const pendingReviewList = await db.decision.findMany({
    where: {
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
    <div className="space-y-8">
      <section className="rounded-lg border bg-card p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-primary">V0.1 本地决策记录与复盘</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal">低后悔决策助手</h1>
            <p className="mt-4 text-muted-foreground">
              不是替你做选择，而是帮你少内耗、少后悔、越来越懂自己的决策模式。
            </p>
          </div>
          <Link
            href="/decisions/new"
            className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            整理一次纠结
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="p-5">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
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
          <CardContent>
            {recentDecisions.length > 0 ? (
              <div className="divide-y">
                {recentDecisions.map((decision) => (
                  <Link
                    key={decision.id}
                    href={`/decisions/${decision.id}`}
                    className="grid gap-2 py-4 first:pt-0 last:pb-0 md:grid-cols-[1fr_auto] md:items-center"
                  >
                    <div>
                      <p className="font-medium">{decision.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {decision.category || "未分类"} · {formatDate(decision.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
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
              <div className="rounded-md border border-dashed p-8 text-center">
                <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
                <p className="mt-3 text-sm text-muted-foreground">还没有记录决策。</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>用户画像摘要</CardTitle>
              <CardDescription>来自复盘后的画像更新。</CardDescription>
            </CardHeader>
            <CardContent>
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
            <CardHeader>
              <CardTitle>待复盘提醒</CardTitle>
              <CardDescription>已经生成建议，但还没有完成复盘。</CardDescription>
            </CardHeader>
            <CardContent>
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
