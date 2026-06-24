export const decisionCategories = ["工作", "投资", "情感", "消费", "健康", "生活", "学习", "其他"] as const;

export type DecisionCategory = (typeof decisionCategories)[number];

export type DecisionDraft = {
  title: string;
  category: string;
  background: string;
  concern: string;
  fear: string;
  emotions: string[];
  options: Array<{
    label: string;
    description: string;
  }>;
};

export type AiOptionAnalysis = {
  optionId: string;
  pros: string[];
  cons: string[];
  regretCost: string;
};

export type AiDecisionAnalysis = {
  recommendedOptionId?: string;
  recommendationTitle?: string;
  recommendationStrength?: string;
  confidence?: string;
  oneSentenceReason?: string;
  oneSentence?: string;
  reversibilityLevel?: string;
  regretRiskLevel?: string;
  regretRisk?: string;
  strategyTag?: string;
  decisionStyle?: string;
  lowRegretAction: string;
  reviewTime?: string;
  reviewWindow?: string;
  realProblem: string;
  keyVariables?: string[];
  emotionalFactors: string[];
  reversibility: string;
  optionAnalysis: AiOptionAnalysis[];
  actionPlan?: string[];
  reviewChecklist?: string[];
  summary: string;
  recommendation?: string;
  reviewSuggestion?: string;
};

export type DecisionReview = {
  reviewedAt: string;
  finalChoice: "follow_recommendation" | "choose_other" | "no_action" | "still_observing";
  regretLevel: "none" | "slight" | "strong" | "unknown";
  outcome: "better_than_expected" | "as_expected" | "worse_than_expected" | "unknown";
  note?: string;
};

export type DecisionReport = {
  id: string;
  title: string;
  category: string;
  rawText: string;
  createdAt: string;
  draft: DecisionDraft;
  analysis: AiDecisionAnalysis;
  review?: DecisionReview;
  reviewStatus?: "pending" | "reviewed";
  reviewDueAt?: string;
};
