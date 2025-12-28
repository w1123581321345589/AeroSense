import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  FlightSession,
  DeviceInfo,
  UserSettings,
  AirQualityReading,
} from "./types";

const KEYS = {
  SESSIONS: "aerosense_sessions",
  DEVICE: "aerosense_device",
  SETTINGS: "aerosense_settings",
  CURRENT_SESSION: "aerosense_current_session",
};

const defaultSettings: UserSettings = {
  displayName: "Traveler",
  avatarType: "passenger",
  useCelsius: true,
  alertSensitivity: "medium",
  hapticEnabled: true,
  isPremium: false,
};

export async function getSettings(): Promise<UserSettings> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (data) {
      return { ...defaultSettings, ...JSON.parse(data) };
    }
    return defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

export async function getSessions(): Promise<FlightSession[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SESSIONS);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch {
    return [];
  }
}

export async function saveSession(session: FlightSession): Promise<void> {
  try {
    const sessions = await getSessions();
    const existingIndex = sessions.findIndex((s) => s.id === session.id);
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session);
    }
    await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (error) {
    console.error("Failed to save session:", error);
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    const sessions = await getSessions();
    const filtered = sessions.filter((s) => s.id !== sessionId);
    await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete session:", error);
  }
}

export async function getCurrentSession(): Promise<FlightSession | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.CURRENT_SESSION);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveCurrentSession(
  session: FlightSession | null
): Promise<void> {
  try {
    if (session) {
      await AsyncStorage.setItem(KEYS.CURRENT_SESSION, JSON.stringify(session));
    } else {
      await AsyncStorage.removeItem(KEYS.CURRENT_SESSION);
    }
  } catch (error) {
    console.error("Failed to save current session:", error);
  }
}

export async function getConnectedDevice(): Promise<DeviceInfo | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.DEVICE);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveConnectedDevice(
  device: DeviceInfo | null
): Promise<void> {
  try {
    if (device) {
      await AsyncStorage.setItem(KEYS.DEVICE, JSON.stringify(device));
    } else {
      await AsyncStorage.removeItem(KEYS.DEVICE);
    }
  } catch (error) {
    console.error("Failed to save device:", error);
  }
}

export function generateMockReading(
  phase: string | null = null
): AirQualityReading {
  const baseCO2ByPhase: Record<string, number> = {
    preFlight: 500,
    boarding: 2400,
    taxi: 3000,
    takeoff: 2700,
    climb: 2000,
    cruise: 1500,
    descent: 1800,
    landing: 2300,
    arrived: 950,
  };

  const base = phase && baseCO2ByPhase[phase] ? baseCO2ByPhase[phase] : 900;
  const variation = Math.floor(Math.random() * 400) - 200;

  return {
    id: `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    co2: Math.max(400, base + variation),
    temperature: 21 + Math.random() * 4,
    humidity: Math.floor(15 + Math.random() * 20),
    pressure: 800 + Math.random() * 50,
    battery: Math.floor(70 + Math.random() * 30),
    timestamp: Date.now(),
    source: "aranet4",
    flightPhase: phase as any,
  };
}

export function createNewSession(): FlightSession {
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    startTime: Date.now(),
    endTime: null,
    readings: [],
    currentPhase: "preFlight",
    airline: null,
    flightNumber: null,
    seat: null,
    hydrationMl: 0,
  };
}
