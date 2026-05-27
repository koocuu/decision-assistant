import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { colors, radii, spacing } from "../../src/theme/tokens";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700"
        },
        tabBarStyle: {
          height: 66,
          paddingTop: spacing.xs,
          paddingBottom: spacing.sm,
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1
        },
        tabBarItemStyle: {
          borderRadius: radii.md
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "控制台",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="grid-outline" size={size} />
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "历史",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="time-outline" size={size} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "设置",
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="settings-outline" size={size} />
        }}
      />
    </Tabs>
  );
}
