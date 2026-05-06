export const decisionCategories = ["消费", "投资", "工作", "情感", "健康", "生活", "学习", "其他"] as const;

export const decisionEmotions = [
  "焦虑",
  "FOMO",
  "不甘心",
  "冲动",
  "怕后悔",
  "沉没成本",
  "控制欲",
  "疲惫",
  "期待",
  "不确定"
] as const;

export type DecisionCategory = (typeof decisionCategories)[number];
export type DecisionEmotion = (typeof decisionEmotions)[number];
