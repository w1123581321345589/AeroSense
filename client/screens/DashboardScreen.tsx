import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { CO2Gauge } from "@/components/CO2Gauge";
import { FlightPhasePill } from "@/components/FlightPhasePill";
import { AlertCard } from "@/components/AlertCard";
import { MetricsGrid } from "@/components/MetricsGrid";
import { TrendChart } from "@/components/TrendChart";
import { HydrationTracker } from "@/components/HydrationTracker";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/context";
import { Colors, Spacing, Typography } from "@/constants/theme";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const {
    device,
    currentReading,
    activeSession,
    activeAlerts,
    dismissAlert,
    endSession,
  } = useApp();

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.headerLeft}>
          <HeaderTitle />
          {device && (
            <View style={styles.deviceStatus}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: device.isConnected ? Colors.light.co2Safe : theme.textSecondary },
                ]}
              />
              <ThemedText style={[styles.deviceName, { color: theme.textSecondary }]}>
                {device.name}
              </ThemedText>
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          {activeSession ? (
            <Pressable
              onPress={endSession}
              style={({ pressed }) => [
                styles.endButton,
                {
                  backgroundColor: Colors.light.co2Critical + "15",
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <ThemedText style={[styles.endButtonText, { color: Colors.light.co2Critical }]}>
                End Flight
              </ThemedText>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.bellButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Feather name="bell" size={24} color={theme.text} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + Spacing["5xl"] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <CO2Gauge co2={currentReading?.co2 ?? null} />

        {activeSession && (
          <FlightPhasePill
            currentPhase={activeSession.currentPhase}
            style={styles.phasePill}
          />
        )}

        {activeAlerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onDismiss={() => dismissAlert(alert.id)}
          />
        ))}

        <MetricsGrid
          temperature={currentReading?.temperature ?? null}
          humidity={currentReading?.humidity ?? null}
          pressure={currentReading?.pressure ?? null}
          battery={currentReading?.battery ?? null}
          useCelsius={true}
        />

        {activeSession && activeSession.readings.length > 1 && (
          <TrendChart readings={activeSession.readings} />
        )}

        {activeSession && (
          <HydrationTracker
            currentMl={activeSession.hydrationMl}
            targetMl={2000}
          />
        )}

        {!device?.isConnected && (
          <Card style={styles.noDeviceCard}>
            <Feather name="bluetooth" size={32} color={theme.textSecondary} />
            <ThemedText style={[styles.noDeviceTitle, { color: theme.textSecondary }]}>
              No Device Connected
            </ThemedText>
            <ThemedText style={[styles.noDeviceText, { color: theme.textSecondary }]}>
              Connect a CO2 monitor to see real-time air quality data
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
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  deviceStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  deviceName: {
    ...Typography.caption,
  },
  headerRight: {
    marginLeft: Spacing.md,
  },
  bellButton: {
    padding: Spacing.sm,
  },
  endButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Spacing.sm,
  },
  endButtonText: {
    ...Typography.small,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  phasePill: {
    marginBottom: Spacing.lg,
  },
  noDeviceCard: {
    alignItems: "center",
    padding: Spacing["2xl"],
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  noDeviceTitle: {
    ...Typography.h3,
    marginTop: Spacing.sm,
  },
  noDeviceText: {
    ...Typography.small,
    textAlign: "center",
  },
});
