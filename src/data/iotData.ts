import { IoTSensorDevice, IoTGateway, IoTTelemetryReading } from '../types';

export const INITIAL_IOT_GATEWAYS: IoTGateway[] = [
  {
    id: 'gw-chicago-01',
    name: 'Edge Gateway Alpha (Bay A/B Machining)',
    location: 'Building 1 - Substation 4A',
    ip: '192.168.10.24',
    protocol: 'MQTT / Modbus TCP',
    connectedSensorsCount: 14,
    status: 'online',
    packetsPerSec: 142,
    uptime: '99.98% (42 days)',
    firmware: 'v2.8.4-RTOS'
  },
  {
    id: 'gw-chicago-02',
    name: 'Cleanroom & Finishing Gateway Beta',
    location: 'Building 1 - Cleanroom Bay C',
    ip: '192.168.10.25',
    protocol: 'OPC-UA / BACnet',
    connectedSensorsCount: 18,
    status: 'online',
    packetsPerSec: 186,
    uptime: '100% (68 days)',
    firmware: 'v2.8.4-RTOS'
  },
  {
    id: 'gw-chicago-03',
    name: 'Logistics & AGV Wireless Access Gateway',
    location: 'High-Bay Warehouse Terminal',
    ip: '192.168.10.26',
    protocol: 'LoRaWAN / BLE 5.2',
    connectedSensorsCount: 9,
    status: 'online',
    packetsPerSec: 54,
    uptime: '99.4% (12 days)',
    firmware: 'v2.7.1-LORA'
  }
];

export const INITIAL_IOT_SENSORS: IoTSensorDevice[] = [
  {
    id: 'sns-cnc-01',
    name: 'Spindle Bearing Triaxial Accelerometer',
    sensorType: 'vibration_piezo',
    protocol: 'MQTT',
    boundAssetId: 'asset-01',
    boundAssetName: 'DMG Mori 5-Axis CNC Milling Center',
    location: 'Bay A, Position 1 - Spindle Head',
    status: 'online',
    signalRssi: -58,
    samplingRateMs: 500,
    macAddress: '70:B3:D5:E2:10:4A',
    ipAddress: '192.168.10.101',
    lastPing: '200ms ago',
    thresholds: {
      tempWarningC: 60,
      tempCriticalC: 75,
      vibWarningMmS: 2.8,
      vibCriticalMmS: 4.5,
      humidityMaxPct: 70
    }
  },
  {
    id: 'sns-cnc-02',
    name: 'Core Motor RTD Thermal Probe',
    sensorType: 'thermal_rtd',
    protocol: 'Modbus TCP',
    boundAssetId: 'asset-01',
    boundAssetName: 'DMG Mori 5-Axis CNC Milling Center',
    location: 'Bay A, Position 1 - Motor Stator',
    status: 'online',
    signalRssi: -62,
    samplingRateMs: 1000,
    macAddress: '70:B3:D5:E2:10:4B',
    ipAddress: '192.168.10.102',
    lastPing: '450ms ago',
    thresholds: {
      tempWarningC: 58,
      tempCriticalC: 72,
      vibWarningMmS: 3.0,
      vibCriticalMmS: 5.0,
      humidityMaxPct: 65
    }
  },
  {
    id: 'sns-prs-01',
    name: 'Hydraulic Ram Pressure & Temp Transducer',
    sensorType: 'multi_environmental',
    protocol: 'Modbus TCP',
    boundAssetId: 'asset-02',
    boundAssetName: 'Komatsu 300-Ton Hydraulic Stamping Press',
    location: 'Bay B - Main Ram Cylinder',
    status: 'warning',
    signalRssi: -69,
    samplingRateMs: 250,
    macAddress: '70:B3:D5:E2:20:11',
    ipAddress: '192.168.10.115',
    lastPing: '120ms ago',
    thresholds: {
      tempWarningC: 55,
      tempCriticalC: 70,
      vibWarningMmS: 3.5,
      vibCriticalMmS: 5.2,
      humidityMaxPct: 80
    }
  },
  {
    id: 'sns-prs-02',
    name: 'Die Bed Harmonic Vibration Sensor',
    sensorType: 'vibration_piezo',
    protocol: 'MQTT',
    boundAssetId: 'asset-02',
    boundAssetName: 'Komatsu 300-Ton Hydraulic Stamping Press',
    location: 'Bay B - Die Bed Lower Plate',
    status: 'warning',
    signalRssi: -71,
    samplingRateMs: 500,
    macAddress: '70:B3:D5:E2:20:12',
    ipAddress: '192.168.10.116',
    lastPing: '310ms ago',
    thresholds: {
      tempWarningC: 52,
      tempCriticalC: 68,
      vibWarningMmS: 3.2,
      vibCriticalMmS: 4.8,
      humidityMaxPct: 75
    }
  },
  {
    id: 'sns-smt-01',
    name: 'Cleanroom Environmental Humidity & Dew Point',
    sensorType: 'humidity_rh',
    protocol: 'BACnet/IP',
    boundAssetId: 'asset-03',
    boundAssetName: 'Fuji NXT III SMT Pick-and-Place Module',
    location: 'Bay C - Class 10,000 Cleanroom Enclosure',
    status: 'online',
    signalRssi: -52,
    samplingRateMs: 2000,
    macAddress: '70:B3:D5:E2:30:8F',
    ipAddress: '192.168.10.140',
    lastPing: '800ms ago',
    thresholds: {
      tempWarningC: 26,
      tempCriticalC: 30,
      vibWarningMmS: 1.2,
      vibCriticalMmS: 2.0,
      humidityMaxPct: 55
    }
  },
  {
    id: 'sns-smt-02',
    name: 'Linear Gantry Ultra-Precision Vibration Monitor',
    sensorType: 'vibration_piezo',
    protocol: 'MQTT',
    boundAssetId: 'asset-03',
    boundAssetName: 'Fuji NXT III SMT Pick-and-Place Module',
    location: 'Bay C - X/Y Head Rail Carriage',
    status: 'online',
    signalRssi: -55,
    samplingRateMs: 250,
    macAddress: '70:B3:D5:E2:30:90',
    ipAddress: '192.168.10.141',
    lastPing: '150ms ago',
    thresholds: {
      tempWarningC: 35,
      tempCriticalC: 45,
      vibWarningMmS: 0.8,
      vibCriticalMmS: 1.5,
      humidityMaxPct: 60
    }
  },
  {
    id: 'sns-coat-01',
    name: 'Cure Oven Multi-Zone Thermocouple Array',
    sensorType: 'thermal_rtd',
    protocol: 'OPC-UA',
    boundAssetId: 'asset-04',
    boundAssetName: 'Nordson Horizon Powder Spray & Oven',
    location: 'Bay D - Powder Coating Oven Zone 2',
    status: 'online',
    signalRssi: -64,
    samplingRateMs: 1000,
    macAddress: '70:B3:D5:E2:40:55',
    ipAddress: '192.168.10.170',
    lastPing: '500ms ago',
    thresholds: {
      tempWarningC: 195,
      tempCriticalC: 220,
      vibWarningMmS: 2.5,
      vibCriticalMmS: 4.0,
      humidityMaxPct: 40
    }
  },
  {
    id: 'sns-coat-02',
    name: 'Exhaust Air Humidity & VOC Sensor',
    sensorType: 'multi_environmental',
    protocol: 'MQTT',
    boundAssetId: 'asset-04',
    boundAssetName: 'Nordson Horizon Powder Spray & Oven',
    location: 'Bay D - Exhaust Stack Ductwork',
    status: 'online',
    signalRssi: -66,
    samplingRateMs: 2000,
    macAddress: '70:B3:D5:E2:40:56',
    ipAddress: '192.168.10.171',
    lastPing: '620ms ago',
    thresholds: {
      tempWarningC: 90,
      tempCriticalC: 120,
      vibWarningMmS: 2.2,
      vibCriticalMmS: 3.8,
      humidityMaxPct: 50
    }
  }
];

