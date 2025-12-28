import React from "react";
import { View, StyleSheet, Pressable, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/context";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import { FlightPhase, FlightPhaseLabels, FlightPhaseOrder } from "@/lib/types";

interface FlightPhasePillProps {
  currentPhase: FlightPhase;
  style?: ViewStyle;
}

const phaseIcons: Record<FlightPhase, string> = {
  preFlight: "briefcase",
  boarding: "users",
  taxi: "truck",
  takeoff: "arrow-up-right",
  climb: "trending-up",
  cruise: "navigation",
  descent: "trending-down",
  landing: "arrow-down-right",
  arrived: "check-circle",
};

export function FlightPhasePill({ currentPhase, style }: FlightPhasePillProps) {
  const { theme, isDark } = useTheme();
  const { updatePhase } = useApp();

  const currentIndex = FlightPhaseOrder.indexOf(currentPhase);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      updatePhase(FlightPhaseOrder[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < FlightPhaseOrder.length - 1) {
      updatePhase(FlightPhaseOrder[currentIndex + 1]);
    }
  };

  const containerStyle = style ? { ...styles.container, ...style } : styles.container;
  
  return (
    <Card style={containerStyle}>
      <Pressable
        onPress={handlePrevious}
        disabled={currentIndex === 0}
        style={({ pressed }) => [
          styles.arrowButton,
          { opacity: currentIndex === 0 ? 0.3 : pressed ? 0.6 : 1 },
        ]}
      >
        <Feather name="chevron-left" size={24} color={theme.text} />
      </Pressable>

      <View style={styles.phaseContent}>
        <View
          style={[
            styles.phaseIcon,
            { backgroundColor: isDark ? Colors.dark.primary + "20" : Colors.light.primary + "20" },
          ]}
        >
          <Feather
            name={phaseIcons[currentPhase] as any}
            size={20}
            color={isDark ? Colors.dark.primary : Colors.light.primary}
          />
        </View>
        <View style={styles.phaseInfo}>
          <ThemedText style={[styles.phaseLabel, { color: theme.textSecondary }]}>
            Flight Phase
          </ThemedText>
          <ThemedText style={styles.phaseName}>
            {FlightPhaseLabels[currentPhase]}
          </ThemedText>
        </View>
      </View>

      <Pressable
        onPress={handleNext}
        disabled={currentIndex === FlightPhaseOrder.length - 1}
        style={({ pressed }) => [
          styles.arrowButton,
          {
            opacity:
              currentIndex === FlightPhaseOrder.length - 1
                ? 0.3
                : pressed
                ? 0.6
                : 1,
          },
        ]}
      >
        <Feather name="chevron-right" size={24} color={theme.text} />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  arrowButton: {
    padding: Spacing.sm,
  },
  phaseContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  phaseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  phaseInfo: {
    alignItems: "flex-start",
  },
  phaseLabel: {
    ...Typography.caption,
  },
  phaseName: {
    ...Typography.h3,
  },
});
