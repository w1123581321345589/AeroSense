import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView, Pressable, Share, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { TrendChart } from "@/components/TrendChart";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/context";
import { Spacing, BorderRadius, Colors, Typography } from "@/constants/theme";
import { FlightPhaseLabels, getAlertLevel } from "@/lib/types";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "SessionSummary">;

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SessionSummaryScreen({ route, navigation }: Props) {
  const { sessionId } = route.params;
  const { theme, isDark } = useTheme();
  const { sessions } = useApp();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  
  const session = sessions.find(s => s.id === sessionId);
  
  const stats = useMemo(() => {
    if (!session) return null;
    if (!session.readings || session.readings.length === 0) {
      return {
        avgCO2: 0,
        maxCO2: 0,
        minCO2: 0,
        duration: session.endTime ? session.endTime - session.startTime : Date.now() - session.startTime,
        criticalCount: 0,
        warningCount: 0,
        goodCount: 0,
        totalReadings: 0,
        phaseBreakdown: {},
      };
    }
    
    const co2Values = session.readings.map(r => r.co2);
    const avgCO2 = Math.round(co2Values.reduce((a, b) => a + b, 0) / co2Values.length);
    const maxCO2 = Math.max(...co2Values);
    const minCO2 = Math.min(...co2Values);
    
    const duration = session.endTime ? session.endTime - session.startTime : Date.now() - session.startTime;
    
    const criticalCount = session.readings.filter(r => r.co2 >= 2500).length;
    const warningCount = session.readings.filter(r => r.co2 >= 1400 && r.co2 < 2500).length;
    const goodCount = session.readings.filter(r => r.co2 < 800).length;
    
    const phaseBreakdown: Record<string, { count: number; avgCO2: number }> = {};
    session.readings.forEach(r => {
      const phase = r.flightPhase || "unknown";
      if (!phaseBreakdown[phase]) {
        phaseBreakdown[phase] = { count: 0, avgCO2: 0 };
      }
      phaseBreakdown[phase].count++;
      phaseBreakdown[phase].avgCO2 += r.co2;
    });
    
    Object.keys(phaseBreakdown).forEach(phase => {
      phaseBreakdown[phase].avgCO2 = Math.round(phaseBreakdown[phase].avgCO2 / phaseBreakdown[phase].count);
    });
    
    return {
      avgCO2,
      maxCO2,
      minCO2,
      duration,
      criticalCount,
      warningCount,
      goodCount,
      totalReadings: session.readings.length,
      phaseBreakdown,
    };
  }, [session]);
  
  const handleShare = async () => {
    if (!session || !stats) return;
    
    const flightInfo = session.airline && session.flightNumber 
      ? `${session.airline} ${session.flightNumber}` 
      : "Flight";
      
    const message = `${flightInfo} Air Quality Report
Date: ${formatDate(session.startTime)}
Duration: ${formatDuration(stats.duration)}

Average CO2: ${stats.avgCO2} ppm
Peak CO2: ${stats.maxCO2} ppm
Lowest CO2: ${stats.minCO2} ppm

Hydration: ${session.hydrationMl}ml

Recorded with AeroSense`;
    
    try {
      await Share.share({ message });
    } catch (error) {
      console.error("Share error:", error);
    }
  };
  
  if (!session) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Session not found</ThemedText>
      </ThemedView>
    );
  }
  
  const overallLevel = stats ? getAlertLevel(stats.avgCO2) : "good";
  const levelColors = {
    good: Colors.co2.good,
    advisory: Colors.co2.advisory,
    warning: Colors.co2.warning,
    critical: Colors.co2.critical,
  };
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.md, paddingBottom: insets.bottom + Spacing.xl }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.flightNumber}>
              {session.airline && session.flightNumber 
                ? `${session.airline} ${session.flightNumber}` 
                : "Flight Session"}
            </ThemedText>
            <ThemedText style={[styles.date, { color: theme.textSecondary }]}>
              {formatDate(session.startTime)}
            </ThemedText>
          </View>
          
          <Pressable onPress={handleShare} style={styles.shareButton}>
            <Feather name="share" size={20} color={theme.text} />
          </Pressable>
        </View>
        
        {stats ? (
          <>
            <Card style={styles.overviewCard}>
              <View style={styles.overviewHeader}>
                <View 
                  style={[styles.levelBadge, { backgroundColor: levelColors[overallLevel] + "20" }]}
                >
                  <View style={[styles.levelDot, { backgroundColor: levelColors[overallLevel] }]} />
                  <ThemedText style={[styles.levelText, { color: levelColors[overallLevel] }]}>
                    {overallLevel.charAt(0).toUpperCase() + overallLevel.slice(1)} Air Quality
                  </ThemedText>
                </View>
                <ThemedText style={[styles.duration, { color: theme.textSecondary }]}>
                  {formatDuration(stats.duration)}
                </ThemedText>
              </View>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Average</ThemedText>
                  <ThemedText style={styles.statValue}>{stats.avgCO2}</ThemedText>
                  <ThemedText style={[styles.statUnit, { color: theme.textSecondary }]}>ppm</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Peak</ThemedText>
                  <ThemedText style={[styles.statValue, { color: Colors.co2.warning }]}>{stats.maxCO2}</ThemedText>
                  <ThemedText style={[styles.statUnit, { color: theme.textSecondary }]}>ppm</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Lowest</ThemedText>
                  <ThemedText style={[styles.statValue, { color: Colors.co2.good }]}>{stats.minCO2}</ThemedText>
                  <ThemedText style={[styles.statUnit, { color: theme.textSecondary }]}>ppm</ThemedText>
                </View>
              </View>
            </Card>
            
            {session.readings.length >= 2 ? (
              <TrendChart readings={session.readings} />
            ) : null}
            
            <Card style={styles.detailsCard}>
              <ThemedText style={styles.sectionTitle}>Flight Details</ThemedText>
              
              <View style={styles.detailRow}>
                <Feather name="map-pin" size={18} color={theme.textSecondary} />
                <ThemedText style={[styles.detailLabel, { color: theme.textSecondary }]}>Seat</ThemedText>
                <ThemedText style={styles.detailValue}>{session.seat || "Not specified"}</ThemedText>
              </View>
              
              <View style={styles.detailRow}>
                <Feather name="droplet" size={18} color={theme.textSecondary} />
                <ThemedText style={[styles.detailLabel, { color: theme.textSecondary }]}>Hydration</ThemedText>
                <ThemedText style={styles.detailValue}>{session.hydrationMl}ml</ThemedText>
              </View>
              
              <View style={styles.detailRow}>
                <Feather name="activity" size={18} color={theme.textSecondary} />
                <ThemedText style={[styles.detailLabel, { color: theme.textSecondary }]}>Readings</ThemedText>
                <ThemedText style={styles.detailValue}>{stats.totalReadings}</ThemedText>
              </View>
            </Card>
            
            <Card style={styles.phaseCard}>
              <ThemedText style={styles.sectionTitle}>CO2 by Flight Phase</ThemedText>
              
              {Object.entries(stats.phaseBreakdown).map(([phase, data]) => (
                <View key={phase} style={styles.phaseRow}>
                  <ThemedText style={styles.phaseName}>
                    {FlightPhaseLabels[phase as keyof typeof FlightPhaseLabels] || phase}
                  </ThemedText>
                  <View style={styles.phaseBar}>
                    <View 
                      style={[
                        styles.phaseBarFill,
                        { 
                          width: `${Math.min((data.avgCO2 / 3000) * 100, 100)}%`,
                          backgroundColor: levelColors[getAlertLevel(data.avgCO2)]
                        }
                      ]} 
                    />
                  </View>
                  <ThemedText style={styles.phaseValue}>{data.avgCO2}</ThemedText>
                </View>
              ))}
            </Card>
            
            <Card style={styles.alertsCard}>
              <ThemedText style={styles.sectionTitle}>Alert Summary</ThemedText>
              
              <View style={styles.alertSummary}>
                <View style={styles.alertItem}>
                  <View style={[styles.alertDot, { backgroundColor: Colors.co2.critical }]} />
                  <ThemedText style={styles.alertCount}>{stats.criticalCount}</ThemedText>
                  <ThemedText style={[styles.alertLabel, { color: theme.textSecondary }]}>Critical</ThemedText>
                </View>
                <View style={styles.alertItem}>
                  <View style={[styles.alertDot, { backgroundColor: Colors.co2.warning }]} />
                  <ThemedText style={styles.alertCount}>{stats.warningCount}</ThemedText>
                  <ThemedText style={[styles.alertLabel, { color: theme.textSecondary }]}>Warning</ThemedText>
                </View>
                <View style={styles.alertItem}>
                  <View style={[styles.alertDot, { backgroundColor: Colors.co2.good }]} />
                  <ThemedText style={styles.alertCount}>{stats.goodCount}</ThemedText>
                  <ThemedText style={[styles.alertLabel, { color: theme.textSecondary }]}>Good</ThemedText>
                </View>
              </View>
            </Card>
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Feather name="bar-chart-2" size={48} color={theme.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              No readings recorded for this session
            </ThemedText>
          </Card>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  flightNumber: {
    fontSize: 28,
    fontWeight: "700",
  },
  date: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  shareButton: {
    padding: Spacing.md,
  },
  overviewCard: {
    padding: Spacing.lg,
  },
  overviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  levelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  duration: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
  },
  statUnit: {
    fontSize: 12,
  },
  detailsCard: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  phaseCard: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  phaseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  phaseName: {
    width: 80,
    fontSize: 12,
  },
  phaseBar: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(128,128,128,0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  phaseBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  phaseValue: {
    width: 40,
    fontSize: 12,
    textAlign: "right",
  },
  alertsCard: {
    padding: Spacing.lg,
  },
  alertSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  alertItem: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  alertDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  alertCount: {
    fontSize: 24,
    fontWeight: "700",
  },
  alertLabel: {
    fontSize: 12,
  },
  emptyCard: {
    padding: Spacing["2xl"],
    alignItems: "center",
    gap: Spacing.md,
  },
  emptyText: {
    textAlign: "center",
  },
});