// Generate dynamic historical telemetry points for an asset
export function generateInitialTelemetryForAsset(
  assetId: string,
  assetName: string,
  baseTemp: number,
  baseVib: number,
  baseHumidity: number,
  pointsCount: number = 24
): IoTTelemetryReading[] {
  const readings: IoTTelemetryReading[] = [];
  const now = Date.now();
  const stepMs = 60 * 1000; // 1 minute per point

  for (let i = pointsCount - 1; i >= 0; i--) {
    const timestamp = now - i * stepMs;
    const date = new Date(timestamp);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Subtle sinusoidal variance + random noise
    const angle = (pointsCount - i) * 0.3;
    const tempNoise = Math.sin(angle) * 1.8 + (Math.random() * 0.8 - 0.4);
    const vibNoise = Math.cos(angle * 1.5) * 0.25 + (Math.random() * 0.15 - 0.07);
    const humidityNoise = Math.sin(angle * 0.8) * 2.2 + (Math.random() * 1.0 - 0.5);

    const temp = Math.round((baseTemp + tempNoise) * 10) / 10;
    const vib = Math.max(0.05, Math.round((baseVib + vibNoise) * 100) / 100);
    const hum = Math.min(100, Math.max(10, Math.round((baseHumidity + humidityNoise) * 10) / 10));

    let status: 'normal' | 'warning' | 'critical' = 'normal';
    if (assetId === 'asset-02') {
      // Press is high vibration
      status = vib > 4.2 ? 'critical' : vib > 3.0 ? 'warning' : 'normal';
    } else if (temp > 65 || vib > 3.5) {
      status = 'warning';
    }

    readings.push({
      time: timeStr,
      timestamp,
      assetId,
      assetName,
      temperatureC: temp,
      vibrationMmS: vib,
      humidityPct: hum,
      pressureBar: assetId === 'asset-02' ? Math.round((210 + Math.sin(angle) * 15) * 10) / 10 : undefined,
      powerKw: Math.round((18 + Math.cos(angle) * 4) * 10) / 10,
      acousticDb: Math.round(68 + Math.sin(angle * 2) * 5),
      status
    });
  }

  return readings;
}
