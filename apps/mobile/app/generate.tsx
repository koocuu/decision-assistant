import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppText, Button, IconButton, Screen, ScreenHeader } from "../src/components/Primitives";
import { Sheep } from "../src/components/Sheep";
import { generateDecisionReport } from "../src/services/generateDecisionReport";
import { consumePendingInput, setPendingInput, type PendingDecisionInput } from "../src/storage/history";
import { colors, hairlineWidth, radii, spacing } from "../src/theme/tokens";

const steps = [
  { title: "拆解决策变量", caption: "提取问题中的关键因子与隐含约束" },
  { title: "评估方案风险收益", caption: "对比每个选项的可逆性、机会成本" },
  { title: "生成低后悔建议", caption: "给出可执行的下一步与复盘窗口" }
];

export default function GenerateScreen() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((current) => Math.min(current + 1, steps.length - 1));
    }, 1500);
    return () => clearInterval(timer);
  }, [retryToken]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      let input: PendingDecisionInput | null = null;
      try {
        setError("");
        input = await consumePendingInput();
        if (!input) {
          throw new Error("没有找到待分析的决策输入。");
        }

        const report = await generateDecisionReport(input);

        if (!cancelled) {
          router.replace({ pathname: "/result", params: { id: report.id } });
        }
      } catch (caughtError) {
        if (input) {
          await setPendingInput(input);
        }
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : "生成决策报告失败。");
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [router, retryToken]);

  function retryGenerate() {
    setActiveStep(0);
    setError("");
    setRetryToken((current) => current + 1);
  }

  return (
    <Screen>
      <ScreenHeader
        left={<IconButton name="close" variant="ghost" onPress={() => router.replace("/")} />}
      />

      <View style={styles.container}>
        {error ? (
          <View style={styles.statusIcon}>
            <Ionicons name="alert-circle-outline" size={28} color={colors.danger} />
          </View>
        ) : (
          <View style={styles.sheepStage}>
            <View style={styles.sheepHaloOuter} />
            <View style={styles.sheepHaloInner} />
            <Sheep size={112} mood="thinking" animate />
          </View>
        )}

        <AppText variant="headline" align="center">
          {error ? "生成遇到问题" : "小羊正在帮你拆解…"}
        </AppText>
        <AppText
          variant="meta"
          color={colors.textSecondary}
          align="center"
          style={{ marginTop: spacing.sm, paddingHorizontal: spacing.lg }}
        >
          {error || "把你的纠结拆成变量、方案、风险和下一步，而不是一段松散的回答。"}
        </AppText>

        {error ? (
          <View style={styles.errorActions}>
            <Button icon="refresh" onPress={retryGenerate} size="md">
              重试生成
            </Button>
            <Button variant="secondary" onPress={() => router.replace("/")} size="md">
              返回修改
            </Button>
          </View>
        ) : (
          <View style={styles.steps}>
            {steps.map((step, index) => {
              const status = index < activeStep ? "done" : index === activeStep ? "active" : "pending";
              return (
                <View key={step.title} style={styles.stepRow}>
                  <View
                    style={[
                      styles.stepIndex,
                      status === "active" ? styles.stepIndexActive : null,
                      status === "done" ? styles.stepIndexDone : null
                    ]}
                  >
                    {status === "done" ? (
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    ) : (
                      <Text
                        style={[
                          styles.stepIndexText,
                          status === "active" ? styles.stepIndexTextActive : null
                        ]}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </Text>
                    )}
                  </View>
                  <View style={styles.stepBody}>
                    <Text
                      style={[
                        styles.stepTitle,
                        status === "pending" ? { color: colors.textTertiary } : null
                      ]}
                    >
                      {step.title}
                    </Text>
                    <Text style={styles.stepCaption}>{step.caption}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    alignItems: "center"
  },
  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.dangerSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl
  },
  sheepStage: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg
  },
  sheepHaloOuter: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.primarySoft,
    opacity: 0.45
  },
  sheepHaloInner: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.primarySoft
  },
  errorActions: {
    width: "100%",
    gap: spacing.md,
    marginTop: spacing.xxl
  },
  steps: {
    width: "100%",
    marginTop: spacing.xxxl,
    paddingHorizontal: spacing.lg
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.lg,
    paddingVertical: spacing.lg
  },
  stepIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: hairlineWidth,
    borderColor: colors.borderStrong,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center"
  },
  stepIndexActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  stepIndexDone: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  },
  stepIndexText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textTertiary,
    letterSpacing: 0.3
  },
  stepIndexTextActive: {
    color: colors.primary
  },
  stepBody: {
    flex: 1,
    gap: 4
  },
  stepTitle: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: "500"
  },
  stepCaption: {
    fontSize: 12,
    color: colors.textTertiary,
    lineHeight: 18
  }
});
