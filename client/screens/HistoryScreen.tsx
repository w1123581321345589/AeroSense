import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/context";
import { Colors, Spacing, Typography, BorderRadius, getCO2Color } from "@/constants/theme";
import type { FlightSession } from "@/lib/types";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const { sessions } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatDuration = (start: number, end: number | null) => {
    const endTime = end || Date.now();
    const durationMs = endTime - start;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getMaxCO2 = (readings: FlightSession["readings"]) => {
    if (readings.length === 0) return 0;
    return Math.max(...readings.map((r) => r.co2));
  };

  const renderSession = ({ item }: { item: FlightSession }) => {
    const maxCO2 = getMaxCO2(item.readings);
    const co2Color = getCO2Color(maxCO2, isDark);

    return (
      <Pressable
        onPress={() => navigation.navigate("SessionSummary", { sessionId: item.id })}
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      >
        <Card style={styles.sessionCard}>
          <View style={styles.sessionHeader}>
            <View style={styles.sessionInfo}>
              <ThemedText style={styles.sessionDate}>
                {formatDate(item.startTime)}
              </ThemedText>
              {item.flightNumber && (
                <ThemedText style={[styles.flightNumber, { color: theme.textSecondary }]}>
                  {item.airline ? `${item.airline} ${item.flightNumber}` : item.flightNumber}
                </ThemedText>
              )}
            </View>
            <View style={[styles.co2Badge, { backgroundColor: co2Color + "20" }]}>
              <ThemedText style={[styles.co2BadgeText, { color: co2Color }]}>
                {maxCO2} ppm
              </ThemedText>
            </View>
          </View>
          <View style={styles.sessionMeta}>
            <View style={styles.metaItem}>
              <Feather name="clock" size={14} color={theme.textSecondary} />
              <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
                {formatDuration(item.startTime, item.endTime)}
              </ThemedText>
            </View>
            <View style={styles.metaItem}>
              <Feather name="activity" size={14} color={theme.textSecondary} />
              <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
                {item.readings.length} readings
              </ThemedText>
            </View>
            {item.seat && (
              <View style={styles.metaItem}>
                <Feather name="map-pin" size={14} color={theme.textSecondary} />
                <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
                  Seat {item.seat}
                </ThemedText>
              </View>
            )}
          </View>
        </Card>
      </Pressable>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIcon,
          { backgroundColor: isDark ? Colors.dark.backgroundSecondary : Colors.light.backgroundSecondary },
        ]}
      >
        <Feather name="send" size={48} color={theme.textSecondary} />
      </View>
      <ThemedText style={styles.emptyTitle}>No Flights Logged</ThemedText>
      <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
        Start a flight session from the Dashboard to begin tracking your air quality
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <ThemedText style={styles.title}>Flight History</ThemedText>
      </View>

      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing["3xl"] },
          sessions.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.textSecondary}
          />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
  },
  emptyList: {
    flex: 1,
  },
  sessionCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    ...Typography.h3,
  },
  flightNumber: {
    ...Typography.small,
    marginTop: 2,
  },
  co2Badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  co2BadgeText: {
    ...Typography.caption,
    fontWeight: "600",
  },
  sessionMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  metaText: {
    ...Typography.caption,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h2,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    textAlign: "center",
  },
});
