import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Sheep } from "@/components/sheep";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { decisionCategories } from "@/lib/decision-constants";
import { decisionStatuses, decisionStatusLabels } from "@/lib/decision-status";
import { decisionOwnerWhere, resolveIdentity } from "@/lib/identity";
import type { DecisionStatus } from "@/lib/types";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 12;

type DecisionsPageProps = {
  searchParams?: Promise<{
    category?: string;
    page?: string;
    status?: string;
  }>;
};

type DecisionWhere = {
  category?: string;
  status?: DecisionStatus;
  userId?: string;
  anonId?: string;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function parsePage(value?: string) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function buildFilterHref(category?: string, status?: string, page?: number) {
  const params = new URLSearchParams();

  if (category) {
    params.set("category", category);
  }

  if (status) {
    params.set("status", status);
  }

  if (page && page > 1) {
    params.set("page", String(page));
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
  const currentPage = parsePage(resolvedSearchParams.page);
  const where: DecisionWhere = decisionOwnerWhere(await resolveIdentity()) as DecisionWhere;

  if (selectedCategory) {
    where.category = selectedCategory;
  }

  if (selectedStatus) {
    where.status = selectedStatus;
  }

  const [decisionCount, decisions] = await Promise.all([
    db.decision.count({ where }),
    db.decision.findMany({
      where,
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        category: true,
        status: true,
        finalChoice: true,
        createdAt: true,
        review: {
          select: {
            regretScore: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })
  ]);
  const totalPages = Math.max(1, Math.ceil(decisionCount / PAGE_SIZE));
  const firstItemNumber = decisionCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastItemNumber = Math.min(currentPage * PAGE_SIZE, decisionCount);

  return (
    <div>
      <PageHeader
        title="历史决策"
        description="查看已经记录的决策，按分类或状态快速筛选。"
        action={
          <Link
            href="/decisions/new"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 sm:h-10 sm:rounded-md"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            新建决策
          </Link>
        }
      />

      <Card className="mb-5 sm:mb-6">
        <CardHeader className="p-5 sm:p-6">
          <CardTitle>筛选</CardTitle>
          <CardDescription>筛选条件会保存在地址栏里，方便返回和分享。</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
          <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]" action="/decisions">
            <label className="grid gap-2">
              <span className="text-sm font-medium">分类</span>
              <select
                className="h-12 rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:h-10 sm:rounded-md"
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
                className="h-12 rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:h-10 sm:rounded-md"
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
              className="h-12 self-end rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 sm:h-10 sm:rounded-md"
              type="submit"
            >
              应用筛选
            </button>
            <Link
              className="inline-flex h-12 items-center justify-center self-end rounded-xl border px-4 text-sm font-medium transition hover:bg-accent sm:h-10 sm:rounded-md"
              href="/decisions"
            >
              清除
            </Link>
          </form>
        </CardContent>
      </Card>

      {decisions.length > 0 ? (
        <>
          <div className="grid gap-4">
            {decisions.map((decision) => (
              <Link key={decision.id} className="block" href={`/decisions/${decision.id}`}>
                <Card className="card-in transition hover:border-primary/50 hover:shadow-md">
                  <CardHeader className="p-5 sm:p-6">
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
                  <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
                    <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">最终选择</p>
                        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {decision.finalChoice || "尚未保存最终选择"}
                        </p>
                      </div>

                      {decision.review ? (
                        <div className="rounded-xl border px-4 py-3 text-sm sm:rounded-md">
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

          <nav
            className="mt-5 flex flex-col gap-3 rounded-2xl border bg-card p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
            aria-label="历史决策分页"
          >
            <span>
              第 {currentPage} / {totalPages} 页，显示 {firstItemNumber}-{lastItemNumber}，共 {decisionCount} 条
            </span>
            <div className="flex gap-2">
              <Link
                aria-disabled={currentPage <= 1}
                className={
                  currentPage <= 1
                    ? "pointer-events-none inline-flex h-10 items-center justify-center rounded-md border px-3 opacity-40"
                    : "inline-flex h-10 items-center justify-center rounded-md border px-3 transition hover:bg-accent"
                }
                href={buildFilterHref(selectedCategory, selectedStatus, currentPage - 1)}
              >
                上一页
              </Link>
              <Link
                aria-disabled={currentPage >= totalPages}
                className={
                  currentPage >= totalPages
                    ? "pointer-events-none inline-flex h-10 items-center justify-center rounded-md border px-3 opacity-40"
                    : "inline-flex h-10 items-center justify-center rounded-md border px-3 transition hover:bg-accent"
                }
                href={buildFilterHref(selectedCategory, selectedStatus, currentPage + 1)}
              >
                下一页
              </Link>
            </div>
          </nav>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div
              className="flex items-center justify-center rounded-3xl"
              style={{ width: 76, height: 76, background: "var(--warm-soft)" }}
            >
              <Sheep size={60} mood="happy" float />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {selectedCategory || selectedStatus ? "当前筛选条件下没有决策。" : "还没有保存的决策，写下第一个纠结吧。"}
            </p>
            <Link
              className="mt-4 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 sm:h-10 sm:rounded-md"
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
