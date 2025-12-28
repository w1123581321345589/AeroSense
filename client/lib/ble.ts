import { Platform } from 'react-native';
import type { DeviceInfo, DeviceType, AirQualityReading } from './types';

const ARANET4_SERVICE_UUID = 'f0cd1400-95da-4f4b-9ac8-aa55d312af0c';
const ARANET4_CHAR_UUID = 'f0cd1503-95da-4f4b-9ac8-aa55d312af0c';

const INKBIRD_SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const INKBIRD_CHAR_UUID = '0000fff4-0000-1000-8000-00805f9b34fb';

export interface BLEDevice {
  id: string;
  name: string | null;
  rssi: number;
  serviceUUIDs: string[];
}

export interface BLEManager {
  isSupported: boolean;
  isEnabled: boolean;
  startScan: (onDeviceFound: (device: BLEDevice) => void) => Promise<void>;
  stopScan: () => void;
  connect: (deviceId: string) => Promise<boolean>;
  disconnect: (deviceId: string) => Promise<void>;
  readData: (deviceId: string) => Promise<AirQualityReading | null>;
  subscribeToUpdates: (deviceId: string, onData: (reading: AirQualityReading) => void) => void;
  unsubscribe: (deviceId: string) => void;
}

function identifyDeviceType(name: string | null, serviceUUIDs: string[]): DeviceType {
  if (name?.toLowerCase().includes('aranet')) return 'aranet4';
  if (name?.toLowerCase().includes('inkbird') || name?.toLowerCase().includes('iam-t1')) return 'inkbird';
  if (name?.toLowerCase().includes('qingping')) return 'qingping';
  
  if (serviceUUIDs.includes(ARANET4_SERVICE_UUID.toLowerCase())) return 'aranet4';
  if (serviceUUIDs.includes(INKBIRD_SERVICE_UUID.toLowerCase())) return 'inkbird';
  
  return 'unknown';
}

function parseAranet4Data(data: Uint8Array): Partial<AirQualityReading> {
  if (data.length < 8) return {};
  
  const co2 = data[0] | (data[1] << 8);
  const temperature = ((data[2] | (data[3] << 8)) / 20) - 273.15;
  const pressure = (data[4] | (data[5] << 8)) / 10;
  const humidity = data[6];
  const battery = data[7];
  
  return { co2, temperature, pressure, humidity, battery };
}

function parseInkbirdData(data: Uint8Array): Partial<AirQualityReading> {
  if (data.length < 6) return {};
  
  const co2 = data[0] | (data[1] << 8);
  const temperature = ((data[2] | (data[3] << 8)) - 4000) / 100;
  const humidity = ((data[4] | (data[5] << 8)) / 100);
  
  return { co2, temperature, humidity, pressure: null, battery: null };
}

export function createSimulatedBLEManager(): BLEManager {
  let scanInterval: NodeJS.Timeout | null = null;
  let updateIntervals: Map<string, NodeJS.Timeout> = new Map();
  
  const simulatedDevices: BLEDevice[] = [
    { id: 'aranet4_sim_001', name: 'Aranet4 Home', rssi: -65, serviceUUIDs: [ARANET4_SERVICE_UUID] },
    { id: 'inkbird_sim_001', name: 'INKBIRD IAM-T1', rssi: -72, serviceUUIDs: [INKBIRD_SERVICE_UUID] },
  ];
  
  return {
    isSupported: true,
    isEnabled: true,
    
    startScan: async (onDeviceFound) => {
      let index = 0;
      scanInterval = setInterval(() => {
        if (index < simulatedDevices.length) {
          onDeviceFound(simulatedDevices[index]);
          index++;
        }
      }, 800);
    },
    
    stopScan: () => {
      if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
      }
    },
    
    connect: async (deviceId) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return true;
    },
    
    disconnect: async (deviceId) => {
      const interval = updateIntervals.get(deviceId);
      if (interval) {
        clearInterval(interval);
        updateIntervals.delete(deviceId);
      }
    },
    
    readData: async (deviceId) => {
      const device = simulatedDevices.find(d => d.id === deviceId);
      if (!device) return null;
      
      const type = identifyDeviceType(device.name, device.serviceUUIDs);
      const baseCO2 = 800 + Math.random() * 1600;
      
      return {
        id: `reading_${Date.now()}`,
        co2: Math.round(baseCO2),
        temperature: 21 + Math.random() * 5,
        humidity: Math.round(20 + Math.random() * 30),
        pressure: 980 + Math.random() * 40,
        battery: Math.round(70 + Math.random() * 30),
        timestamp: Date.now(),
        source: type,
        flightPhase: null,
      };
    },
    
    subscribeToUpdates: (deviceId, onData) => {
      const interval = setInterval(async () => {
        const device = simulatedDevices.find(d => d.id === deviceId);
        if (!device) return;
        
        const type = identifyDeviceType(device.name, device.serviceUUIDs);
        const baseCO2 = 800 + Math.random() * 1600;
        
        onData({
          id: `reading_${Date.now()}`,
          co2: Math.round(baseCO2),
          temperature: 21 + Math.random() * 5,
          humidity: Math.round(20 + Math.random() * 30),
          pressure: 980 + Math.random() * 40,
          battery: Math.round(70 + Math.random() * 30),
          timestamp: Date.now(),
          source: type,
          flightPhase: null,
        });
      }, 5000);
      
      updateIntervals.set(deviceId, interval);
    },
    
    unsubscribe: (deviceId) => {
      const interval = updateIntervals.get(deviceId);
      if (interval) {
        clearInterval(interval);
        updateIntervals.delete(deviceId);
      }
    },
  };
}

export function getBLEManager(): BLEManager {
  if (Platform.OS === 'web') {
    console.log('BLE not supported on web - using simulation');
    return createSimulatedBLEManager();
  }
  
  return createSimulatedBLEManager();
}

export function bleDeviceToDeviceInfo(device: BLEDevice): DeviceInfo {
  const type = identifyDeviceType(device.name, device.serviceUUIDs);
  return {
    id: device.id,
    name: device.name || 'Unknown Device',
    type,
    battery: null,
    lastSeen: Date.now(),
    isConnected: false,
  };
}
