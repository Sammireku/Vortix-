import React, { useState, useEffect, useMemo } from 'react';
import {
  Factory,
  Activity,
  Gauge,
  Thermometer,
  Zap,
  RotateCcw,
  Truck,
  Battery,
  AlertCircle,
  Eye,
  CheckCircle2,
  Cpu,
  Radio,
  Sliders,
  Sparkles,
  TrendingUp,
  Pause,
  Play,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { FloorCell, AgvVehicle, RoleDefinition, MaintenanceAsset } from '../../types';
import { INITIAL_MAINTENANCE_ASSETS } from '../../data/initialData';

interface DigitalTwinViewProps {
  cells: FloorCell[];
  agvFleet: AgvVehicle[];
  currentRole: RoleDefinition;
  maintenanceAssets?: MaintenanceAsset[];
  onSelectCell?: (cell: FloorCell) => void;
  onDispatchAgv?: (agvId: string) => void;
  onEmergencyStopBay?: (bayName: string) => void;
  onNavigateToIotAnalytics?: (assetId?: string) => void;
}

interface HistoricalTempPoint {
  time: string;
  timestamp: number;
  temperature: number;
  displayTemp: number;
  warningLimit: number;
  criticalLimit: number;
  vibration: number;
  status: 'normal' | 'warning' | 'critical';
}

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({
  cells,
  agvFleet,
  currentRole,
  maintenanceAssets = INITIAL_MAINTENANCE_ASSETS,
  onSelectCell,
  onDispatchAgv,
  onEmergencyStopBay,
  onNavigateToIotAnalytics,
}) => {
  const [selectedCellId, setSelectedCellId] = useState<string>(cells[0]?.id || '');
  const [activeBayFilter, setActiveBayFilter] = useState<string>('all');
  const [telemetrySimTime, setTelemetrySimTime] = useState<string>('Real-Time (1.8s)');

  // Selected Maintenance Asset for Recharts Temperature Trend
  const [selectedAssetId, setSelectedAssetId] = useState<string>(maintenanceAssets[0]?.id || 'asset-01');
  const [isChartStreaming, setIsChartStreaming] = useState<boolean>(true);
  const [chartTempUnit, setChartTempUnit] = useState<'C' | 'F'>('C');

  const selectedCell = cells.find((c) => c.id === selectedCellId) || cells[0];
  const selectedAsset = useMemo(() => {
    return maintenanceAssets.find((a) => a.id === selectedAssetId) || maintenanceAssets[0];
  }, [maintenanceAssets, selectedAssetId]);

  // Asset base parameters for temperature simulation
  const assetBaseParams = useMemo(() => {
    switch (selectedAsset.id) {
      case 'asset-02':
        return { baseTemp: 56.4, warnC: 65, critC: 75, warnF: 149, critF: 167 };
      case 'asset-03':
        return { baseTemp: 22.8, warnC: 28, critC: 34, warnF: 82.4, critF: 93.2 };
      case 'asset-04':
        return { baseTemp: 182.0, warnC: 198, critC: 215, warnF: 388.4, critF: 419 };
      case 'asset-01':
      default:
        return { baseTemp: 44.2, warnC: 60, critC: 75, warnF: 140, critF: 167 };
    }
  }, [selectedAsset.id]);

  // Generate initial historical temperature data points
  const [tempHistory, setTempHistory] = useState<HistoricalTempPoint[]>(() => {
    const points: HistoricalTempPoint[] = [];
    const now = Date.now();
    const count = 22;

    for (let i = count - 1; i >= 0; i--) {
      const ts = now - i * 60 * 1000;
      const angle = (count - i) * 0.4;
      const noise = Math.sin(angle) * 1.5 + (Math.random() * 0.6 - 0.3);
      const tempC = Math.round((assetBaseParams.baseTemp + noise) * 10) / 10;
      const isWarn = tempC >= assetBaseParams.warnC;

      points.push({
        time: new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timestamp: ts,
        temperature: tempC,
        displayTemp: tempC,
        warningLimit: assetBaseParams.warnC,
        criticalLimit: assetBaseParams.critC,
        vibration: Math.round((1.6 + Math.cos(angle) * 0.2) * 100) / 100,
        status: isWarn ? 'warning' : 'normal'
      });
    }
    return points;
  });

  // Whenever selected asset changes, reseed historical temperature data
  useEffect(() => {
    const points: HistoricalTempPoint[] = [];
    const now = Date.now();
    const count = 22;

    for (let i = count - 1; i >= 0; i--) {
      const ts = now - i * 60 * 1000;
      const angle = (count - i) * 0.4;
      const noise = Math.sin(angle) * 1.4 + (Math.random() * 0.6 - 0.3);
      const tempC = Math.round((assetBaseParams.baseTemp + noise) * 10) / 10;
      const isWarn = tempC >= assetBaseParams.warnC;

      points.push({
        time: new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timestamp: ts,
        temperature: tempC,
        displayTemp: chartTempUnit === 'F' ? Math.round(((tempC * 9) / 5 + 32) * 10) / 10 : tempC,
        warningLimit: chartTempUnit === 'F' ? assetBaseParams.warnF : assetBaseParams.warnC,
        criticalLimit: chartTempUnit === 'F' ? assetBaseParams.critF : assetBaseParams.critC,
        vibration: Math.round((1.6 + Math.cos(angle) * 0.2) * 100) / 100,
        status: isWarn ? 'warning' : 'normal'
      });
    }
    setTempHistory(points);
  }, [selectedAsset.id, assetBaseParams, chartTempUnit]);

  // Live streaming interval for Recharts Line Chart
  useEffect(() => {
    if (!isChartStreaming) return;

    const interval = setInterval(() => {
      setTempHistory((prev) => {
        const last = prev[prev.length - 1];
        if (!last) return prev;

        const now = Date.now();
        const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const delta = (Math.random() - 0.48) * 0.8;
        const newTempC = Math.round((last.temperature + delta) * 10) / 10;

        const isWarn = newTempC >= assetBaseParams.warnC;
        const isCrit = newTempC >= assetBaseParams.critC;

        const newPoint: HistoricalTempPoint = {
          time: timeStr,
          timestamp: now,
          temperature: newTempC,
          displayTemp: chartTempUnit === 'F' ? Math.round(((newTempC * 9) / 5 + 32) * 10) / 10 : newTempC,
          warningLimit: chartTempUnit === 'F' ? assetBaseParams.warnF : assetBaseParams.warnC,
          criticalLimit: chartTempUnit === 'F' ? assetBaseParams.critF : assetBaseParams.critC,
          vibration: Math.max(0.1, Math.round((last.vibration + (Math.random() - 0.5) * 0.1) * 100) / 100),
          status: isCrit ? 'critical' : isWarn ? 'warning' : 'normal'
        };

        return [...prev.slice(-24), newPoint];
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isChartStreaming, assetBaseParams, chartTempUnit]);

  // When clicking a floor cell, synchronize with the matching maintenance asset
  const handleCellClick = (cell: FloorCell) => {
    setSelectedCellId(cell.id);
    if (onSelectCell) onSelectCell(cell);

    // Map cell to maintenance asset
    if (cell.id === 'cell-cnc-1' || cell.id === 'cell-cnc-2') {
      setSelectedAssetId('asset-01');
    } else if (cell.id === 'cell-press-1') {
      setSelectedAssetId('asset-02');
    } else if (cell.id === 'cell-smt-1') {
      setSelectedAssetId('asset-03');
    } else if (cell.id === 'cell-coat-1') {
      setSelectedAssetId('asset-04');
    }
  };

  const bays = Array.from(new Set(cells.map((c) => c.bay)));

  const getStatusBadge = (status: FloorCell['status']) => {
    switch (status) {
      case 'running':
        return {
          bg: 'bg-emerald-500',
          ring: 'ring-emerald-300',
          text: 'Running',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'bottleneck':
        return {
          bg: 'bg-red-500',
          ring: 'ring-red-300',
          text: 'Bottleneck',
          badgeClass: 'bg-red-100 text-red-800 border-red-300',
        };
      case 'maintenance':
        return {
          bg: 'bg-amber-500',
          ring: 'ring-amber-300',
          text: 'Maintenance',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      case 'idle':
      default:
        return {
          bg: 'bg-gray-400',
          ring: 'ring-gray-200',
          text: 'Idle',
          badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
        };
    }
  };

  const filteredCells =
    activeBayFilter === 'all'
      ? cells
      : cells.filter((c) => c.bay === activeBayFilter);

  // Stats for the chart
  const currentTempDisplay = tempHistory[tempHistory.length - 1]?.displayTemp || 0;
  const tempSeries = tempHistory.map((p) => p.displayTemp);
  const minTemp = tempSeries.length ? Math.min(...tempSeries) : 0;
  const maxTemp = tempSeries.length ? Math.max(...tempSeries) : 0;
  const avgTemp = tempSeries.length
    ? Math.round((tempSeries.reduce((a, b) => a + b, 0) / tempSeries.length) * 10) / 10
    : 0;

  const warnLimitDisplay = chartTempUnit === 'F' ? assetBaseParams.warnF : assetBaseParams.warnC;
  const critLimitDisplay = chartTempUnit === 'F' ? assetBaseParams.critF : assetBaseParams.critC;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls & Status Bar */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E5DE] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-md bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] font-semibold flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-[#5A5A40]" />
              Spatial Cyber-Physical Architecture
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              {telemetrySimTime}
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2D2D24] tracking-tight">
            Shop-Floor 2D Plant Digital Twin
          </h2>
          <p className="text-xs text-[#787668]">
            Interactive 2D spatial workcenter layout, autonomous AGV fleet tracking, and live thermal telemetry.
          </p>
        </div>

        {/* Filter by Bay & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-[#F5F5F0] p-1 rounded-xl border border-[#E5E5DE] text-xs font-semibold">
            <button
              onClick={() => setActiveBayFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeBayFilter === 'all'
                  ? 'bg-white text-[#2D2D24] shadow-xs'
                  : 'text-[#787668] hover:text-[#2D2D24]'
              }`}
            >
              All Bays ({cells.length})
            </button>
            {bays.map((bay) => (
              <button
                key={bay}
                onClick={() => setActiveBayFilter(bay)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeBayFilter === bay
                    ? 'bg-white text-[#2D2D24] shadow-xs'
                    : 'text-[#787668] hover:text-[#2D2D24]'
                }`}
              >
                {bay}
              </button>
            ))}
          </div>

          {/* Quick link to IoT Edge Analytics */}
          {onNavigateToIotAnalytics && (
            <button
              onClick={() => onNavigateToIotAnalytics(selectedAsset.id)}
              className="px-3.5 py-2 bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Full IoT Edge Analytics</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Floor Layout & Deep Dive Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 2D Plant Floor Grid Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E5E5DE] shadow-xs p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E5DE]">
              <div className="flex items-center gap-2">
                <Factory className="w-4 h-4 text-[#5A5A40]" />
                <h3 className="font-serif font-bold text-base text-[#2D2D24]">
                  Midwest Machining Center - 2D Facility Grid (Plant 1)
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#8B7E66]">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Normal
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Bottleneck
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Starved
                </span>
              </div>
            </div>

            {/* Plant Floor 2D Isometric-like Grid with machine cells */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 relative z-10">
              {filteredCells.map((cell) => {
                const badge = getStatusBadge(cell.status);
                const isSelected = cell.id === selectedCellId;

                return (
                  <div
                    key={cell.id}
                    onClick={() => handleCellClick(cell)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-[#FAF9F5] border-[#5A5A40] ring-2 ring-[#5A5A40]/30 shadow-md'
                        : 'bg-white hover:bg-[#F5F5F0]/50 border-[#E5E5DE]'
                    }`}
                  >
                    {/* Top machine badge & status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${badge.bg}`}></span>
                        <span className="font-mono text-[10px] font-bold text-[#8B7E66]">
                          {cell.machineType}
                        </span>
                      </div>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${badge.badgeClass}`}>
                        {badge.text}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-[#2D2D24] mt-2 line-clamp-1">
                      {cell.name}
                    </h4>
                    <div className="text-[10px] text-[#8B7E66] mb-2">{cell.bay}</div>

                    {/* Mini Telemetry Strip */}
                    <div className="grid grid-cols-3 gap-1 pt-2 border-t border-[#E5E5DE] text-center text-[10px] font-mono">
                      <div className="bg-[#F5F5F0] p-1 rounded-md">
                        <span className="text-[#8B7E66] block text-[8px] font-sans">OEE</span>
                        <span className="font-bold text-[#2D2D24]">{cell.oee}%</span>
                      </div>
                      <div className="bg-[#F5F5F0] p-1 rounded-md">
                        <span className="text-[#8B7E66] block text-[8px] font-sans">TEMP</span>
                        <span className="font-bold text-[#2D2D24]">{cell.telemetry.temperatureC}°C</span>
                      </div>
                      <div className="bg-[#F5F5F0] p-1 rounded-md">
                        <span className="text-[#8B7E66] block text-[8px] font-sans">VIB</span>
                        <span className={`font-bold ${cell.telemetry.vibrationMmS > 3.0 ? 'text-red-600' : 'text-[#2D2D24]'}`}>
                          {cell.telemetry.vibrationMmS}
                        </span>
                      </div>
                    </div>

                    {cell.currentWorkOrder && (
                      <div className="mt-2 text-[9px] font-mono text-[#5A5A40] flex items-center gap-1">
                        <span className="text-[#8B7E66]">WO:</span> {cell.currentWorkOrder}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Autonomous AGV Vehicles Track at bottom of floor */}
            <div className="mt-5 pt-4 border-t border-[#E5E5DE] relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#2D2D24] flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#5A5A40]" />
                  Autonomous Mobile Robots (AGV Transit Fleet)
                </span>
                <span className="text-[10px] font-mono text-[#8B7E66]">LiDAR Navigation Active</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {agvFleet.map((agv) => (
                  <div
                    key={agv.id}
                    className="bg-white p-2.5 rounded-xl border border-[#E5E5DE] shadow-xs text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2D2D24]">{agv.name}</span>
                      <span className="text-[10px] font-mono flex items-center gap-1 text-[#5A5A40]">
                        <Battery className="w-3 h-3" /> {agv.batteryPct}%
                      </span>
                    </div>
                    <div className="text-[10px] text-[#787668]">
                      Route: <strong className="text-[#2D2D24]">{agv.currentBay}</strong> &rarr; {agv.destinationBay}
                    </div>
                    <div className="text-[10px] text-[#8B7E66] truncate">
                      Payload: {agv.payload}
                    </div>
                    <div className="w-full bg-[#F5F5F0] rounded-full h-1 mt-1 overflow-hidden">
                      <div
                        className="bg-[#5A5A40] h-1 rounded-full transition-all duration-300"
                        style={{ width: `${agv.progressPct}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Machine Cell Telemetry Deep-Dive */}
        <div className="bg-white rounded-2xl border border-[#E5E5DE] shadow-xs p-5 space-y-5">
          <div className="pb-3 border-b border-[#E5E5DE]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] font-semibold">
                Live Cell Telemetry
              </span>
              <span className="text-[10px] font-mono text-[#8B7E66]">Edge Gateway #09</span>
            </div>
            <h3 className="font-serif font-bold text-lg text-[#2D2D24]">
              {selectedCell.name}
            </h3>
            <div className="text-xs text-[#787668] mt-0.5">
              Assigned Workcenter: <strong>{selectedCell.bay}</strong>
            </div>
          </div>

          {/* Telemetry Sensor Readouts */}
          <div className="space-y-3">
            <div className="bg-[#F5F5F0] p-3 rounded-xl border border-[#E5E5DE]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#8B7E66] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#5A5A40]" /> Spindle Speed
                </span>
                <span className="font-mono font-bold text-[#2D2D24]">
                  {selectedCell.telemetry.spindleRpm} RPM
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#5A5A40] h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, (selectedCell.telemetry.spindleRpm / 18000) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-[#F5F5F0] p-3 rounded-xl border border-[#E5E5DE]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#8B7E66] flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-[#5A5A40]" /> Core Temperature
                </span>
                <span className="font-mono font-bold text-[#2D2D24]">
                  {selectedCell.telemetry.temperatureC} °C
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${
                    selectedCell.telemetry.temperatureC > 70 ? 'bg-red-500' : 'bg-[#5A5A40]'
                  }`}
                  style={{ width: `${Math.min(100, (selectedCell.telemetry.temperatureC / 100) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-[#F5F5F0] p-3 rounded-xl border border-[#E5E5DE]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#8B7E66] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#5A5A40]" /> Harmonic Vibration (FFT)
                </span>
                <span
                  className={`font-mono font-bold ${
                    selectedCell.telemetry.vibrationMmS > 3.0 ? 'text-red-600' : 'text-[#2D2D24]'
                  }`}
                >
                  {selectedCell.telemetry.vibrationMmS} mm/s
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${
                    selectedCell.telemetry.vibrationMmS > 3.0 ? 'bg-red-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, (selectedCell.telemetry.vibrationMmS / 6.0) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-[#F5F5F0] p-3 rounded-xl border border-[#E5E5DE]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#8B7E66] flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-[#5A5A40]" /> Spindle Tool Wear
                </span>
                <span className="font-mono font-bold text-[#2D2D24]">
                  {selectedCell.telemetry.toolWearPct}%
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${
                    selectedCell.telemetry.toolWearPct > 75 ? 'bg-amber-500' : 'bg-[#5A5A40]'
                  }`}
                  style={{ width: `${selectedCell.telemetry.toolWearPct}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Operator & Work Order Details */}
          <div className="pt-3 border-t border-[#E5E5DE] space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#8B7E66]">Assigned Operator:</span>
              <span className="font-semibold text-[#2D2D24]">{selectedCell.operator}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8B7E66]">Active Work Order:</span>
              <span className="font-mono font-semibold text-[#5A5A40]">
                {selectedCell.currentWorkOrder || 'Standby'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8B7E66]">Cell Overall OEE:</span>
              <span className="font-bold text-[#2D2D24]">{selectedCell.oee}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC RECHARTS LIVE-UPDATING HISTORICAL TEMPERATURE TREND SECTION */}
      <div className="bg-white rounded-2xl border border-[#E5E5DE] shadow-xs p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E5E5DE]">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#5A5A40]" />
              <h3 className="font-serif font-bold text-base text-[#2D2D24]">
                Historical Temperature Trends (Recharts Live Stream)
              </h3>
            </div>
            <p className="text-xs text-[#787668]">
              Dynamic live-updating temperature curve for selected maintenance asset with threshold boundary indicators.
            </p>
          </div>

          {/* Controls: Play/Pause, Unit, and Asset Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsChartStreaming(!isChartStreaming)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isChartStreaming
                  ? 'bg-white hover:bg-[#F5F5F0] text-[#2D2D24] border-[#E5E5DE]'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
              }`}
            >
              {isChartStreaming ? (
                <>
                  <Pause className="w-3 h-3" />
                  <span>Pause Stream</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  <span>Resume Stream</span>
                </>
              )}
            </button>

            {/* °C / °F Unit Toggle */}
            <div className="flex items-center bg-[#F5F5F0] p-0.5 rounded-xl border border-[#E5E5DE] text-xs font-bold">
              <button
                onClick={() => setChartTempUnit('C')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  chartTempUnit === 'C' ? 'bg-white text-[#2D2D24] shadow-xs' : 'text-[#787668]'
                }`}
              >
                °C
              </button>
              <button
                onClick={() => setChartTempUnit('F')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  chartTempUnit === 'F' ? 'bg-white text-[#2D2D24] shadow-xs' : 'text-[#787668]'
                }`}
              >
                °F
              </button>
            </div>
          </div>
        </div>

        {/* Asset Selection Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-[#2D2D24] mr-1">Select Asset:</span>
          {maintenanceAssets.map((asset) => {
            const isSelected = asset.id === selectedAssetId;
            return (
              <button
                key={asset.id}
                onClick={() => setSelectedAssetId(asset.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-xs font-bold'
                    : 'bg-[#FAF9F5] hover:bg-[#F5F5F0] text-[#2D2D24] border-[#E5E5DE]'
                }`}
              >
                <span>{asset.name}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-white text-[#5A5A40] border border-[#E5E5DE]'
                }`}>
                  {asset.code}
                </span>
              </button>
            );
          })}
        </div>

        {/* Telemetry Summary Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF9F5] p-3 rounded-xl border border-[#E5E5DE] text-xs">
          <div>
            <span className="text-[#8B7E66] block text-[10px]">CURRENT TEMPERATURE</span>
            <div className="flex items-center gap-1.5 font-bold text-sm text-[#2D2D24] mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{currentTempDisplay} °{chartTempUnit}</span>
            </div>
          </div>
          <div>
            <span className="text-[#8B7E66] block text-[10px]">MIN IN WINDOW</span>
            <div className="font-bold text-sm text-[#2D2D24] mt-0.5">
              {minTemp} °{chartTempUnit}
            </div>
          </div>
          <div>
            <span className="text-[#8B7E66] block text-[10px]">MAX IN WINDOW</span>
            <div className="font-bold text-sm text-[#2D2D24] mt-0.5">
              {maxTemp} °{chartTempUnit}
            </div>
          </div>
          <div>
            <span className="text-[#8B7E66] block text-[10px]">AVERAGE NOMINAL</span>
            <div className="font-bold text-sm text-[#5A5A40] mt-0.5">
              {avgTemp} °{chartTempUnit}
            </div>
          </div>
        </div>

        {/* Warning Banner if Temp Approaching Limit */}
        {currentTempDisplay >= warnLimitDisplay && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Thermal Warning Threshold Exceeded:</strong> Current reading of {currentTempDisplay}°{chartTempUnit} exceeds normal operating window limit ({warnLimitDisplay}°{chartTempUnit}).
              </span>
            </div>
            {onNavigateToIotAnalytics && (
              <button
                onClick={() => onNavigateToIotAnalytics(selectedAsset.id)}
                className="text-[11px] font-bold underline hover:no-underline shrink-0 text-amber-900"
              >
                Inspect Telemetry Harmonics &rarr;
              </button>
            )}
          </div>
        )}

        {/* RECHARTS Dynamic Live-Updating Line Chart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tempHistory} margin={{ top: 15, right: 30, left: -5, bottom: 0 }}>
              <defs>
                <linearGradient id="twinTempGrad" x1="0" y1="0" x2="0" y2="1">
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
                unit={`°${chartTempUnit}`}
                domain={['dataMin - 3', 'dataMax + 4']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E5DE',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  fontSize: '11px'
                }}
                formatter={(val: any) => [`${val} °${chartTempUnit}`, 'Core Temp']}
                labelStyle={{ fontWeight: 'bold', color: '#2D2D24' }}
              />
              <ReferenceLine
                y={warnLimitDisplay}
                stroke="#d97706"
                strokeDasharray="4 4"
                label={{ value: `Warning (${warnLimitDisplay}°)`, fill: '#d97706', fontSize: 10, position: 'insideTopRight' }}
              />
              <ReferenceLine
                y={critLimitDisplay}
                stroke="#dc2626"
                strokeDasharray="4 4"
                label={{ value: `Critical (${critLimitDisplay}°)`, fill: '#dc2626', fontSize: 10, position: 'insideTopRight' }}
              />
              <Area
                type="monotone"
                dataKey="displayTemp"
                stroke="#5A5A40"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#twinTempGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
