import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { RecentDecisionRow } from "../../src/components/DecisionCards";
import { AppText, Button, Card, Screen } from "../../src/components/Primitives";
import { Sheep } from "../../src/components/Sheep";
import { listDecisionReports } from "../../src/services/api";
import { loadHistory } from "../../src/storage/history";
import { colors, hairlineWidth, radii, spacing, tabularNums } from "../../src/theme/tokens";
import type { DecisionReport } from "../../src/types/decision";

function monthKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "未知时间";
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`;
}

export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<DecisionReport[]>([]);

  useFocusEffect(
    useCallback(() => {
      listDecisionReports()
        .then(setHistory)
        .catch(() => loadHistory().then(setHistory));
    }, [])
  );

  const grouped = useMemo(() => {
    const map = new Map<string, DecisionReport[]>();
    history.forEach((report) => {
      const key = monthKey(report.createdAt);
      const list = map.get(key) ?? [];
      list.push(report);
      map.set(key, list);
    });
    return Array.from(map.entries());
  }, [history]);

  const categoryStats = useMemo(() => {
    const counts = new Map<string, number>();
    history.forEach((report) => {
      counts.set(report.category, (counts.get(report.category) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [history]);

  const pendingReviewCount = useMemo(
    () => history.filter((report) => report.reviewStatus !== "reviewed" && !report.review).length,
    [history]
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>决策记录</Text>
          <Text style={styles.subtitle}>登录后跨端同步，匿名也会保留本机缓存</Text>
        </View>

        {history.length > 0 ? (
          <View style={styles.summary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>累计决策</Text>
              <Text style={styles.summaryValue}>{history.length}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>主要方向</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>
                {categoryStats[0]?.[0] || "—"}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>待复盘</Text>
              <Text style={styles.summaryValue}>{pendingReviewCount}</Text>
            </View>
          </View>
        ) : null}

        {grouped.length > 0 ? (
          grouped.map(([month, items]) => (
            <View key={month} style={styles.group}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupTitle}>{month}</Text>
                <Text style={styles.groupCount}>{items.length} 份</Text>
              </View>
              <Card padding={0}>
                {items.map((report, index) => (
                  <RecentDecisionRow
                    key={report.id}
                    report={report}
                    onPress={() => router.push({ pathname: "/result", params: { id: report.id } })}
                    showDivider={index !== items.length - 1}
                  />
                ))}
              </Card>
            </View>
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <View style={styles.emptySheep}>
              <Sheep size={64} mood="idle" />
            </View>
            <AppText variant="title" color={colors.textPrimary} align="center">
              暂无历史记录
            </AppText>
            <AppText
              variant="meta"
              color={colors.textSecondary}
              align="center"
              style={{ marginTop: spacing.sm, paddingHorizontal: spacing.xxl }}
            >
              去决策页生成第一份移动端报告，结果会自动保存在这里。
            </AppText>
            <Button
              variant="secondary"
              size="sm"
              fullWidth={false}
              onPress={() => router.push("/")}
            >
              去生成第一份报告
            </Button>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 104
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl
  },
  title: {
    fontSize: 26,
    color: colors.textPrimary,
    fontWeight: "600",
    letterSpacing: 0,
    lineHeight: 34
  },
  subtitle: {
    fontSize: 13,
    color: colors.textTertiary,
    fontWeight: "500",
    marginTop: 6
  },
  summary: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.sm
  },
  summaryDivider: {
    width: hairlineWidth,
    backgroundColor: colors.divider,
    marginVertical: spacing.xs
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: "500",
    letterSpacing: 0.3,
    marginBottom: 6
  },
  summaryValue: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "600",
    ...tabularNums
  },
  group: {
    marginBottom: spacing.xl
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.md
  },
  groupTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
    letterSpacing: 0.3,
    ...tabularNums
  },
  groupCount: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: "500"
  },
  emptyWrap: {
    alignItems: "center",
    paddingTop: spacing.xxxl * 2,
    paddingHorizontal: spacing.xl,
    gap: spacing.md
  },
  emptySheep: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: colors.warningSoft,
    alignItems: "center",
    justifyContent: "center"
  }
});
