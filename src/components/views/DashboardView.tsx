import React from 'react';
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Gauge,
  Layers,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Cpu,
  Boxes,
  Zap,
} from 'lucide-react';
import {
  ProductionLine,
  WorkOrder,
  Shipment,
  InventoryItem,
  RoleDefinition,
  ViewTab,
} from '../../types';

interface DashboardViewProps {
  lines: ProductionLine[];
  workOrders: WorkOrder[];
  shipments: Shipment[];
  inventory: InventoryItem[];
  currentRole: RoleDefinition;
  onNavigate: (tab: ViewTab) => void;
  onOpenNewWorkOrder: () => void;
  onLaunchAiReport: () => void;
  onTriggerSimulatedAlert: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  lines,
  workOrders,
  shipments,
  inventory,
  currentRole,
  onNavigate,
  onOpenNewWorkOrder,
  onLaunchAiReport,
  onTriggerSimulatedAlert,
}) => {
  // Aggregate Metrics
  const avgOee = (
    lines.reduce((acc, l) => acc + l.oeeScore, 0) / (lines.length || 1)
  ).toFixed(1);

  const avgAvailability = (
    lines.reduce((acc, l) => acc + l.availability, 0) / (lines.length || 1)
  ).toFixed(1);

  const avgPerformance = (
    lines.reduce((acc, l) => acc + l.performance, 0) / (lines.length || 1)
  ).toFixed(1);

  const avgQuality = (
    lines.reduce((acc, l) => acc + l.qualityRate, 0) / (lines.length || 1)
  ).toFixed(1);

  const totalCompletedUnits = lines.reduce((acc, l) => acc + l.completedUnits, 0);
  const totalTargetUnits = lines.reduce((acc, l) => acc + l.targetUnits, 0);
  const totalScrapUnits = workOrders.reduce((acc, w) => acc + w.scrappedUnits, 0);
  const scrapRate = (
    (totalScrapUnits / (totalCompletedUnits + totalScrapUnits || 1)) * 100
  ).toFixed(2);

  const delayedShipments = shipments.filter((s) => s.status === 'customs_hold' || s.riskFactor === 'high');
  const lowStockItems = inventory.filter((i) => i.status === 'low_stock' || i.status === 'critical');

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E5DE] p-6 rounded-3xl shadow-sm text-[#2D2D24]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-serif italic font-medium tracking-tight text-[#2D2D24]">
              Manufacturing Operations Command
            </h1>
            <span className="text-xs bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5A5A40] animate-pulse"></span>
              Real-time Ingest Active
            </span>
          </div>
          <p className="text-xs text-[#8B7E66] mt-1">
            Plant 1 Telemetry: 4 Active Lines &bull; 94.8% OTIF Delivery &bull; OEE Performance: {avgOee}%
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('custom_dashboards')}
            className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Open Drag & Drop Custom Dashboard Studio"
          >
            <Activity className="w-3.5 h-3.5 text-[#E9E9E0]" />
            <span>Custom Team Dashboards</span>
          </button>

          <button
            onClick={onTriggerSimulatedAlert}
            className="text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] font-medium px-3.5 py-2 rounded-xl border border-[#E5E5DE] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Simulate incoming IoT sensor alert or inventory webhook"
          >
            <Zap className="w-3.5 h-3.5 text-[#8B7E66]" />
            <span>Simulate IoT Alert</span>
          </button>

          <button
            onClick={onLaunchAiReport}
            className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-medium px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Gauge className="w-3.5 h-3.5 text-[#E9E9E0]" />
            <span>Automated AI Report</span>
          </button>

          {currentRole.permissions.production !== 'read' && currentRole.permissions.production !== 'none' && (
            <button
              onClick={onOpenNewWorkOrder}
              className="text-xs bg-[#8B7E66] hover:bg-[#786c55] text-white font-medium px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-white" />
              <span>Create Work Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary KPI Grid (Natural Tones Archetype) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Equipment Effectiveness (OEE) */}
        <div className="bg-white border border-[#E5E5DE] p-5 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-[#8B7E66]">
            <span className="text-xs font-bold uppercase tracking-wider">Overall Plant OEE</span>
            <Gauge className="w-4 h-4 text-[#5A5A40]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-medium text-[#2D2D24]">{avgOee}%</span>
            <span className="text-xs text-[#5A5A40] flex items-center font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" /> +2.4% vs Shift 3
            </span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-1 pt-2.5 border-t border-[#E5E5DE] text-[11px]">
            <div>
              <span className="text-[#A09E8E] block">Avail</span>
              <span className="text-[#2D2D24] font-medium">{avgAvailability}%</span>
            </div>
            <div>
              <span className="text-[#A09E8E] block">Perf</span>
              <span className="text-[#2D2D24] font-medium">{avgPerformance}%</span>
            </div>
            <div>
              <span className="text-[#A09E8E] block">Qual</span>
              <span className="text-[#2D2D24] font-medium">{avgQuality}%</span>
            </div>
          </div>
        </div>

        {/* Shift Throughput */}
        <div className="bg-white border border-[#E5E5DE] p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between text-[#8B7E66]">
            <span className="text-xs font-bold uppercase tracking-wider">Shift Production</span>
            <Activity className="w-4 h-4 text-[#5A5A40]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-medium text-[#2D2D24]">{totalCompletedUnits.toLocaleString()}</span>
            <span className="text-xs text-[#A09E8E]">/ {totalTargetUnits.toLocaleString()} units</span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-[#E9E9E0] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#5A5A40] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalCompletedUnits / totalTargetUnits) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-[#A09E8E] mt-1.5">
              <span>Shift Progress</span>
              <span className="text-[#2D2D24] font-medium">
                {((totalCompletedUnits / totalTargetUnits) * 100).toFixed(0)}% Completed
              </span>
            </div>
          </div>
        </div>

        {/* Scrap & Defect Rate */}
        <div className="bg-white border border-[#E5E5DE] p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between text-[#8B7E66]">
            <span className="text-xs font-bold uppercase tracking-wider">Scrap / Defect Rate</span>
            <TrendingUp className="w-4 h-4 text-[#8B7E66]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-medium text-[#2D2D24]">{scrapRate}%</span>
            <span className="text-xs text-[#5A5A40] flex items-center font-medium">
              <ArrowDownRight className="w-3.5 h-3.5" /> -0.3% target
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-[#E5E5DE] text-[11px]">
            <span className="text-[#A09E8E]">Total Scrapped Units</span>
            <span className="text-[#2D2D24] font-semibold">{totalScrapUnits} units</span>
          </div>
        </div>

        {/* Inbound Supply Chain Status */}
        <div className="bg-white border border-[#E5E5DE] p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between text-[#8B7E66]">
            <span className="text-xs font-bold uppercase tracking-wider">Supply Chain Transit</span>
            <Truck className="w-4 h-4 text-[#5A5A40]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-medium text-[#2D2D24]">{shipments.length}</span>
            <span className="text-xs text-[#A09E8E]">Active Inbound Freights</span>
          </div>
          <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-[#E5E5DE] text-[11px]">
            <span className="text-[#A09E8E]">Customs / Port Alerts</span>
            <span className={`font-semibold ${delayedShipments.length > 0 ? 'text-[#B85D36]' : 'text-[#5A5A40]'}`}>
              {delayedShipments.length} At Risk
            </span>
          </div>
        </div>
      </div>

      {/* Production Lines Telemetry Board */}
      <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-serif italic text-[#5A5A40] font-semibold flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#8B7E66]" />
              Live Production Lines &amp; Sensor Telemetry
            </h2>
            <p className="text-xs text-[#A09E8E] mt-0.5">
              Sub-second line speeds, thermal profiling, and real-time OEE status
            </p>
          </div>
          <button
            onClick={() => onNavigate('production')}
            className="text-xs text-[#5A5A40] hover:text-[#2D2D24] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            Detailed Line ERP &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {lines.map((line) => {
            const isRunning = line.status === 'running';
            const isBottleneck = line.status === 'bottleneck';

            return (
              <div
                key={line.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isBottleneck
                    ? 'bg-[#FDF6F0] border-[#B85D36]/40 text-[#2D2D24]'
                    : isRunning
                    ? 'bg-[#F9F9F7] border-[#E5E5DE] hover:border-[#8B7E66] text-[#2D2D24]'
                    : 'bg-[#F5F5F0] border-[#E5E5DE] text-[#787668]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#8B7E66]">{line.code}</span>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                      isRunning
                        ? 'bg-[#5A5A40]/15 text-[#5A5A40] border border-[#5A5A40]/30'
                        : isBottleneck
                        ? 'bg-[#B85D36]/15 text-[#B85D36] border border-[#B85D36]/30 animate-pulse'
                        : 'bg-[#E9E9E0] text-[#787668]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isRunning ? 'bg-[#5A5A40]' : isBottleneck ? 'bg-[#B85D36]' : 'bg-[#A09E8E]'
                      }`}
                    ></span>
                    {line.status}
                  </span>
                </div>

                <div className="mt-2.5">
                  <h3 className="font-semibold text-sm text-[#2D2D24] truncate" title={line.name}>
                    {line.name}
                  </h3>
                  <p className="text-xs text-[#8B7E66] truncate mt-0.5" title={line.currentProduct}>
                    {line.currentProduct}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] text-[#A09E8E] mb-1">
                    <span>Output</span>
                    <span className="text-[#2D2D24] font-medium">
                      {line.completedUnits} / {line.targetUnits}
                    </span>
                  </div>
                  <div className="w-full bg-[#E9E9E0] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isBottleneck ? 'bg-[#B85D36]' : 'bg-[#5A5A40]'}`}
                      style={{ width: `${Math.min(100, (line.completedUnits / line.targetUnits) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* OEE & IoT Sensor details */}
                <div className="mt-3.5 pt-2.5 border-t border-[#E5E5DE] flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-[#A09E8E] block">OEE</span>
                    <span className="font-bold text-[#2D2D24]">{line.oeeScore}%</span>
                  </div>
                  {line.temperatureC && (
                    <div>
                      <span className="text-[#A09E8E] block">Thermal</span>
                      <span className="text-[#2D2D24] font-medium">{line.temperatureC}&deg;C</span>
                    </div>
                  )}
                  {line.vibrationMmS && (
                    <div>
                      <span className="text-[#A09E8E] block">Vibration</span>
                      <span className="text-[#2D2D24] font-medium">{line.vibrationMmS} mm/s</span>
                    </div>
                  )}
                </div>

                {line.lastDowntimeReason && (
                  <div className="mt-2.5 text-[10px] text-[#B85D36] bg-[#B85D36]/10 px-2.5 py-1 rounded-lg border border-[#B85D36]/20 truncate">
                    Notice: {line.lastDowntimeReason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom 2-Column Section: Active Work Orders & Operational Alert Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Work Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-[#E5E5DE] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-serif italic text-[#5A5A40] font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#8B7E66]" />
                Active Floor Work Orders
              </h2>
              <p className="text-xs text-[#A09E8E] mt-0.5">
                Priority scheduling, batch lot numbers, and target unit economics
              </p>
            </div>
            <button
              onClick={() => onNavigate('production')}
              className="text-xs text-[#5A5A40] hover:text-[#2D2D24] font-semibold cursor-pointer"
            >
              View All ({workOrders.length}) &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2D2D24]">
              <thead className="bg-[#F5F5F0] text-[#8B7E66] uppercase text-[10px] tracking-wider border-b border-[#E5E5DE]">
                <tr>
                  <th className="py-2.5 px-3 font-bold">Order / Batch</th>
                  <th className="py-2.5 px-3 font-bold">Product Name</th>
                  <th className="py-2.5 px-3 font-bold">Customer</th>
                  <th className="py-2.5 px-3 font-bold">Status</th>
                  <th className="py-2.5 px-3 font-bold">Priority</th>
                  <th className="py-2.5 px-3 text-right font-bold">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DE]">
                {workOrders.slice(0, 4).map((wo) => (
                  <tr key={wo.id} className="hover:bg-[#F9F9F7] transition-colors">
                    <td className="py-3 px-3 font-medium text-[#2D2D24]">
                      <div>{wo.orderNumber}</div>
                      <div className="text-[10px] text-[#8B7E66]">{wo.batchNumber}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#2D2D24] truncate max-w-[180px]">{wo.productName}</div>
                      <div className="text-[10px] text-[#A09E8E] font-mono">{wo.sku}</div>
                    </td>
                    <td className="py-3 px-3 text-[#787668] truncate max-w-[140px]">{wo.customer}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                          wo.status === 'in_progress'
                            ? 'bg-[#5A5A40]/15 text-[#5A5A40] border border-[#5A5A40]/30'
                            : wo.status === 'quality_check'
                            ? 'bg-[#8B7E66]/20 text-[#8B7E66] border border-[#8B7E66]/40'
                            : wo.status === 'completed'
                            ? 'bg-[#5A5A40] text-white'
                            : 'bg-[#E9E9E0] text-[#787668]'
                        }`}
                      >
                        {wo.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          wo.priority === 'urgent'
                            ? 'text-[#B85D36]'
                            : wo.priority === 'high'
                            ? 'text-[#C48C3B]'
                            : 'text-[#8B7E66]'
                        }`}
                      >
                        {wo.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="font-semibold text-[#2D2D24]">{wo.quantityProduced}</span>
                      <span className="text-[#A09E8E]"> / {wo.quantityOrdered}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Operational Alerts & Low-Code Automations (1 col) matching Design HTML */}
        <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-serif italic text-[#5A5A40] font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#8B7E66]" />
                Live Floor &amp; Supply Alerts
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F5F5F0] text-[#8B7E66] px-2 py-0.5 rounded-full border border-[#E5E5DE]">
                Live Bus
              </span>
            </div>

            <div className="space-y-3">
              {/* Alert 1: Low stock matching Design HTML card */}
              <div className="p-3.5 rounded-2xl bg-[#F9F9F7] border-l-4 border-[#8B7E66] shadow-xs text-xs">
                <div className="flex items-center justify-between text-[#5A5A40] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-[#8B7E66]" />
                    Inventory Low Stock Breach
                  </span>
                  <span className="text-[10px] text-[#A09E8E]">3m ago</span>
                </div>
                <p className="text-[#2D2D24] text-[11px] mt-1">
                  STM32 ARM Microcontrollers at 620 units (Minimum safety threshold: 1,000 units).
                </p>
                <div className="mt-2 flex items-center gap-2 text-[10px]">
                  <span className="text-[#8B7E66]">Triggered:</span>
                  <span className="text-[#5A5A40] font-medium">Workflow wf-01 (Auto-PO created)</span>
                </div>
              </div>

              {/* Alert 2: Freight Customs Hold */}
              <div className="p-3.5 rounded-2xl bg-[#F9F9F7] border-l-4 border-[#B85D36] shadow-xs text-xs">
                <div className="flex items-center justify-between text-[#B85D36] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#B85D36]" />
                    Customs Hold: Air Cargo DHL
                  </span>
                  <span className="text-[10px] text-[#A09E8E]">14m ago</span>
                </div>
                <p className="text-[#2D2D24] text-[11px] mt-1">
                  Shipment DHL-EX-993041 (Semiconductors) held at Chicago O’Hare for paperwork verification.
                </p>
                <div className="mt-2 text-[10px] text-[#8B7E66]">
                  Buffer impact: SMT Line 3 schedule buffered +24h.
                </div>
              </div>

              {/* Alert 3: Line Bottleneck */}
              <div className="p-3.5 rounded-2xl bg-[#F9F9F7] border-l-4 border-[#5A5A40] shadow-xs text-xs">
                <div className="flex items-center justify-between text-[#5A5A40] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#5A5A40]" />
                    SMT Line 3 Feeder Restored
                  </span>
                  <span className="text-[10px] text-[#A09E8E]">42m ago</span>
                </div>
                <p className="text-[#787668] text-[11px] mt-1">
                  Tape feeder clear. Line operating at 92.5% performance rating.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E5E5DE]">
            <button
              onClick={() => onNavigate('workflows')}
              className="w-full text-center text-xs text-[#5A5A40] hover:text-[#2D2D24] font-semibold py-2 rounded-xl bg-[#F5F5F0] hover:bg-[#E9E9E0] border border-[#E5E5DE] transition-colors cursor-pointer"
            >
              Open Low-Code Workflow Engine &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
