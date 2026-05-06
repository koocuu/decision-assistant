import type { DecisionStatus } from "@/lib/types";

export const decisionStatuses: DecisionStatus[] = ["DRAFT", "ANALYZED", "DECIDED", "REVIEWED", "ARCHIVED"];

export const decisionStatusLabels: Record<DecisionStatus, string> = {
  DRAFT: "草稿",
  ANALYZED: "已分析",
  DECIDED: "待复盘",
  REVIEWED: "已复盘",
  ARCHIVED: "已归档"
};
