import type { AiDecisionAnalysis, DecisionReport } from "../types/decision";

function asStringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

export function calculateReviewDueAt(reviewText?: string, baseDate = new Date()) {
  const source = reviewText || "";
  const dayMatch = source.match(/(\d+)\s*天/);
  const weekMatch = source.match(/(\d+)\s*周/);
  const days = dayMatch ? Number(dayMatch[1]) : weekMatch ? Number(weekMatch[1]) * 7 : 7;
  const dueAt = new Date(baseDate);
  dueAt.setDate(dueAt.getDate() + (Number.isFinite(days) && days > 0 ? days : 7));
  return dueAt.toISOString();
}

export function getReviewWindow(analysis: AiDecisionAnalysis) {
  return analysis.reviewTime || analysis.reviewWindow || analysis.reviewSuggestion || "建议 7 天内复盘";
}

export function normalizeReportAnalysis(report: DecisionReport) {
  const analysis = report.analysis;
  const draftOptions = Array.isArray(report.draft?.options) ? report.draft.options : [];
  const optionAnalysis = Array.isArray(analysis.optionAnalysis) ? analysis.optionAnalysis : [];
  const reviewWindow = getReviewWindow(analysis);
  const recommendationTitle = analysis.recommendationTitle || analysis.recommendation || report.title || "先做一个低成本的可逆验证";
  const oneSentence =
    analysis.oneSentenceReason ||
    analysis.oneSentence ||
    analysis.realProblem ||
    analysis.summary ||
    "用更低后悔概率的方式推进这个选择。";

  return {
    action: analysis.lowRegretAction || "先做一个低成本、可复盘的小动作。",
    actionPlan: asStringList(analysis.actionPlan),
    confidence: analysis.recommendationStrength || analysis.confidence || "中",
    decisionStyle: analysis.strategyTag || analysis.decisionStyle || "低成本验证",
    draftOptions,
    factors: asStringList(analysis.emotionalFactors),
    oneSentence,
    optionAnalysis,
    realProblem:
      analysis.realProblem ||
      analysis.oneSentenceReason ||
      analysis.oneSentence ||
      analysis.summary ||
      "当前决策的核心是识别真实约束，而不是追求完美选项。",
    recommendationTitle,
    regretRisk: analysis.regretRiskLevel || analysis.regretRisk || "中",
    reviewDueAt: report.reviewDueAt || calculateReviewDueAt(reviewWindow, new Date(report.createdAt || Date.now())),
    reviewStatus: report.reviewStatus || (report.review ? "reviewed" : "pending"),
    reviewWindow,
    reversibility: analysis.reversibilityLevel || analysis.reversibility || "中",
    summary: analysis.summary || analysis.recommendation || analysis.lowRegretAction || "当前报告暂无方案对比内容。"
  };
}
