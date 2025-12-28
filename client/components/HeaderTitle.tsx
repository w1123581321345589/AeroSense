import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, Typography } from "@/constants/theme";

export function HeaderTitle() {
  const { isDark } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.logoContainer,
          { backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary },
        ]}
      >
        <Feather name="wind" size={18} color="#FFFFFF" />
      </View>
      <ThemedText style={styles.title}>AeroSense</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...Typography.h2,
  },
});
