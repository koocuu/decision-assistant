import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AnalyzeDecisionButton } from "@/components/analyze-decision-button";
import { FinalChoiceForm } from "@/components/final-choice-form";
import { PageHeader } from "@/components/page-header";
import { ReviewForm, reviewMessage } from "@/components/review-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseStoredAiAnalysis } from "@/lib/ai-analysis";
import { db } from "@/lib/db";
import { decisionStatusLabels } from "@/lib/decision-status";

export const dynamic = "force-dynamic";

function formatDate(date: Date | null) {
  if (!date) {
    return "未设置";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function parseStringArray(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function Badge({ label, value }: { label: string; value?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border bg-background px-2.5 py-1 text-sm">
      <span className="text-muted-foreground">{label}：</span>
      <span className="font-medium">{value || "未判断"}</span>
    </span>
  );
}

export default async function DecisionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decision = await db.decision.findUnique({
    where: { id },
    include: {
      options: true,
      review: true
    }
  });

  if (!decision) {
    notFound();
  }

  const emotions = parseStringArray(decision.emotions);
  const aiAnalysis = parseStoredAiAnalysis(decision.aiAnalysis);
  const canReview = Boolean(aiAnalysis) && decision.status !== "REVIEWED" && !decision.review;
  const recommendedOption = aiAnalysis?.recommendedOptionId
    ? decision.options.find((option) => option.id === aiAnalysis.recommendedOptionId)
    : null;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/decisions"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          返回历史决策
        </Link>
      </div>

      <PageHeader title={decision.title} description="把一次纠结收敛成一个低后悔行动。" />

      <section className="mb-6 grid gap-3 md:grid-cols-4">
        <Card>
          <CardHeader className="p-4">
            <CardDescription>分类</CardDescription>
            <CardTitle className="text-base">{decision.category || "未分类"}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardDescription>创建时间</CardDescription>
            <CardTitle className="text-base">{formatDate(decision.createdAt)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardDescription>状态</CardDescription>
            <CardTitle className="text-base">{decisionStatusLabels[decision.status]}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <CardDescription>截止日期</CardDescription>
            <CardTitle className="text-base">{formatDate(decision.deadline)}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <main className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>决策草稿</CardTitle>
              <CardDescription>由你的输入整理出的背景、选项和情绪。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <section>
                <h3 className="text-sm font-medium">背景描述</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {decision.background}
                </p>
              </section>

              <section>
                <h3 className="text-sm font-medium">互斥选项</h3>
                <div className="mt-3 grid gap-3">
                  {decision.options.map((option, index) => (
                    <div key={option.id} className="rounded-md border p-4">
                      <p className="text-sm font-medium">
                        {index + 1}. {option.label}
                      </p>
                      {option.description ? (
                        <p className="mt-2 text-sm text-muted-foreground">{option.description}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid gap-4 md:grid-cols-2">
                {decision.concern ? (
                  <section>
                    <h3 className="text-sm font-medium">最纠结的点</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {decision.concern}
                    </p>
                  </section>
                ) : null}

                {decision.fear ? (
                  <section>
                    <h3 className="text-sm font-medium">最害怕的结果</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {decision.fear}
                    </p>
                  </section>
                ) : null}
              </div>

              <section>
                <h3 className="text-sm font-medium">当前情绪</h3>
                {emotions.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {emotions.map((emotion) => (
                      <span key={emotion} className="rounded-md border bg-accent px-2.5 py-1 text-sm">
                        {emotion}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">未记录情绪。</p>
                )}
              </section>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>低后悔建议</CardTitle>
              <CardDescription>先看结论，详细分析默认收起。</CardDescription>
            </CardHeader>
            <CardContent>
              {aiAnalysis ? (
                <div className="space-y-6">
                  <section className="rounded-lg border border-primary/40 bg-accent p-5">
                    <p className="text-sm font-medium text-primary">推荐选择</p>
                    <h3 className="mt-2 text-2xl font-semibold">
                      {aiAnalysis.recommendationTitle ||
                        recommendedOption?.label ||
                        aiAnalysis.recommendation ||
                        "先做一个低成本试验"}
                    </h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge label="推荐强度" value={aiAnalysis.recommendationStrength} />
                      <Badge label="可逆性" value={aiAnalysis.reversibilityLevel} />
                      <Badge label="后悔风险" value={aiAnalysis.regretRiskLevel} />
                      <Badge label="建议策略" value={aiAnalysis.strategyTag} />
                    </div>
                    <div className="mt-5 grid gap-4">
                      <div>
                        <p className="text-sm font-medium">一句话原因</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {aiAnalysis.oneSentenceReason || aiAnalysis.realProblem || aiAnalysis.summary}
                        </p>
                      </div>
                      <div className="rounded-md border bg-background p-4">
                        <p className="text-sm font-medium">低后悔行动</p>
                        <p className="mt-1 text-base leading-7">{aiAnalysis.lowRegretAction || "先做最小一步验证。"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">复盘时间</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {aiAnalysis.reviewTime || aiAnalysis.reviewSuggestion || "7 天后"}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-md border p-4">
                      <h3 className="text-sm font-medium">真实问题</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{aiAnalysis.realProblem || "未判断"}</p>
                    </div>
                    <div className="rounded-md border p-4">
                      <h3 className="text-sm font-medium">情绪干扰</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {aiAnalysis.emotionalFactors.length
                          ? aiAnalysis.emotionalFactors.slice(0, 3).join("、")
                          : "未判断"}
                      </p>
                    </div>
                    <div className="rounded-md border p-4">
                      <h3 className="text-sm font-medium">可逆性判断</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{aiAnalysis.reversibility || "未判断"}</p>
                    </div>
                  </section>

                  <details className="rounded-md border p-4">
                    <summary className="cursor-pointer text-sm font-medium">展开详细分析</summary>
                    <div className="mt-4 space-y-3">
                      {aiAnalysis.optionAnalysis.map((item) => {
                        const option = decision.options.find((current) => current.id === item.optionId);

                        return (
                          <div key={item.optionId || option?.id} className="rounded-md border p-4">
                            <p className="text-sm font-medium">{option?.label || item.optionId || "未知选项"}</p>
                            <p className="mt-3 text-sm text-muted-foreground">后悔成本：{item.regretCost || "未判断"}</p>
                            <div className="mt-3 grid gap-4 md:grid-cols-2">
                              <div>
                                <p className="text-sm font-medium">优点</p>
                                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                                  {(item.pros.length ? item.pros : ["未判断"]).map((pro) => (
                                    <li key={pro}>{pro}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="text-sm font-medium">缺点</p>
                                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                                  {(item.cons.length ? item.cons : ["未判断"]).map((con) => (
                                    <li key={con}>{con}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">还没有生成低后悔建议。</p>
                  <AnalyzeDecisionButton decisionId={decision.id} />
                </div>
              )}
            </CardContent>
          </Card>

          {decision.review ? (
            <Card>
              <CardHeader>
                <CardTitle>复盘完成</CardTitle>
                <CardDescription>复盘时间：{formatDate(decision.review.reviewedAt)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-md border bg-accent p-4 text-sm leading-6">
                  {reviewMessage(decision.review.regretScore)}
                </div>
                <section>
                  <h3 className="text-sm font-medium">实际结果</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {decision.review.actualResult}
                  </p>
                </section>
                <div className="rounded-md border p-4">
                  <p className="text-sm text-muted-foreground">后悔程度</p>
                  <p className="mt-1 text-2xl font-semibold">{decision.review.regretScore}</p>
                </div>
                {decision.review.lesson ? (
                  <section>
                    <h3 className="text-sm font-medium">下次怎么做</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {decision.review.lesson}
                    </p>
                  </section>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </main>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>最终选择</CardTitle>
              <CardDescription>保存后可进行轻量复盘。</CardDescription>
            </CardHeader>
            <CardContent>
              <FinalChoiceForm decisionId={decision.id} initialFinalChoice={decision.finalChoice} />
            </CardContent>
          </Card>

          {decision.finalChoice ? (
            <Card>
              <CardHeader>
                <CardTitle>已保存选择</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {decision.finalChoice}
                </p>
              </CardContent>
            </Card>
          ) : null}

          {canReview ? (
            <Card>
              <CardHeader>
                <CardTitle>轻量复盘</CardTitle>
                <CardDescription>只记录结果、后悔分和下次策略。</CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewForm decisionId={decision.id} />
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
