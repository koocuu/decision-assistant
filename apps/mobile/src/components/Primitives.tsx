import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  View,
  type ViewStyle
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, hairlineWidth, radii, shadows, spacing, tabularNums, text } from "../theme/tokens";

type Edge = "top" | "right" | "bottom" | "left";

export function Screen({
  children,
  edges = ["top"]
}: {
  children?: ReactNode;
  edges?: ReadonlyArray<Edge>;
}) {
  return (
    <SafeAreaView edges={edges} style={styles.screen}>
      {children}
    </SafeAreaView>
  );
}

export function Card({
  children,
  style,
  padding = spacing.lg,
  variant = "default"
}: {
  children: ReactNode;
  style?: ViewStyle;
  padding?: number;
  variant?: "default" | "subtle" | "outlined";
}) {
  const base =
    variant === "subtle"
      ? styles.cardSubtle
      : variant === "outlined"
        ? styles.cardOutlined
        : styles.card;
  return <View style={[base, { padding }, style]}>{children}</View>;
}

export function Divider({ style, inset = 0 }: { style?: ViewStyle; inset?: number }) {
  return <View style={[styles.divider, { marginLeft: inset }, style]} />;
}

type TextVariant = keyof typeof text;

export function AppText({
  children,
  variant = "body",
  color,
  align,
  numeric = false,
  numberOfLines,
  style,
  weight
}: {
  children: ReactNode;
  variant?: TextVariant;
  color?: string;
  align?: TextStyle["textAlign"];
  numeric?: boolean;
  numberOfLines?: number;
  style?: TextStyle;
  weight?: TextStyle["fontWeight"];
} & Pick<TextProps, "numberOfLines">) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        text[variant],
        color ? { color } : null,
        align ? { textAlign: align } : null,
        weight ? { fontWeight: weight } : null,
        numeric ? tabularNums : null,
        style
      ]}
    >
      {children}
    </Text>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  left,
  right
}: {
  title?: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerSide}>{left}</View>
      <View style={styles.headerCenter}>
        {title ? (
          <AppText variant="title" align="center" numberOfLines={1}>
            {title}
          </AppText>
        ) : null}
        {subtitle ? (
          <AppText variant="caption" align="center" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.headerSide, styles.headerSideRight]}>{right}</View>
    </View>
  );
}

export function SectionHeader({
  title,
  action,
  caption
}: {
  title: string;
  action?: ReactNode;
  caption?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderText}>
        <AppText variant="caption" color={colors.textSecondary} weight="600">
          {title}
        </AppText>
        {caption ? (
          <AppText variant="micro" color={colors.textTertiary} style={{ marginTop: 2 }}>
            {caption}
          </AppText>
        ) : null}
      </View>
      {action}
    </View>
  );
}

export function IconButton({
  name,
  onPress,
  variant = "ghost",
  size = 36
}: {
  name: ComponentProps<typeof Ionicons>["name"];
  onPress?: () => void;
  variant?: "ghost" | "soft" | "primary";
  size?: number;
}) {
  const palette =
    variant === "primary"
      ? { bg: colors.primary, fg: "#FFFFFF" }
      : variant === "soft"
        ? { bg: colors.primarySoft, fg: colors.primary }
        : { bg: colors.card, fg: colors.textPrimary };
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        { width: size, height: size, backgroundColor: palette.bg },
        variant === "ghost" ? styles.iconButtonGhost : null,
        pressed ? { opacity: 0.7 } : null
      ]}
      hitSlop={6}
    >
      <Ionicons name={name} size={Math.round(size * 0.5)} color={palette.fg} />
    </Pressable>
  );
}

export function Button({
  children,
  icon,
  iconRight,
  onPress,
  disabled,
  loading,
  variant = "primary",
  size = "md",
  fullWidth = true
}: {
  children: ReactNode;
  icon?: ComponentProps<typeof Ionicons>["name"];
  iconRight?: ComponentProps<typeof Ionicons>["name"];
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}) {
  const palette =
    variant === "primary"
      ? { bg: colors.primary, fg: "#FFFFFF", border: colors.primary }
      : variant === "danger"
        ? { bg: colors.dangerSoft, fg: colors.danger, border: "transparent" }
        : variant === "ghost"
          ? { bg: "transparent", fg: colors.primary, border: "transparent" }
          : { bg: colors.card, fg: colors.textPrimary, border: colors.borderStrong };

  const sizing =
    size === "lg"
      ? { minHeight: 54, paddingH: spacing.xl, fontSize: 16 }
      : size === "sm"
        ? { minHeight: 36, paddingH: spacing.md, fontSize: 13 }
        : { minHeight: 46, paddingH: spacing.lg, fontSize: 15 };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          minHeight: sizing.minHeight,
          paddingHorizontal: sizing.paddingH,
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: variant === "secondary" ? hairlineWidth : 0,
          alignSelf: fullWidth ? "stretch" : "flex-start"
        },
        disabled ? { opacity: 0.45 } : null,
        pressed && !disabled ? { opacity: 0.85 } : null
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} size="small" />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={sizing.fontSize + 2} color={palette.fg} /> : null}
          <Text
            style={{
              color: palette.fg,
              fontSize: sizing.fontSize,
              fontWeight: "600",
              letterSpacing: 0.1
            }}
          >
            {children}
          </Text>
          {iconRight ? <Ionicons name={iconRight} size={sizing.fontSize + 2} color={palette.fg} /> : null}
        </>
      )}
    </Pressable>
  );
}

