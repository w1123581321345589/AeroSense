export type DeviceType = "aranet4" | "inkbird" | "qingping" | "unknown";

export type FlightPhase =
  | "preFlight"
  | "boarding"
  | "taxi"
  | "takeoff"
  | "climb"
  | "cruise"
  | "descent"
  | "landing"
  | "arrived";

export type AlertLevel = "good" | "advisory" | "warning" | "critical";

export interface AirQualityReading {
  id: string;
  co2: number;
  temperature: number | null;
  humidity: number | null;
  pressure: number | null;
  battery: number | null;
  timestamp: number;
  source: DeviceType;
  flightPhase: FlightPhase | null;
}

export interface FlightSession {
  id: string;
  startTime: number;
  endTime: number | null;
  readings: AirQualityReading[];
  currentPhase: FlightPhase;
  airline: string | null;
  flightNumber: string | null;
  seat: string | null;
  hydrationMl: number;
}

export interface AirQualityAlert {
  id: string;
  level: AlertLevel;
  headline: string;
  metric: string;
  action: string;
  evidence: string | null;
  timestamp: number;
  acknowledged: boolean;
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: DeviceType;
  battery: number | null;
  lastSeen: number;
  isConnected: boolean;
}

export interface UserSettings {
  displayName: string;
  avatarType: "pilot" | "attendant" | "passenger";
  useCelsius: boolean;
  alertSensitivity: "low" | "medium" | "high";
  hapticEnabled: boolean;
  isPremium: boolean;
}

export const FlightPhaseLabels: Record<FlightPhase, string> = {
  preFlight: "Pre-Flight",
  boarding: "Boarding",
  taxi: "Taxi",
  takeoff: "Takeoff",
  climb: "Climb",
  cruise: "Cruise",
  descent: "Descent",
  landing: "Landing",
  arrived: "Arrived",
};

export const FlightPhaseOrder: FlightPhase[] = [
  "preFlight",
  "boarding",
  "taxi",
  "takeoff",
  "climb",
  "cruise",
  "descent",
  "landing",
  "arrived",
];

export function getAlertLevel(co2: number): AlertLevel {
  if (co2 >= 2500) return "critical";
  if (co2 >= 1400) return "warning";
  if (co2 >= 800) return "advisory";
  return "good";
}
