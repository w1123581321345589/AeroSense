import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Typography } from "@/constants/theme";

interface MetricsGridProps {
  temperature: number | null;
  humidity: number | null;
  pressure: number | null;
  battery: number | null;
  useCelsius: boolean;
}

export function MetricsGrid({
  temperature,
  humidity,
  pressure,
  battery,
  useCelsius,
}: MetricsGridProps) {
  const { theme } = useTheme();

  const formatTemperature = (temp: number | null) => {
    if (temp === null) return "--";
    if (useCelsius) {
      return `${temp.toFixed(1)}`;
    }
    return `${((temp * 9) / 5 + 32).toFixed(1)}`;
  };

  const metrics = [
    {
      icon: "thermometer",
      label: "Temperature",
      value: formatTemperature(temperature),
      unit: useCelsius ? "C" : "F",
    },
    {
      icon: "droplet",
      label: "Humidity",
      value: humidity !== null ? `${humidity}` : "--",
      unit: "%",
    },
    {
      icon: "bar-chart-2",
      label: "Pressure",
      value: pressure !== null ? `${Math.round(pressure)}` : "--",
      unit: "hPa",
    },
    {
      icon: "battery",
      label: "Battery",
      value: battery !== null ? `${battery}` : "--",
      unit: "%",
    },
  ];

  return (
    <View style={styles.container}>
      {metrics.map((metric, index) => (
        <Card key={metric.label} style={styles.metricCard}>
          <Feather name={metric.icon as any} size={18} color={theme.textSecondary} />
          <View style={styles.metricContent}>
            <View style={styles.valueRow}>
              <ThemedText style={styles.value}>{metric.value}</ThemedText>
              <ThemedText style={[styles.unit, { color: theme.textSecondary }]}>
                {metric.unit}
              </ThemedText>
            </View>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              {metric.label}
            </ThemedText>
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  metricCard: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  metricContent: {
    flex: 1,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  value: {
    ...Typography.h3,
  },
  unit: {
    ...Typography.caption,
  },
  label: {
    ...Typography.caption,
    marginTop: 2,
  },
});
