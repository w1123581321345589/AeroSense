import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import PreFlightChecklistScreen from "@/screens/PreFlightChecklistScreen";
import FlightSummaryScreen from "@/screens/FlightSummaryScreen";
import OnboardingScreen from "@/screens/OnboardingScreen";
import SessionDetailScreen from "@/screens/SessionDetailScreen";
import TutorialScreen from "@/screens/TutorialScreen";
import SessionSummaryScreen from "@/screens/SessionSummaryScreen";
import AirlineRankingsScreen from "@/screens/AirlineRankingsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useApp } from "@/lib/context";

export type RootStackParamList = {
  Onboarding: undefined;
  Tutorial: undefined;
  MainTabs: undefined;
  Main: undefined;
  PreFlightChecklist: undefined;
  FlightSummary: undefined;
  SessionDetail: { sessionId: string };
  SessionSummary: { sessionId: string };
  AirlineRankings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { device, isLoading } = useApp();

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!device ? (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MainTabs"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Tutorial"
            component={TutorialScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PreFlightChecklist"
            component={PreFlightChecklistScreen}
            options={{
              presentation: "modal",
              headerTitle: "Pre-Flight Checklist",
            }}
          />
          <Stack.Screen
            name="FlightSummary"
            component={FlightSummaryScreen}
            options={{
              presentation: "modal",
              headerTitle: "Flight Summary",
            }}
          />
          <Stack.Screen
            name="SessionDetail"
            component={SessionDetailScreen}
            options={{
              headerTitle: "Flight Details",
            }}
          />
          <Stack.Screen
            name="SessionSummary"
            component={SessionSummaryScreen}
            options={{
              headerTitle: "Flight Summary",
            }}
          />
          <Stack.Screen
            name="AirlineRankings"
            component={AirlineRankingsScreen}
            options={{
              headerTitle: "Airline Rankings",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
