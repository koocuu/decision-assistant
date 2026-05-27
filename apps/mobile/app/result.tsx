import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ConclusionCard, OptionReportCard } from "../src/components/DecisionCards";
import { BodyText, Card, PrimaryButton, Screen, SectionTitle } from "../src/components/Primitives";
import { findReport } from "../src/storage/history";
import { colors, spacing } from "../src/theme/tokens";
import type { DecisionReport } from "../src/types/decision";

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const [report, setReport] = useState<DecisionReport | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    findReport(params.id || "").then((nextReport) => {
      setReport(nextReport);
      setLoaded(true);
    });
  }, [params.id]);

  if (loaded && !report) {
    return (
      <Screen>
        <View style={styles.empty}>
          <Card style={styles.emptyCard}>
            <BodyText muted>没有找到这份本地决策报告。</BodyText>
            <PrimaryButton onPress={() => router.replace("/")}>返回控制台</PrimaryButton>
          </Card>
        </View>
      </Screen>
    );
  }

  if (!report) {
    return <Screen />;
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons color={colors.textPrimary} name="chevron-back" size={20} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.kicker}>决策报告</Text>
            <Text style={styles.title}>{report.title}</Text>
          </View>
        </View>

        <ConclusionCard report={report} />

        <Card style={styles.actionCard}>
          <Text style={styles.actionTitle}>执行建议</Text>
          <BodyText>{report.analysis.lowRegretAction || "先做一个低成本、可复盘的小动作。"}</BodyText>
          <Text style={styles.reviewTime}>复盘时间：{report.analysis.reviewTime || report.analysis.reviewSuggestion || "7 天后"}</Text>
        </Card>

        <SectionTitle>方案摘要</SectionTitle>
        {report.draft.options.map((option, index) => {
          const analysis = report.analysis.optionAnalysis[index] ?? {
            pros: [],
            cons: [],
            regretCost: ""
          };

          return (
            <OptionReportCard
              cons={analysis.cons}
              description={option.description}
              index={index}
              key={`${option.label}-${index}`}
              label={option.label}
              pros={analysis.pros}
              regretCost={analysis.regretCost}
            />
          );
        })}

        <SectionTitle>判断依据</SectionTitle>
        <Card>
          <BodyText muted>{report.analysis.realProblem || "当前决策的核心是识别真实约束，而不是追求完美选项。"}</BodyText>
          <View style={styles.factorRow}>
            {(report.analysis.emotionalFactors.length ? report.analysis.emotionalFactors : ["不确定", "机会成本"]).map((item) => (
              <View key={item} style={styles.factor}>
                <Text style={styles.factorText}>{item}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
    marginTop: spacing.lg
  },
  backButton: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  headerText: {
    flex: 1
  },
  kicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 5
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 31
  },
  actionCard: {
    backgroundColor: "#F7FAFF",
    marginVertical: spacing.lg
  },
  actionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: spacing.sm
  },
  reviewTime: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
    marginTop: spacing.md
  },
  factorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  factor: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  factorText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "800"
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg
  },
  emptyCard: {
    gap: spacing.md
  }
});
