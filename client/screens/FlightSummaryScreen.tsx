import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { TrendChart } from "@/components/TrendChart";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/context";
import { Colors, Spacing, Typography, BorderRadius, getCO2Color } from "@/constants/theme";
import { FlightPhaseLabels } from "@/lib/types";

export default function FlightSummaryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { activeSession, endSession } = useApp();

  if (!activeSession) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.noSession}>No active session</ThemedText>
      </ThemedView>
    );
  }

  const duration = activeSession.endTime
    ? activeSession.endTime - activeSession.startTime
    : Date.now() - activeSession.startTime;

  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  const durationStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  const avgCO2 =
    activeSession.readings.length > 0
      ? Math.round(
          activeSession.readings.reduce((sum, r) => sum + r.co2, 0) /
            activeSession.readings.length
        )
      : 0;

  const maxCO2 =
    activeSession.readings.length > 0
      ? Math.max(...activeSession.readings.map((r) => r.co2))
      : 0;

  const getGrade = () => {
    if (avgCO2 < 1000) return { grade: "A", color: Colors.light.co2Safe };
    if (avgCO2 < 1400) return { grade: "B", color: Colors.light.co2Caution };
    if (avgCO2 < 1800) return { grade: "C", color: Colors.light.co2Warning };
    if (avgCO2 < 2200) return { grade: "D", color: Colors.light.co2Warning };
    return { grade: "F", color: Colors.light.co2Critical };
  };

  const { grade, color: gradeColor } = getGrade();

  const handleEndFlight = () => {
    endSession();
    navigation.goBack();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Feather name="x" size={24} color={theme.text} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Flight Summary</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.gradeCard}>
          <View style={[styles.gradeBadge, { backgroundColor: gradeColor }]}>
            <ThemedText style={styles.gradeText}>{grade}</ThemedText>
          </View>
          <ThemedText style={styles.gradeLabel}>Air Quality Grade</ThemedText>
          <ThemedText style={[styles.gradeDescription, { color: theme.textSecondary }]}>
            Based on average CO2 levels during flight
          </ThemedText>
        </Card>

        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Feather name="clock" size={20} color={theme.textSecondary} />
            <ThemedText style={styles.statValue}>{durationStr}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              Duration
            </ThemedText>
          </Card>
          <Card style={styles.statCard}>
            <Feather name="activity" size={20} color={theme.textSecondary} />
            <ThemedText style={styles.statValue}>{avgCO2}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              Avg CO2 (ppm)
            </ThemedText>
          </Card>
          <Card style={styles.statCard}>
            <Feather
              name="trending-up"
              size={20}
              color={getCO2Color(maxCO2, isDark)}
            />
            <ThemedText style={[styles.statValue, { color: getCO2Color(maxCO2, isDark) }]}>
              {maxCO2}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              Peak CO2 (ppm)
            </ThemedText>
          </Card>
          <Card style={styles.statCard}>
            <Feather name="droplet" size={20} color={Colors.light.primary} />
            <ThemedText style={styles.statValue}>{activeSession.hydrationMl}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              Hydration (ml)
            </ThemedText>
          </Card>
        </View>

        {activeSession.readings.length > 1 && (
          <View style={styles.chartSection}>
            <ThemedText style={styles.sectionTitle}>CO2 Trend</ThemedText>
            <TrendChart readings={activeSession.readings} />
          </View>
        )}

        <View style={styles.infoSection}>
          <ThemedText style={styles.sectionTitle}>Flight Details</ThemedText>
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: theme.textSecondary }]}>
                Current Phase
              </ThemedText>
              <ThemedText style={styles.infoValue}>
                {FlightPhaseLabels[activeSession.currentPhase]}
              </ThemedText>
            </View>
            {activeSession.airline && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                <View style={styles.infoRow}>
                  <ThemedText style={[styles.infoLabel, { color: theme.textSecondary }]}>
                    Airline
                  </ThemedText>
                  <ThemedText style={styles.infoValue}>{activeSession.airline}</ThemedText>
                </View>
              </>
            )}
            {activeSession.flightNumber && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                <View style={styles.infoRow}>
                  <ThemedText style={[styles.infoLabel, { color: theme.textSecondary }]}>
                    Flight
                  </ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {activeSession.flightNumber}
                  </ThemedText>
                </View>
              </>
            )}
            {activeSession.seat && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.divider }]} />
                <View style={styles.infoRow}>
                  <ThemedText style={[styles.infoLabel, { color: theme.textSecondary }]}>
                    Seat
                  </ThemedText>
                  <ThemedText style={styles.infoValue}>{activeSession.seat}</ThemedText>
                </View>
              </>
            )}
            <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: theme.textSecondary }]}>
                Readings
              </ThemedText>
              <ThemedText style={styles.infoValue}>
                {activeSession.readings.length}
              </ThemedText>
            </View>
          </Card>
        </View>

        <Pressable
          onPress={handleEndFlight}
          style={({ pressed }) => [
            styles.endButton,
            {
              backgroundColor: Colors.light.co2Critical,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather name="check-circle" size={20} color="#FFFFFF" />
          <ThemedText style={styles.endButtonText}>End Flight</ThemedText>
        </Pressable>

        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.continueButton,
            {
              borderColor: isDark ? Colors.dark.primary : Colors.light.primary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <ThemedText
            style={[
              styles.continueButtonText,
              { color: isDark ? Colors.dark.primary : Colors.light.primary },
            ]}
          >
            Continue Monitoring
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h3,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  noSession: {
    ...Typography.body,
    textAlign: "center",
    marginTop: Spacing["3xl"],
  },
  gradeCard: {
    alignItems: "center",
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  gradeBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  gradeText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  gradeLabel: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
  gradeDescription: {
    ...Typography.small,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: "47%",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  statValue: {
    ...Typography.h2,
  },
  statLabel: {
    ...Typography.caption,
    textAlign: "center",
  },
  chartSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  infoSection: {
    marginBottom: Spacing.xl,
  },
  infoCard: {
    padding: Spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    ...Typography.body,
  },
  infoValue: {
    ...Typography.body,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  endButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  endButtonText: {
    ...Typography.h3,
    color: "#FFFFFF",
  },
  continueButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  continueButtonText: {
    ...Typography.h3,
  },
});
