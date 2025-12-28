import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, type RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { TrendChart } from "@/components/TrendChart";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/context";
import { Colors, Spacing, Typography, getCO2Color } from "@/constants/theme";
import { FlightPhaseLabels } from "@/lib/types";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type SessionDetailRouteProp = RouteProp<RootStackParamList, "SessionDetail">;

export default function SessionDetailScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<SessionDetailRouteProp>();
  const { theme, isDark } = useTheme();
  const { sessions } = useApp();

  const session = sessions.find((s) => s.id === route.params.sessionId);

  if (!session) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.notFound}>Session not found</ThemedText>
      </ThemedView>
    );
  }

  const duration = (session.endTime || Date.now()) - session.startTime;
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  const durationStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  const avgCO2 =
    session.readings.length > 0
      ? Math.round(
          session.readings.reduce((sum, r) => sum + r.co2, 0) /
            session.readings.length
        )
      : 0;

  const maxCO2 =
    session.readings.length > 0
      ? Math.max(...session.readings.map((r) => r.co2))
      : 0;

  const minCO2 =
    session.readings.length > 0
      ? Math.min(...session.readings.map((r) => r.co2))
      : 0;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getGrade = () => {
    if (avgCO2 < 1000) return { grade: "A", label: "Excellent" };
    if (avgCO2 < 1400) return { grade: "B", label: "Good" };
    if (avgCO2 < 1800) return { grade: "C", label: "Fair" };
    if (avgCO2 < 2200) return { grade: "D", label: "Poor" };
    return { grade: "F", label: "Critical" };
  };

  const { grade, label: gradeLabel } = getGrade();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.headerCard}>
          <ThemedText style={styles.date}>{formatDate(session.startTime)}</ThemedText>
          {session.flightNumber && (
            <ThemedText style={[styles.flightInfo, { color: theme.textSecondary }]}>
              {session.airline ? `${session.airline} ` : ""}
              {session.flightNumber}
              {session.seat ? ` - Seat ${session.seat}` : ""}
            </ThemedText>
          )}
          <View style={styles.timeRow}>
            <ThemedText style={[styles.timeText, { color: theme.textSecondary }]}>
              {formatTime(session.startTime)} - {session.endTime ? formatTime(session.endTime) : "In Progress"}
            </ThemedText>
          </View>
        </Card>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <ThemedText style={[styles.statValue, { color: getCO2Color(avgCO2, isDark) }]}>
              {avgCO2}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              Avg CO2 (ppm)
            </ThemedText>
          </Card>
          <Card style={styles.statCard}>
            <ThemedText style={[styles.statValue, { color: getCO2Color(maxCO2, isDark) }]}>
              {maxCO2}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              Peak CO2 (ppm)
            </ThemedText>
          </Card>
          <Card style={styles.statCard}>
            <ThemedText style={[styles.statValue, { color: getCO2Color(minCO2, isDark) }]}>
              {minCO2}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              Min CO2 (ppm)
            </ThemedText>
          </Card>
          <Card style={styles.statCard}>
            <ThemedText style={styles.statValue}>{durationStr}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              Duration
            </ThemedText>
          </Card>
        </View>

        <Card style={styles.gradeCard}>
          <View style={styles.gradeRow}>
            <View>
              <ThemedText style={[styles.gradeLabel, { color: theme.textSecondary }]}>
                Air Quality Grade
              </ThemedText>
              <ThemedText style={styles.gradeValue}>
                {grade} - {gradeLabel}
              </ThemedText>
            </View>
            <View
              style={[
                styles.gradeBadge,
                { backgroundColor: getCO2Color(avgCO2, isDark) },
              ]}
            >
              <ThemedText style={styles.gradeBadgeText}>{grade}</ThemedText>
            </View>
          </View>
        </Card>

        {session.readings.length > 1 && (
          <View style={styles.chartSection}>
            <ThemedText style={styles.sectionTitle}>CO2 Trend</ThemedText>
            <TrendChart readings={session.readings} />
          </View>
        )}

        <View style={styles.statsSection}>
          <ThemedText style={styles.sectionTitle}>Session Stats</ThemedText>
          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <Feather name="activity" size={18} color={theme.textSecondary} />
              <ThemedText style={[styles.statsLabel, { color: theme.textSecondary }]}>
                Total Readings
              </ThemedText>
              <ThemedText style={styles.statsValue}>{session.readings.length}</ThemedText>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            <View style={styles.statsRow}>
              <Feather name="droplet" size={18} color={Colors.light.primary} />
              <ThemedText style={[styles.statsLabel, { color: theme.textSecondary }]}>
                Hydration
              </ThemedText>
              <ThemedText style={styles.statsValue}>{session.hydrationMl} ml</ThemedText>
            </View>
          </Card>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  notFound: {
    ...Typography.body,
    textAlign: "center",
    marginTop: Spacing["3xl"],
  },
  headerCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  date: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
  },
  flightInfo: {
    ...Typography.body,
    marginBottom: Spacing.xs,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    ...Typography.small,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: "47%",
    alignItems: "center",
    padding: Spacing.lg,
  },
  statValue: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    textAlign: "center",
  },
  gradeCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  gradeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gradeLabel: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
  },
  gradeValue: {
    ...Typography.h3,
  },
  gradeBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeBadgeText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  chartSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  statsSection: {
    marginBottom: Spacing.lg,
  },
  statsCard: {
    padding: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  statsLabel: {
    ...Typography.body,
    flex: 1,
  },
  statsValue: {
    ...Typography.body,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
});
