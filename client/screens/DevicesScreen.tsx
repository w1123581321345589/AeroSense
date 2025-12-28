import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/context";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";
import type { DeviceInfo } from "@/lib/types";

export default function DevicesScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const {
    device,
    isScanning,
    scanForDevices,
    connectDevice,
    disconnectDevice,
    discoveredDevices,
  } = useApp();

  const renderDevice = (deviceItem: DeviceInfo, isConnected: boolean) => (
    <Card key={deviceItem.id} style={styles.deviceCard}>
      <View style={styles.deviceHeader}>
        <View
          style={[
            styles.deviceIcon,
            {
              backgroundColor: isConnected
                ? (isDark ? Colors.dark.co2Safe : Colors.light.co2Safe) + "20"
                : (isDark ? Colors.dark.primary : Colors.light.primary) + "20",
            },
          ]}
        >
          <Feather
            name="radio"
            size={28}
            color={
              isConnected
                ? isDark ? Colors.dark.co2Safe : Colors.light.co2Safe
                : isDark ? Colors.dark.primary : Colors.light.primary
            }
          />
        </View>
        <View style={styles.deviceInfo}>
          <ThemedText style={styles.deviceName}>{deviceItem.name}</ThemedText>
          <View style={styles.deviceMeta}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isConnected
                    ? (isDark ? Colors.dark.co2Safe : Colors.light.co2Safe) + "20"
                    : theme.backgroundSecondary,
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isConnected
                      ? isDark ? Colors.dark.co2Safe : Colors.light.co2Safe
                      : theme.textSecondary,
                  },
                ]}
              />
              <ThemedText
                style={[
                  styles.statusText,
                  {
                    color: isConnected
                      ? isDark ? Colors.dark.co2Safe : Colors.light.co2Safe
                      : theme.textSecondary,
                  },
                ]}
              >
                {isConnected ? "Connected" : "Available"}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {deviceItem.battery !== null && (
        <View style={styles.batteryRow}>
          <Feather name="battery" size={16} color={theme.textSecondary} />
          <ThemedText style={[styles.batteryText, { color: theme.textSecondary }]}>
            {deviceItem.battery}% battery
          </ThemedText>
        </View>
      )}

      <Pressable
        onPress={() => isConnected ? disconnectDevice() : connectDevice(deviceItem)}
        style={({ pressed }) => [
          styles.actionButton,
          {
            backgroundColor: isConnected
              ? Colors.light.co2Critical + "15"
              : isDark ? Colors.dark.primary : Colors.light.primary,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.actionButtonText,
            { color: isConnected ? Colors.light.co2Critical : "#FFFFFF" },
          ]}
        >
          {isConnected ? "Disconnect" : "Connect"}
        </ThemedText>
      </Pressable>
    </Card>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <ThemedText style={styles.title}>Devices</ThemedText>
        <Pressable
          onPress={scanForDevices}
          disabled={isScanning}
          style={({ pressed }) => [
            styles.addButton,
            {
              backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          {isScanning ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Feather name="plus" size={18} color="#FFFFFF" />
              <ThemedText style={styles.addButtonText}>Add Device</ThemedText>
            </>
          )}
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + Spacing["3xl"] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {device && device.isConnected && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              Connected
            </ThemedText>
            {renderDevice(device, true)}
          </View>
        )}

        {discoveredDevices.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              Available Devices
            </ThemedText>
            {discoveredDevices.map((d) => renderDevice(d, false))}
          </View>
        )}

        {isScanning && (
          <View style={styles.scanningContainer}>
            <ActivityIndicator
              size="large"
              color={isDark ? Colors.dark.primary : Colors.light.primary}
            />
            <ThemedText style={[styles.scanningText, { color: theme.textSecondary }]}>
              Scanning for devices...
            </ThemedText>
          </View>
        )}

        {!device && !isScanning && discoveredDevices.length === 0 && (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Feather name="bluetooth" size={48} color={theme.textSecondary} />
            </View>
            <ThemedText style={styles.emptyTitle}>No Devices</ThemedText>
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              Tap "Add Device" to scan for nearby CO2 monitors
            </ThemedText>
          </View>
        )}

        <Card style={styles.helpCard}>
          <Feather name="help-circle" size={20} color={theme.textSecondary} />
          <View style={styles.helpContent}>
            <ThemedText style={styles.helpTitle}>Troubleshooting</ThemedText>
            <ThemedText style={[styles.helpText, { color: theme.textSecondary }]}>
              Make sure your CO2 monitor has Bluetooth enabled and "Smart Home Integration" turned on in device settings.
            </ThemedText>
          </View>
        </Card>
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
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  addButtonText: {
    ...Typography.small,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.caption,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  deviceCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  deviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  deviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
  deviceMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: "500",
  },
  batteryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    paddingLeft: 72,
  },
  batteryText: {
    ...Typography.small,
  },
  actionButton: {
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    ...Typography.h3,
  },
  scanningContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["3xl"],
    gap: Spacing.md,
  },
  scanningText: {
    ...Typography.body,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
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
  helpCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
  helpText: {
    ...Typography.small,
  },
});