export function Chip({
  children,
  active = false,
  onPress
}: {
  children: ReactNode;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active ? styles.chipActive : null,
        pressed ? { opacity: 0.75 } : null
      ]}
    >
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{children}</Text>
    </Pressable>
  );
}

export function Tag({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "neutral" | "primary" | "success" | "danger" | "warning";
}) {
  const palette =
    tone === "primary"
      ? { bg: colors.primarySoft, fg: colors.primary }
      : tone === "success"
        ? { bg: colors.successSoft, fg: colors.success }
        : tone === "danger"
          ? { bg: colors.dangerSoft, fg: colors.danger }
          : tone === "warning"
            ? { bg: colors.warningSoft, fg: colors.warning }
            : { bg: colors.surfaceMuted, fg: colors.textSecondary };
  return (
    <View style={[styles.tag, { backgroundColor: palette.bg }]}>
      <Text style={[styles.tagText, { color: palette.fg }]}>{children}</Text>
    </View>
  );
}

export function Input(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textTertiary}
      selectionColor={colors.primary}
      style={[styles.input, props.multiline ? styles.inputMultiline : null]}
      textAlignVertical={props.multiline ? "top" : "center"}
      {...props}
    />
  );
}

export function MetricRow({
  items
}: {
  items: Array<{ label: string; value: string; tone?: "neutral" | "primary" | "success" | "danger" }>;
}) {
  return (
    <View style={styles.metricRow}>
      {items.map((item, index) => {
        const color =
          item.tone === "primary"
            ? colors.primary
            : item.tone === "success"
              ? colors.success
              : item.tone === "danger"
                ? colors.danger
                : colors.textPrimary;
        return (
          <View key={item.label} style={[styles.metricCell, index !== items.length - 1 ? styles.metricCellDivider : null]}>
            <Text style={styles.metricLabel}>{item.label}</Text>
            <Text style={[styles.metricValue, { color }]} numberOfLines={1}>
              {item.value}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function KeyValueRow({
  label,
  value,
  multiline = false
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <View style={[styles.kvRow, multiline ? styles.kvRowMultiline : null]}>
      <Text style={[styles.kvLabel, multiline ? styles.kvLabelTop : null]}>{label}</Text>
      <Text style={[styles.kvValue, multiline ? styles.kvValueBlock : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: hairlineWidth,
    borderColor: colors.border,
    ...shadows.card
  },
  cardSubtle: {
    backgroundColor: colors.cardSubtle,
    borderRadius: radii.lg,
    borderWidth: hairlineWidth,
    borderColor: colors.border
  },
  cardOutlined: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: hairlineWidth,
    borderColor: colors.borderStrong
  },
  divider: {
    height: hairlineWidth,
    backgroundColor: colors.divider
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    minHeight: 52
  },
  headerSide: {
    width: 44,
    alignItems: "flex-start"
  },
  headerSideRight: {
    alignItems: "flex-end"
  },
  headerCenter: {
    flex: 1,
    alignItems: "center"
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.md
  },
  sectionHeaderText: {
    flex: 1
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill
  },
  iconButtonGhost: {
    borderWidth: hairlineWidth,
    borderColor: colors.border
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radii.md
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceMuted,
    borderWidth: hairlineWidth,
    borderColor: colors.border
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: "600"
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.xs,
    alignSelf: "flex-start"
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    borderWidth: hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
    minHeight: 48
  },
  inputMultiline: {
    minHeight: 122,
    paddingTop: spacing.md
  },
  metricRow: {
    flexDirection: "row",
    alignItems: "stretch"
  },
  metricCell: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm
  },
  metricCellDivider: {
    borderRightWidth: hairlineWidth,
    borderRightColor: colors.divider
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textTertiary,
    marginBottom: 6,
    letterSpacing: 0.3
  },
  metricValue: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    ...tabularNums
  },
  kvRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    gap: spacing.md
  },
  kvRowMultiline: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: spacing.sm
  },
  kvLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500"
  },
  kvLabelTop: {
    color: colors.textTertiary,
    fontSize: 12,
    letterSpacing: 0.3
  },
  kvValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
    flex: 1,
    textAlign: "right"
  },
  kvValueBlock: {
    textAlign: "left",
    fontWeight: "400",
    lineHeight: 22
  }
});
