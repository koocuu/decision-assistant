import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DecisionReport } from "../types/decision";

const historyKey = "decision-assistant:history";
const pendingInputKey = "decision-assistant:pending-input";

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

export async function clearHistory() {
  await AsyncStorage.removeItem(historyKey);
}

export async function findReport(id: string) {
  const current = await loadHistory();
  return current.find((item) => item.id === id) ?? null;
}

export async function setPendingInput(value: { rawText: string; category: string }) {
  await AsyncStorage.setItem(pendingInputKey, JSON.stringify(value));
}

export async function consumePendingInput() {
  const raw = await AsyncStorage.getItem(pendingInputKey);
  if (!raw) {
    return null;
  }

  await AsyncStorage.removeItem(pendingInputKey);

  try {
    return JSON.parse(raw) as { rawText: string; category: string };
  } catch {
    return null;
  }
}
