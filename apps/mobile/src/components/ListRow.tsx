import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors, hairlineWidth, radii, spacing, tabularNums } from "../theme/tokens";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function ListGroup({
  children,
  title,
  caption,
  style
}: {
  children: ReactNode;
  title?: string;
  caption?: string;
  style?: ViewStyle;
}) {
  return (
    <View style={style}>
      {title ? (
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>{title}</Text>
        </View>
      ) : null}
      <View style={styles.group}>{children}</View>
      {caption ? <Text style={styles.groupCaption}>{caption}</Text> : null}
    </View>
  );
}

export function ListRow({
  title,
  subtitle,
  value,
  icon,
  iconTone = "neutral",
  trailing = "chevron",
  onPress,
  destructive = false,
  isFirst = false,
  isLast = false
}: {
  title: string;
  subtitle?: string;
  value?: string;
  icon?: IconName;
  iconTone?: "neutral" | "primary" | "success" | "danger" | "warning";
  trailing?: "chevron" | "none" | ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const iconPalette =
    iconTone === "primary"
      ? { bg: colors.primarySoft, fg: colors.primary }
      : iconTone === "success"
        ? { bg: colors.successSoft, fg: colors.success }
        : iconTone === "danger"
          ? { bg: colors.dangerSoft, fg: colors.danger }
          : iconTone === "warning"
            ? { bg: colors.warningSoft, fg: colors.warning }
            : { bg: colors.surfaceMuted, fg: colors.textSecondary };

  const titleColor = destructive ? colors.danger : colors.textPrimary;

  const content = (
    <View style={styles.row}>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: iconPalette.bg }]}>
          <Ionicons name={icon} size={16} color={iconPalette.fg} />
        </View>
      ) : null}
      <View style={styles.rowBody}>
        <Text style={[styles.rowTitle, { color: titleColor }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text style={styles.rowValue} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {trailing === "chevron" && onPress ? (
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      ) : trailing && trailing !== "none" && trailing !== "chevron" ? (
        trailing
      ) : null}
    </View>
  );

  const wrapperStyle: ViewStyle = {
    borderTopLeftRadius: isFirst ? radii.lg : 0,
    borderTopRightRadius: isFirst ? radii.lg : 0,
    borderBottomLeftRadius: isLast ? radii.lg : 0,
    borderBottomRightRadius: isLast ? radii.lg : 0,
    overflow: "hidden"
  };

  if (onPress) {
    return (
      <View style={wrapperStyle}>
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.rowWrap, pressed ? styles.rowPressed : null]}
        >
          {content}
        </Pressable>
        {!isLast ? <View style={styles.rowDivider} /> : null}
      </View>
    );
  }

  return (
    <View style={wrapperStyle}>
      <View style={styles.rowWrap}>{content}</View>
      {!isLast ? <View style={styles.rowDivider} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: hairlineWidth,
    borderColor: colors.border,
    overflow: "hidden"
  },
  groupHeader: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textTertiary,
    letterSpacing: 0.3,
    textTransform: "uppercase"
  },
  groupCaption: {
    fontSize: 12,
    color: colors.textTertiary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    lineHeight: 18
  },
  rowWrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 50,
    justifyContent: "center",
    backgroundColor: colors.card
  },
  rowPressed: {
    backgroundColor: colors.surfaceMuted
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center"
  },
  rowBody: {
    flex: 1,
    gap: 2
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary
  },
  rowSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17
  },
  rowValue: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
    maxWidth: 180,
    textAlign: "right",
    ...tabularNums
  },
  rowDivider: {
    height: hairlineWidth,
    backgroundColor: colors.divider,
    marginLeft: spacing.lg
  }
});
