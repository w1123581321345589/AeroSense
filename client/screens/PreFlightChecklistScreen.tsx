import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/lib/context";
import { Colors, Spacing, Typography, BorderRadius } from "@/constants/theme";

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  auto?: boolean;
}

export default function PreFlightChecklistScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { device, startSession } = useApp();

  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: "device", label: "CO2 monitor connected", checked: !!device?.isConnected, auto: true },
    { id: "placement", label: "Device placed in seat pocket or tray", checked: false },
    { id: "notifications", label: "Notifications enabled", checked: true, auto: true },
  ]);

  const [airline, setAirline] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [seat, setSeat] = useState("");

  const allChecked = checklist.every((item) => item.checked);

  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id && !item.auto ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleStartFlight = () => {
    startSession(airline || undefined, flightNumber || undefined, seat || undefined);
    navigation.goBack();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.cancelButton, { opacity: pressed ? 0.6 : 1 }]}
        >
          <ThemedText style={[styles.cancelText, { color: theme.textSecondary }]}>
            Cancel
          </ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle}>Pre-Flight Checklist</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <Card style={styles.checklistCard}>
          {checklist.map((item, index) => (
            <View key={item.id}>
              <Pressable
                onPress={() => toggleItem(item.id)}
                disabled={item.auto}
                style={({ pressed }) => [
                  styles.checklistRow,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: item.checked
                        ? isDark ? Colors.dark.co2Safe : Colors.light.co2Safe
                        : "transparent",
                      borderColor: item.checked
                        ? isDark ? Colors.dark.co2Safe : Colors.light.co2Safe
                        : theme.textSecondary,
                    },
                  ]}
                >
                  {item.checked && <Feather name="check" size={14} color="#FFFFFF" />}
                </View>
                <ThemedText
                  style={[
                    styles.checklistLabel,
                    item.checked && { opacity: 0.7 },
                  ]}
                >
                  {item.label}
                </ThemedText>
                {item.auto && (
                  <ThemedText style={[styles.autoLabel, { color: theme.textSecondary }]}>
                    Auto
                  </ThemedText>
                )}
              </Pressable>
              {index < checklist.length - 1 && (
                <View style={[styles.divider, { backgroundColor: theme.divider }]} />
              )}
            </View>
          ))}
        </Card>

        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Flight Details (Optional)
        </ThemedText>

        <Card style={styles.formCard}>
          <View style={styles.formRow}>
            <ThemedText style={styles.formLabel}>Airline</ThemedText>
            <TextInput
              value={airline}
              onChangeText={setAirline}
              placeholder="e.g., United"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.formInput,
                { color: theme.text, backgroundColor: theme.backgroundSecondary },
              ]}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <View style={styles.formRow}>
            <ThemedText style={styles.formLabel}>Flight Number</ThemedText>
            <TextInput
              value={flightNumber}
              onChangeText={setFlightNumber}
              placeholder="e.g., UA123"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.formInput,
                { color: theme.text, backgroundColor: theme.backgroundSecondary },
              ]}
              autoCapitalize="characters"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <View style={styles.formRow}>
            <ThemedText style={styles.formLabel}>Seat</ThemedText>
            <TextInput
              value={seat}
              onChangeText={setSeat}
              placeholder="e.g., 12A"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.formInput,
                { color: theme.text, backgroundColor: theme.backgroundSecondary },
              ]}
              autoCapitalize="characters"
            />
          </View>
        </Card>

        <Pressable
          onPress={handleStartFlight}
          disabled={!allChecked}
          style={({ pressed }) => [
            styles.startButton,
            {
              backgroundColor: allChecked
                ? isDark ? Colors.dark.primary : Colors.light.primary
                : theme.backgroundSecondary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather
            name="navigation"
            size={20}
            color={allChecked ? "#FFFFFF" : theme.textSecondary}
          />
          <ThemedText
            style={[
              styles.startButtonText,
              { color: allChecked ? "#FFFFFF" : theme.textSecondary },
            ]}
          >
            Start Flight
          </ThemedText>
        </Pressable>
      </KeyboardAwareScrollViewCompat>
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
  cancelButton: {
    padding: Spacing.xs,
  },
  cancelText: {
    ...Typography.body,
  },
  headerTitle: {
    ...Typography.h3,
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  checklistCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  checklistRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  checklistLabel: {
    ...Typography.body,
    flex: 1,
  },
  autoLabel: {
    ...Typography.caption,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.caption,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  formCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  formLabel: {
    ...Typography.body,
    flex: 1,
  },
  formInput: {
    ...Typography.body,
    flex: 1,
    textAlign: "right",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  startButtonText: {
    ...Typography.h3,
  },
});
