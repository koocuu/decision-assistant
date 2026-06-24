import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ListGroup, ListRow } from "../../src/components/ListRow";
import { AppText, Button, Screen } from "../../src/components/Primitives";
import { getApiBaseUrl } from "../../src/services/api";
import { clearAiAuth, loadAiAuth, saveAiAuth } from "../../src/storage/auth";
import { clearHistory, loadHistory } from "../../src/storage/history";
import { colors, hairlineWidth, radii, spacing } from "../../src/theme/tokens";

const APP_VERSION = "0.1.0";

export default function SettingsScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authConfigured, setAuthConfigured] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [draftUsername, setDraftUsername] = useState("");
  const [draftPassword, setDraftPassword] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadAiAuth().then((auth) => {
        setUsername(auth?.username ?? "");
        setPassword(auth?.password ?? "");
        setAuthConfigured(Boolean(auth));
      });
      loadHistory().then((items) => setHistoryCount(items.length));
    }, [])
  );

  function openAuthModal() {
    setDraftUsername(username);
    setDraftPassword(password);
    setAuthModalOpen(true);
  }

  async function confirmSave() {
    if (!draftUsername.trim() || !draftPassword) {
      Alert.alert("信息不完整", "请输入 AI 用户名和访问密码。");
      return;
    }
    await saveAiAuth({ username: draftUsername.trim(), password: draftPassword.trim() });
    setUsername(draftUsername.trim());
    setPassword(draftPassword.trim());
    setAuthConfigured(true);
    setAuthModalOpen(false);
  }

  function confirmClearAuth() {
    Alert.alert("移除 AI 访问密码", "之后需要重新输入才能使用 AI 接口。", [
      { text: "取消", style: "cancel" },
      {
        text: "移除",
        style: "destructive",
        onPress: async () => {
          await clearAiAuth();
          setUsername("");
          setPassword("");
          setAuthConfigured(false);
        }
      }
    ]);
  }

  function confirmClearHistory() {
    Alert.alert("清空本地历史", "只删除 App 本机历史，不影响 Web 数据库。", [
      { text: "取消", style: "cancel" },
      {
        text: "清空",
        style: "destructive",
        onPress: async () => {
          await clearHistory();
          setHistoryCount(0);
        }
      }
    ]);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>我的</Text>
          <Text style={styles.subtitle}>账号、连接与本地数据</Text>
        </View>

        {/* Profile placeholder */}
        <Pressable style={({ pressed }) => [styles.profile, pressed ? { opacity: 0.85 } : null]}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={22} color={colors.textSecondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileTitle}>未登录</Text>
            <Text style={styles.profileMeta}>账号同步将在后续版本开放</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </Pressable>

        <ListGroup title="服务连接">
          <ListRow
            icon="cloud-outline"
            iconTone="primary"
            title="AI 接口"
            value={getApiBaseUrl().replace(/^https?:\/\//, "")}
            subtitle={authConfigured ? "本地配置 · 已就绪" : "本地配置 · 未验证"}
            trailing="none"
            isFirst
          />
          <ListRow
            icon="key-outline"
            iconTone={authConfigured ? "success" : "warning"}
            title="访问密码"
            subtitle={authConfigured ? "已配置 · ••••••" : "未配置，无法调用 AI 接口"}
            onPress={openAuthModal}
            isLast
          />
        </ListGroup>

        <ListGroup title="本地数据" style={{ marginTop: spacing.xl }}>
          <ListRow
            icon="albums-outline"
            iconTone="neutral"
            title="本地历史"
            value={`${historyCount} 份`}
            trailing="none"
            isFirst
          />
          <ListRow
            icon="trash-outline"
            iconTone="danger"
            title="清空本地历史"
            onPress={historyCount > 0 ? confirmClearHistory : undefined}
            destructive
            trailing="none"
          />
          {authConfigured ? (
            <ListRow
              icon="log-out-outline"
              iconTone="danger"
              title="移除 AI 访问密码"
              onPress={confirmClearAuth}
              destructive
              trailing="none"
              isLast
            />
          ) : (
            <ListRow icon="lock-closed-outline" iconTone="neutral" title="AI 密码未保存" trailing="none" isLast />
          )}
        </ListGroup>

        <ListGroup title="关于" style={{ marginTop: spacing.xl }}>
          <ListRow title="版本" value={APP_VERSION} trailing="none" isFirst />
          <ListRow title="反馈与建议" trailing="chevron" onPress={() => {}} />
          <ListRow title="服务条款" trailing="chevron" onPress={() => {}} isLast />
        </ListGroup>

        <Text style={styles.footer}>Decision Assistant · v{APP_VERSION}</Text>
      </ScrollView>

      <Modal visible={authModalOpen} animationType="slide" transparent onRequestClose={() => setAuthModalOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setAuthModalOpen(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <AppText variant="titleLg">配置 AI 访问密码</AppText>
          <AppText variant="meta" color={colors.textSecondary} style={{ marginTop: 6, marginBottom: spacing.xl }}>
            这里保存的是 Web 端 Basic Auth 用户名和密码，仅用于调用 AI 接口。
          </AppText>
          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>用户名</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setDraftUsername}
              placeholder="例如 admin"
              placeholderTextColor={colors.textTertiary}
              style={styles.modalInput}
              value={draftUsername}
            />
          </View>
          <View style={styles.modalField}>
            <Text style={styles.modalLabel}>访问密码</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setDraftPassword}
              placeholder="输入访问密码"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry
              style={styles.modalInput}
              value={draftPassword}
            />
          </View>
          <View style={styles.modalActions}>
            <View style={{ flex: 1 }}>
              <Button variant="secondary" onPress={() => setAuthModalOpen(false)}>
                取消
              </Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button onPress={confirmSave}>保存</Button>
            </View>
          </View>
        </View>
      </Modal>
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
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.xl
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center"
  },
  profileTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "600"
  },
  profileMeta: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2
  },
  footer: {
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: "center",
    marginTop: spacing.xxl,
    letterSpacing: 0.3
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.scrim
  },
  modalSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    alignSelf: "center",
    marginBottom: spacing.lg
  },
  modalField: {
    marginBottom: spacing.lg
  },
  modalLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: "500",
    letterSpacing: 0.3,
    marginBottom: spacing.sm
  },
  modalInput: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    borderWidth: hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 48
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm
  }
});
