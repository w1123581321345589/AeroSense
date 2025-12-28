import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/context";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";

interface HydrationTrackerProps {
  currentMl: number;
  targetMl: number;
}

const quickAddOptions = [100, 250, 500];

export function HydrationTracker({ currentMl, targetMl }: HydrationTrackerProps) {
  const { theme, isDark } = useTheme();
  const { addHydration } = useApp();

  const progress = Math.min(currentMl / targetMl, 1);

  const size = 80;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={theme.backgroundSecondary}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={Colors.light.primary}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>
          <View style={styles.progressIcon}>
            <Feather name="droplet" size={24} color={Colors.light.primary} />
          </View>
        </View>
        <View style={styles.info}>
          <ThemedText style={styles.title}>Hydration</ThemedText>
          <ThemedText style={styles.value}>
            {currentMl} <ThemedText style={[styles.unit, { color: theme.textSecondary }]}>/ {targetMl} ml</ThemedText>
          </ThemedText>
          <ThemedText style={[styles.hint, { color: theme.textSecondary }]}>
            Stay hydrated at altitude
          </ThemedText>
        </View>
      </View>

      <View style={styles.quickAddRow}>
        {quickAddOptions.map((amount) => (
          <Pressable
            key={amount}
            onPress={() => addHydration(amount)}
            style={({ pressed }) => [
              styles.quickAddButton,
              {
                backgroundColor: theme.backgroundSecondary,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <Feather name="plus" size={14} color={theme.text} />
            <ThemedText style={styles.quickAddText}>{amount}ml</ThemedText>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  progressContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  progressIcon: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  title: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
  value: {
    ...Typography.h2,
  },
  unit: {
    ...Typography.body,
    fontWeight: "400",
  },
  hint: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  quickAddRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  quickAddButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    gap: Spacing.xs,
  },
  quickAddText: {
    ...Typography.small,
    fontWeight: "500",
  },
});
