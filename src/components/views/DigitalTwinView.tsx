import React, { useState } from 'react';
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
} from 'lucide-react';
import { FloorCell, AgvVehicle, RoleDefinition } from '../../types';

interface DigitalTwinViewProps {
  cells: FloorCell[];
  agvFleet: AgvVehicle[];
  currentRole: RoleDefinition;
  onSelectCell?: (cell: FloorCell) => void;
  onDispatchAgv?: (agvId: string) => void;
  onEmergencyStopBay?: (bayName: string) => void;
}

export const DigitalTwinView: React.FC<DigitalTwinViewProps> = ({
  cells,
  agvFleet,
  currentRole,
  onSelectCell,
  onDispatchAgv,
  onEmergencyStopBay,
}) => {
  const [selectedCellId, setSelectedCellId] = useState<string>(cells[0]?.id || '');
  const [activeBayFilter, setActiveBayFilter] = useState<string>('all');
  const [telemetrySimTime, setTelemetrySimTime] = useState<string>('Real-Time (500ms)');

  const selectedCell = cells.find((c) => c.id === selectedCellId) || cells[0];

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
      case 'idle':
        return {
          bg: 'bg-amber-500',
          ring: 'ring-amber-300',
          text: 'Idle',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      case 'maintenance':
        return {
          bg: 'bg-blue-500',
          ring: 'ring-blue-300',
          text: 'Maintenance',
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
        };
      default:
        return {
          bg: 'bg-gray-400',
          ring: 'ring-gray-300',
          text: 'Offline',
          badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
        };
    }
  };

  const filteredCells =
    activeBayFilter === 'all'
      ? cells
      : cells.filter((c) => c.bay === activeBayFilter);

  const runningCount = cells.filter((c) => c.status === 'running').length;
  const bottleneckCount = cells.filter((c) => c.status === 'bottleneck').length;
  const avgOee = Math.round(
    cells.reduce((acc, c) => acc + c.oee, 0) / (cells.length || 1)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E5DE] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-md bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] font-semibold">
              Cyber-Physical Twin
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
              Live Telemetry Stream
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2D2D24] tracking-tight">
            Interactive 2D Plant Floor Digital Twin & Telemetry Grid
          </h2>
          <p className="text-xs text-[#787668]">
            Spatial layout of manufacturing workcells, IoT edge sensor thresholds, and autonomous mobile robot (AGV) transit.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={activeBayFilter}
            onChange={(e) => setActiveBayFilter(e.target.value)}
            className="text-xs bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-[#2D2D24] font-medium focus:ring-1 focus:ring-[#5A5A40] outline-hidden cursor-pointer"
          >
            <option value="all">All Factory Bays ({cells.length} Cells)</option>
            {bays.map((bay) => (
              <option key={bay} value={bay}>
                {bay}
              </option>
            ))}
          </select>

          {onEmergencyStopBay && (
            <button
              onClick={() => onEmergencyStopBay(activeBayFilter === 'all' ? 'All Bays' : activeBayFilter)}
              className="text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Throttle Bay</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Top Stat Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E5E5DE] shadow-xs">
          <div className="text-[11px] text-[#8B7E66] font-medium">Active Machine Cells</div>
          <div className="text-2xl font-serif font-bold text-[#2D2D24] mt-1">
            {runningCount} <span className="text-sm font-sans font-normal text-[#787668]">/ {cells.length} Online</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Overall Plant Availability: 92.4%
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E5DE] shadow-xs">
          <div className="text-[11px] text-[#8B7E66] font-medium">Fleetwide Average OEE</div>
          <div className="text-2xl font-serif font-bold text-[#2D2D24] mt-1">
            {avgOee}%
          </div>
          <div className="text-[11px] text-[#5A5A40] font-medium mt-1">
            Target benchmark: &gt; 85.0%
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E5DE] shadow-xs">
          <div className="text-[11px] text-[#8B7E66] font-medium">Critical Bottleneck Cells</div>
          <div className="text-2xl font-serif font-bold text-red-600 mt-1">
            {bottleneckCount} Machines
          </div>
          <div className="text-[11px] text-red-600/80 font-medium mt-1">
            High vibration detected on 300T Press
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E5DE] shadow-xs">
          <div className="text-[11px] text-[#8B7E66] font-medium">Autonomous AGV Fleet</div>
          <div className="text-2xl font-serif font-bold text-[#2D2D24] mt-1">
            {agvFleet.filter((a) => a.status === 'in_transit').length} In Transit
          </div>
          <div className="text-[11px] text-[#787668] mt-1">
            {agvFleet.length} Mobile robots active
          </div>
        </div>
      </div>

      {/* Main Layout: 2D Spatial Floor Plan + Right Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 2D Factory Map Canvas */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E5DE] shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DE]">
            <div className="flex items-center gap-2">
              <Factory className="w-4 h-4 text-[#5A5A40]" />
              <h3 className="font-serif font-bold text-base text-[#2D2D24]">
                Factory Floor Layout - Plant 1 Chicago
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-medium text-[#787668]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Running
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Idle
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Bottleneck
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Maintenance
              </span>
            </div>
          </div>

          {/* Interactive 2D Visual Grid */}
          <div className="bg-[#F5F5F0] rounded-xl p-4 border border-[#E5E5DE] min-h-[380px] relative overflow-hidden">
            {/* Grid Floor Line Markings */}
            <div className="absolute inset-0 opacity-15 pointer-events-none grid grid-cols-6 grid-rows-4 divide-x divide-y divide-[#8B7E66]">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i}></div>
              ))}
            </div>

            {/* Workcell Cards Grid */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {filteredCells.map((cell) => {
                const badge = getStatusBadge(cell.status);
                const isSelected = cell.id === selectedCellId;

                return (
                  <div
                    key={cell.id}
                    onClick={() => {
                      setSelectedCellId(cell.id);
                      if (onSelectCell) onSelectCell(cell);
                    }}
                    className={`bg-white rounded-xl p-3.5 border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'border-[#5A5A40] shadow-md ring-2 ring-[#5A5A40]/30'
                        : 'border-[#E5E5DE] hover:border-[#8B7E66] shadow-xs'
                    }`}
                  >
                    {/* Top Status Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${badge.bg} ring-4 ${badge.ring}`}></span>
                        <span className="font-mono text-[10px] font-bold text-[#5A5A40]">
                          {cell.code}
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
    </div>
  );
};
