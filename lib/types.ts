export type DecisionStatus = "DRAFT" | "ANALYZED" | "DECIDED" | "REVIEWED" | "ARCHIVED";

export type DecisionOption = {
  id: string;
  decisionId: string;
  label: string;
  description?: string | null;
};

export type DecisionAnalysis = {
  realProblem: string;
  emotionalFactors: string[];
  reversibility: string;
  optionAnalysis: Array<{
    optionId: string;
    pros: string[];
    cons: string[];
    regretCost: string;
  }>;
  recommendation: string;
  lowRegretAction: string;
  reviewSuggestion: string;
  summary: string;
};

export type Decision = {
  id: string;
  title: string;
  category?: string | null;
  background: string;
  concern?: string | null;
  fear?: string | null;
  emotions?: string[];
  deadline?: string | null;
  aiAnalysis?: DecisionAnalysis | null;
  finalChoice?: string | null;
  status: DecisionStatus;
  reviewDate?: string | null;
  createdAt: string;
  updatedAt: string;
  options: DecisionOption[];
};

export type DecisionReview = {
  id: string;
  decisionId: string;
  actualResult: string;
  regretScore: number;
  outcome?: string | null;
  fearHappened?: boolean | null;
  wouldChooseAgain?: boolean | null;
  lesson?: string | null;
  reviewedAt: string;
};

export type UserProfile = {
  id: string;
  summary?: string | null;
  commonCategories?: string[];
  commonConcerns?: string[];
  commonEmotions?: string[];
  commonBiases?: string[];
  lowRegretStrategies?: string[];
  highRegretPatterns?: string[];
  lowRegretPatterns?: string[];
  updatedAt: string;
};

export type NewDecisionInput = {
  title: string;
  category?: string;
  background: string;
  concern?: string;
  fear?: string;
  emotions?: string[];
  deadline?: string;
  options: Array<Pick<DecisionOption, "label" | "description">>;
};
