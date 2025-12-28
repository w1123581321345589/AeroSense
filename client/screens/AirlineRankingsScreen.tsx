import React, { useMemo } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/context";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getAirlineByCode, calculateRating, type AirlineRanking } from "@/lib/airlines";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "AirlineRankings">;

const RATING_COLORS = {
  excellent: Colors.co2.good,
  good: "#4CAF50",
  fair: Colors.co2.advisory,
  poor: Colors.co2.critical,
};

const RATING_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  excellent: "award",
  good: "thumbs-up",
  fair: "minus",
  poor: "thumbs-down",
};

export default function AirlineRankingsScreen({ navigation }: Props) {
  const { theme, isDark } = useTheme();
  const { sessions } = useApp();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  
  const rankings = useMemo<AirlineRanking[]>(() => {
    const airlineData: Record<string, { co2Values: number[]; name: string }> = {};
    
    sessions.forEach(session => {
      if (!session.airline || session.readings.length === 0) return;
      
      const code = session.airline.toUpperCase();
      if (!airlineData[code]) {
        const airline = getAirlineByCode(code);
        airlineData[code] = { 
          co2Values: [], 
          name: airline?.name || code 
        };
      }
      
      session.readings.forEach(r => {
        airlineData[code].co2Values.push(r.co2);
      });
    });
    
    return Object.entries(airlineData)
      .map(([code, data]) => {
        const avgCO2 = Math.round(data.co2Values.reduce((a, b) => a + b, 0) / data.co2Values.length);
        const maxCO2 = Math.max(...data.co2Values);
        const minCO2 = Math.min(...data.co2Values);
        const sessionCount = sessions.filter(s => s.airline?.toUpperCase() === code).length;
        
        return {
          airlineCode: code,
          airlineName: data.name,
          avgCO2,
          maxCO2,
          minCO2,
          sessionCount,
          rating: calculateRating(avgCO2),
        };
      })
      .sort((a, b) => a.avgCO2 - b.avgCO2);
  }, [sessions]);
  
  const hasData = rankings.length > 0;
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.md, paddingBottom: insets.bottom + Spacing.xl }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.subtitle}>
          Based on your {sessions.length} recorded flight{sessions.length !== 1 ? "s" : ""}
        </ThemedText>
        
        {hasData ? (
          <>
            {rankings.map((ranking, index) => (
              <Card key={ranking.airlineCode} style={styles.rankingCard}>
                <View style={styles.rankHeader}>
                  <View style={styles.rankBadge}>
                    <ThemedText style={styles.rankNumber}>#{index + 1}</ThemedText>
                  </View>
                  
                  <View style={styles.airlineInfo}>
                    <ThemedText style={styles.airlineName}>{ranking.airlineName}</ThemedText>
                    <ThemedText style={[styles.airlineCode, { color: theme.textSecondary }]}>
                      {ranking.airlineCode} - {ranking.sessionCount} flight{ranking.sessionCount !== 1 ? "s" : ""}
                    </ThemedText>
                  </View>
                  
                  <View style={[styles.ratingBadge, { backgroundColor: RATING_COLORS[ranking.rating] + "20" }]}>
                    <Feather 
                      name={RATING_ICONS[ranking.rating]} 
                      size={16} 
                      color={RATING_COLORS[ranking.rating]} 
                    />
                    <ThemedText style={[styles.ratingText, { color: RATING_COLORS[ranking.rating] }]}>
                      {ranking.rating.charAt(0).toUpperCase() + ranking.rating.slice(1)}
                    </ThemedText>
                  </View>
                </View>
                
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Average</ThemedText>
                    <ThemedText style={[styles.statValue, { color: RATING_COLORS[ranking.rating] }]}>
                      {ranking.avgCO2}
                    </ThemedText>
                    <ThemedText style={[styles.statUnit, { color: theme.textSecondary }]}>ppm</ThemedText>
                  </View>
                  
                  <View style={styles.statDivider} />
                  
                  <View style={styles.statItem}>
                    <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Peak</ThemedText>
                    <ThemedText style={styles.statValue}>{ranking.maxCO2}</ThemedText>
                    <ThemedText style={[styles.statUnit, { color: theme.textSecondary }]}>ppm</ThemedText>
                  </View>
                  
                  <View style={styles.statDivider} />
                  
                  <View style={styles.statItem}>
                    <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Best</ThemedText>
                    <ThemedText style={[styles.statValue, { color: Colors.co2.good }]}>
                      {ranking.minCO2}
                    </ThemedText>
                    <ThemedText style={[styles.statUnit, { color: theme.textSecondary }]}>ppm</ThemedText>
                  </View>
                </View>
              </Card>
            ))}
            
            <Card style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Feather name="info" size={20} color={isDark ? Colors.dark.primary : Colors.light.primary} />
                <ThemedText style={styles.infoTitle}>How Rankings Work</ThemedText>
              </View>
              <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>
                Airlines are ranked by average CO2 levels across all your recorded flights. 
                Lower average CO2 means better cabin air quality. Ratings are based on research 
                showing cognitive effects at different CO2 levels.
              </ThemedText>
              
              <View style={styles.legendContainer}>
                {Object.entries(RATING_COLORS).map(([rating, color]) => (
                  <View key={rating} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: color }]} />
                    <ThemedText style={styles.legendText}>
                      {rating.charAt(0).toUpperCase() + rating.slice(1)}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </Card>
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Feather name="bar-chart-2" size={64} color={theme.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Rankings Yet</ThemedText>
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              Start recording flights with airline information to see how different airlines 
              compare on cabin air quality.
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
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: Spacing.sm,
  },
  rankingCard: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  rankHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(128,128,128,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: "700",
  },
  airlineInfo: {
    flex: 1,
  },
  airlineName: {
    fontSize: 16,
    fontWeight: "600",
  },
  airlineCode: {
    fontSize: 12,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(128,128,128,0.2)",
  },
  statLabel: {
    fontSize: 11,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  statUnit: {
    fontSize: 10,
  },
  infoCard: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
  },
  emptyCard: {
    padding: Spacing["2xl"],
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
