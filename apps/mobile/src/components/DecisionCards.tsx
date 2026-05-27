import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../theme/tokens";
import type { DecisionReport } from "../types/decision";
import { BodyText, Card, MetricPill } from "./Primitives";

export function RecentDecisionCard({ report, onPress }: { report: DecisionReport; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.recentCard}>
        <View style={styles.recentHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{report.category}</Text>
          </View>
          <Text style={styles.dateText}>{new Date(report.createdAt).toLocaleDateString("zh-CN")}</Text>
        </View>
        <Text style={styles.recentTitle}>{report.title}</Text>
        <Text style={styles.recentMeta} numberOfLines={1}>
          推荐：{report.analysis.recommendationTitle || report.analysis.recommendation || "低后悔行动"}
        </Text>
      </Card>
    </Pressable>
  );
}

export function ConclusionCard({ report }: { report: DecisionReport }) {
  const analysis = report.analysis;
  return (
    <Card style={styles.conclusion}>
      <View style={styles.conclusionTop}>
        <View>
          <Text style={styles.conclusionKicker}>核心结论</Text>
          <Text style={styles.recommendation}>
            {analysis.recommendationTitle || analysis.recommendation || "先做一个低成本验证"}
          </Text>
        </View>
        <View style={styles.scoreBadge}>
          <Ionicons color={colors.primary} name="analytics-outline" size={18} />
        </View>
      </View>
      <BodyText muted>{analysis.oneSentenceReason || analysis.summary || "用更低后悔概率的方式推进这个选择。"}</BodyText>
      <View style={styles.metrics}>
        <MetricPill label="置信度" value={analysis.recommendationStrength || "中"} />
        <MetricPill label="决策风格" value={analysis.strategyTag || "低成本验证"} />
        <MetricPill label="可逆性" value={analysis.reversibilityLevel || "中"} />
        <MetricPill label="后悔风险" value={analysis.regretRiskLevel || "中"} />
      </View>
    </Card>
  );
}

export function OptionReportCard({
  label,
  description,
  regretCost,
  pros,
  cons,
  index
}: {
  label: string;
  description?: string;
  regretCost?: string;
  pros: string[];
  cons: string[];
  index: number;
}) {
  return (
    <Card style={styles.optionCard}>
      <View style={styles.optionHeader}>
        <Text style={styles.optionIndex}>{String(index + 1).padStart(2, "0")}</Text>
        <View style={styles.optionTitleWrap}>
          <Text style={styles.optionTitle}>{label}</Text>
          {description ? <Text style={styles.optionDescription}>{description}</Text> : null}
        </View>
      </View>
      <View style={styles.optionDivider} />
      <ReportLine title="适合情况" value={description || "当你更看重确定性与执行成本时。"} />
      <ReportLine title="主要收益" value={pros.length ? pros.join(" / ") : "降低决策摩擦，便于快速执行。"} />
      <ReportLine title="主要风险" value={cons.length ? cons.join(" / ") : "收益空间可能有限，需要后续复盘。"} />
      <ReportLine title="可能后悔点" value={regretCost || "如果机会成本高，可能会觉得选择过于保守。"} />
    </Card>
  );
}

function ReportLine({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.reportLine}>
      <Text style={styles.reportTitle}>{title}</Text>
      <Text style={styles.reportValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  recentCard: {
    marginBottom: spacing.md,
    padding: spacing.md
  },
  recentHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm
  },
  categoryBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4
  },
  categoryText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800"
  },
  dateText: {
    color: colors.textTertiary,
    fontSize: 12,
    fontWeight: "700"
  },
  recentTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 24
  },
  recentMeta: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs
  },
  conclusion: {
    backgroundColor: "#FDFEFF",
    borderColor: "#CEDBF3"
  },
  conclusionTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md
  },
  conclusionKicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: spacing.xs
  },
  recommendation: {
    color: colors.inkBlue,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 36,
    maxWidth: 250
  },
  scoreBadge: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  optionCard: {
    marginBottom: spacing.md
  },
  optionHeader: {
    flexDirection: "row",
    gap: spacing.md
  },
  optionIndex: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 3
  },
  optionTitleWrap: {
    flex: 1
  },
  optionTitle: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: "900",
    lineHeight: 26
  },
  optionDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: spacing.xs
  },
  optionDivider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: spacing.md
  },
  reportLine: {
    marginBottom: spacing.md
  },
  reportTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 4
  },
  reportValue: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21
  }
});
