import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, hairlineWidth, radii, shadows, spacing, tabularNums } from "../theme/tokens";
import type { DecisionReport } from "../types/decision";
import { AppText, Divider, Tag } from "./Primitives";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}.${month}.${day}`;
}

export function RecentDecisionRow({
  report,
  onPress,
  showDivider = true
}: {
  report: DecisionReport;
  onPress?: () => void;
  showDivider?: boolean;
}) {
  const recommendation =
    report.analysis.recommendationTitle || report.analysis.recommendation || "低后悔行动建议";
  const reviewed = report.reviewStatus === "reviewed" || Boolean(report.review);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.rowItem, pressed ? { backgroundColor: colors.surfaceMuted } : null]}
    >
      <View style={styles.rowTopLine}>
        <View style={styles.rowTags}>
          <Tag tone="neutral">{report.category}</Tag>
          <Tag tone={reviewed ? "success" : "neutral"}>{reviewed ? "已复盘" : "待复盘"}</Tag>
        </View>
        <Text style={styles.rowDate}>{formatDate(report.createdAt)}</Text>
      </View>
      <Text style={styles.rowTitle} numberOfLines={2}>
        {report.title}
      </Text>
      <View style={styles.rowRecommendation}>
        <Text style={styles.rowMetaLabel}>推荐</Text>
        <Text style={styles.rowMetaValue} numberOfLines={1}>
          {recommendation}
        </Text>
      </View>
      {showDivider ? <View style={styles.rowItemDivider} /> : null}
    </Pressable>
  );
}

export function ConclusionCard({
  recommendationTitle,
  strength,
  regretRisk,
  reviewWindow,
  oneSentence
}: {
  recommendationTitle: string;
  strength: string;
  regretRisk: string;
  reviewWindow: string;
  oneSentence: string;
}) {
  return (
    <View style={styles.conclusion}>
      <View style={styles.conclusionAccent} />
      <View style={styles.conclusionHeader}>
        <Text style={styles.conclusionLabel}>推荐方案</Text>
      </View>
      <Text style={styles.recommendation}>{recommendationTitle}</Text>
      <View style={styles.conclusionFacts}>
        <ConclusionFact label="建议强度" value={strength} tone="primary" />
        <ConclusionFact label="后悔风险" value={regretRisk} />
        <ConclusionFact label="复盘窗口" value={reviewWindow} />
      </View>
      <View style={styles.judgementBox}>
        <Text style={styles.judgementLabel}>一句话判断</Text>
        <Text style={styles.recommendationReason}>{oneSentence}</Text>
      </View>
    </View>
  );
}

function ConclusionFact({
  label,
  value,
  tone = "neutral"
}: {
  label: string;
  value: string;
  tone?: "neutral" | "primary";
}) {
  return (
    <View style={styles.conclusionFact}>
      <Text style={styles.conclusionFactLabel}>{label}</Text>
      <Text style={[styles.conclusionFactValue, tone === "primary" ? { color: colors.primary } : null]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function ReportMetricChips({
  confidence,
  reversibility,
  regretRisk,
  styleTag
}: {
  confidence: string;
  reversibility: string;
  regretRisk: string;
  styleTag: string;
}) {
  const items = [
    { label: "置信度", value: confidence, tone: "primary" as const },
    { label: "可逆性", value: reversibility },
    { label: "后悔风险", value: regretRisk },
    { label: "风格", value: styleTag }
  ];

  return (
    <View style={styles.metricChips}>
      {items.map((item) => (
        <View key={item.label} style={[styles.metricChip, item.tone === "primary" ? styles.metricChipPrimary : null]}>
          <Text style={[styles.metricChipLabel, item.tone === "primary" ? { color: colors.primary } : null]}>
            {item.label}
          </Text>
          <Text style={styles.metricChipValue} numberOfLines={2}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function OptionReportCard({
  label,
  description,
  regretCost,
  pros,
  cons,
  fitFor,
  index
}: {
  label: string;
  description?: string;
  regretCost?: string;
  pros: string[];
  cons: string[];
  fitFor?: string;
  index: number;
}) {
  const summary = description || "这是一个可选路径，适合在当前约束下进一步比较成本、收益和后悔风险。";
  return (
    <View style={styles.optionCard}>
      <View style={styles.optionHeader}>
        <Text style={styles.optionIndex}>{String(index + 1).padStart(2, "0")}</Text>
        <View style={styles.optionTitleWrap}>
          <Text style={styles.optionTitle} numberOfLines={2}>
            {label}
          </Text>
          <Text style={styles.optionSummaryLabel}>一句摘要</Text>
          <Text style={styles.optionDescription} numberOfLines={3}>
            {summary}
          </Text>
        </View>
      </View>
      <Divider style={{ marginVertical: spacing.lg }} />
      <ReportSection
        title="适合你如果"
        body={fitFor || description || "你更看重确定性、执行成本和短期可控性。"}
      />
      <ReportSection
        title="主要收益"
        body={pros.length ? pros.join("；") : "降低决策摩擦，便于快速执行。"}
        tone="success"
      />
      <ReportSection
        title="主要风险"
        body={cons.length ? cons.join("；") : "收益空间可能有限，需要后续复盘。"}
        tone="danger"
      />
      <ReportSection
        title="可能后悔点"
        body={regretCost || "如果机会成本高，可能会觉得选择过于保守。"}
        tone="neutral"
        last
      />
    </View>
  );
}

function ReportSection({
  title,
  body,
  tone = "neutral",
  last = false
}: {
  title: string;
  body: string;
  tone?: "neutral" | "success" | "danger";
  last?: boolean;
}) {
  const accent =
    tone === "success" ? colors.success : tone === "danger" ? colors.danger : colors.textSecondary;
  return (
    <View style={[styles.reportSection, last ? { marginBottom: 0 } : null]}>
      <View style={styles.reportTitleRow}>
        <View style={[styles.reportAccent, { backgroundColor: accent }]} />
        <Text style={styles.reportTitle}>{title}</Text>
      </View>
      <Text style={styles.reportBody}>{body}</Text>
    </View>
  );
}

export function InsightCard({
  realProblem,
  factors,
  action,
  reviewTime
}: {
  realProblem: string;
  factors: string[];
  action: string;
  reviewTime: string;
}) {
  return (
    <View style={styles.insightCard}>
      <View style={styles.insightHeader}>
        <View style={styles.insightHeaderIcon}>
          <Ionicons name="analytics-outline" size={15} color={colors.primary} />
        </View>
        <Text style={styles.insightLabel}>判断依据</Text>
      </View>
      <AppText variant="body" color={colors.textPrimary} style={{ marginTop: spacing.md }}>
        {realProblem}
      </AppText>
      {factors.length ? (
        <View style={styles.factorRow}>
          {factors.map((item) => (
            <View key={item} style={styles.factor}>
              <Text style={styles.factorText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.lowRegretBox}>
        <View style={styles.actionRow}>
          <View style={styles.actionIcon}>
            <Ionicons name="arrow-forward" size={14} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionLabel}>低后悔行动</Text>
            <Text style={styles.actionBody}>{action}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.actionRow, { marginTop: spacing.md }]}>
        <View style={styles.actionIcon}>
          <Ionicons name="time-outline" size={14} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.actionLabel}>复盘时间</Text>
          <Text style={styles.actionBody}>{reviewTime}</Text>
        </View>
      </View>
    </View>
  );
}

export function ActionChecklist({ items }: { items: string[] }) {
  const normalized = items.map((item) => item.trim()).filter(Boolean).slice(0, 5);

  if (!normalized.length) {
    return null;
  }

  return (
    <View style={styles.checklistCard}>
      <Text style={styles.checklistTitle}>下一步执行</Text>
      <View style={styles.checklistItems}>
        {normalized.map((item, index) => (
          <View key={`${item}-${index}`} style={styles.checklistItem}>
            <View style={styles.checkIcon}>
              <Ionicons name="checkmark" size={12} color={colors.primary} />
            </View>
            <Text style={styles.checkText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card
  },
  rowTopLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm
  },
  rowTags: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    gap: spacing.xs
  },
  rowDate: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: "500",
    ...tabularNums
  },
  rowTitle: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: "500",
    lineHeight: 22,
    letterSpacing: 0
  },
  rowRecommendation: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    gap: spacing.sm
  },
  rowMetaLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: "500",
    letterSpacing: 0.3
  },
  rowMetaValue: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    flex: 1
  },
  rowItemDivider: {
    height: hairlineWidth,
    backgroundColor: colors.divider,
    marginTop: spacing.lg,
    marginHorizontal: 0
  },
  conclusion: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: hairlineWidth,
    borderColor: colors.border,
    padding: spacing.xl,
    overflow: "hidden",
    ...shadows.card
  },
  conclusionAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.primary
  },
  conclusionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm
  },
  conclusionLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  conclusionFacts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  conclusionFact: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: hairlineWidth,
    flexGrow: 1,
    minWidth: "30%",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  conclusionFactLabel: {
    color: colors.textTertiary,
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 3
  },
  conclusionFactValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18
  },
  recommendation: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: "600",
    lineHeight: 32,
    letterSpacing: 0
  },
  judgementBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    marginTop: spacing.lg,
    padding: spacing.md
  },
  judgementLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6
  },
  recommendationReason: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22
  },
  metricChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  metricChip: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: hairlineWidth,
    flexBasis: "48%",
    flexGrow: 1,
    padding: spacing.md
  },
  metricChipPrimary: {
    backgroundColor: colors.primarySoft,
    borderColor: "#D6E3FF"
  },
  metricChipLabel: {
    color: colors.textTertiary,
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 5
  },
  metricChipValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 19
  },
  optionCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: hairlineWidth,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.card
  },
  optionHeader: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start"
  },
  optionIndex: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginTop: 4,
    ...tabularNums
  },
  optionTitleWrap: {
    flex: 1
  },
  optionTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: "600",
    lineHeight: 25,
    letterSpacing: 0
  },
  optionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 3
  },
  optionSummaryLabel: {
    color: colors.textTertiary,
    fontSize: 11,
    fontWeight: "600",
    marginTop: spacing.sm
  },
  reportSection: {
    marginBottom: spacing.lg
  },
  reportTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 6
  },
  reportAccent: {
    width: 4,
    height: 14,
    borderRadius: 2
  },
  reportTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
    letterSpacing: 0.3
  },
  reportBody: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
    paddingLeft: spacing.md
  },
  insightCard: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: hairlineWidth,
    borderColor: colors.border,
    padding: spacing.xl,
    ...shadows.card
  },
  insightHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  insightHeaderIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radii.sm,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  insightLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase"
  },
  factorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  lowRegretBox: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    marginTop: spacing.lg,
    padding: spacing.md
  },
  factor: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5
  },
  factorText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500"
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md
  },
  actionIcon: {
    width: 26,
    height: 26,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2
  },
  actionLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginBottom: 4
  },
  actionBody: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
    lineHeight: 20
  },
  checklistCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: hairlineWidth,
    padding: spacing.xl,
    ...shadows.card
  },
  checklistTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "600",
    marginBottom: spacing.lg
  },
  checklistItems: {
    gap: spacing.md
  },
  checklistItem: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md
  },
  checkIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    height: 22,
    justifyContent: "center",
    marginTop: 1,
    width: 22
  },
  checkText: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 14,
    lineHeight: 21
  }
});
