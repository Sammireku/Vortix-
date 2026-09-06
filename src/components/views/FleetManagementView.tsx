import React, { useState } from 'react';
import {
  Truck,
  Battery,
  BatteryCharging,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldCheck,
  MapPin,
  Compass,
  Navigation,
  CheckCircle2,
  Clock,
  Plus,
  Zap,
  Activity,
  ChevronRight,
  Filter,
  Search,
  Sliders,
  X,
} from 'lucide-react';
import { FleetVehicle, FleetMission, FleetInspection } from '../../types';

interface FleetManagementViewProps {
  vehicles: FleetVehicle[];
  missions: FleetMission[];
  onDispatchMission: (mission: FleetMission) => void;
  onUpdateVehicleStatus: (vehicleId: string, status: FleetVehicle['status']) => void;
  onShowNotification?: (title: string, message: string, type?: 'success' | 'alert') => void;
}

export const FleetManagementView: React.FC<FleetManagementViewProps> = ({
  vehicles,
  missions,
  onDispatchMission,
  onUpdateVehicleStatus,
  onShowNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'vehicles' | 'missions' | 'inspections'>('radar');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(vehicles[0]?.id || null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState<boolean>(false);

  // New Mission Form State
  const [newMission, setNewMission] = useState({
    vehicleId: vehicles[0]?.id || '',
    pickupLocation: 'CNC Bay A (Storage Rack 3)',
    dropoffLocation: 'Line 2 - Stamping Bay',
    cargoDescription: '50x Machined Titanium Turbine Flanges',
    priority: 'high' as const,
  });

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  // Top Metrics
  const activeMovingCount = vehicles.filter((v) => v.status === 'in_mission' || v.status === 'moving').length;
  const chargingCount = vehicles.filter((v) => v.status === 'charging').length;
  const avgBatteryPct = Math.round(
    vehicles.reduce((acc, v) => acc + v.batteryPercentage, 0) / Math.max(1, vehicles.length)
  );
  const activeMissionsCount = missions.filter((m) => m.status === 'in_progress' || m.status === 'assigned').length;

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.currentLocation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || v.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle = vehicles.find((v) => v.id === newMission.vehicleId) || vehicles[0];

    const code = `MSN-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdMission: FleetMission = {
      id: `msn-${Date.now()}`,
      missionNumber: code,
      missionCode: code,
      vehicleId: vehicle.id,
      vehicleCode: vehicle.vehicleCode || vehicle.callsign || vehicle.name,
      vehicleCallsign: vehicle.callsign || vehicle.vehicleCode || vehicle.name,
      pickupLocation: newMission.pickupLocation,
      dropoffLocation: newMission.dropoffLocation,
      payloadType: newMission.cargoDescription || 'Industrial Pallets',
      cargoDescription: newMission.cargoDescription,
      payloadWeightKg: 450,
      priority: newMission.priority,
      status: 'in_transit',
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dispatchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedArrival: 'In 8 mins',
      progressPct: 15,
      etaMinutes: 8,
    };

    onDispatchMission(createdMission);
    onUpdateVehicleStatus(vehicle.id, 'en_route');
    setIsDispatchModalOpen(false);

    if (onShowNotification) {
      onShowNotification(
        'Mission Dispatched',
        `${vehicle.callsign || vehicle.vehicleCode || vehicle.name} assigned to transfer ${newMission.cargoDescription} to ${newMission.dropoffLocation}.`
      );
    }
  };

  const handleEmergencyStopAll = () => {
    vehicles.forEach((v) => onUpdateVehicleStatus(v.id, 'maintenance_hold'));
    if (onShowNotification) {
      onShowNotification('EMERGENCY FLEET STOP', 'All autonomous AGVs and mobile units halted immediately.', 'alert');
    }
  };

  return (
    <div className="space-y-6 text-[#2D2D24]">
      {/* Top Banner & Title Bar */}
      <div className="bg-white border border-[#E5E5DE] p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#5A5A40]/10 text-[#5A5A40] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Autonomous AGVs & Mobile Logistics
            </span>
            <span className="text-[10px] text-[#8B7E66]">&bull; Plant 1 Shop Floor</span>
          </div>
          <h1 className="font-serif font-bold text-2xl text-[#2D2D24] mt-1">Fleet Robotics & Logistics Control</h1>
          <p className="text-xs text-[#8B7E66] mt-0.5">
            Real-time 2D floor tracking, AGV battery telematics, autonomous waypoint routing, and mission dispatch control.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleEmergencyStopAll}
            className="flex items-center gap-1.5 text-xs bg-[#B33A3A] hover:bg-[#8F2E2E] text-white font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
            title="Immediate emergency stop signal to all mobile robotics"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Emergency Fleet E-Stop</span>
          </button>
          <button
            onClick={() => setIsDispatchModalOpen(true)}
            className="flex items-center gap-1.5 text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Dispatch Mission</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-[#E5E5DE] p-4 rounded-2xl shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B7E66]">Fleet Roster</div>
          <div className="font-serif font-bold text-2xl text-[#2D2D24] mt-1">{vehicles.length} Units</div>
          <div className="text-[11px] text-[#5A5A40] mt-0.5 flex items-center gap-1">
            <Truck className="w-3 h-3" />
            <span>AGVs, Tuggers & Forklifts</span>
          </div>
        </div>

        <div className="bg-white border border-[#E5E5DE] p-4 rounded-2xl shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B7E66]">Active In-Motion</div>
          <div className="font-serif font-bold text-2xl text-[#2E6930] mt-1">{activeMovingCount} Units</div>
          <div className="text-[11px] text-[#2E6930] mt-0.5 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#2E6930] animate-pulse" />
            <span>Navigating shop-floor</span>
          </div>
        </div>

        <div className="bg-white border border-[#E5E5DE] p-4 rounded-2xl shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B7E66]">Avg Battery Level</div>
          <div className="font-serif font-bold text-2xl text-[#2D2D24] mt-1">{avgBatteryPct}%</div>
          <div className="text-[11px] text-[#5A5A40] mt-0.5 flex items-center gap-1">
            <Battery className="w-3 h-3 text-[#2E6930]" />
            <span>{chargingCount} Docks Active</span>
          </div>
        </div>

        <div className="bg-white border border-[#E5E5DE] p-4 rounded-2xl shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B7E66]">Active Dispatches</div>
          <div className="font-serif font-bold text-2xl text-[#2D2D24] mt-1">{activeMissionsCount} Missions</div>
          <div className="text-[11px] text-[#787668] mt-0.5">Automated routing</div>
        </div>

        <div className="bg-white border border-[#E5E5DE] p-4 rounded-2xl shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B7E66]">OSHA Pre-Trip Audit</div>
          <div className="font-serif font-bold text-2xl text-[#2E6930] mt-1">100%</div>
          <div className="text-[11px] text-[#2E6930] mt-0.5 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>LiDAR & Brake Checked</span>
          </div>
        </div>
      </div>

      {/* Main Tab Controls & Floor Navigation */}
      <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E5E5DE] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#FAF9F5]">
          <div className="flex items-center gap-1 bg-[#F5F5F0] p-1 rounded-2xl border border-[#E5E5DE] overflow-x-auto max-w-full pb-1">
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'radar' ? 'bg-white text-[#2D2D24] shadow-2xs' : 'text-[#787668] hover:text-[#2D2D24]'
              }`}
            >
              2D Floor Radar & Live Tracking
            </button>
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'vehicles' ? 'bg-white text-[#2D2D24] shadow-2xs' : 'text-[#787668] hover:text-[#2D2D24]'
              }`}
            >
              Vehicle Telematics Grid ({vehicles.length})
            </button>
            <button
              onClick={() => setActiveTab('missions')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'missions' ? 'bg-white text-[#2D2D24] shadow-2xs' : 'text-[#787668] hover:text-[#2D2D24]'
              }`}
            >
              Live Missions & Dispatches ({missions.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white border border-[#E5E5DE] rounded-xl px-2.5 py-1.5 text-xs text-[#2D2D24] focus:outline-hidden"
            >
              <option value="all">All Vehicle Types</option>
              <option value="autonomous_agv">Autonomous AGVs</option>
              <option value="forklift_electric">Electric Forklifts</option>
              <option value="tow_tractor">Tow Tractors</option>
              <option value="pallet_jack">Pallet Jacks</option>
            </select>
          </div>
        </div>

        {/* Tab 1: Live 2D Plant Floor Radar */}
        {activeTab === 'radar' && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 2D Floor Plan Canvas Mockup */}
            <div className="lg:col-span-2 bg-[#1A1A14] text-white border border-[#3A3A2F] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[460px] shadow-inner">
              {/* Radar Grid Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(#3A3A2F_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

              {/* Plant Zones Representation */}
              <div className="relative z-10 grid grid-cols-3 gap-3 text-[10px] uppercase tracking-wider font-mono text-[#A3A392]">
                <div className="border border-[#3A3A2F] bg-black/30 p-2.5 rounded-xl">
                  <span className="text-[#D3D3CA] font-bold">Bay A: CNC Milling</span>
                  <p className="text-[9px] text-[#7A7A68] lowercase">x: 10-30, y: 10-40</p>
                </div>
                <div className="border border-[#3A3A2F] bg-black/30 p-2.5 rounded-xl">
                  <span className="text-[#D3D3CA] font-bold">Bay B: Stamping & Press</span>
                  <p className="text-[9px] text-[#7A7A68] lowercase">x: 40-60, y: 10-40</p>
                </div>
                <div className="border border-[#3A3A2F] bg-black/30 p-2.5 rounded-xl">
                  <span className="text-[#D3D3CA] font-bold">Bay C: Cleanroom SMT</span>
                  <p className="text-[9px] text-[#7A7A68] lowercase">x: 70-90, y: 10-40</p>
                </div>
              </div>

              {/* Center Shop Floor Corridor / Dynamic Vehicle Markers */}
              <div className="relative z-10 my-10 min-h-[220px]">
                {vehicles.map((v) => {
                  const isSelected = v.id === selectedVehicle?.id;
                  const posX = `${Math.min(88, Math.max(8, v.telemetry.coordinates.x))}%`;
                  const posY = `${Math.min(80, Math.max(15, v.telemetry.coordinates.y))}%`;

                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVehicleId(v.id)}
                      style={{ left: posX, top: posY }}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 group z-20`}
                      title={`${v.callsign}: ${v.name} (${v.status})`}
                    >
                      <div className="relative flex flex-col items-center">
                        {/* Outer Glow Ring for Selected / Moving */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                            isSelected
                              ? 'border-white bg-[#5A5A40] ring-4 ring-[#5A5A40]/50'
                              : v.status === 'in_mission' || v.status === 'moving'
                              ? 'border-[#2E6930] bg-[#2E6930]/40 animate-pulse'
                              : v.status === 'charging'
                              ? 'border-[#2B547E] bg-[#2B547E]/40'
                              : 'border-[#8B7E66] bg-[#2D2D24]'
                          }`}
                        >
                          <Navigation
                            className="w-4 h-4 text-white transform"
                            style={{ transform: `rotate(${v.telemetry.coordinates.heading}deg)` }}
                          />
                        </div>

                        {/* Callsign Tag */}
                        <span
                          className={`mt-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border whitespace-nowrap shadow-xs ${
                            isSelected
                              ? 'bg-white text-[#2D2D24] border-white'
                              : 'bg-black/80 text-[#D3D3CA] border-[#3A3A2F]'
                          }`}
                        >
                          {v.callsign}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Docking & Warehouse Stations */}
              <div className="relative z-10 grid grid-cols-3 gap-3 text-[10px] uppercase tracking-wider font-mono text-[#A3A392]">
                <div className="border border-[#3A3A2F] bg-black/30 p-2.5 rounded-xl">
                  <span className="text-[#D3D3CA] font-bold">Inbound Dock 1</span>
                </div>
                <div className="border border-[#3A3A2F] bg-black/30 p-2.5 rounded-xl text-center">
                  <span className="text-[#2E6930] font-bold">Fast-Charge Docks (4/6 Free)</span>
                </div>
                <div className="border border-[#3A3A2F] bg-black/30 p-2.5 rounded-xl text-right">
                  <span className="text-[#D3D3CA] font-bold">Outbound Shipping</span>
                </div>
              </div>

              {/* Floor Legend */}
              <div className="absolute bottom-3 left-4 text-[9px] font-mono text-[#8B7E66] flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#2E6930]" /> Moving
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#2B547E]" /> Charging
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#8B7E66]" /> Idle
                </span>
              </div>
            </div>

            {/* Selected Vehicle Telematics Detail Card */}
            <div className="bg-[#FAF9F5] border border-[#E5E5DE] rounded-3xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#8B7E66]">{selectedVehicle.serialNumber}</span>
                    <h3 className="font-bold text-base text-[#2D2D24]">{selectedVehicle.name}</h3>
                    <p className="text-xs text-[#5A5A40] font-semibold">{selectedVehicle.callsign} &bull; {selectedVehicle.type.replace('_', ' ')}</p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                      selectedVehicle.status === 'in_mission' || selectedVehicle.status === 'moving'
                        ? 'bg-[#EBF3ED] text-[#2E6930] border border-[#CDE5D2]'
                        : selectedVehicle.status === 'charging'
                        ? 'bg-[#EAF0F6] text-[#2B547E] border border-[#C6D8EB]'
                        : 'bg-[#F5F5F0] text-[#787668] border border-[#E5E5DE]'
                    }`}
                  >
                    {selectedVehicle.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Battery & Speed Telemetry */}
                <div className="bg-white border border-[#E5E5DE] rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#8B7E66] flex items-center gap-1">
                        <Battery className="w-3.5 h-3.5 text-[#2E6930]" />
                        <span>State of Charge</span>
                      </span>
                      <span className="font-bold text-[#2D2D24] font-mono">{selectedVehicle.batteryPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#F5F5F0] rounded-full overflow-hidden border border-[#E5E5DE]">
                      <div
                        className="h-full bg-[#2E6930] rounded-full transition-all"
                        style={{ width: `${selectedVehicle.batteryPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E5DE] text-xs">
                    <div>
                      <span className="text-[10px] text-[#8B7E66] block">Ground Velocity</span>
                      <span className="font-bold text-[#2D2D24] font-mono">{selectedVehicle.telemetry.speedMps} m/s</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8B7E66] block">Heading Angle</span>
                      <span className="font-bold text-[#2D2D24] font-mono">{selectedVehicle.telemetry.coordinates.heading}&deg;</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8B7E66] block">Active Payload</span>
                      <span className="font-bold text-[#2D2D24] font-mono">
                        {selectedVehicle.telemetry.payloadKg} / {selectedVehicle.maxPayloadKg} kg
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8B7E66] block">Odometer</span>
                      <span className="font-bold text-[#2D2D24] font-mono">{selectedVehicle.totalDistanceKm} km</span>
                    </div>
                  </div>
                </div>

                {/* Current Location & Mission */}
                <div className="bg-white border border-[#E5E5DE] rounded-2xl p-3 text-xs space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[#8B7E66]">
                    <MapPin className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span className="font-medium text-[#2D2D24]">Location:</span>
                    <span className="truncate">{selectedVehicle.currentLocation}</span>
                  </div>
                  {selectedVehicle.assignedMission ? (
                    <div className="text-[11px] text-[#5A5A40] bg-[#5A5A40]/10 p-2 rounded-xl">
                      <span className="font-bold">Mission: </span>
                      <span>{selectedVehicle.assignedMission}</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#8B7E66] italic">No active mission assigned (Idle).</div>
                  )}
                </div>
              </div>

              {/* Vehicle Operational Controls */}
              <div className="pt-3 border-t border-[#E5E5DE] space-y-2">
                <button
                  onClick={() => {
                    setIsDispatchModalOpen(true);
                    setNewMission({ ...newMission, vehicleId: selectedVehicle.id });
                  }}
                  className="w-full bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Dispatch New Task</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateVehicleStatus(selectedVehicle.id, 'charging')}
                    className="bg-white hover:bg-[#F5F5F0] text-[#2D2D24] border border-[#E5E5DE] text-xs font-semibold py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <Zap className="w-3 h-3 text-[#C48C3B]" />
                    <span>Send to Dock</span>
                  </button>
                  <button
                    onClick={() =>
                      onUpdateVehicleStatus(
                        selectedVehicle.id,
                        selectedVehicle.status === 'maintenance' ? 'idle' : 'maintenance'
                      )
                    }
                    className="bg-white hover:bg-[#F5F5F0] text-[#2D2D24] border border-[#E5E5DE] text-xs font-semibold py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <RotateCcw className="w-3 h-3 text-[#787668]" />
                    <span>{selectedVehicle.status === 'maintenance' ? 'Clear Hold' : 'Set Maint.'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Vehicle Telematics Grid */}
        {activeTab === 'vehicles' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredVehicles.map((veh) => (
                <div
                  key={veh.id}
                  className="bg-[#FAF9F5] border border-[#E5E5DE] rounded-2xl p-4.5 space-y-3 hover:border-[#C4C4B8] transition-all shadow-2xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-[#2D2D24]">{veh.name}</h4>
                        <span className="text-[10px] font-mono bg-white border border-[#E5E5DE] px-1.5 py-0.5 rounded-md text-[#5A5A40]">
                          {veh.callsign}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8B7E66]">{veh.type.replace('_', ' ').toUpperCase()} &bull; {veh.serialNumber}</p>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                        veh.status === 'in_mission' || veh.status === 'moving'
                          ? 'bg-[#EBF3ED] text-[#2E6930] border border-[#CDE5D2]'
                          : veh.status === 'charging'
                          ? 'bg-[#EAF0F6] text-[#2B547E] border border-[#C6D8EB]'
                          : 'bg-[#F5F5F0] text-[#787668] border border-[#E5E5DE]'
                      }`}
                    >
                      {veh.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Battery & Load Bar */}
                  <div className="bg-white border border-[#E5E5DE] rounded-xl p-2.5 text-[11px] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8B7E66] flex items-center gap-1">
                        <Battery className="w-3.5 h-3.5 text-[#2E6930]" /> Battery:
                      </span>
                      <span className="font-bold text-[#2D2D24] font-mono">{veh.batteryPercentage}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8B7E66]">Location:</span>
                      <span className="text-[#2D2D24] font-medium truncate max-w-[180px]">{veh.currentLocation}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8B7E66]">Payload Capacity:</span>
                      <span className="text-[#2D2D24] font-mono">{veh.telemetry.payloadKg} / {veh.maxPayloadKg} kg</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E5E5DE] flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedVehicleId(veh.id);
                        setActiveTab('radar');
                      }}
                      className="text-[11px] text-[#5A5A40] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Locate on 2D Radar</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsDispatchModalOpen(true);
                        setNewMission({ ...newMission, vehicleId: veh.id });
                      }}
                      className="text-[11px] bg-white hover:bg-[#F5F5F0] text-[#2D2D24] border border-[#E5E5DE] px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer shadow-2xs"
                    >
                      Dispatch Task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Live Missions */}
        {activeTab === 'missions' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-[#2D2D24]">Active Transport Dispatches & Routing</h3>
                <p className="text-xs text-[#8B7E66] mt-0.5">
                  Autonomous material transfer missions moving between CNC bays, staging areas, and assembly.
                </p>
              </div>
              <button
                onClick={() => setIsDispatchModalOpen(true)}
                className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Dispatch</span>
              </button>
            </div>

            <div className="border border-[#E5E5DE] rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#E5E5DE] text-[10px] font-bold uppercase text-[#8B7E66]">
                    <th className="p-3">Mission Code</th>
                    <th className="p-3">Assigned AGV</th>
                    <th className="p-3">Cargo Description</th>
                    <th className="p-3">Origin &rarr; Destination</th>
                    <th className="p-3">Progress</th>
                    <th className="p-3">ETA</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5DE]">
                  {missions.map((m) => (
                    <tr key={m.id} className="hover:bg-[#FAF9F5] transition-colors">
                      <td className="p-3 font-mono font-bold text-[#2D2D24]">{m.missionCode}</td>
                      <td className="p-3 font-semibold text-[#5A5A40]">{m.vehicleCallsign}</td>
                      <td className="p-3 text-[#2D2D24]">{m.cargoDescription}</td>
                      <td className="p-3 text-[#787668]">
                        <div className="font-medium text-[#2D2D24]">{m.origin}</div>
                        <div className="text-[10px] text-[#8B7E66]">&rarr; {m.destination}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-[#F5F5F0] rounded-full overflow-hidden border border-[#E5E5DE]">
                            <div className="h-full bg-[#2E6930] rounded-full" style={{ width: `${m.progressPct}%` }} />
                          </div>
                          <span className="font-mono text-[10px] text-[#787668]">{m.progressPct}%</span>
                        </div>
                      </td>
                      <td className="p-3 text-[#2D2D24] font-mono">{m.etaMinutes} mins</td>
                      <td className="p-3 text-right">
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                            m.status === 'in_progress'
                              ? 'bg-[#EBF3ED] text-[#2E6930] border border-[#CDE5D2]'
                              : m.status === 'completed'
                              ? 'bg-[#F5F5F0] text-[#787668] border border-[#E5E5DE]'
                              : 'bg-[#FFF9EB] text-[#8C6B1C] border border-[#F5E2B3]'
                          }`}
                        >
                          {m.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Dispatch Mission Modal */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#5A5A40]/15 text-[#5A5A40]">
                  <Truck className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#2D2D24]">Dispatch Material Transport Mission</h3>
              </div>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="p-1 rounded-lg text-[#8B7E66] hover:text-[#2D2D24]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMission} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-semibold text-[#2D2D24] mb-1">Select AGV / Vehicle</label>
                <select
                  value={newMission.vehicleId}
                  onChange={(e) => setNewMission({ ...newMission, vehicleId: e.target.value })}
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.callsign}: {v.name} ({v.batteryPercentage}% Batt, Status: {v.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#2D2D24] mb-1">Cargo / Payload Description</label>
                <input
                  type="text"
                  value={newMission.cargoDescription}
                  onChange={(e) => setNewMission({ ...newMission, cargoDescription: e.target.value })}
                  placeholder="e.g. 50x Machined Titanium Turbine Flanges"
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#5A5A40]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1">Pickup Origin</label>
                  <input
                    type="text"
                    value={newMission.pickupLocation}
                    onChange={(e) => setNewMission({ ...newMission, pickupLocation: e.target.value })}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1">Dropoff Destination</label>
                  <input
                    type="text"
                    value={newMission.dropoffLocation}
                    onChange={(e) => setNewMission({ ...newMission, dropoffLocation: e.target.value })}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2D2D24] mb-1">Dispatch Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['standard', 'high', 'critical'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewMission({ ...newMission, priority: p })}
                      className={`py-2 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                        newMission.priority === p
                          ? 'border-[#5A5A40] bg-[#5A5A40]/10 text-[#5A5A40]'
                          : 'border-[#E5E5DE] bg-white text-[#787668]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E5DE] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E5DE] text-xs font-semibold text-[#2D2D24] hover:bg-[#F5F5F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-semibold cursor-pointer"
                >
                  Transmit Dispatch Signal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
