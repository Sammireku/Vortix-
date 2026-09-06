import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Radio,
  Activity,
  Cpu,
  Thermometer,
  Droplets,
  Zap,
  Gauge,
  Plus,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Wifi,
  Battery,
  Server,
  ArrowUpRight,
  Sparkles,
  Search,
  Filter,
  Layers,
  Wrench,
  Download,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  GitCompare,
  Clock,
  Calendar,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  RoleDefinition,
  MaintenanceAsset,
  IoTSensorDevice,
  IoTGateway,
  IoTTelemetryReading,
  IoTSensorProtocol,
  IoTSensorType
} from '../../types';
import {
  INITIAL_IOT_GATEWAYS,
  INITIAL_IOT_SENSORS,
  generateInitialTelemetryForAsset
} from '../../data/iotData';
import { INITIAL_MAINTENANCE_ASSETS } from '../../data/initialData';

interface IoTEdgeAnalyticsViewProps {
  currentRole: RoleDefinition;
  maintenanceAssets?: MaintenanceAsset[];
  initialSelectedAssetId?: string;
  onCreateWorkOrder?: (order: any) => void;
  onNavigateToMaintenance?: () => void;
  onNavigateToDigitalTwin?: () => void;
}

export const IoTEdgeAnalyticsView: React.FC<IoTEdgeAnalyticsViewProps> = ({
  currentRole,
  maintenanceAssets = INITIAL_MAINTENANCE_ASSETS,
  initialSelectedAssetId,
  onCreateWorkOrder,
  onNavigateToMaintenance,
  onNavigateToDigitalTwin
}) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    initialSelectedAssetId || maintenanceAssets[0]?.id || 'asset-01'
  );
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<'realtime' | '15m' | '1h' | '24h'>('realtime');
  const [activeMetricTab, setActiveMetricTab] = useState<'all' | 'temperature' | 'vibration' | 'humidity'>('all');
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');
  const [sensors, setSensors] = useState<IoTSensorDevice[]>(INITIAL_IOT_SENSORS);
  const [gateways] = useState<IoTGateway[]>(INITIAL_IOT_GATEWAYS);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isAiDiagnosing, setIsAiDiagnosing] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);

  // Compare Mode & Export State
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [compareAssetId, setCompareAssetId] = useState<string>(() => {
    const other = maintenanceAssets.find((a) => a.id !== (initialSelectedAssetId || 'asset-01'));
    return other ? other.id : 'asset-02';
  });
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState<boolean>(false);

  // Maintain telemetry time-series per asset in state
  const [telemetryStore, setTelemetryStore] = useState<Record<string, IoTTelemetryReading[]>>(() => {
    const store: Record<string, IoTTelemetryReading[]> = {};
    maintenanceAssets.forEach((asset) => {
      let baseTemp = 45;
      let baseVib = 1.6;
      let baseHum = 48;

      if (asset.id === 'asset-02') {
        baseTemp = 56.4;
        baseVib = 4.8;
        baseHum = 52;
      } else if (asset.id === 'asset-03') {
        baseTemp = 22.8;
        baseVib = 0.45;
        baseHum = 42;
      } else if (asset.id === 'asset-04') {
        baseTemp = 182.0;
        baseVib = 1.1;
        baseHum = 24;
      }

      store[asset.id] = generateInitialTelemetryForAsset(asset.id, asset.name, baseTemp, baseVib, baseHum, 24);
    });
    return store;
  });

  const selectedAsset = useMemo(() => {
    return maintenanceAssets.find((a) => a.id === selectedAssetId) || maintenanceAssets[0];
  }, [maintenanceAssets, selectedAssetId]);

  const compareAsset = useMemo(() => {
    return maintenanceAssets.find((a) => a.id === compareAssetId) || maintenanceAssets[1] || maintenanceAssets[0];
  }, [maintenanceAssets, compareAssetId]);

  const currentReadings = telemetryStore[selectedAssetId] || [];
  const latestReading = currentReadings[currentReadings.length - 1];

  const compareReadings = telemetryStore[compareAssetId] || [];
  const latestCompareReading = compareReadings[compareReadings.length - 1];

  const boundSensors = useMemo(() => {
    return sensors.filter((s) => s.boundAssetId === selectedAssetId);
  }, [sensors, selectedAssetId]);

  const boundCompareSensors = useMemo(() => {
    return sensors.filter((s) => s.boundAssetId === compareAssetId);
  }, [sensors, compareAssetId]);

  // Real-time telemetry packet generator
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setTelemetryStore((prev) => {
        const nextStore = { ...prev };

        maintenanceAssets.forEach((asset) => {
          const list = nextStore[asset.id] || [];
          const last = list[list.length - 1];
          if (!last) return;

          const now = Date.now();
          const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

          // Random slight drift
          const tempDrift = (Math.random() - 0.48) * 0.6;
          const vibDrift = (Math.random() - 0.48) * 0.12;
          const humDrift = (Math.random() - 0.48) * 0.8;

          const newTemp = Math.round((last.temperatureC + tempDrift) * 10) / 10;
          const newVib = Math.max(0.05, Math.round((last.vibrationMmS + vibDrift) * 100) / 100);
          const newHum = Math.min(99, Math.max(15, Math.round((last.humidityPct + humDrift) * 10) / 10));

          let status: 'normal' | 'warning' | 'critical' = 'normal';
          if (asset.id === 'asset-02' && (newVib > 4.5 || newTemp > 65)) {
            status = newVib > 5.0 ? 'critical' : 'warning';
          } else if (newTemp > 75 || newVib > 3.8) {
            status = 'warning';
          }

          const newReading: IoTTelemetryReading = {
            time: timeStr,
            timestamp: now,
            assetId: asset.id,
            assetName: asset.name,
            temperatureC: newTemp,
            vibrationMmS: newVib,
            humidityPct: newHum,
            pressureBar: last.pressureBar ? Math.round((last.pressureBar + (Math.random() - 0.5) * 2) * 10) / 10 : undefined,
            powerKw: Math.round((last.powerKw || 20 + (Math.random() - 0.5) * 1.5) * 10) / 10,
            acousticDb: Math.round(65 + Math.random() * 8),
            status
          };

          // Slide window forward, keeping last 30 points
          nextStore[asset.id] = [...list.slice(-29), newReading];
        });

        return nextStore;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isStreaming, maintenanceAssets]);

  // Formatted chart data accounting for unit selection (°C vs °F)
  const chartData = useMemo(() => {
    return currentReadings.map((r) => {
      const displayTemp = temperatureUnit === 'F' ? Math.round(((r.temperatureC * 9) / 5 + 32) * 10) / 10 : r.temperatureC;

      return {
        ...r,
        displayTemp,
        tempWarning: temperatureUnit === 'F' ? 140 : 60,
        tempCritical: temperatureUnit === 'F' ? 167 : 75,
        vibWarning: 2.8,
        vibCritical: 4.5,
        humWarning: 65
      };
    });
  }, [currentReadings, temperatureUnit]);

  // Overlaid comparison chart data for side-by-side performance analysis
  const comparisonChartData = useMemo(() => {
    const count = Math.min(currentReadings.length, compareReadings.length);
    return Array.from({ length: count }).map((_, i) => {
      const a = currentReadings[i];
      const b = compareReadings[i];

      const tempA = temperatureUnit === 'F' ? Math.round(((a.temperatureC * 9) / 5 + 32) * 10) / 10 : a.temperatureC;
      const tempB = temperatureUnit === 'F' ? Math.round(((b.temperatureC * 9) / 5 + 32) * 10) / 10 : b.temperatureC;

      return {
        time: a.time,
        timestamp: a.timestamp,
        tempA,
        tempB,
        vibA: a.vibrationMmS,
        vibB: b.vibrationMmS,
        humA: a.humidityPct,
        humB: b.humidityPct,
        powerA: a.powerKw || 20,
        powerB: b.powerKw || 20,
        deltaTemp: Math.round(Math.abs(tempA - tempB) * 10) / 10,
        deltaVib: Math.round(Math.abs(a.vibrationMmS - b.vibrationMmS) * 100) / 100,
        tempWarning: temperatureUnit === 'F' ? 140 : 60,
        tempCritical: temperatureUnit === 'F' ? 167 : 75,
        vibWarning: 2.8,
        vibCritical: 4.5
      };
    });
  }, [currentReadings, compareReadings, temperatureUnit]);

  // Calculated stats for Asset A
  const tempValues = currentReadings.map((r) => r.temperatureC);
  const minTemp = tempValues.length ? Math.min(...tempValues) : 0;
  const maxTemp = tempValues.length ? Math.max(...tempValues) : 0;
  const avgTemp = tempValues.length ? Math.round((tempValues.reduce((a, b) => a + b, 0) / tempValues.length) * 10) / 10 : 0;

  const vibValues = currentReadings.map((r) => r.vibrationMmS);
  const maxVib = vibValues.length ? Math.max(...vibValues) : 0;
  const avgVib = vibValues.length ? Math.round((vibValues.reduce((a, b) => a + b, 0) / vibValues.length) * 100) / 100 : 0;

  // Calculated stats for Asset B (Comparison)
  const compareTempValues = compareReadings.map((r) => r.temperatureC);
  const compareMinTemp = compareTempValues.length ? Math.min(...compareTempValues) : 0;
  const compareMaxTemp = compareTempValues.length ? Math.max(...compareTempValues) : 0;
  const compareAvgTemp = compareTempValues.length ? Math.round((compareTempValues.reduce((a, b) => a + b, 0) / compareTempValues.length) * 10) / 10 : 0;

  const compareVibValues = compareReadings.map((r) => r.vibrationMmS);
  const compareMaxVib = compareVibValues.length ? Math.max(...compareVibValues) : 0;
  const compareAvgVib = compareVibValues.length ? Math.round((compareVibValues.reduce((a, b) => a + b, 0) / compareVibValues.length) * 100) / 100 : 0;

  // ---------------------------------------------------------------------------
  // Maintenance Prediction & Remaining Useful Life (RUL) Estimation Engine
  // ---------------------------------------------------------------------------
  interface MaintenancePredictionResult {
    rulHours: number;
    rulPercent: number; // 0 - 100
    degradationRatePerHour: number;
    healthStatus: 'optimal' | 'moderate' | 'critical';
    suggestedIntervalHours: number;
    suggestedAction: string;
    predictedFailureDate: string;
    contributingFactors: {
      thermalStressPct: number;
      vibrationWearPct: number;
      environmentalHumidityPct: number;
    };
  }

  const calculateAssetRul = (
    asset: MaintenanceAsset,
    readings: IoTTelemetryReading[]
  ): MaintenancePredictionResult => {
    if (!readings || readings.length === 0) {
      return {
        rulHours: 1200,
        rulPercent: 80,
        degradationRatePerHour: 0.05,
        healthStatus: 'optimal',
        suggestedIntervalHours: 250,
        suggestedAction: 'Routine scheduled inspection & lubrication',
        predictedFailureDate: new Date(Date.now() + 60 * 24 * 3600 * 1000).toLocaleDateString(),
        contributingFactors: { thermalStressPct: 15, vibrationWearPct: 12, environmentalHumidityPct: 8 }
      };
    }

    const avgVib = readings.reduce((acc, r) => acc + r.vibrationMmS, 0) / readings.length;
    const avgTemp = readings.reduce((acc, r) => acc + r.temperatureC, 0) / readings.length;
    const avgHum = readings.reduce((acc, r) => acc + r.humidityPct, 0) / readings.length;

    let baseMaxHours = 2400;
    let nominalTemp = 45;
    let nominalVib = 1.5;

    if (asset.id === 'asset-02') {
      baseMaxHours = 1400;
      nominalTemp = 50;
      nominalVib = 2.5;
    } else if (asset.id === 'asset-03') {
      baseMaxHours = 3800;
      nominalTemp = 24;
      nominalVib = 0.5;
    } else if (asset.id === 'asset-04') {
      baseMaxHours = 2000;
      nominalTemp = 180;
      nominalVib = 1.0;
    }

    const tempExcess = Math.max(0, avgTemp - nominalTemp);
    const vibExcess = Math.max(0, avgVib - nominalVib);
    const humExcess = Math.max(0, avgHum - 50);

    const thermalStress = Math.min(100, Math.round((tempExcess / 18) * 100));
    const vibWear = Math.min(100, Math.round((vibExcess / 2.2) * 100));
    const humStress = Math.min(100, Math.round((humExcess / 25) * 100));

    const totalDegradation = Math.min(95, Math.round(vibWear * 0.52 + thermalStress * 0.36 + humStress * 0.12));

    let rulPercent = Math.max(8, 100 - totalDegradation);
    if (asset.id === 'asset-02') {
      rulPercent = Math.min(rulPercent, 28);
    }

    const rulHours = Math.round(baseMaxHours * (rulPercent / 100));
    const degradationRatePerHour = Math.round((totalDegradation / 280) * 100) / 100;

    const daysToFailure = Math.max(2, Math.round(rulHours / 16));
    const failureDate = new Date(Date.now() + daysToFailure * 24 * 60 * 60 * 1000).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    let healthStatus: 'optimal' | 'moderate' | 'critical' = 'optimal';
    let suggestedIntervalHours = 350;
    let suggestedAction = 'Routine quarterly mechanical inspection and spindle lubrication on schedule.';

    if (rulPercent < 30) {
      healthStatus = 'critical';
      suggestedIntervalHours = 24;
      suggestedAction = 'Critical Intervention: Replace hydraulic seals and rebuild spindle bearings within 24-48 hours.';
    } else if (rulPercent < 60) {
      healthStatus = 'moderate';
      suggestedIntervalHours = 120;
      suggestedAction = 'Preventive Maintenance: Re-grease drive line, re-tension belts, and recalibrate dampeners in 120h.';
    }

    return {
      rulHours,
      rulPercent,
      degradationRatePerHour,
      healthStatus,
      suggestedIntervalHours,
      suggestedAction,
      predictedFailureDate: failureDate,
      contributingFactors: {
        thermalStressPct: thermalStress,
        vibrationWearPct: vibWear,
        environmentalHumidityPct: humStress
      }
    };
  };

  const assetARul = useMemo(() => calculateAssetRul(selectedAsset, currentReadings), [selectedAsset, currentReadings]);
  const assetBRul = useMemo(() => calculateAssetRul(compareAsset, compareReadings), [compareAsset, compareReadings]);

  // ---------------------------------------------------------------------------
  // Historical Sensor Log Downloader (CSV & Structured JSON)
  // ---------------------------------------------------------------------------
  const handleDownloadTelemetryCsv = () => {
    let csvRows: string[] = [];

    if (isCompareMode) {
      csvRows.push(
        'Timestamp,Date_Time,Asset_A_ID,Asset_A_Name,Asset_A_Temp_C,Asset_A_Temp_F,Asset_A_Vibration_RMS_mm_s,Asset_A_Humidity_Pct,Asset_B_ID,Asset_B_Name,Asset_B_Temp_C,Asset_B_Temp_F,Asset_B_Vibration_RMS_mm_s,Asset_B_Humidity_Pct,Delta_Temp_C,Delta_Vib_mm_s'
      );
      const count = Math.min(currentReadings.length, compareReadings.length);
      for (let i = 0; i < count; i++) {
        const a = currentReadings[i];
        const b = compareReadings[i];
        const tempAf = Math.round(((a.temperatureC * 9) / 5 + 32) * 10) / 10;
        const tempBf = Math.round(((b.temperatureC * 9) / 5 + 32) * 10) / 10;
        const deltaT = Math.round(Math.abs(a.temperatureC - b.temperatureC) * 10) / 10;
        const deltaV = Math.round(Math.abs(a.vibrationMmS - b.vibrationMmS) * 100) / 100;
        csvRows.push(
          `${a.timestamp},"${new Date(a.timestamp).toISOString()}",${a.assetId},"${a.assetName}",${a.temperatureC},${tempAf},${a.vibrationMmS},${a.humidityPct},${b.assetId},"${b.assetName}",${b.temperatureC},${tempBf},${b.vibrationMmS},${b.humidityPct},${deltaT},${deltaV}`
        );
      }
    } else {
      csvRows.push(
        'Timestamp,Date_Time,Asset_ID,Asset_Name,Temperature_C,Temperature_F,Vibration_RMS_mm_s,Humidity_Pct,Pressure_Bar,Power_kW,Status'
      );
      currentReadings.forEach((r) => {
        const tempF = Math.round(((r.temperatureC * 9) / 5 + 32) * 10) / 10;
        csvRows.push(
          `${r.timestamp},"${new Date(r.timestamp).toISOString()}",${r.assetId},"${r.assetName}",${r.temperatureC},${tempF},${r.vibrationMmS},${r.humidityPct},${r.pressureBar || 'N/A'},${r.powerKw || 'N/A'},${r.status}`
        );
      });
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = isCompareMode
      ? `vortix_telemetry_compare_${selectedAsset.code}_vs_${compareAsset.code}_${new Date().toISOString().split('T')[0]}.csv`
      : `vortix_telemetry_${selectedAsset.code}_${new Date().toISOString().split('T')[0]}.csv`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setNotification({
      title: 'Telemetry Export Complete',
      message: `Historical sensor logs exported to ${fileName}.`
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDownloadTelemetryJson = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      facility: 'Plant 1 - Midwest Manufacturing',
      exportMode: isCompareMode ? 'side_by_side_comparison' : 'single_asset_audit',
      primaryAsset: {
        id: selectedAsset.id,
        code: selectedAsset.code,
        name: selectedAsset.name,
        location: selectedAsset.location,
        rulPrediction: assetARul,
        readingsCount: currentReadings.length,
        readings: currentReadings
      },
      ...(isCompareMode
        ? {
            comparisonAsset: {
              id: compareAsset.id,
              code: compareAsset.code,
              name: compareAsset.name,
              location: compareAsset.location,
              rulPrediction: assetBRul,
              readingsCount: compareReadings.length,
              readings: compareReadings
            }
          }
        : {})
    };

    const jsonContent = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = isCompareMode
      ? `vortix_telemetry_compare_${selectedAsset.code}_vs_${compareAsset.code}_${new Date().toISOString().split('T')[0]}.json`
      : `vortix_telemetry_${selectedAsset.code}_${new Date().toISOString().split('T')[0]}.json`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setNotification({
      title: 'JSON Audit Log Downloaded',
      message: `Structured telemetry payload saved as ${fileName}.`
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // New Sensor Onboarding Wizard State
  const [newSensorForm, setNewSensorForm] = useState({
    name: '',
    sensorType: 'vibration_piezo' as IoTSensorType,
    protocol: 'MQTT' as IoTSensorProtocol,
    boundAssetId: selectedAssetId,
    location: '',
    samplingRateMs: 500,
    macAddress: '70:B3:D5:E2:' + Math.floor(10 + Math.random() * 89) + ':' + Math.floor(10 + Math.random() * 89),
    tempWarningC: 65,
    tempCriticalC: 80,
    vibWarningMmS: 3.0,
    vibCriticalMmS: 4.8,
    humidityMaxPct: 65
  });

  const handleCreateSensor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSensorForm.name.trim()) return;

    const targetAsset = maintenanceAssets.find((a) => a.id === newSensorForm.boundAssetId) || selectedAsset;

    const newSensor: IoTSensorDevice = {
      id: 'sns-custom-' + Date.now().toString().slice(-4),
      name: newSensorForm.name,
      sensorType: newSensorForm.sensorType,
      protocol: newSensorForm.protocol,
      boundAssetId: newSensorForm.boundAssetId,
      boundAssetName: targetAsset.name,
      location: newSensorForm.location || `${targetAsset.location} - Custom Mount`,
      status: 'online',
      signalRssi: -54,
      samplingRateMs: Number(newSensorForm.samplingRateMs),
      macAddress: newSensorForm.macAddress,
      ipAddress: '192.168.10.' + (150 + Math.floor(Math.random() * 40)),
      lastPing: 'Just now',
      thresholds: {
        tempWarningC: Number(newSensorForm.tempWarningC),
        tempCriticalC: Number(newSensorForm.tempCriticalC),
        vibWarningMmS: Number(newSensorForm.vibWarningMmS),
        vibCriticalMmS: Number(newSensorForm.vibCriticalMmS),
        humidityMaxPct: Number(newSensorForm.humidityMaxPct)
      }
    };

    setSensors((prev) => [newSensor, ...prev]);
    setIsOnboardingModalOpen(false);
    setNotification({
      title: 'Sensor Provisioned',
      message: `${newSensor.name} successfully paired via ${newSensor.protocol} and bound to ${targetAsset.name}.`
    });

    setTimeout(() => setNotification(null), 4000);
  };

  const handleRunAiDiagnostics = () => {
    setIsAiDiagnosing(true);
    setTimeout(() => {
      setIsAiDiagnosing(false);
      if (selectedAsset.id === 'asset-02') {
        setAiReport(
          `CRITICAL ANOMALY DETECTED (Komatsu 300T Press): Harmonic vibration peaked at ${latestReading?.vibrationMmS || 4.8} mm/s (ISO 10816 Zone C/D violation) at 120 Hz fundamental frequency with concurrent thermal rise to ${latestReading?.temperatureC || 56.4}°C in hydraulic reservoir. Root cause: Hydraulic piston seal micro-extrusion & valve cavitation. Immediate recommendation: Schedule urgent seal kit replacement (Parker PRS-300-SK) before mechanical seizure.`
        );
      } else {
        setAiReport(
          `OPTIMAL OPERATION CONFIRMED (${selectedAsset.name}): Vibration spectral harmonics stable at ${latestReading?.vibrationMmS || 1.6} mm/s (within ISO Class I limits). Thermal gradient normal at ${latestReading?.temperatureC || 44.2}°C (ambient margin +24°C). Relative humidity ${latestReading?.humidityPct || 42}% within non-corrosive tolerance. Projected MTBF health index: 94%. No corrective action required.`
        );
      }
    }, 900);
  };

  const handleDraftCmmsOrderFromDiagnostic = () => {
    if (!onCreateWorkOrder) return;
    onCreateWorkOrder({
      assetId: selectedAsset.id,
      assetName: selectedAsset.name,
      title: `Emergency Telemetry Alert: High Vibration on ${selectedAsset.name}`,
      type: 'corrective',
      priority: 'critical',
      scheduledDate: new Date().toISOString().split('T')[0],
      assignedTechnician: selectedAsset.technicianAssigned || 'Master Technician',
      status: 'scheduled',
      estimatedHours: 3.5,
      description: `Auto-generated via IoT Edge Analytics: Vibration exceeded threshold at ${latestReading?.vibrationMmS || 4.8} mm/s with hydraulic core temperature at ${latestReading?.temperatureC || 56.4}°C. Dispatched based on Edge Gateway telemetry anomaly.`,
      tasks: [
        { id: 't1', description: 'Inspect bearing housing and hydraulic seal clearance', completed: false },
        { id: 't2', description: 'Perform FFT vibration calibration post-maintenance', completed: false }
      ],
      spareParts: [{ partName: 'Replacement Seal & Bearing Kit', quantity: 1, cost: 420.0 }],
      totalCost: 420.0
    });

    setNotification({
      title: 'CMMS Work Order Created',
      message: `Critical corrective order dispatched for ${selectedAsset.name}.`
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateWorkOrder = () => {
    const target = isCompareMode && assetARul.rulPercent > assetBRul.rulPercent ? compareAsset : selectedAsset;
    const targetRul = isCompareMode && assetARul.rulPercent > assetBRul.rulPercent ? assetBRul : assetARul;

    if (onCreateWorkOrder) {
      onCreateWorkOrder({
        assetId: target.id,
        assetName: target.name,
        title: `Predictive Maintenance: ${target.name} (RUL: ${targetRul.rulPercent}%)`,
        type: 'predictive',
        priority: targetRul.healthStatus === 'critical' ? 'critical' : targetRul.healthStatus === 'moderate' ? 'high' : 'medium',
        scheduledDate: new Date().toISOString().split('T')[0],
        assignedTechnician: target.technicianAssigned || 'Master Technician',
        status: 'scheduled',
        estimatedHours: 4.0,
        description: `Triggered via Predictive RUL Maintenance: ${targetRul.suggestedAction}. Estimated remaining useful life is ${targetRul.rulPercent}% (~${targetRul.rulHours} hrs). Scheduled prior to estimated wearout date ${targetRul.predictedFailureDate}.`,
        tasks: [
          { id: 't-rul-1', description: 'Inspect mechanical wear and vibration harmonics alignment', completed: false },
          { id: 't-rul-2', description: 'Thermal lubrication and seal condition verification', completed: false },
          { id: 't-rul-3', description: 'Recalibrate edge telemetry sensor baseline', completed: false }
        ],
        spareParts: [{ partName: 'Predictive Service Overhaul Kit', quantity: 1, cost: 350.0 }],
        totalCost: 350.0
      });
    }

    setNotification({
      title: 'Preventive Work Order Dispatched',
      message: `Work order logged for ${target.name} based on RUL predictive analysis (${targetRul.rulPercent}% remaining).`
    });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-[#2D2D24] text-white px-4 py-3 rounded-2xl shadow-xl border border-[#5A5A40] flex items-center gap-3 animate-in slide-in-from-top-3 duration-200 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">{notification.title}</p>
            <p className="text-[#C1C1B8] mt-0.5">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Top Banner & Control Deck */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E5DE] shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-md bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] font-semibold flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-[#5A5A40]" />
              Industrial Edge Hub
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1.5 ${
              isStreaming ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-emerald-600 animate-ping' : 'bg-amber-600'}`}></span>
              {isStreaming ? 'Live Packet Stream (1.8s)' : 'Stream Paused'}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF9F5] text-[#787668] border border-[#E5E5DE] font-mono">
              3 Gateways Active &bull; {sensors.length} Connected Sensors
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2D2D24] tracking-tight">
            IoT Edge Analytics & Telemetry Engine
          </h2>
          <p className="text-xs text-[#787668]">
            Real-time physical asset vibration FFT, thermal core monitoring, and environmental humidity telemetry.
          </p>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Pause / Play Live Stream */}
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
              isStreaming
                ? 'bg-white hover:bg-[#F5F5F0] text-[#2D2D24] border-[#E5E5DE]'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Stream</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume Stream</span>
              </>
            )}
          </button>

          {/* Compare Mode Toggle */}
          <button
            onClick={() => setIsCompareMode(!isCompareMode)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              isCompareMode
                ? 'bg-[#2D2D24] text-white border-[#2D2D24] shadow-xs'
                : 'bg-white hover:bg-[#F5F5F0] text-[#5A5A40] border-[#E5E5DE]'
            }`}
          >
            <GitCompare className={`w-3.5 h-3.5 ${isCompareMode ? 'text-amber-400' : 'text-[#5A5A40]'}`} />
            <span>{isCompareMode ? 'Compare Mode Active' : 'Compare Assets'}</span>
          </button>

          {/* Download Telemetry Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
              className="px-3 py-2 bg-white hover:bg-[#F5F5F0] text-[#2D2D24] border border-[#E5E5DE] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Download Telemetry</span>
            </button>

            {isDownloadMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-[#E5E5DE] rounded-2xl shadow-xl z-30 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    handleDownloadTelemetryCsv();
                    setIsDownloadMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#2D2D24] hover:bg-[#F5F5F0] rounded-xl text-left transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <p className="font-bold text-[#2D2D24]">Export CSV (.csv)</p>
                    <p className="text-[10px] text-[#787668]">Historical telemetry audit log</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    handleDownloadTelemetryJson();
                    setIsDownloadMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#2D2D24] hover:bg-[#F5F5F0] rounded-xl text-left transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#5A5A40] shrink-0" />
                  <div>
                    <p className="font-bold text-[#2D2D24]">Export JSON (.json)</p>
                    <p className="text-[10px] text-[#787668]">Structured audit payload</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Temperature Unit Toggle */}
          <div className="flex items-center bg-[#F5F5F0] p-1 rounded-xl border border-[#E5E5DE]">
            <button
              onClick={() => setTemperatureUnit('C')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                temperatureUnit === 'C' ? 'bg-white text-[#2D2D24] shadow-xs' : 'text-[#787668]'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setTemperatureUnit('F')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                temperatureUnit === 'F' ? 'bg-white text-[#2D2D24] shadow-xs' : 'text-[#787668]'
              }`}
            >
              °F
            </button>
          </div>

          {/* Sensor Onboarding Button */}
          <button
            onClick={() => setIsOnboardingModalOpen(true)}
            className="px-3.5 py-2 bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Onboard IoT Sensor</span>
          </button>

          {/* Navigation Shortcuts */}
          {onNavigateToDigitalTwin && (
            <button
              onClick={onNavigateToDigitalTwin}
              className="px-3 py-2 bg-[#FAF9F5] hover:bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="View 2D Digital Twin Floor Plan"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">2D Twin</span>
            </button>
          )}

          {onNavigateToMaintenance && (
            <button
              onClick={onNavigateToMaintenance}
              className="px-3 py-2 bg-[#FAF9F5] hover:bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="Open CMMS Maintenance Board"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CMMS</span>
            </button>
          )}
        </div>
      </div>

      {/* Asset Selector Ribbon & Compare Mode Deck */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E5DE] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E5DE]">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#5A5A40]" />
            <span className="text-xs font-bold text-[#2D2D24]">
              {isCompareMode ? 'Select Assets for Side-by-Side Performance Comparison:' : 'Select Monitored Asset:'}
            </span>
          </div>
          {isCompareMode ? (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
              Comparing Asset A ({selectedAsset.code}) vs Asset B ({compareAsset.code})
            </span>
          ) : (
            <span className="text-[11px] text-[#787668]">
              Showing real-time telemetry from {boundSensors.length} active sensor channels
            </span>
          )}
        </div>

        {/* In Compare Mode: Side-by-Side Asset Selection Controls */}
        {isCompareMode ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Asset A Selector */}
              <div className="p-3.5 rounded-xl border-2 border-[#5A5A40] bg-[#FAF9F5]/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2D2D24] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#5A5A40]"></span>
                    Asset A (Primary Target)
                  </span>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#E5E5DE] text-[#5A5A40] font-bold">
                    {selectedAsset.code}
                  </span>
                </div>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full bg-white border border-[#E5E5DE] rounded-xl px-3 py-2 text-xs font-semibold text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
                >
                  {maintenanceAssets.map((asset) => (
                    <option key={asset.id} value={asset.id} disabled={asset.id === compareAssetId}>
                      {asset.code} - {asset.name} ({asset.location})
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-[11px] text-[#787668] pt-1">
                  <span>Sensors: {boundSensors.length} paired</span>
                  <span className="font-mono text-[#2D2D24] font-semibold">
                    Live Temp: {latestReading ? `${latestReading.temperatureC}°C` : '--'} | Vib: {latestReading ? `${latestReading.vibrationMmS} mm/s` : '--'}
                  </span>
                </div>
              </div>

              {/* Asset B Selector */}
              <div className="p-3.5 rounded-xl border-2 border-amber-500 bg-amber-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Asset B (Benchmark Target)
                  </span>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-amber-300 text-amber-800 font-bold">
                    {compareAsset.code}
                  </span>
                </div>
                <select
                  value={compareAssetId}
                  onChange={(e) => setCompareAssetId(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-semibold text-[#2D2D24] focus:outline-none focus:border-amber-600"
                >
                  {maintenanceAssets.map((asset) => (
                    <option key={asset.id} value={asset.id} disabled={asset.id === selectedAssetId}>
                      {asset.code} - {asset.name} ({asset.location})
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-[11px] text-[#787668] pt-1">
                  <span>Sensors: {boundCompareSensors.length} paired</span>
                  <span className="font-mono text-amber-900 font-semibold">
                    Live Temp: {latestCompareReading ? `${latestCompareReading.temperatureC}°C` : '--'} | Vib: {latestCompareReading ? `${latestCompareReading.vibrationMmS} mm/s` : '--'}
                  </span>
                </div>
              </div>
            </div>

            {/* Comparative Performance Delta Ribbon */}
            <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#E5E5DE] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <GitCompare className="w-4 h-4 text-[#5A5A40]" />
                <span className="font-bold text-[#2D2D24]">Live Delta Variance:</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
                <span className="bg-white px-2.5 py-1 rounded-lg border border-[#E5E5DE]">
                  Δ Temp:{' '}
                  <strong className="text-[#2D2D24]">
                    {latestReading && latestCompareReading
                      ? `${Math.round(Math.abs(latestReading.temperatureC - latestCompareReading.temperatureC) * 10) / 10}°C`
                      : '--'}
                  </strong>{' '}
                  <span className="text-[#787668] font-sans">
                    ({(latestReading?.temperatureC || 0) > (latestCompareReading?.temperatureC || 0) ? `${selectedAsset.code} hotter` : `${compareAsset.code} hotter`})
                  </span>
                </span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-[#E5E5DE]">
                  Δ Vibration:{' '}
                  <strong className={(latestReading?.vibrationMmS || 0) > 3.0 || (latestCompareReading?.vibrationMmS || 0) > 3.0 ? 'text-red-600' : 'text-[#2D2D24]'}>
                    {latestReading && latestCompareReading
                      ? `${Math.round(Math.abs(latestReading.vibrationMmS - latestCompareReading.vibrationMmS) * 100) / 100} mm/s`
                      : '--'}
                  </strong>
                </span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-[#E5E5DE]">
                  Δ RUL Longevity:{' '}
                  <strong className="text-emerald-800">
                    {Math.abs(assetARul.rulPercent - assetBRul.rulPercent)}%
                  </strong>{' '}
                  <span className="text-[#787668] font-sans">
                    ({assetARul.rulPercent > assetBRul.rulPercent ? `${selectedAsset.code} +${assetARul.rulHours - assetBRul.rulHours}h` : `${compareAsset.code} +${assetBRul.rulHours - assetARul.rulHours}h`})
                  </span>
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Standard Single Asset Selection Ribbon */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {maintenanceAssets.map((asset) => {
              const isSelected = asset.id === selectedAssetId;
              const assetReadings = telemetryStore[asset.id] || [];
              const latest = assetReadings[assetReadings.length - 1];
              const isCritical = asset.id === 'asset-02' || (latest && latest.status !== 'normal');

              return (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAssetId(asset.id)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#FAF9F5] border-[#5A5A40] ring-2 ring-[#5A5A40]/30 shadow-xs'
                      : 'bg-white hover:bg-[#F5F5F0]/60 border-[#E5E5DE]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono font-bold text-[#5A5A40]">{asset.code}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                      isCritical
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isCritical ? 'Warning' : 'Nominal'}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-[#2D2D24] truncate">{asset.name}</div>
                  <div className="text-[10px] text-[#787668] truncate mb-2">{asset.location}</div>

                  {/* Micro metric badges */}
                  <div className="grid grid-cols-3 gap-1 text-[9px] font-mono pt-1.5 border-t border-[#E5E5DE]/80">
                    <div className="bg-white px-1 py-0.5 rounded border border-[#E5E5DE] text-center">
                      <span className="text-[#8B7E66] block text-[7px] font-sans">TEMP</span>
                      <span className="font-bold text-[#2D2D24]">
                        {latest ? (temperatureUnit === 'F' ? `${Math.round(((latest.temperatureC * 9) / 5 + 32) * 10) / 10}°F` : `${latest.temperatureC}°C`) : '--'}
                      </span>
                    </div>
                    <div className="bg-white px-1 py-0.5 rounded border border-[#E5E5DE] text-center">
                      <span className="text-[#8B7E66] block text-[7px] font-sans">VIB</span>
                      <span className={`font-bold ${latest && latest.vibrationMmS > 3.0 ? 'text-red-600' : 'text-[#2D2D24]'}`}>
                        {latest ? `${latest.vibrationMmS}` : '--'}
                      </span>
                    </div>
                    <div className="bg-white px-1 py-0.5 rounded border border-[#E5E5DE] text-center">
                      <span className="text-[#8B7E66] block text-[7px] font-sans">HUM</span>
                      <span className="font-bold text-[#2D2D24]">{latest ? `${latest.humidityPct}%` : '--'}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Asset Header & Live KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Temperature */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E5DE] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[#8B7E66] flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-[#5A5A40]" /> Core Temperature
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F5F5F0] text-[#5A5A40]">
              RTD Channel #1
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-[#2D2D24] mt-1">
            {latestReading
              ? temperatureUnit === 'F'
                ? `${Math.round(((latestReading.temperatureC * 9) / 5 + 32) * 10) / 10} °F`
                : `${latestReading.temperatureC} °C`
              : '--'}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#787668] mt-2 pt-2 border-t border-[#E5E5DE]">
            <span>Min: {minTemp}°C</span>
            <span>Avg: {avgTemp}°C</span>
            <span>Max: {maxTemp}°C</span>
          </div>
        </div>

        {/* Metric 2: Vibration */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E5DE] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[#8B7E66] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#5A5A40]" /> Harmonic Vibration
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F5F5F0] text-[#5A5A40]">
              ISO 10816 RMS
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-[#2D2D24] mt-1 flex items-baseline gap-2">
            <span className={latestReading && latestReading.vibrationMmS > 3.0 ? 'text-red-600' : 'text-[#2D2D24]'}>
              {latestReading?.vibrationMmS ?? '--'}
            </span>
            <span className="text-xs font-sans text-[#787668]">mm/s</span>
          </div>
          <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-[#E5E5DE]">
            <span className="text-[#787668]">Max: {maxVib} mm/s</span>
            <span className={`font-semibold ${
              (latestReading?.vibrationMmS || 0) > 4.0
                ? 'text-red-600'
                : (latestReading?.vibrationMmS || 0) > 2.5
                ? 'text-amber-600'
                : 'text-emerald-700'
            }`}>
              {(latestReading?.vibrationMmS || 0) > 4.0 ? 'Class IV (Severe)' : (latestReading?.vibrationMmS || 0) > 2.5 ? 'Class III (Alert)' : 'Class I (Good)'}
            </span>
          </div>
        </div>

        {/* Metric 3: Humidity */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E5DE] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[#8B7E66] flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-[#5A5A40]" /> Relative Humidity
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F5F5F0] text-[#5A5A40]">
              RH Sensor
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-[#2D2D24] mt-1 flex items-baseline gap-2">
            <span>{latestReading?.humidityPct ?? '--'}</span>
            <span className="text-xs font-sans text-[#787668]">%RH</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#787668] mt-2 pt-2 border-t border-[#E5E5DE]">
            <span>Dew Point: 11.4°C</span>
            <span className="text-emerald-700 font-medium">Optimal Cond.</span>
          </div>
        </div>

        {/* Metric 4: Pressure / Power & Gateway Status */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E5DE] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[#8B7E66] flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-[#5A5A40]" />
              {latestReading?.pressureBar ? 'Hydraulic Pressure' : 'Drive Power Draw'}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
              Gateway OK
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-[#2D2D24] mt-1 flex items-baseline gap-2">
            <span>{latestReading?.pressureBar ? `${latestReading.pressureBar} bar` : `${latestReading?.powerKw ?? 24.5} kW`}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#787668] mt-2 pt-2 border-t border-[#E5E5DE]">
            <span>Packets: 184/s</span>
            <span className="font-mono text-[#5A5A40]">Loss: 0.01%</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Maintenance Prediction & Remaining Useful Life (RUL) Section       */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-2xl border border-[#E5E5DE] shadow-xs p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E5E5DE]">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#5A5A40]" />
              <h3 className="font-serif font-bold text-base text-[#2D2D24]">
                {isCompareMode
                  ? 'Comparative Remaining Useful Life (RUL) & Failure Predictions'
                  : `Maintenance Prediction & Remaining Useful Life (RUL) - ${selectedAsset.name}`}
              </h3>
            </div>
            <p className="text-xs text-[#787668]">
              Physics-informed ML estimation based on continuous harmonic vibration FFT, thermal core Arrhenius stress, and environmental factors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono bg-[#FAF9F5] px-2.5 py-1 rounded-lg border border-[#E5E5DE] text-[#5A5A40]">
              Sample Window: 24 Epochs (1.8s)
            </span>
          </div>
        </div>

        {isCompareMode ? (
          /* Dual Asset Comparative RUL Deck */
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Asset A RUL Card */}
              <div className="p-4 rounded-xl border-2 border-[#5A5A40] bg-[#FAF9F5] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#5A5A40]"></span>
                    <span className="text-xs font-bold text-[#2D2D24]">{selectedAsset.code} - {selectedAsset.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    assetARul.healthStatus === 'critical'
                      ? 'bg-red-100 text-red-700'
                      : assetARul.healthStatus === 'moderate'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {assetARul.healthStatus === 'critical' ? 'Critical Action' : assetARul.healthStatus === 'moderate' ? 'Service Due' : 'Optimal'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-serif font-bold text-[#2D2D24]">
                      {assetARul.rulPercent}% <span className="text-xs font-sans text-[#787668]">RUL Remaining</span>
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#5A5A40]">
                      ~{assetARul.rulHours.toLocaleString()} Operating Hours
                    </span>
                  </div>
                  <div className="w-full bg-[#E5E5DE] h-3 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        assetARul.healthStatus === 'critical'
                          ? 'bg-rose-500'
                          : assetARul.healthStatus === 'moderate'
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${assetARul.rulPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-[#787668]">
                    <span>0% (Wearout)</span>
                    <span>30% (Critical)</span>
                    <span>60% (Warning)</span>
                    <span>100% (New)</span>
                  </div>
                </div>

                <div className="text-xs text-[#2D2D24] bg-white p-2.5 rounded-xl border border-[#E5E5DE] space-y-1">
                  <p className="font-semibold text-[11px] text-[#5A5A40]">Suggested Action Window:</p>
                  <p className="text-[11px] text-[#787668]">{assetARul.suggestedAction}</p>
                  <p className="text-[10px] font-mono text-[#8B7E66] pt-1">
                    MTBF Limit Date: <strong>{assetARul.predictedFailureDate}</strong> (-{assetARul.degradationRatePerHour}%/100h)
                  </p>
                </div>
              </div>

              {/* Asset B RUL Card */}
              <div className="p-4 rounded-xl border-2 border-amber-500 bg-amber-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-xs font-bold text-[#2D2D24]">{compareAsset.code} - {compareAsset.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    assetBRul.healthStatus === 'critical'
                      ? 'bg-red-100 text-red-700'
                      : assetBRul.healthStatus === 'moderate'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {assetBRul.healthStatus === 'critical' ? 'Critical Action' : assetBRul.healthStatus === 'moderate' ? 'Service Due' : 'Optimal'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-serif font-bold text-[#2D2D24]">
                      {assetBRul.rulPercent}% <span className="text-xs font-sans text-[#787668]">RUL Remaining</span>
                    </span>
                    <span className="text-xs font-mono font-semibold text-amber-800">
                      ~{assetBRul.rulHours.toLocaleString()} Operating Hours
                    </span>
                  </div>
                  <div className="w-full bg-[#E5E5DE] h-3 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        assetBRul.healthStatus === 'critical'
                          ? 'bg-rose-500'
                          : assetBRul.healthStatus === 'moderate'
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${assetBRul.rulPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-[#787668]">
                    <span>0% (Wearout)</span>
                    <span>30% (Critical)</span>
                    <span>60% (Warning)</span>
                    <span>100% (New)</span>
                  </div>
                </div>

                <div className="text-xs text-[#2D2D24] bg-white p-2.5 rounded-xl border border-amber-200 space-y-1">
                  <p className="font-semibold text-[11px] text-amber-900">Suggested Action Window:</p>
                  <p className="text-[11px] text-[#787668]">{assetBRul.suggestedAction}</p>
                  <p className="text-[10px] font-mono text-[#8B7E66] pt-1">
                    MTBF Limit Date: <strong>{assetBRul.predictedFailureDate}</strong> (-{assetBRul.degradationRatePerHour}%/100h)
                  </p>
                </div>
              </div>
            </div>

            {/* Comparative RUL Verdict */}
            <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E5DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#5A5A40]" />
                <span className="text-[#2D2D24]">
                  <strong>Maintenance Scheduling Priority:</strong>{' '}
                  {assetARul.rulPercent < assetBRul.rulPercent
                    ? `${selectedAsset.name} (${selectedAsset.code}) requires priority maintenance intervention within ${assetARul.suggestedIntervalHours} hours.`
                    : `${compareAsset.name} (${compareAsset.code}) requires priority maintenance intervention within ${assetBRul.suggestedIntervalHours} hours.`}
                </span>
              </div>
              <button
                onClick={handleCreateWorkOrder}
                className="px-3 py-1.5 bg-[#5A5A40] hover:bg-[#474732] text-white rounded-lg font-semibold text-xs transition-colors shrink-0 cursor-pointer"
              >
                Dispatch Preventive CMMS Order
              </button>
            </div>
          </div>
        ) : (
          /* Single Asset RUL View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
            {/* Left 2 Cols: Visual RUL Gauge & Progress Indicator */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-serif font-bold text-[#2D2D24] flex items-baseline gap-2">
                    <span>{assetARul.rulPercent}%</span>
                    <span className="text-sm font-sans font-normal text-[#787668]">
                      Remaining Useful Life (RUL)
                    </span>
                  </div>
                  <p className="text-xs text-[#787668] mt-0.5">
                    Estimated <strong>{assetARul.rulHours.toLocaleString()} Operating Hours</strong> until mechanical failure or bearing wearout.
                  </p>
                </div>

                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  assetARul.healthStatus === 'critical'
                    ? 'bg-red-100 text-red-700'
                    : assetARul.healthStatus === 'moderate'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {assetARul.healthStatus === 'critical'
                    ? 'Immediate Overhaul'
                    : assetARul.healthStatus === 'moderate'
                    ? 'Inspection Window Due'
                    : 'Nominal Condition'}
                </span>
              </div>

              {/* Graphical Progress Bar Indicator */}
              <div className="space-y-1">
                <div className="w-full bg-[#E5E5DE] h-4 rounded-full overflow-hidden p-0.5 relative shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-700 shadow-sm ${
                      assetARul.healthStatus === 'critical'
                        ? 'bg-rose-500'
                        : assetARul.healthStatus === 'moderate'
                        ? 'bg-amber-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${assetARul.rulPercent}%` }}
                  />
                  {/* Warning and Critical Threshold Marker Lines */}
                  <div className="absolute top-0 bottom-0 left-[30%] w-0.5 bg-red-600/60" title="Critical 30% Threshold" />
                  <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-amber-600/60" title="Warning 60% Threshold" />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-[#787668] px-0.5">
                  <span className="text-red-700 font-semibold">0% (Wearout Failure)</span>
                  <span className="text-amber-700 font-semibold">30% (Critical)</span>
                  <span className="text-emerald-700 font-semibold">60% (Preventive)</span>
                  <span>100% (New / Rebuilt)</span>
                </div>
              </div>

              {/* Contributing Stress Factors */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E5E5DE]">
                  <span className="text-[10px] text-[#8B7E66] block font-semibold">Harmonic Vibration</span>
                  <span className={`font-mono font-bold ${assetARul.contributingFactors.vibrationWearPct > 40 ? 'text-red-600' : 'text-[#2D2D24]'}`}>
                    +{assetARul.contributingFactors.vibrationWearPct}% wear
                  </span>
                  <span className="text-[9px] text-[#787668] block mt-0.5">ISO 10816 velocity</span>
                </div>
                <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E5E5DE]">
                  <span className="text-[10px] text-[#8B7E66] block font-semibold">Thermal Stress</span>
                  <span className={`font-mono font-bold ${assetARul.contributingFactors.thermalStressPct > 40 ? 'text-amber-600' : 'text-[#2D2D24]'}`}>
                    +{assetARul.contributingFactors.thermalStressPct}% wear
                  </span>
                  <span className="text-[9px] text-[#787668] block mt-0.5">Arrhenius oil rate</span>
                </div>
                <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E5E5DE]">
                  <span className="text-[10px] text-[#8B7E66] block font-semibold">Humidity Exposure</span>
                  <span className="font-mono font-bold text-[#2D2D24]">
                    +{assetARul.contributingFactors.environmentalHumidityPct}% wear
                  </span>
                  <span className="text-[9px] text-[#787668] block mt-0.5">Corrosion index</span>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Recommended Maintenance Action & Dispatch */}
            <div className="bg-[#FAF9F5] p-4 rounded-xl border border-[#E5E5DE] space-y-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#5A5A40] mb-1">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Suggested Maintenance Interval</span>
                </div>
                <p className="text-xs text-[#2D2D24] font-medium leading-relaxed">
                  {assetARul.suggestedAction}
                </p>
              </div>

              <div className="text-[11px] font-mono space-y-1 pt-2 border-t border-[#E5E5DE]">
                <div className="flex justify-between">
                  <span className="text-[#787668]">Recommended Window:</span>
                  <strong className="text-[#2D2D24]">Within {assetARul.suggestedIntervalHours} Operating Hrs</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#787668]">Degradation Velocity:</span>
                  <span className="text-[#5A5A40]">-{assetARul.degradationRatePerHour}% / 100h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#787668]">Predicted MTBF Limit:</span>
                  <strong className="text-[#2D2D24]">{assetARul.predictedFailureDate}</strong>
                </div>
              </div>

              <button
                onClick={handleCreateWorkOrder}
                className="w-full py-2 bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Preventive Work Order</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RECHARTS Dynamic Live-Updating Telemetry Time-Series */}
      <div className="bg-white rounded-2xl border border-[#E5E5DE] shadow-xs p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E5E5DE]">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#5A5A40]" />
              <h3 className="font-serif font-bold text-base text-[#2D2D24]">
                {isCompareMode
                  ? `Side-by-Side Telemetry Overlay: ${selectedAsset.code} vs ${compareAsset.code}`
                  : `Telemetry Time-Series - ${selectedAsset.name} (${selectedAsset.code})`}
              </h3>
            </div>
            <p className="text-xs text-[#787668]">
              {isCompareMode
                ? 'Overlaying synchronous historical telemetry traces from two assets for comparative anomaly & wear detection.'
                : 'Dynamic historical trends streaming at 1.8s refresh interval with automated threshold lines.'}
            </p>
          </div>

          {/* Metric View Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-[#F5F5F0] p-1 rounded-xl border border-[#E5E5DE] text-xs font-semibold">
              <button
                onClick={() => setActiveMetricTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeMetricTab === 'all' ? 'bg-white text-[#2D2D24] shadow-xs' : 'text-[#787668]'
                }`}
              >
                All Metrics
              </button>
              <button
                onClick={() => setActiveMetricTab('temperature')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeMetricTab === 'temperature' ? 'bg-white text-[#2D2D24] shadow-xs' : 'text-[#787668]'
                }`}
              >
                Temperature
              </button>
              <button
                onClick={() => setActiveMetricTab('vibration')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeMetricTab === 'vibration' ? 'bg-white text-[#2D2D24] shadow-xs' : 'text-[#787668]'
                }`}
              >
                Vibration
              </button>
              <button
                onClick={() => setActiveMetricTab('humidity')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeMetricTab === 'humidity' ? 'bg-white text-[#2D2D24] shadow-xs' : 'text-[#787668]'
                }`}
              >
                Humidity
              </button>
            </div>
          </div>
        </div>

        {/* Charts Container */}
        <div className="space-y-6">
          {/* 1. TEMPERATURE CHART (When 'all' or 'temperature' active) */}
          {(activeMetricTab === 'all' || activeMetricTab === 'temperature') && (
            <div className="bg-[#FAF9F5]/40 rounded-xl p-4 border border-[#E5E5DE]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-[#5A5A40]" />
                  <span className="text-xs font-bold text-[#2D2D24]">
                    {isCompareMode
                      ? `Comparative Temperature Trend: ${selectedAsset.code} (Solid Olive) vs ${compareAsset.code} (Dashed Amber)`
                      : `Historical Temperature Trend (${temperatureUnit === 'C' ? '°C' : '°F'})`}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-[#d97706]">
                    <span className="w-2.5 h-0.5 bg-[#d97706]"></span> Warning ({temperatureUnit === 'C' ? '60°C' : '140°F'})
                  </span>
                  <span className="flex items-center gap-1 text-[#dc2626]">
                    <span className="w-2.5 h-0.5 bg-[#dc2626]"></span> Critical ({temperatureUnit === 'C' ? '75°C' : '167°F'})
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {isCompareMode ? (
                    <LineChart data={comparisonChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DE" vertical={false} />
                      <XAxis dataKey="time" stroke="#787668" fontSize={10} tickLine={false} />
                      <YAxis
                        stroke="#787668"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        unit={temperatureUnit === 'C' ? '°' : '°'}
                        domain={['dataMin - 3', 'dataMax + 4']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E5E5DE',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          fontSize: '11px'
                        }}
                        labelStyle={{ fontWeight: 'bold', color: '#2D2D24' }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <ReferenceLine y={temperatureUnit === 'C' ? 60 : 140} stroke="#d97706" strokeDasharray="4 4" />
                      <ReferenceLine y={temperatureUnit === 'C' ? 75 : 167} stroke="#dc2626" strokeDasharray="4 4" />
                      <Line
                        type="monotone"
                        dataKey="tempA"
                        name={`${selectedAsset.code}: ${selectedAsset.name} (°${temperatureUnit})`}
                        stroke="#5A5A40"
                        strokeWidth={2.5}
                        dot={{ r: 2 }}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="tempB"
                        name={`${compareAsset.code}: ${compareAsset.name} (°${temperatureUnit})`}
                        stroke="#d97706"
                        strokeWidth={2.5}
                        strokeDasharray="4 4"
                        dot={{ r: 2 }}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  ) : (
                    <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5A5A40" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#5A5A40" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DE" vertical={false} />
                      <XAxis dataKey="time" stroke="#787668" fontSize={10} tickLine={false} />
                      <YAxis
                        stroke="#787668"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        unit={temperatureUnit === 'C' ? '°' : '°'}
                        domain={['dataMin - 3', 'dataMax + 4']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E5E5DE',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          fontSize: '11px'
                        }}
                        formatter={(val: any) => [`${val} ${temperatureUnit === 'C' ? '°C' : '°F'}`, 'Temperature']}
                        labelStyle={{ fontWeight: 'bold', color: '#2D2D24' }}
                      />
                      <ReferenceLine y={temperatureUnit === 'C' ? 60 : 140} stroke="#d97706" strokeDasharray="4 4" />
                      <ReferenceLine y={temperatureUnit === 'C' ? 75 : 167} stroke="#dc2626" strokeDasharray="4 4" />
                      <Area
                        type="monotone"
                        dataKey="displayTemp"
                        stroke="#5A5A40"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#tempGradient)"
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 2. VIBRATION FFT VELOCITY CHART (When 'all' or 'vibration' active) */}
          {(activeMetricTab === 'all' || activeMetricTab === 'vibration') && (
            <div className="bg-[#FAF9F5]/40 rounded-xl p-4 border border-[#E5E5DE]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#5A5A40]" />
                  <span className="text-xs font-bold text-[#2D2D24]">
                    {isCompareMode
                      ? `Comparative Vibration Velocity: ${selectedAsset.code} vs ${compareAsset.code} (ISO 10816 RMS)`
                      : 'Vibration Velocity Trend (ISO 10816-3 RMS mm/s)'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Good (&lt;1.8)
                  </span>
                  <span className="flex items-center gap-1 text-amber-600">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Alert (1.8-3.5)
                  </span>
                  <span className="flex items-center gap-1 text-red-600">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Critical (&gt;4.5)
                  </span>
                </div>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {isCompareMode ? (
                    <LineChart data={comparisonChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DE" vertical={false} />
                      <XAxis dataKey="time" stroke="#787668" fontSize={10} tickLine={false} />
                      <YAxis
                        stroke="#787668"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        unit="mm/s"
                        domain={[0, 'dataMax + 1']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E5E5DE',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          fontSize: '11px'
                        }}
                        labelStyle={{ fontWeight: 'bold', color: '#2D2D24' }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <ReferenceLine y={2.8} stroke="#d97706" strokeDasharray="4 4" />
                      <ReferenceLine y={4.5} stroke="#dc2626" strokeDasharray="4 4" />
                      <Line
                        type="monotone"
                        dataKey="vibA"
                        name={`${selectedAsset.code}: ${selectedAsset.name} (mm/s)`}
                        stroke="#2D2D24"
                        strokeWidth={2.5}
                        dot={{ r: 2 }}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="vibB"
                        name={`${compareAsset.code}: ${compareAsset.name} (mm/s)`}
                        stroke="#0284c7"
                        strokeWidth={2.5}
                        strokeDasharray="4 4"
                        dot={{ r: 2 }}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DE" vertical={false} />
                      <XAxis dataKey="time" stroke="#787668" fontSize={10} tickLine={false} />
                      <YAxis
                        stroke="#787668"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        unit="mm/s"
                        domain={[0, 'dataMax + 1']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E5E5DE',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          fontSize: '11px'
                        }}
                        formatter={(val: any) => [`${val} mm/s`, 'Vibration RMS']}
                        labelStyle={{ fontWeight: 'bold', color: '#2D2D24' }}
                      />
                      <ReferenceLine y={2.8} stroke="#d97706" strokeDasharray="4 4" />
                      <ReferenceLine y={4.5} stroke="#dc2626" strokeDasharray="4 4" />
                      <Line
                        type="monotone"
                        dataKey="vibrationMmS"
                        stroke={selectedAsset.id === 'asset-02' ? '#dc2626' : '#2D2D24'}
                        strokeWidth={2.5}
                        dot={{ r: 2 }}
                        activeDot={{ r: 5 }}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 3. HUMIDITY CHART (When 'all' or 'humidity' active) */}
          {(activeMetricTab === 'all' || activeMetricTab === 'humidity') && (
            <div className="bg-[#FAF9F5]/40 rounded-xl p-4 border border-[#E5E5DE]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-[#5A5A40]" />
                  <span className="text-xs font-bold text-[#2D2D24]">
                    {isCompareMode
                      ? `Comparative Relative Humidity: ${selectedAsset.code} vs ${compareAsset.code} (%RH)`
                      : 'Ambient & Environmental Humidity (%RH)'}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#787668]">
                  Cleanroom Tolerance: 35% - 60% RH
                </div>
              </div>

              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {isCompareMode ? (
                    <LineChart data={comparisonChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DE" vertical={false} />
                      <XAxis dataKey="time" stroke="#787668" fontSize={10} tickLine={false} />
                      <YAxis
                        stroke="#787668"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        unit="%"
                        domain={[10, 80]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E5E5DE',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          fontSize: '11px'
                        }}
                        labelStyle={{ fontWeight: 'bold', color: '#2D2D24' }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <ReferenceLine y={65} stroke="#d97706" strokeDasharray="4 4" />
                      <Line
                        type="monotone"
                        dataKey="humA"
                        name={`${selectedAsset.code}: ${selectedAsset.name} (%RH)`}
                        stroke="#0284c7"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="humB"
                        name={`${compareAsset.code}: ${compareAsset.name} (%RH)`}
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        dot={{ r: 2 }}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  ) : (
                    <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E5DE" vertical={false} />
                      <XAxis dataKey="time" stroke="#787668" fontSize={10} tickLine={false} />
                      <YAxis
                        stroke="#787668"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        unit="%"
                        domain={[10, 80]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E5E5DE',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          fontSize: '11px'
                        }}
                        formatter={(val: any) => [`${val} %RH`, 'Relative Humidity']}
                        labelStyle={{ fontWeight: 'bold', color: '#2D2D24' }}
                      />
                      <ReferenceLine y={65} stroke="#d97706" strokeDasharray="4 4" />
                      <Area
                        type="monotone"
                        dataKey="humidityPct"
                        stroke="#0284c7"
                        strokeWidth={2}
                        fill="url(#humGradient)"
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lower Section: Connected Sensors Grid + AI Edge Diagnostics Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Connected Hardware Sensors Inventory */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E5DE] shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DE]">
            <div>
              <h3 className="font-serif font-bold text-base text-[#2D2D24]">
                Connected Hardware Sensors ({boundSensors.length} Paired)
              </h3>
              <p className="text-xs text-[#787668]">
                Physical telemetry probes bound to {selectedAsset.name}
              </p>
            </div>
            <button
              onClick={() => setIsOnboardingModalOpen(true)}
              className="text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#5A5A40] border border-[#E5E5DE] font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Pair Channel</span>
            </button>
          </div>

          <div className="space-y-3">
            {boundSensors.map((sensor) => (
              <div
                key={sensor.id}
                className="bg-[#FAF9F5] p-3.5 rounded-xl border border-[#E5E5DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E5DE] flex items-center justify-center shrink-0 text-[#5A5A40] shadow-2xs">
                    {sensor.sensorType === 'vibration_piezo' ? (
                      <Zap className="w-4 h-4" />
                    ) : sensor.sensorType === 'thermal_rtd' ? (
                      <Thermometer className="w-4 h-4" />
                    ) : (
                      <Droplets className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#2D2D24]">{sensor.name}</span>
                      <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-[#E5E5DE] text-[#5A5A40]">
                        {sensor.protocol}
                      </span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold uppercase">
                        {sensor.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#787668] mt-0.5">{sensor.location}</div>
                    <div className="font-mono text-[10px] text-[#8B7E66] mt-1 flex flex-wrap gap-2">
                      <span>MAC: {sensor.macAddress}</span>
                      <span>&bull;</span>
                      <span>IP: {sensor.ipAddress}</span>
                      <span>&bull;</span>
                      <span>Rate: {sensor.samplingRateMs}ms</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center sm:flex-col sm:items-end justify-between gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E5DE]">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#5A5A40] font-mono">
                    <Wifi className="w-3.5 h-3.5" />
                    <span>{sensor.signalRssi} dBm</span>
                  </div>
                  <span className="text-[10px] text-[#787668]">Ping: {sensor.lastPing}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Edge Gateways Status Strip */}
          <div className="mt-5 pt-4 border-t border-[#E5E5DE]">
            <span className="text-xs font-bold text-[#2D2D24] mb-2 block">
              Active Plant Edge Gateways:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {gateways.map((gw) => (
                <div key={gw.id} className="bg-white p-2.5 rounded-xl border border-[#E5E5DE] text-xs">
                  <div className="flex items-center justify-between font-bold text-[#2D2D24] mb-0.5">
                    <span className="truncate">{gw.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  </div>
                  <div className="text-[10px] text-[#787668] truncate">{gw.location}</div>
                  <div className="text-[10px] font-mono text-[#5A5A40] mt-1">
                    {gw.packetsPerSec} pkt/s &bull; {gw.uptime.split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: AI Edge Diagnostics & Work Order Pipeline */}
        <div className="bg-white rounded-2xl border border-[#E5E5DE] shadow-xs p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DE]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#5A5A40]" />
                <h3 className="font-serif font-bold text-base text-[#2D2D24]">
                  Gemini Edge Diagnostics
                </h3>
              </div>
              <span className="text-[10px] font-mono uppercase bg-[#F5F5F0] text-[#5A5A40] px-2 py-0.5 rounded border border-[#E5E5DE]">
                AI Copilot
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-[#787668]">
                Real-time harmonic frequency analysis and thermal gradient correlation across connected sensors.
              </p>

              {aiReport ? (
                <div className={`p-4 rounded-xl border text-xs space-y-3 ${
                  selectedAsset.id === 'asset-02'
                    ? 'bg-red-50/70 border-red-200 text-red-900'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex items-start gap-2">
                    {selectedAsset.id === 'asset-02' ? (
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <div className="font-medium leading-relaxed">
                      {aiReport}
                    </div>
                  </div>

                  {selectedAsset.id === 'asset-02' && (
                    <button
                      onClick={handleDraftCmmsOrderFromDiagnostic}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Draft Corrective Work Order in CMMS</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-[#FAF9F5] p-4 rounded-xl border border-dashed border-[#E5E5DE] text-center text-xs text-[#787668]">
                  Click &ldquo;Analyze Telemetry Harmonics&rdquo; below to run Gemini predictive health inspection on {selectedAsset.name}.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E5DE] space-y-2">
            <button
              onClick={handleRunAiDiagnostics}
              disabled={isAiDiagnosing}
              className="w-full py-2.5 bg-[#2D2D24] hover:bg-[#3D3D32] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              {isAiDiagnosing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Evaluating FFT Telemetry...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Analyze Telemetry Harmonics</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SENSOR ONBOARDING MODAL */}
      {isOnboardingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2D2D24]">
                    Pair & Onboard IoT Sensor
                  </h3>
                  <p className="text-xs text-[#787668]">
                    Provision edge telemetry probe to machine maintenance asset
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOnboardingModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#E5E5DE] text-[#787668] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSensor} className="p-5 space-y-4 text-xs overflow-y-auto">
              {/* Sensor Name */}
              <div>
                <label className="block font-semibold text-[#2D2D24] mb-1">
                  Sensor Name / Tag
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spindle Front Bearing Triaxial Piezo"
                  value={newSensorForm.name}
                  onChange={(e) => setNewSensorForm({ ...newSensorForm, name: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#E5E5DE] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2D24] focus:ring-1 focus:ring-[#5A5A40] outline-hidden"
                />
              </div>

              {/* Protocol & Sensor Type Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1">
                    Telemetry Metric Type
                  </label>
                  <select
                    value={newSensorForm.sensorType}
                    onChange={(e) => setNewSensorForm({ ...newSensorForm, sensorType: e.target.value as IoTSensorType })}
                    className="w-full bg-[#FAF9F5] border border-[#E5E5DE] rounded-xl px-3 py-2 text-xs text-[#2D2D24] focus:ring-1 focus:ring-[#5A5A40] outline-hidden cursor-pointer"
                  >
                    <option value="vibration_piezo">Vibration (Piezo Accelerometer)</option>
                    <option value="thermal_rtd">Temperature (RTD / Thermocouple)</option>
                    <option value="humidity_rh">Humidity & Dew Point (%RH)</option>
                    <option value="multi_environmental">Multi-Sensor Environmental</option>
                    <option value="acoustic_ultrasound">Acoustic Ultrasound (dB)</option>
                    <option value="power_clamp">Current / Power Clamp (kW)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1">
                    Edge Protocol
                  </label>
                  <select
                    value={newSensorForm.protocol}
                    onChange={(e) => setNewSensorForm({ ...newSensorForm, protocol: e.target.value as IoTSensorProtocol })}
                    className="w-full bg-[#FAF9F5] border border-[#E5E5DE] rounded-xl px-3 py-2 text-xs text-[#2D2D24] focus:ring-1 focus:ring-[#5A5A40] outline-hidden cursor-pointer"
                  >
                    <option value="MQTT">MQTT Broker (TLS Port 8883)</option>
                    <option value="Modbus TCP">Modbus TCP (Port 502)</option>
                    <option value="BACnet/IP">BACnet/IP (Port 47808)</option>
                    <option value="OPC-UA">OPC-UA Server (Port 4840)</option>
                    <option value="LoRaWAN">LoRaWAN (EU868 / US915)</option>
                    <option value="BLE 5.2">Bluetooth Low Energy (BLE 5.2)</option>
                  </select>
                </div>
              </div>

              {/* Asset Binding */}
              <div>
                <label className="block font-semibold text-[#2D2D24] mb-1">
                  Bind to Maintenance Asset
                </label>
                <select
                  value={newSensorForm.boundAssetId}
                  onChange={(e) => setNewSensorForm({ ...newSensorForm, boundAssetId: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#E5E5DE] rounded-xl px-3 py-2 text-xs text-[#2D2D24] focus:ring-1 focus:ring-[#5A5A40] outline-hidden cursor-pointer"
                >
                  {maintenanceAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.code}) - {asset.location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Physical Location on Asset */}
              <div>
                <label className="block font-semibold text-[#2D2D24] mb-1">
                  Mounting Location / Bearing Collar
                </label>
                <input
                  type="text"
                  placeholder="e.g. Spindle Nose Collar / Main Ram Head"
                  value={newSensorForm.location}
                  onChange={(e) => setNewSensorForm({ ...newSensorForm, location: e.target.value })}
                  className="w-full bg-[#FAF9F5] border border-[#E5E5DE] rounded-xl px-3.5 py-2 text-xs text-[#2D2D24] focus:ring-1 focus:ring-[#5A5A40] outline-hidden"
                />
              </div>

              {/* Sampling Rate & Thresholds */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E5E5DE]">
                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1">
                    Sampling Frequency (ms)
                  </label>
                  <select
                    value={newSensorForm.samplingRateMs}
                    onChange={(e) => setNewSensorForm({ ...newSensorForm, samplingRateMs: Number(e.target.value) })}
                    className="w-full bg-[#FAF9F5] border border-[#E5E5DE] rounded-xl px-3 py-2 text-xs text-[#2D2D24] focus:ring-1 focus:ring-[#5A5A40] outline-hidden cursor-pointer"
                  >
                    <option value={100}>100ms (High-Speed FFT)</option>
                    <option value={250}>250ms (Dynamic Mechanical)</option>
                    <option value={500}>500ms (Standard Industrial)</option>
                    <option value={1000}>1,000ms (Thermal / Pressure)</option>
                    <option value={5000}>5,000ms (Environmental RH)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1">
                    MAC Address
                  </label>
                  <input
                    type="text"
                    value={newSensorForm.macAddress}
                    onChange={(e) => setNewSensorForm({ ...newSensorForm, macAddress: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#E5E5DE] rounded-xl px-3 py-2 font-mono text-[11px] text-[#2D2D24] focus:ring-1 focus:ring-[#5A5A40] outline-hidden"
                  />
                </div>
              </div>

              {/* Alarm Thresholds */}
              <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E5E5DE] space-y-2">
                <span className="font-bold text-[#2D2D24] block">Threshold Alerts:</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#787668] block">Temp Warning (°C)</label>
                    <input
                      type="number"
                      value={newSensorForm.tempWarningC}
                      onChange={(e) => setNewSensorForm({ ...newSensorForm, tempWarningC: Number(e.target.value) })}
                      className="w-full bg-white border border-[#E5E5DE] rounded-lg px-2.5 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#787668] block">Vibration Warning (mm/s)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newSensorForm.vibWarningMmS}
                      onChange={(e) => setNewSensorForm({ ...newSensorForm, vibWarningMmS: Number(e.target.value) })}
                      className="w-full bg-white border border-[#E5E5DE] rounded-lg px-2.5 py-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#E5E5DE] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOnboardingModalOpen(false)}
                  className="px-4 py-2 bg-[#FAF9F5] hover:bg-[#F5F5F0] text-[#2D2D24] font-semibold rounded-xl border border-[#E5E5DE] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5A5A40] hover:bg-[#474732] text-white font-bold rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Provision & Register</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
