import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#11181C",
    textSecondary: "#687076",
    buttonText: "#FFFFFF",
    tabIconDefault: "#687076",
    tabIconSelected: "#007AFF",
    link: "#007AFF",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F2F2F7",
    backgroundSecondary: "#E6E6E6",
    backgroundTertiary: "#D9D9D9",
    divider: "#C6C6C8",
    primary: "#007AFF",
    navy: "#1C2A3A",
    co2Safe: "#34C759",
    co2Caution: "#FFD60A",
    co2Warning: "#FF9500",
    co2Critical: "#FF3B30",
    card: "#F2F2F7",
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#0A84FF",
    link: "#0A84FF",
    backgroundRoot: "#000000",
    backgroundDefault: "#1C1C1E",
    backgroundSecondary: "#2C2C2E",
    backgroundTertiary: "#3A3A3C",
    divider: "#38383A",
    primary: "#0A84FF",
    navy: "#1C2A3A",
    co2Safe: "#30D158",
    co2Caution: "#FFD60A",
    co2Warning: "#FF9F0A",
    co2Critical: "#FF453A",
    card: "#1C1C1E",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 50,
  cardPadding: 16,
  cardRadius: 12,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  heroMetric: {
    fontSize: 72,
    fontWeight: "700" as const,
  },
  h1: {
    fontSize: 34,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 22,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 17,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 17,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 15,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 17,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export function getCO2Color(co2: number, isDark: boolean): string {
  const colors = isDark ? Colors.dark : Colors.light;
  if (co2 < 800) return colors.co2Safe;
  if (co2 < 1400) return colors.co2Caution;
  if (co2 < 2500) return colors.co2Warning;
  return colors.co2Critical;
}

export function getCO2Status(co2: number): string {
  if (co2 < 800) return "Good";
  if (co2 < 1400) return "Fair";
  if (co2 < 2500) return "Poor";
  return "Critical";
}
