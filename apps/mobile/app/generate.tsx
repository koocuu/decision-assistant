import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { BodyText, Card, PrimaryButton, Screen, Title } from "../src/components/Primitives";
import { analyzeDecision, createDecision, parseDecision } from "../src/services/api";
import { consumePendingInput, saveReport } from "../src/storage/history";
import { colors, radii, spacing } from "../src/theme/tokens";
import type { DecisionReport } from "../src/types/decision";

const steps = [
  "正在拆解你的决策变量",
  "正在评估不同方案的风险收益",
  "正在生成更低后悔概率的建议"
];

export default function GenerateScreen() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");

  const currentStep = useMemo(() => steps[Math.min(activeStep, steps.length - 1)], [activeStep]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((current) => Math.min(current + 1, steps.length - 1));
    }, 1350);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const input = await consumePendingInput();
        if (!input) {
          throw new Error("没有找到待分析的决策输入。");
        }

        const draft = await parseDecision(input.rawText);
        const normalizedDraft = {
          ...draft,
          category: input.category || draft.category
        };
        const created = await createDecision(normalizedDraft);
        const analyzed = await analyzeDecision(created.id);
        const report: DecisionReport = {
          id: created.id,
          title: normalizedDraft.title,
          category: input.category || normalizedDraft.category,
          rawText: input.rawText,
          createdAt: new Date().toISOString(),
          draft: normalizedDraft,
          analysis: analyzed.aiAnalysis
        };

        await saveReport(report);

        if (!cancelled) {
          router.replace({ pathname: "/result", params: { id: report.id } });
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : "生成决策报告失败。");
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <Screen>
      <View style={styles.container}>
        <Card style={styles.panel}>
          <View style={styles.indicator}>
            {error ? <Text style={styles.errorMark}>!</Text> : <ActivityIndicator color={colors.primary} size="small" />}
          </View>
          <Title>{error ? "生成遇到问题" : "正在形成决策报告"}</Title>
          <BodyText muted>
            {error || "我们会把你的问题拆成变量、方案、风险与执行建议，而不是给出一段松散回答。"}
          </BodyText>
          {!error ? (
            <View style={styles.stepList}>
              {steps.map((step, index) => (
                <View key={step} style={styles.stepRow}>
                  <View style={[styles.dot, index <= activeStep && styles.dotActive]} />
                  <Text style={[styles.stepText, index === activeStep && styles.stepTextActive]}>{step}</Text>
                </View>
              ))}
            </View>
          ) : (
            <PrimaryButton onPress={() => router.replace("/")}>返回控制台</PrimaryButton>
          )}
          {!error ? <Text style={styles.currentStep}>{currentStep}</Text> : null}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg
  },
  panel: {
    gap: spacing.lg
  },
  indicator: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radii.lg,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  errorMark: {
    color: colors.danger,
    fontSize: 22,
    fontWeight: "900"
  },
  stepList: {
    gap: spacing.md,
    marginTop: spacing.sm
  },
  stepRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  dot: {
    backgroundColor: colors.border,
    borderRadius: 4,
    height: 8,
    width: 8
  },
  dotActive: {
    backgroundColor: colors.primary
  },
  stepText: {
    color: colors.textTertiary,
    fontSize: 15,
    fontWeight: "700"
  },
  stepTextActive: {
    color: colors.textPrimary
  },
  currentStep: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900"
  }
});
