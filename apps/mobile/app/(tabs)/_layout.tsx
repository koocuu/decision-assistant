import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { colors, hairlineWidth } from "../../src/theme/tokens";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
          marginTop: 0
        },
        tabBarIconStyle: {
          marginBottom: 1
        },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: hairlineWidth,
          height: Platform.OS === "ios" ? 78 : 58,
          paddingTop: 6,
          paddingBottom: Platform.OS === "ios" ? 22 : 6,
          shadowColor: colors.textPrimary,
          shadowOpacity: 0.03,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
          elevation: 1
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "决策",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="compass-outline" size={focused ? 22 : 21} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "记录",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="albums-outline" size={focused ? 22 : 21} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "我的",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name="person-circle-outline" size={focused ? 23 : 22} color={color} />
          )
        }}
      />
    </Tabs>
  );
}
