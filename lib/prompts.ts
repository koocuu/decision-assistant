import type { DeepSeekMessage } from "@/lib/deepseek";
import { decisionCategories, decisionEmotions } from "@/lib/decision-constants";

type PromptDecision = {
  id: string;
  title: string;
  category: string | null;
  background: string;
  concern: string | null;
  fear: string | null;
  emotions: string | null;
  deadline: Date | null;
  options: Array<{
    id: string;
    label: string;
    description: string | null;
  }>;
};

type PromptUserProfile = {
  summary: string | null;
  commonCategories: string | null;
  commonConcerns: string | null;
  commonEmotions: string | null;
  commonBiases: string | null;
  lowRegretStrategies: string | null;
  highRegretPatterns: string | null;
  lowRegretPatterns: string | null;
} | null;

type PromptReview = {
  actualResult: string;
  regretScore: number;
  outcome: string | null;
  fearHappened: boolean | null;
  wouldChooseAgain: boolean | null;
  lesson: string | null;
  reviewedAt: Date;
};

type ProfileUpdateDecision = PromptDecision & {
  aiAnalysis: string | null;
  finalChoice: string | null;
  createdAt: Date;
  review: PromptReview | null;
};

function parseJsonArray(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseJsonObject(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function buildDecisionAnalysisMessages(
  decision: PromptDecision,
  userProfile: PromptUserProfile
): DeepSeekMessage[] {
  const payload = {
    userProfileSummary: userProfile?.summary ?? "",
    decision: {
      id: decision.id,
      title: decision.title,
      category: decision.category,
      background: decision.background,
      concern: decision.concern,
      fear: decision.fear,
      emotions: parseJsonArray(decision.emotions),
      deadline: decision.deadline?.toISOString() ?? null,
      options: decision.options.map((option) => ({
        optionId: option.id,
        label: option.label,
        description: option.description
      }))
    }
  };

  return [
    {
      role: "system",
      content:
        "你是一个理性、克制、直接的 AI 决策教练。你的任务不是给用户一篇全面分析报告，而是帮助用户把纠结收敛成一个低后悔行动。输出必须是严格 JSON，不要 markdown，不要解释。"
    },
    {
      role: "user",
      content: `你必须明确给出：
1. 推荐选择
2. 推荐强度
3. 一句话原因
4. 可逆性等级
5. 后悔风险等级
6. 建议策略
7. 一个具体、低成本、可执行的下一步
8. 明确复盘时间

判断原则：
- 如果决策成本低、可逆性高，优先推荐小成本试验。
- 如果用户情绪强烈但信息不足，优先推荐延迟决策或先收集信息。
- 如果用户已经长期反复纠结，且行动成本低，优先推荐直接执行一个最小动作。
- 如果涉及投资、医疗、法律等高风险领域，不做确定性承诺，建议先收集信息、遵循专业意见或分批投入。
- 对生活、消费、宠物、健身、学习类问题，优先给 7 天以内能验证的小动作。
- 医疗类不做诊断、不替代医生建议，优先建议遵医嘱；如出现异常症状，建议联系医生。
- 不要给太多选择，避免用户更纠结。
- 不要输出长篇解释，让用户 10 秒内知道下一步该做什么。

请严格按照 JSON 输出：
{
  "recommendedOptionId": "string",
  "recommendationTitle": "string",
  "recommendationStrength": "强|中|弱",
  "oneSentenceReason": "string",
  "reversibilityLevel": "高|中|低",
  "regretRiskLevel": "高|中|低",
  "strategyTag": "小成本试验|延迟决策|直接执行|先收集信息|设置边界|分批投入|暂缓",
  "lowRegretAction": "string",
  "reviewTime": "string",
  "realProblem": "string",
  "emotionalFactors": ["string"],
  "reversibility": "string",
  "optionAnalysis": [
    {
      "optionId": "string",
      "pros": ["string"],
      "cons": ["string"],
      "regretCost": "string"
    }
  ],
  "summary": "string"
}

字段要求：
- recommendedOptionId 必须对应某个选项 ID。
- recommendationStrength 只能是：强 / 中 / 弱。
- reversibilityLevel 只能是：高 / 中 / 低。
- regretRiskLevel 只能是：高 / 中 / 低。
- strategyTag 只能是：小成本试验、延迟决策、直接执行、先收集信息、设置边界、分批投入、暂缓。
- recommendationTitle 控制在 30 字以内。
- oneSentenceReason 控制在 80 字以内。
- lowRegretAction 必须具体、低成本、可执行。
- reviewTime 必须明确。
- emotionalFactors 最多 3 个。
- pros 最多 2 条，cons 最多 2 条。
- regretCost 一句话。
- 不要输出 markdown，不要输出解释。

输入：
${JSON.stringify(payload, null, 2)}`
    }
  ];
}

export function buildParseDecisionMessages(rawText: string): DeepSeekMessage[] {
  return [
    {
      role: "system",
      content:
        "你是一个理性、克制、擅长帮用户整理纠结的决策助手。你的任务不是直接给建议，而是把未经整理的自然语言整理成结构化决策草稿。输出必须是严格 JSON，不要 markdown，不要解释。"
    },
    {
      role: "user",
      content: `请从用户原文中提取：决策标题、分类、背景、可选方案、最纠结的点、最害怕的结果、当前情绪。

分类只能从以下选：
${decisionCategories.join("、")}

情绪只能从以下选：
${decisionEmotions.join("、")}

关键规则：
1. 选项必须是互斥的决策路径，而不是可以同时完成的待办事项。
2. 不要把“注意事项”“护理建议”“执行步骤”当成选项。
3. 如果用户问“我该干嘛”，选项应围绕不同安排方式，而不是拆成多个建议。
4. 如果用户表达的是健康、医疗、恢复相关问题，选项要围绕“休息 / 轻量活动 / 延后安排”等行为路径，不要替代医生建议。
5. 选项数量默认 2 到 3 个。
6. 每个选项必须可执行、清晰、互斥。
7. 如果某些内容更适合作为建议，请放到 background、concern 或 fear，不要放进 options。
8. 不要给建议，不要做长篇分析，不要扩写太多用户没说的内容。
9. 如果用户没有明确选项，请根据语义补充 2 到 3 个合理的互斥路径。
10. background 控制在 100 字以内。

输出格式：
{
  "title": "一句话标题",
  "category": "生活",
  "background": "用户纠结的背景，控制在 100 字以内",
  "options": [
    {
      "label": "选项 1 的短标题",
      "description": "这个选项具体是什么意思"
    }
  ],
  "concern": "用户真正卡住的核心矛盾",
  "fear": "用户最害怕发生的结果",
  "emotions": ["控制欲", "不确定"]
}

用户原文：
${rawText}`
    }
  ];
}

export function buildUserProfileUpdateMessages(
  decision: ProfileUpdateDecision,
  userProfile: Exclude<PromptUserProfile, null>
): DeepSeekMessage[] {
  const payload = {
    oldProfile: {
      summary: userProfile.summary,
      commonCategories: parseJsonArray(userProfile.commonCategories),
      commonConcerns: parseJsonArray(userProfile.commonConcerns),
      commonEmotions: parseJsonArray(userProfile.commonEmotions),
      commonBiases: parseJsonArray(userProfile.commonBiases),
      lowRegretStrategies: parseJsonArray(userProfile.lowRegretStrategies),
      highRegretPatterns: parseJsonArray(userProfile.highRegretPatterns),
      lowRegretPatterns: parseJsonArray(userProfile.lowRegretPatterns)
    },
    reviewedDecision: {
      id: decision.id,
      title: decision.title,
      category: decision.category,
      background: decision.background,
      concern: decision.concern,
      fear: decision.fear,
      emotions: parseJsonArray(decision.emotions),
      finalChoice: decision.finalChoice,
      aiAnalysis: parseJsonObject(decision.aiAnalysis),
      options: decision.options.map((option) => ({
        optionId: option.id,
        label: option.label,
        description: option.description
      })),
      review: decision.review
        ? {
            actualResult: decision.review.actualResult,
            regretScore: decision.review.regretScore,
            outcome: decision.review.outcome,
            fearHappened: decision.review.fearHappened,
            wouldChooseAgain: decision.review.wouldChooseAgain,
            lesson: decision.review.lesson,
            reviewedAt: decision.review.reviewedAt.toISOString()
          }
        : null
    }
  };

  return [
    {
      role: "system",
      content:
        "You update a long-term user decision profile for a low-regret decision assistant. Return valid JSON only. Do not include markdown, code fences, or extra prose."
    },
    {
      role: "user",
      content: `Update the user profile using the old profile plus this newly reviewed decision.

Return exactly this JSON shape:
{
  "summary": "string",
  "commonCategories": ["string"],
  "commonConcerns": ["string"],
  "commonEmotions": ["string"],
  "commonBiases": ["string"],
  "lowRegretStrategies": ["string"],
  "highRegretPatterns": ["string"],
  "lowRegretPatterns": ["string"]
}

Rules:
- Preserve useful old profile information unless the new review clearly changes it.
- Infer patterns cautiously from limited data.
- commonBiases should describe recurring thinking traps, not diagnoses.
- lowRegretStrategies should be concrete future decision tactics.
- highRegretPatterns and lowRegretPatterns should be behavioral patterns.
- Output JSON only.

Input:
${JSON.stringify(payload, null, 2)}`
    }
  ];
}
