import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  TextInput,
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

type AvatarType = "pilot" | "attendant" | "passenger";

const avatars: { type: AvatarType; icon: string; label: string }[] = [
  { type: "pilot", icon: "briefcase", label: "Pilot" },
  { type: "attendant", icon: "coffee", label: "Crew" },
  { type: "passenger", icon: "user", label: "Passenger" },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const { settings, updateSettings, disconnectDevice } = useApp();

  const [editingName, setEditingName] = React.useState(false);
  const [tempName, setTempName] = React.useState(settings.displayName);

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateSettings({ displayName: tempName.trim() });
    }
    setEditingName(false);
  };

  const handleAvatarChange = (type: AvatarType) => {
    updateSettings({ avatarType: type });
  };

  const handleSensitivityChange = (sensitivity: "low" | "medium" | "high") => {
    updateSettings({ alertSensitivity: sensitivity });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <ThemedText style={styles.title}>Settings</ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + Spacing["3xl"] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary },
              ]}
            >
              <Feather
                name={
                  settings.avatarType === "pilot"
                    ? "briefcase"
                    : settings.avatarType === "attendant"
                    ? "coffee"
                    : "user"
                }
                size={32}
                color="#FFFFFF"
              />
            </View>
            <View style={styles.nameSection}>
              {editingName ? (
                <View style={styles.nameEditRow}>
                  <TextInput
                    value={tempName}
                    onChangeText={setTempName}
                    style={[
                      styles.nameInput,
                      {
                        color: theme.text,
                        backgroundColor: theme.backgroundSecondary,
                        borderColor: isDark ? Colors.dark.primary : Colors.light.primary,
                      },
                    ]}
                    autoFocus
                    onBlur={handleSaveName}
                    onSubmitEditing={handleSaveName}
                  />
                </View>
              ) : (
                <Pressable
                  onPress={() => {
                    setTempName(settings.displayName);
                    setEditingName(true);
                  }}
                  style={styles.nameRow}
                >
                  <ThemedText style={styles.displayName}>{settings.displayName}</ThemedText>
                  <Feather name="edit-2" size={16} color={theme.textSecondary} />
                </Pressable>
              )}
            </View>
          </View>

          <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            Avatar
          </ThemedText>
          <View style={styles.avatarPicker}>
            {avatars.map((avatar) => (
              <Pressable
                key={avatar.type}
                onPress={() => handleAvatarChange(avatar.type)}
                style={({ pressed }) => [
                  styles.avatarOption,
                  {
                    backgroundColor:
                      settings.avatarType === avatar.type
                        ? (isDark ? Colors.dark.primary : Colors.light.primary) + "20"
                        : theme.backgroundSecondary,
                    borderColor:
                      settings.avatarType === avatar.type
                        ? isDark ? Colors.dark.primary : Colors.light.primary
                        : "transparent",
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Feather
                  name={avatar.icon as any}
                  size={24}
                  color={
                    settings.avatarType === avatar.type
                      ? isDark ? Colors.dark.primary : Colors.light.primary
                      : theme.textSecondary
                  }
                />
                <ThemedText
                  style={[
                    styles.avatarLabel,
                    {
                      color:
                        settings.avatarType === avatar.type
                          ? isDark ? Colors.dark.primary : Colors.light.primary
                          : theme.textSecondary,
                    },
                  ]}
                >
                  {avatar.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Card>

        <ThemedText style={[styles.groupTitle, { color: theme.textSecondary }]}>
          Preferences
        </ThemedText>

        <Card style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Temperature Unit</ThemedText>
              <ThemedText style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Display temperature in Celsius or Fahrenheit
              </ThemedText>
            </View>
            <View style={styles.unitToggle}>
              <Pressable
                onPress={() => updateSettings({ useCelsius: true })}
                style={[
                  styles.unitOption,
                  {
                    backgroundColor: settings.useCelsius
                      ? isDark ? Colors.dark.primary : Colors.light.primary
                      : theme.backgroundSecondary,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.unitText,
                    { color: settings.useCelsius ? "#FFFFFF" : theme.text },
                  ]}
                >
                  C
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => updateSettings({ useCelsius: false })}
                style={[
                  styles.unitOption,
                  {
                    backgroundColor: !settings.useCelsius
                      ? isDark ? Colors.dark.primary : Colors.light.primary
                      : theme.backgroundSecondary,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.unitText,
                    { color: !settings.useCelsius ? "#FFFFFF" : theme.text },
                  ]}
                >
                  F
                </ThemedText>
              </Pressable>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Haptic Feedback</ThemedText>
              <ThemedText style={[styles.settingDescription, { color: theme.textSecondary }]}>
                Vibration for alerts and interactions
              </ThemedText>
            </View>
            <Switch
              value={settings.hapticEnabled}
              onValueChange={(value) => updateSettings({ hapticEnabled: value })}
              trackColor={{
                false: theme.backgroundSecondary,
                true: isDark ? Colors.dark.primary : Colors.light.primary,
              }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <View style={styles.settingRowVertical}>
            <ThemedText style={styles.settingLabel}>Alert Sensitivity</ThemedText>
            <View style={styles.sensitivityOptions}>
              {(["low", "medium", "high"] as const).map((level) => (
                <Pressable
                  key={level}
                  onPress={() => handleSensitivityChange(level)}
                  style={[
                    styles.sensitivityOption,
                    {
                      backgroundColor:
                        settings.alertSensitivity === level
                          ? isDark ? Colors.dark.primary : Colors.light.primary
                          : theme.backgroundSecondary,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.sensitivityText,
                      {
                        color:
                          settings.alertSensitivity === level ? "#FFFFFF" : theme.text,
                      },
                    ]}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        </Card>

        <ThemedText style={[styles.groupTitle, { color: theme.textSecondary }]}>
          Premium
        </ThemedText>

        <Card style={styles.premiumCard}>
          <View style={styles.premiumHeader}>
            <View
              style={[
                styles.premiumBadge,
                { backgroundColor: isDark ? Colors.dark.co2Caution : Colors.light.co2Caution },
              ]}
            >
              <Feather name="star" size={20} color="#000000" />
            </View>
            <View style={styles.premiumInfo}>
              <ThemedText style={styles.premiumTitle}>AeroSense Premium</ThemedText>
              <ThemedText style={[styles.premiumPrice, { color: theme.textSecondary }]}>
                $4.99/month
              </ThemedText>
            </View>
          </View>
          <View style={styles.premiumFeatures}>
            <View style={styles.featureRow}>
              <Feather name="check" size={16} color={Colors.light.co2Safe} />
              <ThemedText style={styles.featureText}>Multi-device support</ThemedText>
            </View>
            <View style={styles.featureRow}>
              <Feather name="check" size={16} color={Colors.light.co2Safe} />
              <ThemedText style={styles.featureText}>Export flight history</ThemedText>
            </View>
            <View style={styles.featureRow}>
              <Feather name="check" size={16} color={Colors.light.co2Safe} />
              <ThemedText style={styles.featureText}>Advanced analytics</ThemedText>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.upgradeButton,
              {
                backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <ThemedText style={styles.upgradeButtonText}>Upgrade</ThemedText>
          </Pressable>
        </Card>

        <Pressable
          onPress={disconnectDevice}
          style={({ pressed }) => [
            styles.disconnectButton,
            {
              backgroundColor: Colors.light.co2Critical + "15",
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <ThemedText style={[styles.disconnectText, { color: Colors.light.co2Critical }]}>
            Disconnect Device
          </ThemedText>
        </Pressable>

        <ThemedText style={[styles.versionText, { color: theme.textSecondary }]}>
          AeroSense v1.0.0
        </ThemedText>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  profileCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  nameSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  nameEditRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  displayName: {
    ...Typography.h2,
  },
  nameInput: {
    flex: 1,
    ...Typography.h2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  sectionLabel: {
    ...Typography.caption,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  avatarPicker: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  avatarOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    gap: Spacing.xs,
  },
  avatarLabel: {
    ...Typography.caption,
    fontWeight: "500",
  },
  groupTitle: {
    ...Typography.caption,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  settingsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingRowVertical: {
    gap: Spacing.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    ...Typography.body,
    fontWeight: "500",
    marginBottom: 2,
  },
  settingDescription: {
    ...Typography.caption,
  },
  unitToggle: {
    flexDirection: "row",
    borderRadius: BorderRadius.xs,
    overflow: "hidden",
  },
  unitOption: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  unitText: {
    ...Typography.body,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  sensitivityOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  sensitivityOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
  sensitivityText: {
    ...Typography.small,
    fontWeight: "500",
  },
  premiumCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  premiumHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  premiumBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  premiumInfo: {
    flex: 1,
  },
  premiumTitle: {
    ...Typography.h3,
  },
  premiumPrice: {
    ...Typography.small,
  },
  premiumFeatures: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  featureText: {
    ...Typography.body,
  },
  upgradeButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  upgradeButtonText: {
    ...Typography.h3,
    color: "#FFFFFF",
  },
  disconnectButton: {
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  disconnectText: {
    ...Typography.body,
    fontWeight: "600",
  },
  versionText: {
    ...Typography.caption,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
});
