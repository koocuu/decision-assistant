import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { decisionCategories } from "@/lib/decision-constants";
import { decisionStatuses, decisionStatusLabels } from "@/lib/decision-status";
import type { DecisionStatus } from "@/lib/types";

type DecisionsPageProps = {
  searchParams?: Promise<{
    category?: string;
    status?: string;
  }>;
};

type DecisionWhere = {
  category?: string;
  status?: DecisionStatus;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function buildFilterHref(category?: string, status?: string) {
  const params = new URLSearchParams();

  if (category) {
    params.set("category", category);
  }

  if (status) {
    params.set("status", status);
  }

  const query = params.toString();
  return query ? `/decisions?${query}` : "/decisions";
}

export default async function DecisionsPage({ searchParams }: DecisionsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedCategory =
    resolvedSearchParams.category &&
    (decisionCategories as readonly string[]).includes(resolvedSearchParams.category)
      ? resolvedSearchParams.category
      : "";
  const selectedStatus =
    resolvedSearchParams.status && (decisionStatuses as readonly string[]).includes(resolvedSearchParams.status)
      ? (resolvedSearchParams.status as DecisionStatus)
      : "";
  const where: DecisionWhere = {};

  if (selectedCategory) {
    where.category = selectedCategory;
  }

  if (selectedStatus) {
    where.status = selectedStatus;
  }

  const decisions = await db.decision.findMany({
    where,
    include: {
      review: {
        select: {
          regretScore: true,
          reviewedAt: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return (
    <div>
      <PageHeader
        title="历史决策"
        description="查看已经记录的决策，按分类或状态快速筛选。"
        action={
          <Link
            href="/decisions/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            新建决策
          </Link>
        }
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>筛选</CardTitle>
          <CardDescription>筛选条件会保存在地址栏里，方便返回和分享。</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]" action="/decisions">
            <label className="grid gap-2">
              <span className="text-sm font-medium">分类</span>
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                defaultValue={selectedCategory}
                name="category"
              >
                <option value="">全部分类</option>
                {decisionCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">状态</span>
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                defaultValue={selectedStatus}
                name="status"
              >
                <option value="">全部状态</option>
                {decisionStatuses.map((status) => (
                  <option key={status} value={status}>
                    {decisionStatusLabels[status]}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="h-10 self-end rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              type="submit"
            >
              应用筛选
            </button>
            <Link
              className="inline-flex h-10 items-center justify-center self-end rounded-md border px-4 text-sm font-medium transition hover:bg-accent"
              href="/decisions"
            >
              清除
            </Link>
          </form>
        </CardContent>
      </Card>

      {decisions.length > 0 ? (
        <div className="grid gap-4">
          {decisions.map((decision) => (
            <Link key={decision.id} className="block" href={`/decisions/${decision.id}`}>
              <Card className="transition hover:border-primary/50 hover:shadow-md">
                <CardHeader>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <CardTitle>{decision.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {decision.category || "未分类"} · {formatDate(decision.createdAt)}
                      </CardDescription>
                    </div>
                    <span className="w-fit rounded-md border bg-accent px-2.5 py-1 text-sm text-accent-foreground">
                      {decisionStatusLabels[decision.status]}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">最终选择</p>
                      <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {decision.finalChoice || "尚未保存最终选择"}
                      </p>
                    </div>

                    {decision.review ? (
                      <div className="rounded-md border px-4 py-3 text-sm">
                        <p className="text-muted-foreground">后悔分</p>
                        <p className="mt-1 text-2xl font-semibold">{decision.review.regretScore}</p>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {selectedCategory || selectedStatus ? "当前筛选条件下没有决策。" : "还没有保存的决策。"}
            </p>
            <Link
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              href={buildFilterHref()}
            >
              查看全部
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
