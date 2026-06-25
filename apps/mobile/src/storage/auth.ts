import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const anonIdKey = "anonId";
const sessionTokenKey = "decision_assistant_session_token";

function createUuid() {
  const cryptoValue = globalThis.crypto?.randomUUID?.();
  if (cryptoValue) {
    return cryptoValue;
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export async function getAnonId() {
  const existing = await AsyncStorage.getItem(anonIdKey);
  if (existing) {
    return existing;
  }

  const created = createUuid();
  await AsyncStorage.setItem(anonIdKey, created);
  return created;
}

export async function getSessionToken() {
  return SecureStore.getItemAsync(sessionTokenKey);
}

export async function saveSessionToken(token: string) {
  await SecureStore.setItemAsync(sessionTokenKey, token);
}

export async function clearSessionToken() {
  await SecureStore.deleteItemAsync(sessionTokenKey);
}
