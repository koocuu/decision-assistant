import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { BodyText, Card, Label, PrimaryButton, Screen, SectionTitle, Title } from "../../src/components/Primitives";
import { getApiBaseUrl } from "../../src/services/api";
import { loadAiAuth, saveAiAuth } from "../../src/storage/auth";
import { clearHistory } from "../../src/storage/history";
import { colors, radii, spacing } from "../../src/theme/tokens";

export default function SettingsScreen() {
  const [clearing, setClearing] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authConfigured, setAuthConfigured] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadAiAuth().then((auth) => {
        setUsername(auth?.username ?? "");
        setPassword(auth?.password ?? "");
        setAuthConfigured(Boolean(auth));
      });
    }, [])
  );

  function confirmClear() {
    Alert.alert("清空本地历史", "这只会删除 App 本机历史，不会删除 Web 数据库中的记录。", [
      { text: "取消", style: "cancel" },
      {
        text: "清空",
        style: "destructive",
        onPress: async () => {
          setClearing(true);
          await clearHistory();
          setClearing(false);
        }
      }
    ]);
  }

  async function saveCredentials() {
    if (!username.trim() || !password) {
      Alert.alert("信息不完整", "请输入 AI 用户名和访问密码。");
      return;
    }

    await saveAiAuth({ username: username.trim(), password: password.trim() });
    setAuthConfigured(true);
    Alert.alert("已保存", "AI 功能会在本机自动使用这组访问密码。");
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Preferences</Text>
          <Title>设置</Title>
          <BodyText muted>0.1.0 先保持轻量，本地历史和远端 AI 服务分离。</BodyText>
        </View>

        <SectionTitle>服务状态</SectionTitle>
        <Card style={styles.statusCard}>
          <StatusRow label="API 地址" value={getApiBaseUrl()} state="ok" />
          <StatusRow label="AI 访问密码" value={authConfigured ? "已配置" : "未配置"} state={authConfigured ? "ok" : "warn"} />
          <StatusRow label="版本" value="0.1.0" state="ok" />
        </Card>

        <SectionTitle>AI 访问密码</SectionTitle>
        <Card style={styles.authCard}>
          <BodyText muted>这里保存的是当前 Web 端 Basic Auth 用户名和密码，仅用于调用 AI 接口。</BodyText>
          <TextInput
            autoCapitalize="none"
            onChangeText={setUsername}
            placeholder="用户名"
            placeholderTextColor={colors.textTertiary}
            style={styles.input}
            value={username}
          />
          <TextInput
            onChangeText={setPassword}
            placeholder="访问密码"
            placeholderTextColor={colors.textTertiary}
            secureTextEntry
            style={styles.input}
            value={password}
          />
          <PrimaryButton onPress={saveCredentials}>保存 AI 访问密码</PrimaryButton>
        </Card>

        <SectionTitle>本地数据</SectionTitle>
        <Pressable disabled={clearing} onPress={confirmClear} style={styles.dangerButton}>
          <View>
            <Text style={styles.dangerTitle}>清空本地历史</Text>
            <Text style={styles.dangerDescription}>不会影响线上数据库记录。</Text>
          </View>
          <Ionicons color={colors.danger} name="trash-outline" size={20} />
        </Pressable>

        <SectionTitle>账号</SectionTitle>
        <Card>
          <Label>预留能力</Label>
          <Text style={styles.placeholderTitle}>登录系统暂未启用</Text>
          <BodyText muted>后续可接入邮箱、GitHub 或 Apple 登录，并按用户隔离决策数据。</BodyText>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function StatusRow({ label, value, state }: { label: string; value: string; state: "ok" | "warn" }) {
  return (
    <View style={styles.statusRow}>
      <View style={[styles.statusDot, state === "warn" && styles.statusDotWarn]} />
      <View style={styles.statusBody}>
        <Text style={styles.statusLabel}>{label}</Text>
        <Text style={styles.statusValue}>{value}</Text>
      </View>
    </View>
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
  },
  statusCard: {
    gap: spacing.md
  },
  authCard: {
    gap: spacing.md,
    marginBottom: spacing.lg
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: spacing.md
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  },
  statusDot: {
    backgroundColor: colors.success,
    borderRadius: 5,
    height: 10,
    width: 10
  },
  statusDotWarn: {
    backgroundColor: "#D69200"
  },
  statusBody: {
    flex: 1
  },
  statusLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "800"
  },
  statusValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 3
  },
  dangerButton: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: "#F1C9C9",
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
    padding: spacing.lg
  },
  dangerTitle: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: "900"
  },
  dangerDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4
  },
  placeholderTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: spacing.sm,
    marginTop: spacing.sm
  }
});
