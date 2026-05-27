import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { RecentDecisionCard } from "../../src/components/DecisionCards";
import { BodyText, Card, Chip, InputBox, PrimaryButton, Screen, SectionTitle, Title } from "../../src/components/Primitives";
import { loadHistory, setPendingInput } from "../../src/storage/history";
import { colors, spacing } from "../../src/theme/tokens";
import type { DecisionCategory, DecisionReport } from "../../src/types/decision";

const categories: DecisionCategory[] = ["职业选择", "投资判断", "情感关系", "消费决策", "生活安排"];

export default function DashboardScreen() {
  const router = useRouter();
  const [rawText, setRawText] = useState("");
  const [category, setCategory] = useState<DecisionCategory>("职业选择");
  const [history, setHistory] = useState<DecisionReport[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadHistory().then(setHistory);
    }, [])
  );

  async function startDecision() {
    if (!rawText.trim()) {
      Alert.alert("先写下问题", "用一两句话描述你正在纠结的选择。");
      return;
    }

    await setPendingInput({ rawText: rawText.trim(), category });
    router.push("/generate");
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.kicker}>Decision Committee</Text>
            <Title>今天要做什么决策？</Title>
          </View>
          <View style={styles.logoMark}>
            <Ionicons color={colors.primary} name="pulse-outline" size={22} />
          </View>
        </View>

        <Card style={styles.inputCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>决策输入</Text>
            <Text style={styles.status}>AI 可用</Text>
          </View>
          <InputBox
            multiline
            onChangeText={setRawText}
            placeholder="例如：我在纠结要不要换工作，当前公司稳定但成长慢，新机会薪资更高但不确定性也更强。"
            value={rawText}
          />
          <View style={styles.chips}>
            {categories.map((item) => (
              <Chip active={category === item} key={item} onPress={() => setCategory(item)}>
                {item}
              </Chip>
            ))}
          </View>
          <PrimaryButton icon="analytics-outline" onPress={startDecision}>
            生成决策报告
          </PrimaryButton>
        </Card>

        <View style={styles.marketStrip}>
          <View>
            <Text style={styles.marketLabel}>低后悔原则</Text>
            <Text style={styles.marketValue}>先识别可逆性，再投入资源</Text>
          </View>
          <Ionicons color={colors.success} name="trending-up-outline" size={23} />
        </View>

        <SectionTitle>最近决策</SectionTitle>
        {history.length > 0 ? (
          history.slice(0, 4).map((report) => (
            <RecentDecisionCard
              key={report.id}
              report={report}
              onPress={() => router.push({ pathname: "/result", params: { id: report.id } })}
            />
          ))
        ) : (
          <Card>
            <BodyText muted>还没有本地决策记录。第一份报告会自动保存在这里。</BodyText>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
    marginTop: spacing.lg
  },
  kicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: spacing.xs
  },
  logoMark: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  inputCard: {
    gap: spacing.md
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "900"
  },
  status: {
    backgroundColor: colors.successSoft,
    borderRadius: 999,
    color: colors.success,
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: spacing.sm,
    paddingVertical: 5
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  marketStrip: {
    alignItems: "center",
    backgroundColor: "#EDF3FA",
    borderColor: "#D8E2EF",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: spacing.lg,
    padding: spacing.md
  },
  marketLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "800"
  },
  marketValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4
  }
});
