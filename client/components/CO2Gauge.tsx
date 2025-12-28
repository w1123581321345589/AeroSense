import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle, G } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, Typography, getCO2Color, getCO2Status } from "@/constants/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CO2GaugeProps {
  co2: number | null;
}

export function CO2Gauge({ co2 }: CO2GaugeProps) {
  const { theme, isDark } = useTheme();

  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const displayCO2 = co2 ?? 0;
  const maxCO2 = 5000;
  const progress = Math.min(displayCO2 / maxCO2, 1);

  const animatedProgress = useSharedValue(0);

  React.useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 500,
      easing: Easing.inOut(Easing.ease),
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value * 0.75),
  }));

  const co2Color = co2 !== null ? getCO2Color(displayCO2, isDark) : theme.textSecondary;
  const status = co2 !== null ? getCO2Status(displayCO2) : "No Data";

  return (
    <Card style={styles.container}>
      <View style={styles.gaugeContainer}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G rotation="-135" origin={`${size / 2}, ${size / 2}`}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={theme.backgroundSecondary}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
              strokeLinecap="round"
            />
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={co2Color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
              strokeLinecap="round"
              animatedProps={animatedProps}
            />
          </G>
        </Svg>
        <View style={styles.valueContainer}>
          <ThemedText style={[styles.value, { color: co2Color }]}>
            {co2 !== null ? displayCO2 : "--"}
          </ThemedText>
          <ThemedText style={[styles.unit, { color: theme.textSecondary }]}>
            ppm
          </ThemedText>
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: co2Color + "20" }]}>
        <View style={[styles.statusDot, { backgroundColor: co2Color }]} />
        <ThemedText style={[styles.statusText, { color: co2Color }]}>
          {status}
        </ThemedText>
      </View>
      <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
        Carbon Dioxide Level
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  gaugeContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  valueContainer: {
    position: "absolute",
    alignItems: "center",
  },
  value: {
    ...Typography.heroMetric,
  },
  unit: {
    ...Typography.body,
    marginTop: -Spacing.sm,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.lg,
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...Typography.small,
    fontWeight: "600",
  },
  label: {
    ...Typography.caption,
    marginTop: Spacing.sm,
  },
});
