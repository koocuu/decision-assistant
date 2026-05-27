import AsyncStorage from "@react-native-async-storage/async-storage";

const aiAuthKey = "decision-assistant:ai-auth";

export type AiAuth = {
  username: string;
  password: string;
};

export async function loadAiAuth() {
  const raw = await AsyncStorage.getItem(aiAuthKey);
  if (!raw) {
    const envAuth = process.env.EXPO_PUBLIC_AI_AUTH;
    if (!envAuth?.includes(":")) {
      return null;
    }

    const [username, ...passwordParts] = envAuth.split(":");
    return {
      username: username.trim(),
      password: passwordParts.join(":").trim()
    };
  }

  try {
    const parsed = JSON.parse(raw) as AiAuth;
    return parsed.username && parsed.password ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveAiAuth(auth: AiAuth) {
  await AsyncStorage.setItem(
    aiAuthKey,
    JSON.stringify({
      username: auth.username.trim(),
      password: auth.password.trim()
    })
  );
}

export async function clearAiAuth() {
  await AsyncStorage.removeItem(aiAuthKey);
}
