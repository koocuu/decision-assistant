import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DecisionReport, DecisionReview } from "../types/decision";

const historyKey = "decision-assistant:history";
const pendingInputKey = "decision-assistant:pending-input";

export type PendingDecisionInput = {
  rawText: string;
  category: string;
};

export async function loadHistory() {
  const raw = await AsyncStorage.getItem(historyKey);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as DecisionReport[];
  } catch {
    return [];
  }
}

export async function saveReport(report: DecisionReport) {
  const current = await loadHistory();
  const next = [report, ...current.filter((item) => item.id !== report.id)].slice(0, 50);
  await AsyncStorage.setItem(historyKey, JSON.stringify(next));
}

export async function updateReportReview(reportId: string, review: DecisionReview) {
  const current = await loadHistory();
  let updated = false;
  const next = current.map((item) => {
    if (item.id !== reportId) {
      return item;
    }
    updated = true;
    return {
      ...item,
      review,
      reviewStatus: "reviewed" as const
    };
  });

  if (!updated) {
    return false;
  }

  await AsyncStorage.setItem(historyKey, JSON.stringify(next));
  return true;
}

export async function clearHistory() {
  await AsyncStorage.removeItem(historyKey);
}

export async function findReport(id: string) {
  const current = await loadHistory();
  return current.find((item) => item.id === id) ?? null;
}

export async function setPendingInput(value: PendingDecisionInput) {
  await AsyncStorage.setItem(pendingInputKey, JSON.stringify(value));
}

export async function loadPendingInput() {
  const raw = await AsyncStorage.getItem(pendingInputKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PendingDecisionInput;
    return typeof parsed.rawText === "string" && typeof parsed.category === "string" && parsed.rawText.trim()
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export async function consumePendingInput() {
  const pendingInput = await loadPendingInput();
  await AsyncStorage.removeItem(pendingInputKey);
  return pendingInput;
}
