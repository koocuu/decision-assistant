import { analyzeDecision, createDecision, parseDecision } from "./api";
import { calculateReviewDueAt, getReviewWindow } from "./normalizeReportAnalysis";
import { saveReport, type PendingDecisionInput } from "../storage/history";
import type { DecisionReport } from "../types/decision";

export async function generateDecisionReport(input: PendingDecisionInput) {
  const draft = await parseDecision(input.rawText);
  const normalizedDraft = {
    ...draft,
    category: input.category || draft.category
  };
  const created = await createDecision(normalizedDraft);
  const analyzed = await analyzeDecision(created.id);
  const createdAt = new Date().toISOString();
  const reviewWindow = getReviewWindow(analyzed.aiAnalysis);

  const report: DecisionReport = {
    id: created.id,
    title: normalizedDraft.title,
    category: input.category || normalizedDraft.category,
    rawText: input.rawText,
    createdAt,
    draft: normalizedDraft,
    analysis: analyzed.aiAnalysis,
    reviewStatus: "pending",
    reviewDueAt: calculateReviewDueAt(reviewWindow, new Date(createdAt))
  };

  await saveReport(report);
  return report;
}
