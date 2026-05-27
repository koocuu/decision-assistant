import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { RecentDecisionCard } from "../../src/components/DecisionCards";
import { BodyText, Card, Screen, SectionTitle, Title } from "../../src/components/Primitives";
import { loadHistory } from "../../src/storage/history";
import { colors, spacing } from "../../src/theme/tokens";
import type { DecisionReport } from "../../src/types/decision";

export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<DecisionReport[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadHistory().then(setHistory);
    }, [])
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Decision Ledger</Text>
          <Title>历史决策</Title>
          <BodyText muted>只保存移动端本地生成的报告，适合快速回看自己的判断轨迹。</BodyText>
        </View>

        <SectionTitle>全部记录</SectionTitle>
        {history.length > 0 ? (
          history.map((report) => (
            <RecentDecisionCard
              key={report.id}
              report={report}
              onPress={() => router.push({ pathname: "/result", params: { id: report.id } })}
            />
          ))
        ) : (
          <Card>
            <BodyText muted>暂无历史记录。去控制台生成第一份移动端决策报告。</BodyText>
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
  header: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
    marginTop: spacing.lg
  },
  kicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900"
  }
});
