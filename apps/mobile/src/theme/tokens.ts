import { Platform, type TextStyle } from "react-native";

export const colors = {
  background: "#F5F6F8",
  card: "#FFFFFF",
  cardSubtle: "#FAFBFC",

  primary: "#1557D6",
  primarySoft: "#EEF3FE",
  primaryInk: "#0E3F98",

  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  textQuaternary: "#C5CAD3",

  border: "#E8EBF0",
  borderStrong: "#DDE2EA",
  divider: "#EEF1F4",

  success: "#0A8B5A",
  successSoft: "#E8F4EE",
  danger: "#C9364A",
  dangerSoft: "#FBEDEF",
  warning: "#B7791F",
  warningSoft: "#FAF1E0",

  surfaceMuted: "#F7F8FA",
  overlay: "rgba(17, 24, 39, 0.04)",
  scrim: "rgba(17, 24, 39, 0.42)"
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48
} as const;

export const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  pill: 999
} as const;

export const fontSize = {
  micro: 11,
  caption: 12,
  meta: 13,
  body: 14,
  bodyLg: 15,
  title: 17,
  titleLg: 20,
  headline: 24,
  display: 28
} as const;

export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700"
} as const satisfies Record<string, TextStyle["fontWeight"]>;

export const lineHeight = {
  tight: 1.25,
  snug: 1.4,
  normal: 1.5,
  relaxed: 1.65
} as const;

export const shadows = {
  none: {
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0
  },
  card: {
    shadowColor: "#111827",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1
  },
  raised: {
    shadowColor: "#111827",
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2
  }
} as const;

export const hairlineWidth = Platform.select({ ios: 0.5, android: 1, default: 1 }) ?? 1;

export const tabularNums: TextStyle = {
  fontVariant: ["tabular-nums"]
};

export const text = {
  display: {
    fontSize: fontSize.display,
    lineHeight: Math.round(fontSize.display * lineHeight.tight),
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: 0
  },
  headline: {
    fontSize: fontSize.headline,
    lineHeight: Math.round(fontSize.headline * lineHeight.snug),
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: 0
  },
  titleLg: {
    fontSize: fontSize.titleLg,
    lineHeight: Math.round(fontSize.titleLg * lineHeight.snug),
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: 0
  },
  title: {
    fontSize: fontSize.title,
    lineHeight: Math.round(fontSize.title * lineHeight.snug),
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary
  },
  body: {
    fontSize: fontSize.body,
    lineHeight: Math.round(fontSize.body * lineHeight.relaxed),
    fontWeight: fontWeight.regular,
    color: colors.textPrimary
  },
  bodyLg: {
    fontSize: fontSize.bodyLg,
    lineHeight: Math.round(fontSize.bodyLg * lineHeight.relaxed),
    fontWeight: fontWeight.regular,
    color: colors.textPrimary
  },
  meta: {
    fontSize: fontSize.meta,
    lineHeight: Math.round(fontSize.meta * lineHeight.normal),
    fontWeight: fontWeight.regular,
    color: colors.textSecondary
  },
  caption: {
    fontSize: fontSize.caption,
    lineHeight: Math.round(fontSize.caption * lineHeight.normal),
    fontWeight: fontWeight.medium,
    color: colors.textTertiary
  },
  micro: {
    fontSize: fontSize.micro,
    lineHeight: Math.round(fontSize.micro * lineHeight.normal),
    fontWeight: fontWeight.medium,
    color: colors.textTertiary,
    letterSpacing: 0.3
  }
} as const satisfies Record<string, TextStyle>;
