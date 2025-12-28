import React, { useState, useRef } from "react";
import { View, StyleSheet, Dimensions, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue,
  interpolate,
  Extrapolate 
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Tutorial">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface TutorialStep {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  tip: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    icon: "wifi",
    title: "Connect Your Device",
    description: "AeroSense works with popular CO2 monitors like the Aranet4 and INKBIRD IAM-T1. Simply turn on your device and we'll find it via Bluetooth.",
    tip: "Make sure Bluetooth is enabled on your phone before scanning for devices.",
  },
  {
    icon: "activity",
    title: "Real-Time Monitoring",
    description: "Watch your cabin air quality in real-time with our color-coded CO2 gauge. Green is good, yellow is moderate, orange needs attention, and red is critical.",
    tip: "CO2 levels above 2500 ppm can affect your focus and energy.",
  },
  {
    icon: "navigation",
    title: "Flight Phase Tracking",
    description: "Different flight phases have different air quality patterns. Boarding and taxi typically have higher CO2 levels than cruise altitude.",
    tip: "Update your flight phase to get context-aware recommendations.",
  },
  {
    icon: "bell",
    title: "Smart Alerts",
    description: "Receive notifications when CO2 levels need attention. We'll tell you exactly what to do, like opening your overhead air vent.",
    tip: "Enable notifications for critical alerts even in background.",
  },
  {
    icon: "droplet",
    title: "Stay Hydrated",
    description: "Cabin air is dry and high CO2 increases fatigue. Track your water intake to stay sharp throughout your flight.",
    tip: "Aim for 250ml every 2 hours during flight.",
  },
  {
    icon: "bar-chart-2",
    title: "Flight History",
    description: "Review your past flights to see air quality trends. Compare airlines and identify which routes have the best cabin air.",
    tip: "Premium users can export detailed reports.",
  },
];

export default function TutorialScreen({ navigation }: Props) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  
  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      scrollRef.current?.scrollTo({ x: nextStep * SCREEN_WIDTH, animated: true });
    } else {
      navigation.replace("MainTabs");
    }
  };
  
  const handleSkip = () => {
    navigation.replace("MainTabs");
  };
  
  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const step = Math.round(offsetX / SCREEN_WIDTH);
    if (step !== currentStep && step >= 0 && step < TUTORIAL_STEPS.length) {
      setCurrentStep(step);
    }
  };
  
  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <ThemedText style={{ color: theme.textSecondary }}>Skip</ThemedText>
        </Pressable>
      </View>
      
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {TUTORIAL_STEPS.map((step, index) => (
          <View key={index} style={[styles.stepContainer, { width: SCREEN_WIDTH }]}>
            <View style={[styles.iconContainer, { backgroundColor: isDark ? Colors.dark.primary + "20" : Colors.light.primary + "20" }]}>
              <Feather 
                name={step.icon} 
                size={48} 
                color={isDark ? Colors.dark.primary : Colors.light.primary} 
              />
            </View>
            
            <ThemedText style={styles.stepTitle}>{step.title}</ThemedText>
            <ThemedText style={[styles.stepDescription, { color: theme.textSecondary }]}>
              {step.description}
            </ThemedText>
            
            <Card style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <Feather name="zap" size={16} color={Colors.co2.advisory} />
                <ThemedText style={styles.tipLabel}>Pro Tip</ThemedText>
              </View>
              <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>
                {step.tip}
              </ThemedText>
            </Card>
          </View>
        ))}
      </ScrollView>
      
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <View style={styles.dots}>
          {TUTORIAL_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentStep 
                    ? (isDark ? Colors.dark.primary : Colors.light.primary)
                    : theme.divider,
                  width: index === currentStep ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
        
        <Pressable
          onPress={handleNext}
          style={[styles.nextButton, { backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary }]}
        >
          <ThemedText style={styles.nextButtonText}>
            {currentStep === TUTORIAL_STEPS.length - 1 ? "Get Started" : "Next"}
          </ThemedText>
          <Feather name="arrow-right" size={20} color="#fff" />
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
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  skipButton: {
    padding: Spacing.sm,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  stepDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: Spacing["2xl"],
    paddingHorizontal: Spacing.lg,
  },
  tipCard: {
    width: "100%",
    padding: Spacing.lg,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tipLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.co2.advisory,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
