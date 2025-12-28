import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type {
  FlightSession,
  DeviceInfo,
  UserSettings,
  AirQualityReading,
  AirQualityAlert,
  FlightPhase,
} from "./types";
import { getAlertLevel } from "./types";
import {
  getSettings,
  saveSettings,
  getSessions,
  saveSession,
  deleteSession,
  getCurrentSession,
  saveCurrentSession,
  getConnectedDevice,
  saveConnectedDevice,
  generateMockReading,
  createNewSession,
} from "./storage";
import * as Haptics from "expo-haptics";

interface AppContextType {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  
  device: DeviceInfo | null;
  isScanning: boolean;
  scanForDevices: () => void;
  connectDevice: (device: DeviceInfo) => void;
  disconnectDevice: () => void;
  discoveredDevices: DeviceInfo[];
  
  currentReading: AirQualityReading | null;
  
  activeSession: FlightSession | null;
  startSession: (airline?: string, flightNumber?: string, seat?: string) => void;
  endSession: () => void;
  updatePhase: (phase: FlightPhase) => void;
  addHydration: (ml: number) => void;
  
  sessions: FlightSession[];
  deleteSessionById: (id: string) => void;
  
  activeAlerts: AirQualityAlert[];
  dismissAlert: (id: string) => void;
  
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>({
    displayName: "Traveler",
    avatarType: "passenger",
    useCelsius: true,
    alertSensitivity: "medium",
    hapticEnabled: true,
    isPremium: false,
  });
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<DeviceInfo[]>([]);
  const [currentReading, setCurrentReading] = useState<AirQualityReading | null>(null);
  const [activeSession, setActiveSession] = useState<FlightSession | null>(null);
  const [sessions, setSessions] = useState<FlightSession[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<AirQualityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const readingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadData();
    return () => {
      if (readingIntervalRef.current) {
        clearInterval(readingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (device && device.isConnected) {
      startReadingUpdates();
    } else {
      stopReadingUpdates();
    }
    return () => stopReadingUpdates();
  }, [device]);

  const loadData = async () => {
    try {
      const [loadedSettings, loadedSessions, loadedDevice, loadedCurrentSession] = await Promise.all([
        getSettings(),
        getSessions(),
        getConnectedDevice(),
        getCurrentSession(),
      ]);
      
      setSettings(loadedSettings);
      setSessions(loadedSessions);
      setDevice(loadedDevice);
      setActiveSession(loadedCurrentSession);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startReadingUpdates = () => {
    if (readingIntervalRef.current) return;
    
    const reading = generateMockReading(activeSession?.currentPhase || null);
    setCurrentReading(reading);
    checkForAlerts(reading);
    
    readingIntervalRef.current = setInterval(() => {
      const newReading = generateMockReading(activeSession?.currentPhase || null);
      setCurrentReading(newReading);
      checkForAlerts(newReading);
      
      if (activeSession) {
        setActiveSession(prev => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            readings: [...prev.readings, newReading],
          };
          saveCurrentSession(updated);
          return updated;
        });
      }
    }, 5000);
  };

  const stopReadingUpdates = () => {
    if (readingIntervalRef.current) {
      clearInterval(readingIntervalRef.current);
      readingIntervalRef.current = null;
    }
  };

  const checkForAlerts = (reading: AirQualityReading) => {
    const level = getAlertLevel(reading.co2);
    if (level === "critical" || level === "warning") {
      const existingAlert = activeAlerts.find(a => a.level === level && !a.acknowledged);
      if (!existingAlert) {
        const newAlert: AirQualityAlert = {
          id: `alert_${Date.now()}`,
          level,
          headline: level === "critical" ? "High CO2 Detected" : "Elevated CO2 Levels",
          metric: `${reading.co2} ppm`,
          action: level === "critical"
            ? "Open overhead vent fully and direct airflow toward your face."
            : "Consider opening your air vent for better circulation.",
          evidence: level === "critical"
            ? "Studies show cognitive performance decreases above 2500 ppm"
            : null,
          timestamp: Date.now(),
          acknowledged: false,
        };
        setActiveAlerts(prev => [newAlert, ...prev]);
        
        if (settings.hapticEnabled) {
          Haptics.notificationAsync(
            level === "critical"
              ? Haptics.NotificationFeedbackType.Error
              : Haptics.NotificationFeedbackType.Warning
          );
        }
      }
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const scanForDevices = useCallback(() => {
    setIsScanning(true);
    setDiscoveredDevices([]);
    
    setTimeout(() => {
      const mockDevices: DeviceInfo[] = [
        {
          id: "aranet4_001",
          name: "Aranet4 Home",
          type: "aranet4",
          battery: 85,
          lastSeen: Date.now(),
          isConnected: false,
        },
        {
          id: "inkbird_001",
          name: "INKBIRD IAM-T1",
          type: "inkbird",
          battery: 92,
          lastSeen: Date.now(),
          isConnected: false,
        },
      ];
      setDiscoveredDevices(mockDevices);
      setIsScanning(false);
    }, 2000);
  }, []);

  const connectDevice = useCallback(async (deviceToConnect: DeviceInfo) => {
    setIsScanning(false);
    const connectedDevice = { ...deviceToConnect, isConnected: true, lastSeen: Date.now() };
    setDevice(connectedDevice);
    await saveConnectedDevice(connectedDevice);
    setDiscoveredDevices([]);
    
    if (settings.hapticEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [settings.hapticEnabled]);

  const disconnectDevice = useCallback(async () => {
    setDevice(null);
    setCurrentReading(null);
    await saveConnectedDevice(null);
    stopReadingUpdates();
    
    if (settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [settings.hapticEnabled]);

  const startSession = useCallback(async (airline?: string, flightNumber?: string, seat?: string) => {
    const session = createNewSession();
    session.airline = airline || null;
    session.flightNumber = flightNumber || null;
    session.seat = seat || null;
    
    setActiveSession(session);
    await saveCurrentSession(session);
    
    if (settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [settings.hapticEnabled]);

  const endSession = useCallback(async () => {
    if (!activeSession) return;
    
    const completedSession = {
      ...activeSession,
      endTime: Date.now(),
    };
    
    await saveSession(completedSession);
    await saveCurrentSession(null);
    
    setSessions(prev => [completedSession, ...prev]);
    setActiveSession(null);
    setActiveAlerts([]);
    
    if (settings.hapticEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [activeSession, settings.hapticEnabled]);

  const updatePhase = useCallback(async (phase: FlightPhase) => {
    if (!activeSession) return;
    
    const updated = { ...activeSession, currentPhase: phase };
    setActiveSession(updated);
    await saveCurrentSession(updated);
    
    if (settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [activeSession, settings.hapticEnabled]);

  const addHydration = useCallback(async (ml: number) => {
    if (!activeSession) return;
    
    const updated = { ...activeSession, hydrationMl: activeSession.hydrationMl + ml };
    setActiveSession(updated);
    await saveCurrentSession(updated);
    
    if (settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [activeSession, settings.hapticEnabled]);

  const deleteSessionById = useCallback(async (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    await deleteSession(id);
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== id));
    
    if (settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [settings.hapticEnabled]);

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        device,
        isScanning,
        scanForDevices,
        connectDevice,
        disconnectDevice,
        discoveredDevices,
        currentReading,
        activeSession,
        startSession,
        endSession,
        updatePhase,
        addHydration,
        sessions,
        deleteSessionById,
        activeAlerts,
        dismissAlert,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
