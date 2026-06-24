import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { RecentDecisionRow } from "../../src/components/DecisionCards";
import {
  AppText,
  Button,
  Card,
  Chip,
  Input,
  Screen,
  SectionHeader
} from "../../src/components/Primitives";
import { Sheep } from "../../src/components/Sheep";
import { loadAiAuth } from "../../src/storage/auth";
import { loadHistory, loadPendingInput, setPendingInput } from "../../src/storage/history";
import { colors, hairlineWidth, radii, spacing, tabularNums } from "../../src/theme/tokens";
import { decisionCategories, type DecisionCategory, type DecisionReport } from "../../src/types/decision";

const categories: DecisionCategory[] = [...decisionCategories];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "深夜好";
  if (hour < 11) return "早上好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

export default function DashboardScreen() {
  const router = useRouter();
  const [rawText, setRawText] = useState("");
  const [category, setCategory] = useState<DecisionCategory>("工作");
  const [history, setHistory] = useState<DecisionReport[]>([]);
  const [authConfigured, setAuthConfigured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const stats = useMemo(() => {
    const now = new Date();
    const pending = history.filter(
      (report) => report.reviewStatus !== "reviewed" && !report.review
    ).length;
    const thisMonth = history.filter((report) => {
      const date = new Date(report.createdAt);
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    }).length;
    return { total: history.length, pending, thisMonth };
  }, [history]);

  useFocusEffect(
    useCallback(() => {
      loadHistory().then(setHistory);
      loadAiAuth().then((auth) => setAuthConfigured(Boolean(auth)));
      loadPendingInput().then((pendingInput) => {
        if (!pendingInput) return;
        setRawText(pendingInput.rawText);
        if ((decisionCategories as readonly string[]).includes(pendingInput.category)) {
          setCategory(pendingInput.category as DecisionCategory);
        }
      });
    }, [])
  );

  async function startDecision() {
    if (!rawText.trim()) {
      Alert.alert("先写下问题", "用一两句话描述你正在纠结的选择。");
      return;
    }

    const auth = await loadAiAuth();
    if (!auth) {
      setAuthConfigured(false);
      Alert.alert(
        "需要配置 AI 访问密码",
        "移动端会连接 decision.koocuu.com 的 AI 接口，请先在「我的」中保存访问密码。",
        [
          { text: "稍后", style: "cancel" },
          { text: "去设置", onPress: () => router.push("/settings") }
        ]
      );
      return;
    }

    setSubmitting(true);
    await setPendingInput({ rawText: rawText.trim(), category });
    router.push("/generate");
    setTimeout(() => setSubmitting(false), 500);
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.topBarText}>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.hero}>今天有什么纠结，{"\n"}说给我听？</Text>
          </View>
          <View style={styles.sheepBubble}>
            <Sheep size={58} mood="idle" animate />
          </View>
        </View>

        {/* Stat overview — the "hero numbers", like a market overview */}
        <Pressable
          style={styles.stats}
          onPress={() => router.push("/history")}
          disabled={history.length === 0}
        >
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>累计决策</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statValue, stats.pending > 0 ? { color: colors.primary } : null]}>
              {stats.pending}
            </Text>
            <Text style={styles.statLabel}>待复盘</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{stats.thisMonth}</Text>
            <Text style={styles.statLabel}>本月</Text>
          </View>
        </Pressable>

        {/* Input card */}
        <Card padding={spacing.lg} style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputHeaderTitle}>写下你的问题</Text>
            <View style={styles.inputStatus}>
              <View
                style={[styles.inputStatusDot, authConfigured ? { backgroundColor: colors.success } : { backgroundColor: colors.warning }]}
              />
              <Text style={[styles.inputStatusText, !authConfigured ? { color: colors.warning } : null]}>
                {authConfigured ? "小羊已就绪" : "未配置 AI"}
              </Text>
            </View>
          </View>

          <Input
            multiline
            onChangeText={setRawText}
            placeholder="例如：我在纠结要不要换工作。现在岗位稳定但成长慢，新机会薪资更高但有不确定性。"
            value={rawText}
          />

          <View style={styles.chipScroll}>
            {categories.map((item) => (
              <Chip active={category === item} key={item} onPress={() => setCategory(item)}>
                {item}
              </Chip>
            ))}
          </View>

          <Button icon="arrow-forward" onPress={startDecision} loading={submitting} size="lg">
            生成决策报告
          </Button>
        </Card>

        {/* Templates */}
        <SectionHeader title="常用模板" caption="选择一个更具体的场景，快速开始分析" />
        <View style={styles.quickGrid}>
          {templates.map((item) => (
            <TemplateCard
              key={item.label}
              icon={item.icon}
              label={item.label}
              caption={item.caption}
              onPress={() => {
                setRawText(item.prompt);
                setCategory(item.category);
              }}
              active={rawText === item.prompt}
            />
          ))}
        </View>

        {/* Recent decisions */}
        <SectionHeader
          title="最近决策"
          action={
            history.length > 4 ? (
              <Pressable onPress={() => router.push("/history")} hitSlop={6}>
                <Text style={styles.sectionAction}>查看全部</Text>
              </Pressable>
            ) : undefined
          }
        />
        <Card padding={0}>
          {history.length > 0 ? (
            history.slice(0, 4).map((report, index, arr) => (
              <RecentDecisionRow
                key={report.id}
                report={report}
                onPress={() => router.push({ pathname: "/result", params: { id: report.id } })}
                showDivider={index !== arr.length - 1}
              />
            ))
          ) : (
            <View style={styles.emptyHistory}>
              <View style={styles.emptySheep}>
                <Sheep size={56} mood="idle" />
              </View>
              <AppText variant="meta" color={colors.textSecondary}>
                还没有决策记录
              </AppText>
              <AppText variant="caption" color={colors.textTertiary} style={{ marginTop: 4 }}>
                写下第一个纠结，小羊帮你理
              </AppText>
            </View>
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const templates: Array<{
  label: string;
  caption: string;
  prompt: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  category: DecisionCategory;
}> = [
  {
    label: "跳槽还是留下",
    caption: "职业选择",
    prompt: "我在纠结要不要跳槽。当前工作比较稳定，但成长和收入空间有限；新机会看起来更有上升空间，但也有不确定性。",
    icon: "briefcase-outline",
    category: "工作"
  },
  {
    label: "现在要不要加仓",
    caption: "投资判断",
    prompt: "我在纠结现在要不要加仓。当前价格已经波动了一段时间，我担心错过机会，也担心继续下跌带来更大回撤。",
    icon: "trending-up-outline",
    category: "投资"
  },
  {
    label: "要不要继续联系",
    caption: "情感关系",
    prompt: "我在纠结要不要继续联系对方。继续投入可能还有机会，但也让我消耗很多；停止联系会轻松一些，但我担心之后后悔。",
    icon: "heart-outline",
    category: "情感"
  },
  {
    label: "这笔消费值不值",
    caption: "消费决策",
    prompt: "我在纠结这笔消费值不值。它能解决当前需求，也会带来体验提升，但价格不低，我担心买完之后使用频率不高。",
    icon: "card-outline",
    category: "消费"
  }
];

function TemplateCard({
  label,
  caption,
  icon,
  active,
  onPress
}: {
  label: string;
  caption: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickItem,
        active ? styles.quickItemActive : null,
        pressed ? { opacity: 0.7 } : null
      ]}
    >
      <View style={[styles.quickIcon, active ? styles.quickIconActive : null]}>
        <Ionicons name={icon} size={17} color={active ? colors.primary : colors.textSecondary} />
      </View>
      <View style={styles.quickText}>
        <Text style={styles.quickLabel}>{label}</Text>
        <Text style={styles.quickCaption}>{caption}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 104
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingTop: spacing.md,
    marginBottom: spacing.xl
  },
  topBarText: {
    flex: 1
  },
  greeting: {
    fontSize: 13,
    color: colors.textTertiary,
    fontWeight: "500",
    marginBottom: 6
  },
  hero: {
    fontSize: 25,
    color: colors.textPrimary,
    fontWeight: "600",
    letterSpacing: 0,
    lineHeight: 33
  },
  sheepBubble: {
    width: 74,
    height: 74,
    borderRadius: 24,
    backgroundColor: colors.warningSoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg
  },
  statCell: {
    flex: 1,
    alignItems: "center"
  },
  statDivider: {
    width: hairlineWidth,
    alignSelf: "stretch",
    marginVertical: spacing.sm,
    backgroundColor: colors.divider
  },
  statValue: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: "600",
    letterSpacing: -0.4,
    marginBottom: 5,
    ...tabularNums
  },
  statLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: "500",
    letterSpacing: 0.3
  },
  inputCard: {
    marginBottom: spacing.xxl,
    gap: spacing.md
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  inputHeaderTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "600",
    letterSpacing: 0
  },
  inputStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  inputStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  inputStatusText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: "500"
  },
  chipScroll: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.xxl
  },
  quickItem: {
    width: "47.5%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md
  },
  quickItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  quickIcon: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center"
  },
  quickIconActive: {
    backgroundColor: colors.card
  },
  quickLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
    lineHeight: 19
  },
  quickText: {
    flex: 1
  },
  quickCaption: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: "500",
    marginTop: 2
  },
  sectionAction: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "500"
  },
  emptyHistory: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    gap: 2
  },
  emptySheep: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.warningSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md
  }
});
