import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import {
  ActionChecklist,
  ConclusionCard,
  InsightCard,
  OptionReportCard,
  ReportMetricChips
} from "../src/components/DecisionCards";
import {
  AppText,
  Button,
  IconButton,
  Screen,
  ScreenHeader,
  SectionHeader,
  Tag
} from "../src/components/Primitives";
import { Sheep } from "../src/components/Sheep";
import { normalizeReportAnalysis } from "../src/services/normalizeReportAnalysis";
import { fetchDecisionReport, submitDecisionReview } from "../src/services/api";
import { findReport, updateReportReview } from "../src/storage/history";
import { colors, hairlineWidth, radii, spacing, tabularNums } from "../src/theme/tokens";
import type { DecisionReport, DecisionReview } from "../src/types/decision";

type ReviewChoice<T extends string> = {
  label: string;
  value: T;
};

const finalChoiceOptions: Array<ReviewChoice<DecisionReview["finalChoice"]>> = [
  { label: "采用推荐方案", value: "follow_recommendation" },
  { label: "选择了其他方案", value: "choose_other" },
  { label: "暂时没行动", value: "no_action" },
  { label: "还在观察", value: "still_observing" }
];

const regretOptions: Array<ReviewChoice<DecisionReview["regretLevel"]>> = [
  { label: "不后悔", value: "none" },
  { label: "有点后悔", value: "slight" },
  { label: "很后悔", value: "strong" },
  { label: "还不确定", value: "unknown" }
];

const outcomeOptions: Array<ReviewChoice<DecisionReview["outcome"]>> = [
  { label: "比预期更好", value: "better_than_expected" },
  { label: "基本符合预期", value: "as_expected" },
  { label: "比预期更差", value: "worse_than_expected" },
  { label: "还不确定", value: "unknown" }
];

function formatReportDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd} · ${hh}:${min}`;
}

function formatReviewDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

function labelOf<T extends string>(options: Array<ReviewChoice<T>>, value: T) {
  return options.find((item) => item.value === value)?.label ?? value;
}

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const [report, setReport] = useState<DecisionReport | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [finalChoice, setFinalChoice] = useState<DecisionReview["finalChoice"]>("follow_recommendation");
  const [regretLevel, setRegretLevel] = useState<DecisionReview["regretLevel"]>("unknown");
  const [outcome, setOutcome] = useState<DecisionReview["outcome"]>("unknown");
  const [note, setNote] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [reviewCelebrated, setReviewCelebrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      const id = params.id || "";
      const nextReport = await fetchDecisionReport(id).catch(() => findReport(id));

      if (!cancelled) {
        setReport(nextReport);
        setLoaded(true);
      }
    }

    loadReport();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  useEffect(() => {
    if (!reviewCelebrated) {
      return;
    }

    const timer = setTimeout(() => setReviewCelebrated(false), 1800);
    return () => clearTimeout(timer);
  }, [reviewCelebrated]);

  function openReviewModal() {
    const review = report?.review;
    setFinalChoice(review?.finalChoice ?? "follow_recommendation");
    setRegretLevel(review?.regretLevel ?? "unknown");
    setOutcome(review?.outcome ?? "unknown");
    setNote(review?.note ?? "");
    setReviewOpen(true);
  }

  async function saveReview() {
    if (!report) return;

    const review: DecisionReview = {
      reviewedAt: new Date().toISOString(),
      finalChoice,
      regretLevel,
      outcome,
      note: note.trim() || undefined
    };

    try {
      setSavingReview(true);
      await submitDecisionReview(report.id, review);
      const updated = await updateReportReview(report.id, review);
      if (!updated) {
        setReport({ ...report, review, reviewStatus: "reviewed" });
      } else {
        setReport({ ...report, review, reviewStatus: "reviewed" });
      }
      setReviewOpen(false);
      setReviewCelebrated(true);
    } catch {
      Alert.alert("保存失败", "复盘记录暂时没有保存成功，请稍后再试。");
    } finally {
      setSavingReview(false);
    }
  }

  if (loaded && !report) {
    return (
      <Screen>
        <ScreenHeader
          title="决策报告"
          left={<IconButton name="chevron-back" variant="ghost" onPress={() => router.back()} />}
        />
        <View style={styles.empty}>
          <AppText variant="meta" color={colors.textSecondary} align="center">
            没有找到这份本地决策报告
          </AppText>
          <View style={{ width: 200, marginTop: spacing.lg }}>
            <Button onPress={() => router.replace("/")}>返回首页</Button>
          </View>
        </View>
      </Screen>
    );
  }

  if (!report) {
    return <Screen />;
  }

  const normalized = normalizeReportAnalysis(report);

  return (
    <Screen>
      <ScreenHeader
        title="决策报告"
        left={<IconButton name="chevron-back" variant="ghost" onPress={() => router.back()} />}
        right={<IconButton name="share-outline" variant="ghost" />}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.reportMeta}>
          <View style={styles.reportMetaTop}>
            <Tag tone="primary">{report.category}</Tag>
            <Text style={styles.reportDate}>{formatReportDate(report.createdAt)}</Text>
          </View>
          <Text style={styles.reportTitle}>{report.title}</Text>
        </View>

        <ConclusionCard
          recommendationTitle={normalized.recommendationTitle}
          strength={normalized.confidence}
          regretRisk={normalized.regretRisk}
          reviewWindow={normalized.reviewWindow}
          oneSentence={normalized.oneSentence}
        />

        <ReportMetricChips
          confidence={normalized.confidence}
          reversibility={normalized.reversibility}
          regretRisk={normalized.regretRisk}
          styleTag={normalized.decisionStyle}
        />

        <InsightCard
          realProblem={normalized.realProblem}
          factors={normalized.factors.length ? normalized.factors : ["不确定性", "机会成本"]}
          action={normalized.action}
          reviewTime={normalized.reviewWindow}
        />

        <ActionChecklist items={normalized.actionPlan} />

        <ReviewCard
          report={report}
          reviewDueAt={normalized.reviewDueAt}
          onPress={openReviewModal}
        />

        <SectionHeader
          title="方案摘要"
          caption={
            normalized.draftOptions.length
              ? `共 ${normalized.draftOptions.length} 个候选方案`
              : "当前报告以文本建议为主"
          }
        />
        {normalized.draftOptions.length ? (
          <View style={{ gap: 0 }}>
            {normalized.draftOptions.map((option, index) => {
              const optionReport = normalized.optionAnalysis[index] ?? {
                pros: [],
                cons: [],
                regretCost: ""
              };
              return (
                <OptionReportCard
                  key={`${option.label}-${index}`}
                  index={index}
                  label={option.label || `方案 ${index + 1}`}
                  description={option.description}
                  pros={Array.isArray(optionReport.pros) ? optionReport.pros : []}
                  cons={Array.isArray(optionReport.cons) ? optionReport.cons : []}
                  regretCost={optionReport.regretCost}
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.textFallback}>
            <Text style={styles.textFallbackTitle}>报告摘要</Text>
            <Text style={styles.textFallbackBody}>{normalized.summary}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            报告基于当前输入生成，适合用于辅助判断。重要决策建议结合现实信息复核。
          </Text>
        </View>
      </ScrollView>

      <ReviewModal
        visible={reviewOpen}
        finalChoice={finalChoice}
        regretLevel={regretLevel}
        outcome={outcome}
        note={note}
        saving={savingReview}
        onChangeFinalChoice={setFinalChoice}
        onChangeRegretLevel={setRegretLevel}
        onChangeOutcome={setOutcome}
        onChangeNote={setNote}
        onCancel={() => setReviewOpen(false)}
        onSave={saveReview}
      />

      {reviewCelebrated ? (
        <View pointerEvents="none" style={styles.celebrateToast}>
          <Sheep size={46} mood="celebrate" animate />
          <Text style={styles.celebrateToastText}>复盘已保存</Text>
        </View>
      ) : null}
    </Screen>
  );
}

function ReviewCard({
  report,
  reviewDueAt,
  onPress
}: {
  report: DecisionReport;
  reviewDueAt: string;
  onPress: () => void;
}) {
  const review = report.review;

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewHeaderText}>
          <Text style={styles.reviewTitle}>{review ? "已复盘" : "复盘这个决策"}</Text>
          <Text style={styles.reviewCaption}>
            {review ? "这次决策已经形成一条本地复盘记录" : "到复盘窗口后，记录你最后怎么选、有没有后悔。"}
          </Text>
        </View>
        <Tag tone={review ? "success" : "neutral"}>{review ? "已复盘" : "待复盘"}</Tag>
      </View>

      {review ? (
        <View style={styles.reviewRows}>
          <ReviewRow label="最终选择" value={labelOf(finalChoiceOptions, review.finalChoice)} />
          <ReviewRow label="后悔程度" value={labelOf(regretOptions, review.regretLevel)} />
          <ReviewRow label="结果评价" value={labelOf(outcomeOptions, review.outcome)} />
          <ReviewRow label="复盘时间" value={formatReviewDate(review.reviewedAt)} />
          {review.note ? <ReviewRow label="提醒自己" value={review.note} multiline /> : null}
        </View>
      ) : (
        <View style={styles.reviewPendingBox}>
          <Text style={styles.reviewPendingLabel}>建议复盘时间</Text>
          <Text style={styles.reviewPendingValue}>{formatReviewDate(reviewDueAt) || "7 天后"}</Text>
        </View>
      )}

      <Button size="sm" variant={review ? "secondary" : "primary"} onPress={onPress}>
        {review ? "修改复盘" : "现在复盘"}
      </Button>
    </View>
  );
}

function ReviewRow({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <View style={[styles.reviewRow, multiline ? styles.reviewRowMultiline : null]}>
      <Text style={styles.reviewRowLabel}>{label}</Text>
      <Text style={[styles.reviewRowValue, multiline ? styles.reviewRowValueBlock : null]}>{value}</Text>
    </View>
  );
}

function ReviewModal({
  visible,
  finalChoice,
  regretLevel,
  outcome,
  note,
  saving,
  onChangeFinalChoice,
  onChangeRegretLevel,
  onChangeOutcome,
  onChangeNote,
  onCancel,
  onSave
}: {
  visible: boolean;
  finalChoice: DecisionReview["finalChoice"];
  regretLevel: DecisionReview["regretLevel"];
  outcome: DecisionReview["outcome"];
  note: string;
  saving: boolean;
  onChangeFinalChoice: (value: DecisionReview["finalChoice"]) => void;
  onChangeRegretLevel: (value: DecisionReview["regretLevel"]) => void;
  onChangeOutcome: (value: DecisionReview["outcome"]) => void;
  onChangeNote: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.modalScrim}>
        <View style={styles.modalCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>复盘这个决策</Text>
            <Text style={styles.modalCaption}>只记录关键反馈，帮助下一次判断更稳。</Text>

            <ReviewOptionGroup
              title="你最后怎么选了？"
              options={finalChoiceOptions}
              value={finalChoice}
              onChange={onChangeFinalChoice}
            />
            <ReviewOptionGroup
              title="现在后悔吗？"
              options={regretOptions}
              value={regretLevel}
              onChange={onChangeRegretLevel}
            />
            <ReviewOptionGroup
              title="结果比预期如何？"
              options={outcomeOptions}
              value={outcome}
              onChange={onChangeOutcome}
            />

            <View style={styles.noteBlock}>
              <Text style={styles.optionGroupTitle}>下次类似决策要提醒自己什么？</Text>
              <TextInput
                value={note}
                onChangeText={onChangeNote}
                placeholder="可选，例如：不要只看短期情绪，先验证真实成本。"
                placeholderTextColor={colors.textTertiary}
                multiline
                textAlignVertical="top"
                style={styles.noteInput}
              />
            </View>

            <View style={styles.modalActions}>
              <Button variant="secondary" size="md" onPress={onCancel} disabled={saving}>
                取消
              </Button>
              <Button size="md" onPress={onSave} loading={saving}>
                保存复盘
              </Button>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ReviewOptionGroup<T extends string>({
  title,
  options,
  value,
  onChange
}: {
  title: string;
  options: Array<ReviewChoice<T>>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.optionGroup}>
      <Text style={styles.optionGroupTitle}>{title}</Text>
      <View style={styles.optionChips}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.optionChip,
                active ? styles.optionChipActive : null,
                pressed ? { opacity: 0.78 } : null
              ]}
            >
              <Text style={[styles.optionChipText, active ? styles.optionChipTextActive : null]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg
  },
  reportMeta: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs
  },
  reportMetaTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md
  },
  reportDate: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: "500",
    ...tabularNums
  },
  reportTitle: {
    fontSize: 22,
    color: colors.textPrimary,
    fontWeight: "600",
    lineHeight: 30,
    letterSpacing: 0
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl
  },
  footer: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xs
  },
  footerText: {
    fontSize: 11,
    color: colors.textTertiary,
    lineHeight: 18,
    textAlign: "center"
  },
  textFallback: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: hairlineWidth,
    padding: spacing.xl
  },
  textFallbackTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.sm
  },
  textFallbackBody: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22
  },
  reviewCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: hairlineWidth,
    padding: spacing.xl,
    gap: spacing.lg
  },
  reviewHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  reviewHeaderText: {
    flex: 1
  },
  reviewTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 24
  },
  reviewCaption: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4
  },
  reviewRows: {
    borderTopColor: colors.divider,
    borderTopWidth: hairlineWidth
  },
  reviewRow: {
    alignItems: "center",
    borderBottomColor: colors.divider,
    borderBottomWidth: hairlineWidth,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.md
  },
  reviewRowMultiline: {
    alignItems: "flex-start",
    flexDirection: "column"
  },
  reviewRowLabel: {
    color: colors.textTertiary,
    fontSize: 12,
    fontWeight: "600"
  },
  reviewRowValue: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 21,
    textAlign: "right"
  },
  reviewRowValueBlock: {
    textAlign: "left"
  },
  reviewPendingBox: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: hairlineWidth,
    padding: spacing.md
  },
  reviewPendingLabel: {
    color: colors.textTertiary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4
  },
  reviewPendingValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600"
  },
  modalScrim: {
    alignItems: "center",
    backgroundColor: colors.scrim,
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg
  },
  modalCard: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: hairlineWidth,
    maxHeight: "92%",
    padding: spacing.xl,
    width: "100%"
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 28
  },
  modalCaption: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: spacing.lg
  },
  optionGroup: {
    marginBottom: spacing.lg
  },
  optionGroupTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.sm
  },
  optionChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  optionChip: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  optionChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary
  },
  optionChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "500"
  },
  optionChipTextActive: {
    color: colors.primary,
    fontWeight: "600"
  },
  noteBlock: {
    marginBottom: spacing.lg
  },
  noteInput: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: hairlineWidth,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 21,
    minHeight: 88,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md
  },
  modalActions: {
    gap: spacing.md
  },
  celebrateToast: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: hairlineWidth,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: "absolute",
    top: spacing.xl,
    shadowColor: colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3
  },
  celebrateToastText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "600"
  }
});
