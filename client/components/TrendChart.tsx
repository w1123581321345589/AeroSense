import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Line, Text as SvgText, Circle, Defs, LinearGradient, Stop } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, Typography, getCO2Color } from "@/constants/theme";
import type { AirQualityReading } from "@/lib/types";

interface TrendChartProps {
  readings: AirQualityReading[];
}

export function TrendChart({ readings }: TrendChartProps) {
  const { theme, isDark } = useTheme();

  if (readings.length < 2) {
    return null;
  }

  const width = Dimensions.get("window").width - Spacing.xl * 2 - Spacing.lg * 2;
  const height = 120;
  const padding = { top: 10, right: 10, bottom: 25, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const recentReadings = readings.slice(-30);

  const minCO2 = Math.min(...recentReadings.map((r) => r.co2));
  const maxCO2 = Math.max(...recentReadings.map((r) => r.co2));
  const range = maxCO2 - minCO2 || 100;
  const yMin = Math.max(0, minCO2 - range * 0.1);
  const yMax = maxCO2 + range * 0.1;

  const getX = (index: number) =>
    padding.left + (index / (recentReadings.length - 1)) * chartWidth;

  const getY = (co2: number) =>
    padding.top + chartHeight - ((co2 - yMin) / (yMax - yMin)) * chartHeight;

  const pathData = recentReadings
    .map((reading, index) => {
      const x = getX(index);
      const y = getY(reading.co2);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const lastReading = recentReadings[recentReadings.length - 1];
  const lineColor = getCO2Color(lastReading.co2, isDark);

  const yAxisLabels = [
    { value: yMax, y: padding.top },
    { value: (yMax + yMin) / 2, y: padding.top + chartHeight / 2 },
    { value: yMin, y: padding.top + chartHeight },
  ];

  const areaPath = pathData + 
    ` L ${getX(recentReadings.length - 1)} ${padding.top + chartHeight}` +
    ` L ${getX(0)} ${padding.top + chartHeight} Z`;

  const lastX = getX(recentReadings.length - 1);
  const lastY = getY(lastReading.co2);

  return (
    <Card style={styles.container}>
      <ThemedText style={styles.title}>30-Minute Trend</ThemedText>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={lineColor} stopOpacity="0.25" />
            <Stop offset="1" stopColor={lineColor} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {yAxisLabels.map((label, index) => (
          <React.Fragment key={index}>
            <Line
              x1={padding.left}
              y1={label.y}
              x2={width - padding.right}
              y2={label.y}
              stroke={theme.divider}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
            <SvgText
              x={padding.left - 5}
              y={label.y + 4}
              fontSize={10}
              fill={theme.textSecondary}
              textAnchor="end"
            >
              {Math.round(label.value)}
            </SvgText>
          </React.Fragment>
        ))}

        <Path
          d={areaPath}
          fill="url(#areaGrad)"
        />

        <Path
          d={pathData}
          stroke={lineColor}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <Circle cx={lastX} cy={lastY} r={5} fill={lineColor} />
        <Circle cx={lastX} cy={lastY} r={2.5} fill="#fff" />

        <SvgText
          x={padding.left}
          y={height - 5}
          fontSize={10}
          fill={theme.textSecondary}
        >
          30m ago
        </SvgText>
        <SvgText
          x={width - padding.right}
          y={height - 5}
          fontSize={10}
          fill={theme.textSecondary}
          textAnchor="end"
        >
          Now
        </SvgText>
      </Svg>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
});
