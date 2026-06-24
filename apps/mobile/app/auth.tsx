import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { AppText, Button, Card, IconButton, Input, Screen, ScreenHeader } from "../src/components/Primitives";
import { Sheep } from "../src/components/Sheep";
import { login, register } from "../src/services/api";
import { colors, spacing } from "../src/theme/tokens";

type Mode = "login" | "register";

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isRegister = mode === "register";

  async function submit() {
    if (!email.trim() || !password) {
      Alert.alert("还差一点", "请输入邮箱和密码。");
      return;
    }

    if (isRegister && password.length < 8) {
      Alert.alert("密码太短", "密码至少需要 8 位。");
      return;
    }

    try {
      setSubmitting(true);
      const user = isRegister ? await register(email, password) : await login(email, password);
      Alert.alert("已登录", user?.email || "账号已同步。");
      router.replace("/settings");
    } catch (error) {
      Alert.alert("操作失败", error instanceof Error ? error.message : "请稍后再试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <ScreenHeader
        title={isRegister ? "创建账号" : "登录账号"}
        left={<IconButton name="chevron-back" variant="ghost" onPress={() => router.back()} />}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.sheepBubble}>
              <Sheep size={72} mood="idle" animate />
            </View>
            <AppText variant="headline" align="center">
              {isRegister ? "把匿名记录收进账号" : "欢迎回来"}
            </AppText>
            <AppText variant="meta" color={colors.textSecondary} align="center" style={styles.heroText}>
              {isRegister
                ? "注册后，当前设备上的匿名决策会自动同步到这个账号。"
                : "登录后可以在 Web 和 App 之间查看同一份历史记录。"}
            </AppText>
          </View>

          <Card style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>邮箱</Text>
              <Input
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="you@example.com"
                value={email}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>密码</Text>
              <Input
                autoCapitalize="none"
                autoComplete={isRegister ? "new-password" : "current-password"}
                onChangeText={setPassword}
                placeholder="至少 8 位"
                secureTextEntry
                value={password}
              />
            </View>
            <Button onPress={submit} loading={submitting} size="lg">
              {isRegister ? "注册并登录" : "登录"}
            </Button>
            <Button
              variant="ghost"
              onPress={() => setMode(isRegister ? "login" : "register")}
              disabled={submitting}
            >
              {isRegister ? "已有账号，去登录" : "没有账号，创建一个"}
            </Button>
          </Card>

          <Button variant="secondary" onPress={() => router.replace("/settings")}>
            跳过，匿名继续
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg
  },
  hero: {
    alignItems: "center",
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl
  },
  sheepBubble: {
    alignItems: "center",
    backgroundColor: colors.warningSoft,
    borderRadius: 28,
    height: 92,
    justifyContent: "center",
    marginBottom: spacing.lg,
    width: 92
  },
  heroText: {
    marginTop: spacing.sm,
    lineHeight: 20
  },
  form: {
    gap: spacing.lg
  },
  field: {
    gap: spacing.sm
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600"
  }
});
