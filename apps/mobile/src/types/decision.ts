export type DecisionCategory = "职业选择" | "投资判断" | "情感关系" | "消费决策" | "生活安排";

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
  oneSentenceReason?: string;
  reversibilityLevel?: string;
  regretRiskLevel?: string;
  strategyTag?: string;
  lowRegretAction: string;
  reviewTime?: string;
  realProblem: string;
  emotionalFactors: string[];
  reversibility: string;
  optionAnalysis: AiOptionAnalysis[];
  summary: string;
  recommendation?: string;
  reviewSuggestion?: string;
};

export type DecisionReport = {
  id: string;
  title: string;
  category: string;
  rawText: string;
  createdAt: string;
  draft: DecisionDraft;
  analysis: AiDecisionAnalysis;
};
