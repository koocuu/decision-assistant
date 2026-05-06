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

export function extractJsonText(content: string) {
  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function enumString(value: unknown, allowed: string[]) {
  const candidate = asString(value);
  return allowed.includes(candidate) ? candidate : undefined;
}

export function parseAiAnalysis(content: string): AiDecisionAnalysis {
  const parsed = JSON.parse(extractJsonText(content)) as Record<string, unknown>;
  const rawOptionAnalysis = Array.isArray(parsed.optionAnalysis) ? parsed.optionAnalysis : [];

  return {
    recommendedOptionId: asString(parsed.recommendedOptionId) || undefined,
    recommendationTitle: asString(parsed.recommendationTitle) || asString(parsed.recommendation) || undefined,
    recommendationStrength: enumString(parsed.recommendationStrength, ["强", "中", "弱"]),
    oneSentenceReason: asString(parsed.oneSentenceReason) || undefined,
    reversibilityLevel: enumString(parsed.reversibilityLevel, ["高", "中", "低"]),
    regretRiskLevel: enumString(parsed.regretRiskLevel, ["高", "中", "低"]),
    strategyTag: enumString(parsed.strategyTag, [
      "小成本试验",
      "延迟决策",
      "直接执行",
      "先收集信息",
      "设置边界",
      "分批投入",
      "暂缓"
    ]),
    lowRegretAction: asString(parsed.lowRegretAction) || asString(parsed.regretMinimizer),
    reviewTime: asString(parsed.reviewTime) || asString(parsed.reviewSuggestion) || undefined,
    realProblem: asString(parsed.realProblem),
    emotionalFactors: stringArray(parsed.emotionalFactors),
    reversibility: asString(parsed.reversibility),
    optionAnalysis: rawOptionAnalysis.map((item) => {
      const option = item as Record<string, unknown>;

      return {
        optionId: asString(option.optionId),
        pros: stringArray(option.pros).slice(0, 2),
        cons: stringArray(option.cons).slice(0, 2),
        regretCost: asString(option.regretCost)
      };
    }),
    summary: asString(parsed.summary),
    recommendation: asString(parsed.recommendation) || undefined,
    reviewSuggestion: asString(parsed.reviewSuggestion) || undefined
  };
}

export function parseStoredAiAnalysis(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return parseAiAnalysis(value);
  } catch {
    return null;
  }
}
