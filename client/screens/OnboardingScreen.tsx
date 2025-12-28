import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/context";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import type { DeviceInfo } from "@/lib/types";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { isScanning, scanForDevices, discoveredDevices, connectDevice } = useApp();

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    scanForDevices();
    pulseScale.value = withRepeat(
      withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 2 - pulseScale.value,
  }));

  const renderDevice = ({ item }: { item: DeviceInfo }) => (
    <Card style={styles.deviceCard}>
      <View style={styles.deviceInfo}>
        <View
          style={[
            styles.deviceIcon,
            { backgroundColor: isDark ? Colors.dark.primary + "20" : Colors.light.primary + "20" },
          ]}
        >
          <Feather
            name="radio"
            size={24}
            color={isDark ? Colors.dark.primary : Colors.light.primary}
          />
        </View>
        <View style={styles.deviceText}>
          <ThemedText style={styles.deviceName}>{item.name}</ThemedText>
          <ThemedText style={[styles.deviceType, { color: theme.textSecondary }]}>
            {item.type === "aranet4" ? "Aranet4" : item.type === "inkbird" ? "INKBIRD" : "CO2 Monitor"}
          </ThemedText>
        </View>
        {item.battery !== null && (
          <View style={styles.batteryContainer}>
            <Feather name="battery" size={16} color={theme.textSecondary} />
            <ThemedText style={[styles.batteryText, { color: theme.textSecondary }]}>
              {item.battery}%
            </ThemedText>
          </View>
        )}
      </View>
      <Pressable
        onPress={() => connectDevice(item)}
        style={({ pressed }) => [
          styles.connectButton,
          {
            backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary,
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <ThemedText style={styles.connectButtonText}>Connect</ThemedText>
      </Pressable>
    </Card>
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + Spacing.xl }]}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View
            style={[
              styles.logoCircle,
              { backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary },
            ]}
          >
            <Feather name="wind" size={40} color="#FFFFFF" />
          </View>
        </View>
        <ThemedText style={styles.title}>AeroSense</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Aviation Air Quality Intelligence
        </ThemedText>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.sectionTitle}>Connect Your CO2 Monitor</ThemedText>
        <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
          {Platform.OS === "web"
            ? "On web, we'll simulate a device connection. For real BLE connectivity, use the Expo Go app on your mobile device."
            : "Turn on Bluetooth and ensure your CO2 monitor is nearby with Smart Home integration enabled."}
        </ThemedText>

        {isScanning ? (
          <View style={styles.scanningContainer}>
            <Animated.View
              style={[
                styles.pulseRing,
                pulseStyle,
                { borderColor: isDark ? Colors.dark.primary : Colors.light.primary },
              ]}
            />
            <View
              style={[
                styles.scanCircle,
                { backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary },
              ]}
            >
              <Feather name="bluetooth" size={32} color="#FFFFFF" />
            </View>
            <ThemedText style={[styles.scanningText, { color: theme.textSecondary }]}>
              Scanning for devices...
            </ThemedText>
          </View>
        ) : discoveredDevices.length > 0 ? (
          <FlatList
            data={discoveredDevices}
            renderItem={renderDevice}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.deviceList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="bluetooth" size={48} color={theme.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              No devices found
            </ThemedText>
            <Pressable
              onPress={scanForDevices}
              style={({ pressed }) => [
                styles.rescanButton,
                {
                  borderColor: isDark ? Colors.dark.primary : Colors.light.primary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.rescanButtonText,
                  { color: isDark ? Colors.dark.primary : Colors.light.primary },
                ]}
              >
                Scan Again
              </ThemedText>
            </Pressable>
          </View>
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Pressable
          onPress={() => {
            connectDevice({
              id: "demo_device",
              name: "Demo CO2 Monitor",
              type: "aranet4",
              battery: 100,
              lastSeen: Date.now(),
              isConnected: false,
            });
          }}
          style={({ pressed }) => [
            styles.skipButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <ThemedText style={[styles.skipText, { color: theme.textSecondary }]}>
            Continue with Demo Mode
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing["3xl"],
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.small,
    marginBottom: Spacing.xl,
  },
  scanningContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -Spacing["5xl"],
  },
  pulseRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
  },
  scanCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scanningText: {
    ...Typography.body,
    marginTop: Spacing.xl,
  },
  deviceList: {
    paddingTop: Spacing.sm,
  },
  deviceCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  deviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  deviceText: {
    flex: 1,
  },
  deviceName: {
    ...Typography.h3,
    marginBottom: 2,
  },
  deviceType: {
    ...Typography.caption,
  },
  batteryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  batteryText: {
    ...Typography.caption,
  },
  connectButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  connectButtonText: {
    ...Typography.h3,
    color: "#FFFFFF",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -Spacing["5xl"],
    gap: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
  },
  rescanButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  rescanButtonText: {
    ...Typography.h3,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  skipButton: {
    padding: Spacing.md,
  },
  skipText: {
    ...Typography.body,
  },
});
