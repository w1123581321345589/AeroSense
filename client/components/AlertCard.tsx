import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import type { AirQualityAlert } from "@/lib/types";

interface AlertCardProps {
  alert: AirQualityAlert;
  onDismiss: () => void;
}

export function AlertCard({ alert, onDismiss }: AlertCardProps) {
  const { theme, isDark } = useTheme();

  const getAlertColor = () => {
    switch (alert.level) {
      case "critical":
        return isDark ? Colors.dark.co2Critical : Colors.light.co2Critical;
      case "warning":
        return isDark ? Colors.dark.co2Warning : Colors.light.co2Warning;
      case "advisory":
        return isDark ? Colors.dark.co2Caution : Colors.light.co2Caution;
      default:
        return isDark ? Colors.dark.co2Safe : Colors.light.co2Safe;
    }
  };

  const alertColor = getAlertColor();

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutUp.duration(200)}
      style={[
        styles.container,
        { backgroundColor: theme.card },
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: alertColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: alertColor + "20" }]}>
            <Feather
              name={alert.level === "critical" ? "alert-triangle" : "alert-circle"}
              size={20}
              color={alertColor}
            />
          </View>
          <View style={styles.headerText}>
            <ThemedText style={[styles.headline, { color: alertColor }]}>
              {alert.headline}
            </ThemedText>
            <ThemedText style={styles.metric}>{alert.metric}</ThemedText>
          </View>
          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.dismissButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Feather name="x" size={20} color={theme.textSecondary} />
          </Pressable>
        </View>
        <ThemedText style={[styles.action, { color: theme.textSecondary }]}>
          {alert.action}
        </ThemedText>
        {alert.evidence && (
          <View style={[styles.evidenceContainer, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="book-open" size={14} color={theme.textSecondary} />
            <ThemedText style={[styles.evidence, { color: theme.textSecondary }]}>
              {alert.evidence}
            </ThemedText>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  headline: {
    ...Typography.h3,
    marginBottom: 2,
  },
  metric: {
    ...Typography.small,
    fontWeight: "600",
  },
  dismissButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  action: {
    ...Typography.small,
    marginBottom: Spacing.sm,
  },
  evidenceContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.sm,
    borderRadius: BorderRadius.xs,
    gap: Spacing.sm,
  },
  evidence: {
    ...Typography.caption,
    flex: 1,
    fontStyle: "italic",
  },
});
