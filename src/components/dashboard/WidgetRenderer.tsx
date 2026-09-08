import React, { useState } from 'react';
import { WidgetErrorBoundary } from './WidgetErrorBoundary';
import {
  GripVertical,
  Maximize2,
  Minimize2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Settings,
  Factory,
  ClipboardCheck,
  Activity,
  Cpu,
  Layers,
  Wrench,
  CheckCircle2,
  Truck,
  Boxes,
  ShieldAlert,
  TrendingUp,
  Zap,
  AlertTriangle,
  FileText,
  Printer,
  QrCode,
  ArrowUpRight,
  Clock,
  Gauge,
  ExternalLink,
  Plus,
  Play,
  RotateCcw,
  Receipt,
  Briefcase,
  Megaphone,
  DollarSign,
  Users,
  Target,
  BarChart2,
  PieChart,
  Grid,
  Filter,
  MapPin,
  Hash,
  Sliders,
  Table,
  FileCode,
  AlertCircle,
  Download,
  Search,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import {
  DashboardWidget,
  ProductionLine,
  WorkOrder,
  DigitalTraveler,
  FloorCell,
  AgvVehicle,
  BomNode,
  MaintenanceAsset,
  MaintenanceWorkOrder,
  Shipment,
  InventoryItem,
  OperationalAlert,
  MrpRequirement,
  RoleDefinition,
  ViewTab,
  Invoice,
  FinanceMetric,
  CrmDeal,
  MarketingCampaign,
  GlobalFilterState,
} from '../../types';
import {
  initialInvoices,
  initialFinance,
  initialDeals,
  initialCampaigns,
} from '../../data/initialData';

interface WidgetRendererProps {
  widget: DashboardWidget;
  isEditMode: boolean;
  // Layout Controls
  onResize?: (widgetId: string, newColSpan: 1 | 2 | 3 | 4) => void;
  onRemove?: (widgetId: string) => void;
  onMove?: (widgetId: string, direction: 'left' | 'right') => void;
  // Drag handlers
  onDragStart?: (e: React.DragEvent, widgetId: string) => void;
  onDragOver?: (e: React.DragEvent, widgetId: string) => void;
  onDrop?: (e: React.DragEvent, widgetId: string) => void;
  isDragOver?: boolean;

  // Real App Data
  lines: ProductionLine[];
  workOrders: WorkOrder[];
  travelers: DigitalTraveler[];
  floorCells: FloorCell[];
  agvFleet: AgvVehicle[];
  multiLevelBom: BomNode[];
  maintenanceAssets: MaintenanceAsset[];
  maintenanceOrders: MaintenanceWorkOrder[];
  shipments: Shipment[];
  inventory: InventoryItem[];
  alerts: OperationalAlert[];
  currentRole: RoleDefinition;

  // Actions
  onNavigateTab: (tab: ViewTab) => void;
  onUpdateStep?: (travelerId: string, stepId: string, val: string | number, status: 'passed' | 'failed') => void;
  onSignOffTraveler?: (travelerId: string, badgeId: string, comments: string) => void;
  onDraftPurchaseOrder?: (mrpItem: MrpRequirement) => void;
  onToggleMaintenanceTask?: (woId: string, taskId: string) => void;
  onEmergencyStopBay?: (bayName: string) => void;
  onOpenBarcodeScanner?: () => void;
  onOpenPrintLabel?: () => void;
  onUpdateLineStatus?: (lineId: string, status: ProductionLine['status']) => void;
  onAcknowledgeAlert?: (alertId: string) => void;
  onSaveWidgetSettings?: (widgetId: string, settings: Record<string, any>) => void;
  invoices?: Invoice[];
  finance?: FinanceMetric;
  deals?: CrmDeal[];
  campaigns?: MarketingCampaign[];
  onPayInvoice?: (invoiceId: string) => void;
  onAdvanceDealStage?: (dealId: string) => void;
  globalFilter?: GlobalFilterState;
}

interface TableRecord {
  sku: string;
  category: string;
  order: string;
  facility: string;
  qty: number;
  oee: number;
  cost: number;
  status: string;
}

const initialTableRecords: TableRecord[] = [
  { sku: 'AERO-TITANIUM-BRKT', category: 'Precision Milling', order: 'WO-8891', facility: 'Dallas Stamping Hub', qty: 250, oee: 88.4, cost: 142.50, status: 'Optimal' },
  { sku: 'TURBO-IMPELLER-V2', category: '5-Axis CNC', order: 'WO-8892', facility: 'Munich Precision Optics', qty: 120, oee: 81.2, cost: 310.20, status: 'Running' },
  { sku: 'SENSOR-PCB-SMT-9', category: 'SMT Assembly', order: 'WO-8893', facility: 'Tokyo Micro-Assembly', qty: 1000, oee: 92.0, cost: 28.40, status: 'Inspecting' },
  { sku: 'VALVE-BODY-HYD-50', category: 'Hydraulics', order: 'WO-8894', facility: 'Dallas Stamping Hub', qty: 400, oee: 85.6, cost: 89.00, status: 'Completed' },
  { sku: 'OPTIC-LENS-HOUSING', category: 'Precision Milling', order: 'WO-8895', facility: 'Munich Precision Optics', qty: 320, oee: 89.1, cost: 185.00, status: 'Optimal' },
  { sku: 'TITANIUM-FASTENER-M8', category: 'Fasteners', order: 'WO-8896', facility: 'London Fasteners', qty: 5000, oee: 94.5, cost: 6.20, status: 'Running' },
];

const InteractivePivotTableWidget: React.FC<{ globalFilter?: GlobalFilterState }> = ({ globalFilter }) => {
  const [search, setSearch] = useState('');
  const [isPivot, setIsPivot] = useState(false);
  const [sortCol, setSortCol] = useState<keyof TableRecord>('sku');
  const [sortAsc, setSortAsc] = useState(true);

  // Filter records
  const filtered = initialTableRecords.filter((r) => {
    const matchesLocal =
      search === '' ||
      r.sku.toLowerCase().includes(search.toLowerCase()) ||
      r.category.toLowerCase().includes(search.toLowerCase()) ||
      r.order.toLowerCase().includes(search.toLowerCase()) ||
      r.status.toLowerCase().includes(search.toLowerCase());

    const matchesFacility =
      !globalFilter ||
      globalFilter.facilityId === 'All Plants' ||
      r.facility.toLowerCase().includes(globalFilter.facilityId.split(' ')[0].toLowerCase());

    const matchesGlobalSearch =
      !globalFilter?.searchKeyword ||
      r.sku.toLowerCase().includes(globalFilter.searchKeyword.toLowerCase()) ||
      r.category.toLowerCase().includes(globalFilter.searchKeyword.toLowerCase());

    return matchesLocal && matchesFacility && matchesGlobalSearch;
  });

  // Sort records
  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortCol];
    const valB = b[sortCol];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const handleSort = (col: keyof TableRecord) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  // Pivot Aggregations (group by Category)
  const pivotData = React.useMemo(() => {
    const map = new Map<string, { category: string; totalQty: number; avgOee: number; count: number; totalVal: number }>();
    filtered.forEach((r) => {
      const existing = map.get(r.category) || { category: r.category, totalQty: 0, avgOee: 0, count: 0, totalVal: 0 };
      existing.totalQty += r.qty;
      existing.avgOee += r.oee;
      existing.totalVal += r.qty * r.cost;
      existing.count += 1;
      map.set(r.category, existing);
    });
    return Array.from(map.values()).map((c) => ({
      ...c,
      avgOee: (c.avgOee / c.count).toFixed(1),
    }));
  }, [filtered]);

  // Real CSV Download
  const handleExportCsv = () => {
    const headers = ['SKU', 'Category', 'Work Order', 'Facility', 'Quantity', 'OEE', 'Unit Cost', 'Status'];
    const rows = sorted.map((r) => [r.sku, r.category, r.order, r.facility, r.qty, `${r.oee}%`, `$${r.cost.toFixed(2)}`, r.status]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vortix-data-records-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Real Excel (TSV) Download
  const handleExportExcel = () => {
    const headers = ['SKU', 'Category', 'Work Order', 'Facility', 'Quantity', 'OEE', 'Unit Cost', 'Status'];
    const rows = sorted.map((r) => [r.sku, r.category, r.order, r.facility, r.qty, `${r.oee}%`, `$${r.cost.toFixed(2)}`, r.status]);
    const tsvContent = [headers.join('\t'), ...rows.map((row) => row.join('\t'))].join('\n');
    const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vortix-data-records-${Date.now()}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 bg-[#F5F5F0] border border-[#E5E5DE] px-2.5 py-1 rounded-xl text-xs text-[#2D2D24] flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#8B7E66]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Inline search SKU, category, status..."
            className="bg-transparent text-xs text-[#2D2D24] outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPivot(!isPivot)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl font-medium border transition-colors cursor-pointer ${
              isPivot
                ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                : 'bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border-[#E5E5DE]'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>{isPivot ? 'Pivot: ON' : 'Pivot View'}</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1 text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#5A5A40] border border-[#E5E5DE] px-2.5 py-1 rounded-xl font-medium cursor-pointer"
            title="Download CSV file"
          >
            <Download className="w-3 h-3" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1 text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#5A5A40] border border-[#E5E5DE] px-2.5 py-1 rounded-xl font-medium cursor-pointer"
            title="Download Excel spreadsheet"
          >
            <FileSpreadsheet className="w-3 h-3" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Table Body: Detail vs Pivot */}
      {isPivot ? (
        <div className="overflow-x-auto border border-[#E5E5DE] rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F5F0] text-[10px] uppercase font-bold text-[#8B7E66] border-b border-[#E5E5DE]">
              <tr>
                <th className="p-2.5">Category Pivot</th>
                <th className="p-2.5 text-right">SKU Count</th>
                <th className="p-2.5 text-right">Total Units</th>
                <th className="p-2.5 text-right">Avg OEE</th>
                <th className="p-2.5 text-right">Total Inventory Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5DE]">
              {pivotData.map((p) => (
                <tr key={p.category} className="hover:bg-[#F9F9F7]">
                  <td className="p-2.5 font-semibold text-[#2D2D24]">{p.category}</td>
                  <td className="p-2.5 text-right font-mono text-[#5A5A40]">{p.count} SKUs</td>
                  <td className="p-2.5 text-right font-mono font-bold text-[#2D2D24]">{p.totalQty.toLocaleString()}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-[#2E6930]">{p.avgOee}%</td>
                  <td className="p-2.5 text-right font-mono text-[#8B7E66]">${p.totalVal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#E5E5DE] rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F5F5F0] text-[10px] uppercase font-bold text-[#8B7E66] border-b border-[#E5E5DE]">
              <tr>
                <th onClick={() => handleSort('sku')} className="p-2 cursor-pointer hover:bg-[#E9E9E0]">
                  <div className="flex items-center gap-1">
                    <span>SKU</span>
                    <ArrowUpDown className="w-2.5 h-2.5" />
                  </div>
                </th>
                <th onClick={() => handleSort('category')} className="p-2 cursor-pointer hover:bg-[#E9E9E0]">
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    <ArrowUpDown className="w-2.5 h-2.5" />
                  </div>
                </th>
                <th onClick={() => handleSort('order')} className="p-2 cursor-pointer hover:bg-[#E9E9E0]">
                  Work Order
                </th>
                <th onClick={() => handleSort('qty')} className="p-2 text-right cursor-pointer hover:bg-[#E9E9E0]">
                  <div className="flex items-center justify-end gap-1">
                    <span>Units</span>
                    <ArrowUpDown className="w-2.5 h-2.5" />
                  </div>
                </th>
                <th onClick={() => handleSort('oee')} className="p-2 text-right cursor-pointer hover:bg-[#E9E9E0]">
                  <div className="flex items-center justify-end gap-1">
                    <span>OEE</span>
                    <ArrowUpDown className="w-2.5 h-2.5" />
                  </div>
                </th>
                <th onClick={() => handleSort('cost')} className="p-2 text-right cursor-pointer hover:bg-[#E9E9E0]">
                  <div className="flex items-center justify-end gap-1">
                    <span>Cost</span>
                    <ArrowUpDown className="w-2.5 h-2.5" />
                  </div>
                </th>
                <th onClick={() => handleSort('status')} className="p-2 text-center cursor-pointer hover:bg-[#E9E9E0]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5DE]">
              {sorted.map((r) => (
                <tr key={r.sku} className="hover:bg-[#F9F9F7]">
                  <td className="p-2 font-mono font-bold text-[#2D2D24]">{r.sku}</td>
                  <td className="p-2 text-[#787668]">{r.category}</td>
                  <td className="p-2 font-mono text-[#5A5A40]">{r.order}</td>
                  <td className="p-2 text-right font-mono">{r.qty}</td>
                  <td className="p-2 text-right font-mono font-bold text-[#2E6930]">{r.oee}%</td>
                  <td className="p-2 text-right font-mono">${r.cost.toFixed(2)}</td>
                  <td className="p-2 text-center">
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#5A5A40]/15 text-[#5A5A40]">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center justify-between text-[10px] text-[#8B7E66] px-1">
        <span>Showing {sorted.length} of {initialTableRecords.length} records</span>
        {globalFilter?.facilityId && globalFilter.facilityId !== 'All Plants' && (
          <span className="font-semibold text-[#5A5A40]">Facility Filter: {globalFilter.facilityId}</span>
        )}
      </div>
    </div>
  );
};

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  widget,
  isEditMode,
  onResize,
  onRemove,
  onMove,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
  lines,
  workOrders,
  travelers,
  floorCells,
  agvFleet,
  multiLevelBom,
  maintenanceAssets,
  maintenanceOrders,
  shipments,
  inventory,
  alerts,
  currentRole,
  onNavigateTab,
  onUpdateStep,
  onSignOffTraveler,
  onDraftPurchaseOrder,
  onToggleMaintenanceTask,
  onEmergencyStopBay,
  onOpenBarcodeScanner,
  onOpenPrintLabel,
  onUpdateLineStatus,
  onAcknowledgeAlert,
  onSaveWidgetSettings,
  invoices = initialInvoices,
  finance = initialFinance,
  deals = initialDeals,
  campaigns = initialCampaigns,
  onPayInvoice,
  onAdvanceDealStage,
  globalFilter,
}) => {
  // Local state for interactive widgets
  const [selectedTravelerId, setSelectedTravelerId] = useState<string>(
    widget.settings?.travelerId || travelers[0]?.id || ''
  );
  const [noteContent, setNoteContent] = useState<string>(
    widget.settings?.noteText || 'Daily shift priorities: keep cell temperature below 60°C and verify lot stamps.'
  );

  const activeTraveler = travelers.find((t) => t.id === selectedTravelerId) || travelers[0];

  // Helper col-span class
  const getColSpanClass = (span: 1 | 2 | 3 | 4) => {
    switch (span) {
      case 1:
        return 'col-span-1';
      case 2:
        return 'col-span-1 md:col-span-2';
      case 3:
        return 'col-span-1 md:col-span-2 xl:col-span-3';
      case 4:
      default:
        return 'col-span-1 md:col-span-2 xl:col-span-4';
    }
  };

  // Render individual widget content based on type
  const renderWidgetBody = () => {
    switch (widget.type) {
      // 1. QUICK ACTION BAR
      case 'quick_action_bar': {
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={onOpenBarcodeScanner}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F5F0] hover:bg-[#E9E9E0] border border-[#E5E5DE] text-left transition-colors cursor-pointer group"
            >
              <div>
                <div className="text-xs font-semibold text-[#2D2D24]">Scan Barcode / QR</div>
                <div className="text-[11px] text-[#8B7E66]">Camera & laser scanner</div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#5A5A40] group-hover:scale-105 transition-transform shadow-2xs">
                <QrCode className="w-4 h-4" />
              </div>
            </button>

            <button
              onClick={onOpenPrintLabel}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F5F0] hover:bg-[#E9E9E0] border border-[#E5E5DE] text-left transition-colors cursor-pointer group"
            >
              <div>
                <div className="text-xs font-semibold text-[#2D2D24]">Print Thermal Label</div>
                <div className="text-[11px] text-[#8B7E66]">4"x6" Code-128 barcode</div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#5A5A40] group-hover:scale-105 transition-transform shadow-2xs">
                <Printer className="w-4 h-4" />
              </div>
            </button>

            <button
              onClick={() => onEmergencyStopBay && onEmergencyStopBay('CNC Machining Bay A')}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF5F5] hover:bg-[#FFEAEB] border border-[#FCDAD7] text-left transition-colors cursor-pointer group"
            >
              <div>
                <div className="text-xs font-semibold text-[#B33A3A]">Bay Safety E-Stop</div>
                <div className="text-[11px] text-[#D9534F]">Engage 10% crawl speed</div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#B33A3A] group-hover:scale-105 transition-transform shadow-2xs">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </button>

            <button
              onClick={() => onNavigateTab('digital_traveler')}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#F5F5F0] hover:bg-[#E9E9E0] border border-[#E5E5DE] text-left transition-colors cursor-pointer group"
            >
              <div>
                <div className="text-xs font-semibold text-[#2D2D24]">Launch Full SOP</div>
                <div className="text-[11px] text-[#8B7E66]">Open shop-floor terminal</div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#5A5A40] group-hover:scale-105 transition-transform shadow-2xs">
                <ClipboardCheck className="w-4 h-4" />
              </div>
            </button>
          </div>
        );
      }

      // 2. LINE OEE TRACKER
      case 'line_oee_tracker': {
        const avgOee = (
          lines.reduce((acc, l) => acc + l.oeeScore, 0) / (lines.length || 1)
        ).toFixed(1);

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#E5E5DE]">
              <span className="text-xs text-[#8B7E66]">Average Plant OEE</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold font-mono text-[#2D2D24]">{avgOee}%</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF3ED] text-[#2E6930] font-semibold">
                  Target: 85%
                </span>
              </div>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {lines.map((line) => (
                <div
                  key={line.id}
                  className="p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#2D2D24] truncate">{line.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium uppercase ${
                          line.status === 'running'
                            ? 'bg-[#EBF3ED] text-[#2E6930]'
                            : line.status === 'bottleneck'
                            ? 'bg-[#FFF9EB] text-[#8C6B1C]'
                            : 'bg-[#F0F0EB] text-[#787668]'
                        }`}
                      >
                        {line.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8B7E66] truncate mt-0.5">
                      {line.currentProduct} &bull; Shift: {line.activeShift}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-[#2D2D24]">{line.oeeScore}% OEE</div>
                    <div className="text-[10px] text-[#8B7E66]">
                      {line.completedUnits}/{line.targetUnits} pcs
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 3. ACTIVE DIGITAL TRAVELER SOP
      case 'active_traveler': {
        if (!activeTraveler) {
          return <div className="text-xs text-[#8B7E66] py-4">No active travelers found.</div>;
        }

        const completedCount = activeTraveler.steps.filter((s) => s.isCompleted).length;
        const progressPct = Math.round((completedCount / (activeTraveler.steps.length || 1)) * 100);

        return (
          <div className="space-y-3">
            {/* Traveler Selector & Status */}
            <div className="flex items-center justify-between gap-2">
              <select
                value={selectedTravelerId}
                onChange={(e) => setSelectedTravelerId(e.target.value)}
                className="text-xs bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-2.5 py-1 text-[#2D2D24] font-medium outline-hidden"
              >
                {travelers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.travelerNumber} &mdash; {t.partName}
                  </option>
                ))}
              </select>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  activeTraveler.status === 'approved'
                    ? 'bg-[#EBF3ED] text-[#2E6930]'
                    : activeTraveler.status === 'quality_quarantine'
                    ? 'bg-[#FFF5F5] text-[#B33A3A]'
                    : 'bg-[#FFF9EB] text-[#8C6B1C]'
                }`}
              >
                {activeTraveler.status.replace('_', ' ')}
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-[#8B7E66]">
                <span>Routing Progress</span>
                <span className="font-mono font-semibold text-[#2D2D24]">{progressPct}%</span>
              </div>
              <div className="w-full h-2 bg-[#E5E5DE] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#5A5A40] rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Steps snippet */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {activeTraveler.steps.slice(0, 3).map((step) => (
                <div
                  key={step.id}
                  className="p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-[#2D2D24] truncate">
                      Step {step.stepNumber}: {step.title}
                    </div>
                    <div className="text-[11px] text-[#8B7E66]">
                      Target: {step.targetValue} {step.unit}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {step.isCompleted ? (
                      <span className="flex items-center gap-1 text-[11px] text-[#2E6930] bg-[#EBF3ED] px-2 py-0.5 rounded-lg font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        {step.operatorValue} {step.unit}
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          onUpdateStep &&
                          onUpdateStep(activeTraveler.id, step.id, step.targetValue, 'passed')
                        }
                        className="text-[10px] bg-[#5A5A40] text-white px-2.5 py-1 rounded-lg font-medium hover:bg-[#474732] cursor-pointer"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={() => onNavigateTab('digital_traveler')}
                className="text-xs text-[#5A5A40] hover:text-[#2D2D24] font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Open Full Routing Traveler</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      }

      // 4. 2D FACTORY FLOOR DIGITAL TWIN & IOT
      case 'digital_twin_map': {
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {floorCells.slice(0, 6).map((cell) => (
                <div
                  key={cell.id}
                  className="p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#2D2D24] truncate">{cell.name}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        cell.status === 'active'
                          ? 'bg-[#2E6930] animate-pulse'
                          : cell.status === 'warning'
                          ? 'bg-[#8C6B1C]'
                          : 'bg-[#787668]'
                      }`}
                    />
                  </div>
                  <div className="text-[10px] text-[#8B7E66]">Machine: {cell.machineId}</div>

                  <div className="grid grid-cols-2 gap-1 pt-1 text-[10px] font-mono border-t border-[#E5E5DE]">
                    <div>
                      <span className="text-[#8B7E66] block">Temp:</span>
                      <span className="font-semibold text-[#2D2D24]">{cell.telemetry.tempC}°C</span>
                    </div>
                    <div>
                      <span className="text-[#8B7E66] block">Vibe:</span>
                      <span className="font-semibold text-[#2D2D24]">{cell.telemetry.vibrationMmS} mm/s</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-[#8B7E66] pt-1">
              <span>6 Work Centers Live &bull; IoT Telemetry Frequency: 1.2s</span>
              <button
                onClick={() => onNavigateTab('digital_twin')}
                className="text-[#5A5A40] font-medium hover:text-[#2D2D24] flex items-center gap-1 cursor-pointer"
              >
                <span>View 2D Plant Layout</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      }

      // 5. AGV AUTONOMOUS FLEET RADAR
      case 'agv_fleet_radar': {
        return (
          <div className="space-y-2.5">
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {agvFleet.map((agv) => (
                <div
                  key={agv.id}
                  className="p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#2D2D24]">{agv.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium ${
                          agv.status === 'moving'
                            ? 'bg-[#EBF3ED] text-[#2E6930]'
                            : agv.status === 'charging'
                            ? 'bg-[#FFF9EB] text-[#8C6B1C]'
                            : 'bg-[#F0F0EB] text-[#787668]'
                        }`}
                      >
                        {agv.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8B7E66] truncate mt-0.5">
                      Destination: {agv.destinationBay} &bull; Payload: {agv.payload}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-[#2D2D24]">{agv.batteryPct}% Battery</div>
                    <div className="text-[10px] text-[#8B7E66] font-mono">
                      X:{agv.xCoord} Y:{agv.yCoord}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={() => onNavigateTab('digital_twin')}
                className="text-xs text-[#5A5A40] hover:text-[#2D2D24] font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Track AGV Coordinates</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      }

      // 6. MULTI-LEVEL BOM & MRP SHORTAGES
      case 'mrp_shortage_alert': {
        // Collect shortages from initialBom or mock
        const shortages: MrpRequirement[] = [
          {
            id: 'mrp-req-01',
            sku: 'RAW-SS-416-BAR',
            name: 'Stainless Steel 416 Round Bar',
            totalRequired: 120,
            stockOnHand: 40,
            onOrder: 0,
            netShortage: 80,
            unit: 'MTR',
            leadTimeDays: 7,
            supplier: 'Allegheny Steel Corp',
            estimatedCost: 3840,
            status: 'shortage',
            suggestedOrderDate: '2026-09-03',
          },
          {
            id: 'mrp-req-02',
            sku: 'SUB-SEAL-PKG',
            name: 'Fluorocarbon O-Ring Kit',
            totalRequired: 240,
            stockOnHand: 100,
            onOrder: 50,
            netShortage: 90,
            unit: 'SET',
            leadTimeDays: 4,
            supplier: 'Precision Elastomers Ltd',
            estimatedCost: 990,
            status: 'shortage',
            suggestedOrderDate: '2026-09-04',
          },
        ];

        return (
          <div className="space-y-3">
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {shortages.map((item) => (
                <div
                  key={item.sku}
                  className="p-2.5 rounded-xl bg-[#FFF9EB] border border-[#F5E2B3] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-[#2D2D24] truncate">{item.name}</div>
                    <div className="text-[11px] text-[#8C6B1C]">
                      SKU: {item.sku} &bull; Shortage: <strong>{item.netShortage} {item.unit}</strong>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <div className="text-right text-[11px]">
                      <div className="font-mono font-bold text-[#2D2D24]">${item.estimatedCost}</div>
                      <div className="text-[#8C6B1C]">{item.leadTimeDays}d lead</div>
                    </div>
                    <button
                      onClick={() => onDraftPurchaseOrder && onDraftPurchaseOrder(item)}
                      className="text-[10px] bg-[#5A5A40] text-white px-2.5 py-1 rounded-lg font-medium hover:bg-[#474732] cursor-pointer"
                    >
                      Draft PO
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-[#8B7E66] pt-1">
              <span>Auto MRP recalculation on active work orders</span>
              <button
                onClick={() => onNavigateTab('bom_mrp')}
                className="text-[#5A5A40] font-medium hover:text-[#2D2D24] flex items-center gap-1 cursor-pointer"
              >
                <span>Explore Multi-Level BOM</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      }

      // 7. EQUIPMENT HEALTH & CMMS ASSET RELIABILITY
      case 'equipment_health_gauge': {
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              {maintenanceAssets.slice(0, 4).map((asset) => (
                <div
                  key={asset.id}
                  className="p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#2D2D24] truncate">{asset.name}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                        asset.healthScore >= 90
                          ? 'bg-[#EBF3ED] text-[#2E6930]'
                          : asset.healthScore >= 70
                          ? 'bg-[#FFF9EB] text-[#8C6B1C]'
                          : 'bg-[#FFF5F5] text-[#B33A3A]'
                      }`}
                    >
                      {asset.healthScore}%
                    </span>
                  </div>
                  <div className="text-[11px] text-[#8B7E66]">
                    MTBF: {asset.mtbfHours}h &bull; Run: {asset.operatingHours}h
                  </div>
                  <div className="text-[10px] text-[#8B7E66] truncate">
                    Next PM: {asset.nextServiceDate}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={() => onNavigateTab('maintenance')}
                className="text-xs text-[#5A5A40] hover:text-[#2D2D24] font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Open Maintenance CMMS</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      }

      // 8. CMMS WORK ORDERS BOARD
      case 'maintenance_orders_board': {
        return (
          <div className="space-y-2.5">
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {maintenanceOrders.slice(0, 3).map((wo) => (
                <div
                  key={wo.id}
                  className="p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-[#2D2D24]">{wo.title}</div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                        wo.priority === 'critical' || wo.priority === 'urgent'
                          ? 'bg-[#FFF5F5] text-[#B33A3A]'
                          : 'bg-[#FFF9EB] text-[#8C6B1C]'
                      }`}
                    >
                      {wo.priority}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#8B7E66]">
                    Machine: {wo.assetName} &bull; Tech: {wo.assignedTechnician}
                  </div>

                  {wo.tasks.slice(0, 2).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onToggleMaintenanceTask && onToggleMaintenanceTask(wo.id, task.id)}
                      className="flex items-center gap-2 cursor-pointer text-[11px] text-[#2D2D24] bg-white p-1.5 rounded-lg border border-[#E5E5DE]"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        readOnly
                        className="rounded-sm text-[#5A5A40] cursor-pointer"
                      />
                      <span className={task.completed ? 'line-through text-[#8B7E66]' : ''}>
                        {task.description}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={() => onNavigateTab('maintenance')}
                className="text-xs text-[#5A5A40] hover:text-[#2D2D24] font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Dispatch Maintenance Team</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      }

      // 9. SUPPLY CHAIN TRACKING & GPS RADAR
      case 'shipment_radar': {
        return (
          <div className="space-y-2.5">
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {shipments.slice(0, 3).map((ship) => (
                <div
                  key={ship.id}
                  className="p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#2D2D24]">{ship.trackingNumber}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium uppercase ${
                          ship.riskFactor === 'high'
                            ? 'bg-[#FFF5F5] text-[#B33A3A]'
                            : 'bg-[#EBF3ED] text-[#2E6930]'
                        }`}
                      >
                        {ship.riskFactor} risk
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8B7E66] truncate mt-0.5">
                      {ship.origin} &rarr; {ship.destination} ({ship.carrier})
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-medium text-[#2D2D24] capitalize">
                      {ship.status.replace('_', ' ')}
                    </div>
                    <div className="text-[10px] text-[#8B7E66]">ETA: {ship.estimatedDelivery}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={() => onNavigateTab('supply_chain')}
                className="text-xs text-[#5A5A40] hover:text-[#2D2D24] font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Live GPS Radar Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      }

      // 10. INVENTORY STOCK LEVELS
      case 'inventory_stock_levels': {
        const lowItems = inventory.filter((i) => i.status === 'low_stock' || i.status === 'critical');
        return (
          <div className="space-y-2.5">
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {(lowItems.length ? lowItems : inventory.slice(0, 4)).map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-[#2D2D24] truncate">{item.name}</div>
                    <div className="text-[11px] text-[#8B7E66]">
                      SKU: {item.sku} &bull; Bin: {item.location}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-[#2D2D24]">
                      {item.currentStock} {item.unit}
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium uppercase ${
                        item.status === 'critical' || item.status === 'low_stock'
                          ? 'bg-[#FFF5F5] text-[#B33A3A]'
                          : 'bg-[#EBF3ED] text-[#2E6930]'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-xs text-[#5A5A40] hover:text-[#2D2D24] font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Inventory & Lots</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      }

      // 11. FINANCIAL MARGINS & COSTING
      case 'financial_margins': {
        const totalUnits = lines.reduce((acc, l) => acc + l.completedUnits, 0);
        const estimatedRevenue = totalUnits * 450;
        const estimatedCost = totalUnits * 315;
        const grossMargin = ((estimatedRevenue - estimatedCost) / (estimatedRevenue || 1)) * 100;

        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DE]">
                <span className="text-[11px] text-[#8B7E66]">Daily Production Value</span>
                <div className="text-lg font-mono font-bold text-[#2D2D24] mt-1">
                  ${estimatedRevenue.toLocaleString()}
                </div>
                <span className="text-[10px] text-[#2E6930]">+6.4% vs last shift</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DE]">
                <span className="text-[11px] text-[#8B7E66]">Operating Margin</span>
                <div className="text-lg font-mono font-bold text-[#2D2D24] mt-1">
                  {grossMargin.toFixed(1)}%
                </div>
                <span className="text-[10px] text-[#5A5A40]">Standard Target: 28%</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#FFF9EB] border border-[#F5E2B3] text-xs text-[#8C6B1C] flex items-center justify-between">
              <span>Scrap Impact: -$3,240 across 4 line shifts</span>
              <button
                onClick={() => onNavigateTab('finance')}
                className="font-semibold underline cursor-pointer"
              >
                Breakdown
              </button>
            </div>
          </div>
        );
      }

      // 12. QUALITY & SCRAP SPC
      case 'quality_spc_chart': {
        const totalCompletedUnits = lines.reduce((acc, l) => acc + l.completedUnits, 0);
        const totalScrapUnits = workOrders.reduce((acc, w) => acc + w.scrappedUnits, 0);
        const scrapRate = (
          (totalScrapUnits / (totalCompletedUnits + totalScrapUnits || 1)) * 100
        ).toFixed(2);

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-[#8B7E66]">Scrap Rate Percentage</span>
                <div className="text-xl font-bold font-mono text-[#2D2D24]">{scrapRate}%</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#8B7E66]">Total Scrapped</span>
                <div className="text-sm font-mono font-bold text-[#B33A3A]">{totalScrapUnits} units</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-xs space-y-1">
              <div className="font-semibold text-[#2D2D24]">ISO 9001 Compliance Yield</div>
              <div className="text-[11px] text-[#8B7E66]">
                First Pass Yield (FPY): 98.2% &bull; Zero unresolved critical NCRs.
              </div>
            </div>
          </div>
        );
      }

      // 13. ALERTS LIVE TICKER
      case 'alerts_live_ticker': {
        return (
          <div className="space-y-2">
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {alerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-2 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    alert.severity === 'critical'
                      ? 'bg-[#FFF5F5] border-[#FCDAD7]'
                      : alert.severity === 'warning'
                      ? 'bg-[#FFF9EB] border-[#F5E2B3]'
                      : 'bg-[#F5F5F0] border-[#E5E5DE]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle
                      className={`w-4 h-4 shrink-0 ${
                        alert.severity === 'critical'
                          ? 'text-[#B33A3A]'
                          : alert.severity === 'warning'
                          ? 'text-[#8C6B1C]'
                          : 'text-[#5A5A40]'
                      }`}
                    />
                    <div className="truncate">
                      <span className="font-semibold text-[#2D2D24]">{alert.title}</span>
                      <span className="text-[11px] text-[#8B7E66] ml-2">({alert.source})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-[#8B7E66]">{alert.timestamp}</span>
                    <button
                      onClick={() => onAcknowledgeAlert && onAcknowledgeAlert(alert.id)}
                      className="text-[10px] px-2 py-0.5 bg-white hover:bg-[#F5F5F0] border border-[#E5E5DE] rounded-md font-medium text-[#2D2D24] cursor-pointer"
                    >
                      Ack
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 14. TEAM HANDOVER NOTES
      case 'team_handover_notes': {
        return (
          <div className="space-y-2">
            <textarea
              value={noteContent}
              onChange={(e) => {
                setNoteContent(e.target.value);
                if (onSaveWidgetSettings) {
                  onSaveWidgetSettings(widget.id, { noteText: e.target.value });
                }
              }}
              rows={4}
              placeholder="Type handover notes, machine quirks, or shift priorities..."
              className="w-full text-xs p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] placeholder-[#8B7E66] focus:ring-1 focus:ring-[#5A5A40] outline-hidden resize-none font-sans"
            />
            <div className="flex items-center justify-between text-[10px] text-[#8B7E66]">
              <span>Saved to shift board automatically</span>
              <span className="font-mono">Author: {currentRole.title}</span>
            </div>
          </div>
        );
      }

      // 15. ACCOUNTING GL & AR/AP WIDGET
      case 'accounting_gl_widget': {
        const totalAr = invoices
          .filter((i) => i.type === 'receivable' && i.status !== 'paid')
          .reduce((acc, i) => acc + i.amount, 0);
        const totalAp = invoices
          .filter((i) => i.type === 'payable' && i.status !== 'paid')
          .reduce((acc, i) => acc + i.amount, 0);
        const pendingInvoices = invoices.filter((i) => i.status !== 'paid').slice(0, 3);

        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#F5F5F0] p-2.5 rounded-xl border border-[#E5E5DE]">
                <span className="text-[10px] text-[#787668] uppercase font-bold block">Outstanding AR (Due)</span>
                <span className="text-sm font-mono font-bold text-[#5A5A40]">${totalAr.toLocaleString()}</span>
                <span className="text-[10px] text-[#2E6930] block mt-0.5">Inflow Pipeline</span>
              </div>
              <div className="bg-[#F5F5F0] p-2.5 rounded-xl border border-[#E5E5DE]">
                <span className="text-[10px] text-[#787668] uppercase font-bold block">Outstanding AP (Bills)</span>
                <span className="text-sm font-mono font-bold text-[#B85D36]">${totalAp.toLocaleString()}</span>
                <span className="text-[10px] text-[#8B7E66] block mt-0.5">Supplier Commitments</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-[#8B7E66] uppercase">
                <span>Pending Invoices &amp; Vouchers</span>
                <span>Due Date</span>
              </div>
              {pendingInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-2 bg-[#F9F9F7] rounded-xl border border-[#E5E5DE] text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[#2D2D24]">{inv.invoiceNumber}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase font-semibold ${
                          inv.type === 'receivable' ? 'bg-[#5A5A40]/15 text-[#5A5A40]' : 'bg-[#8B7E66]/20 text-[#8B7E66]'
                        }`}
                      >
                        {inv.type === 'receivable' ? 'AR' : 'AP'}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#787668] truncate block">{inv.counterparty}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-[#2D2D24] text-xs">
                      ${inv.amount.toLocaleString()}
                    </span>
                    {onPayInvoice && (
                      <button
                        onClick={() => onPayInvoice(inv.id)}
                        className="text-[10px] bg-white hover:bg-[#E9E9E0] text-[#5A5A40] border border-[#E5E5DE] px-2 py-0.5 rounded-md font-medium cursor-pointer"
                      >
                        Settle
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-[#E5E5DE] text-xs">
              <span className="text-[11px] text-[#8B7E66]">Absorption Gross Margin: {finance.grossMargin}%</span>
              <button
                onClick={() => onNavigateTab('finance')}
                className="text-[11px] text-[#5A5A40] hover:text-[#474732] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>General Ledger</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      }

      // 16. CRM PIPELINE WIDGET
      case 'crm_pipeline_widget': {
        const totalValue = deals.reduce((sum, d) => sum + d.dealValue, 0);
        const wonCount = deals.filter((d) => d.stage === 'won_contract').length;
        const topDeals = deals.slice(0, 3);

        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#F5F5F0] p-2.5 rounded-xl border border-[#E5E5DE]">
                <span className="text-[10px] text-[#787668] uppercase font-bold block">Total Pipeline Value</span>
                <span className="text-sm font-mono font-bold text-[#5A5A40]">${totalValue.toLocaleString()}</span>
                <span className="text-[10px] text-[#8B7E66] block mt-0.5">{deals.length} Active RFQs</span>
              </div>
              <div className="bg-[#F5F5F0] p-2.5 rounded-xl border border-[#E5E5DE]">
                <span className="text-[10px] text-[#787668] uppercase font-bold block">Won &amp; In Production</span>
                <span className="text-sm font-mono font-bold text-[#2E6930]">{wonCount} Contracts</span>
                <span className="text-[10px] text-[#8B7E66] block mt-0.5">ERP Work Orders Linked</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-[#8B7E66] uppercase">
                <span>Top OEM Opportunities</span>
                <span>Stage / Value</span>
              </div>
              {topDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex items-center justify-between p-2 bg-[#F9F9F7] rounded-xl border border-[#E5E5DE] text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-[#2D2D24] truncate">{deal.companyName}</div>
                    <div className="text-[10px] text-[#787668] truncate">{deal.productCategory}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="font-mono font-bold text-[#5A5A40] block">${deal.dealValue.toLocaleString()}</span>
                      <span className="text-[9px] bg-[#E9E9E0] text-[#5A5A40] px-1.5 py-0.2 rounded font-mono uppercase">
                        {deal.stage.replace('_', ' ')}
                      </span>
                    </div>
                    {onAdvanceDealStage && deal.stage !== 'won_contract' && (
                      <button
                        onClick={() => onAdvanceDealStage(deal.id)}
                        className="text-[10px] bg-white hover:bg-[#E9E9E0] text-[#5A5A40] border border-[#E5E5DE] px-2 py-0.5 rounded-md font-medium cursor-pointer"
                      >
                        Advance
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-[#E5E5DE] text-xs">
              <span className="text-[11px] text-[#8B7E66]">Commercial Win Probability: 68% avg</span>
              <button
                onClick={() => onNavigateTab('crm_marketing')}
                className="text-[11px] text-[#5A5A40] hover:text-[#474732] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Full CRM Pipeline</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      }

      // 17. MARKETING ROI WIDGET
      case 'marketing_roi_widget': {
        const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
        const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
        const totalLeads = campaigns.reduce((s, c) => s + c.leadsGenerated, 0);
        const spentPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#F5F5F0] p-2.5 rounded-xl border border-[#E5E5DE]">
                <span className="text-[10px] text-[#787668] uppercase font-bold block">Ad Spend &amp; Expos</span>
                <span className="text-sm font-mono font-bold text-[#2D2D24]">
                  ${totalSpent.toLocaleString()} / ${totalBudget.toLocaleString()}
                </span>
                <div className="w-full bg-[#E5E5DE] h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-[#5A5A40] h-full rounded-full" style={{ width: `${spentPct}%` }}></div>
                </div>
              </div>

              <div className="bg-[#F5F5F0] p-2.5 rounded-xl border border-[#E5E5DE]">
                <span className="text-[10px] text-[#787668] uppercase font-bold block">Leads Generated</span>
                <span className="text-sm font-mono font-bold text-[#5A5A40]">{totalLeads} OEM Leads</span>
                <span className="text-[10px] text-[#2E6930] block mt-0.5">38.4x Target ROI</span>
              </div>
            </div>

            <div className="space-y-1.5">
              {campaigns.slice(0, 2).map((camp) => (
                <div
                  key={camp.id}
                  className="p-2 bg-[#F9F9F7] rounded-xl border border-[#E5E5DE] text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-[#2D2D24] block">{camp.name}</span>
                    <span className="text-[10px] text-[#8B7E66]">{camp.channel} • {camp.leadsGenerated} leads</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#5A5A40] block">{camp.roiMultiplier}x ROI</span>
                    <span className="text-[10px] text-[#787668]">${camp.spent.toLocaleString()} spent</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-[#E5E5DE] text-xs">
              <span className="text-[11px] text-[#8B7E66]">Attribution model: Multi-touch Industrial</span>
              <button
                onClick={() => onNavigateTab('crm_marketing')}
                className="text-[11px] text-[#5A5A40] hover:text-[#474732] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Attribution Analytics</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      }

      // 18. TREND LINE CHART
      case 'chart_line_metric': {
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#787668] uppercase font-bold block">Rolling 12-Hour Telemetry</span>
                <span className="text-base font-mono font-bold text-[#2D2D24]">89.4% Current Output</span>
              </div>
              <span className="text-[10px] bg-[#5A5A40]/10 text-[#5A5A40] px-2 py-0.5 rounded-full font-semibold">
                +4.2% vs target
              </span>
            </div>
            <div className="h-28 w-full bg-[#F5F5F0] rounded-2xl p-2 flex items-end relative overflow-hidden border border-[#E5E5DE]">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 110 50">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5A5A40" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#5A5A40" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon
                  points="0,50 0,32 10,28 20,30 30,22 40,19 50,21 60,16 70,18 80,12 90,15 100,9 110,11 110,50"
                  fill="url(#lineGrad)"
                />
                <polyline
                  fill="none"
                  stroke="#5A5A40"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,32 10,28 20,30 30,22 40,19 50,21 60,16 70,18 80,12 90,15 100,9 110,11"
                />
              </svg>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-[#8B7E66]">
              <span>08:00 AM (Start)</span>
              <span>12:00 PM</span>
              <span>08:00 PM (Live)</span>
            </div>
          </div>
        );
      }

      // 19. CATEGORY BREAKDOWN BAR CHART
      case 'chart_bar_breakdown': {
        const barData = [
          { label: 'CNC Bay A', value: 92, target: 85, color: '#5A5A40' },
          { label: 'CNC Bay B', value: 88, target: 85, color: '#5A5A40' },
          { label: 'Bay C (Tooling)', value: 74, target: 85, color: '#B85D36' },
          { label: 'SMT Cleanroom', value: 94, target: 90, color: '#2E6930' },
          { label: 'Final Assembly', value: 86, target: 85, color: '#5A5A40' },
        ];
        return (
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] text-[#8B7E66] uppercase font-bold">
              <span>Cell / Bay</span>
              <span>Throughput / Target (85%)</span>
            </div>
            <div className="space-y-2">
              {barData.map((b) => (
                <div key={b.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#2D2D24]">{b.label}</span>
                    <span className="font-mono text-[#5A5A40] font-bold">{b.value}%</span>
                  </div>
                  <div className="w-full bg-[#E5E5DE] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${b.value}%`, backgroundColor: b.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 20. DONUT / PIE DISTRIBUTION
      case 'chart_pie_distribution': {
        const slices = [
          { name: 'Completed & Staged', count: 18, pct: 45, color: '#5A5A40' },
          { name: 'In Assembly WIP', count: 14, pct: 35, color: '#8B7E66' },
          { name: 'Quality Inspection', count: 5, pct: 12, color: '#2E6930' },
          { name: 'Scheduled Backlog', count: 3, pct: 8, color: '#B85D36' },
        ];
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full border-8 border-[#5A5A40] border-t-[#8B7E66] border-r-[#2E6930] border-b-[#B85D36] shrink-0 flex items-center justify-center shadow-xs">
                <span className="text-xs font-mono font-bold text-[#2D2D24]">40 WOs</span>
              </div>
              <div className="space-y-1.5 flex-1">
                {slices.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }}></span>
                      <span className="text-[#2D2D24] truncate max-w-[130px]">{s.name}</span>
                    </div>
                    <span className="font-mono font-bold text-[#5A5A40]">{s.count} ({s.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      // 21. HOURLY SHIFT HEATMAP MATRIX
      case 'chart_heatmap_activity': {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
        const shifts = ['Alpha (06-14)', 'Bravo (14-22)', 'Night (22-06)'];
        const matrix = [
          [3, 4, 2],
          [4, 4, 3],
          [4, 3, 2],
          [3, 4, 3],
          [4, 2, 1],
        ];
        const getColor = (level: number) => {
          if (level === 4) return 'bg-[#5A5A40] text-white';
          if (level === 3) return 'bg-[#8B7E66] text-white';
          if (level === 2) return 'bg-[#D1CFBF] text-[#2D2D24]';
          return 'bg-[#EFEFEA] text-[#787668]';
        };

        return (
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-[10px] text-[#8B7E66] uppercase font-bold">
              <span>Day</span>
              <div className="flex gap-4">
                {shifts.map((sh) => (
                  <span key={sh}>{sh}</span>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              {days.map((day, dIdx) => (
                <div key={day} className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#2D2D24] w-8">{day}</span>
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    {matrix[dIdx].map((val, sIdx) => (
                      <div
                        key={sIdx}
                        className={`h-7 rounded-xl flex items-center justify-center font-mono text-[10px] font-bold ${getColor(
                          val
                        )}`}
                      >
                        {val === 4 ? 'Peak' : val === 3 ? 'High' : val === 2 ? 'Normal' : 'Idle'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 22. RADIAL UTILIZATION & CAPACITY GAUGE
      case 'chart_gauge_capacity': {
        const capacityPct = 86;
        return (
          <div className="flex flex-col items-center justify-center py-2 space-y-2 text-center">
            <div className="relative w-32 h-20 overflow-hidden flex items-end justify-center">
              <div className="w-28 h-28 rounded-full border-8 border-[#E5E5DE] border-t-[#5A5A40] border-r-[#5A5A40] border-l-[#5A5A40] rotate-[35deg]"></div>
              <div className="absolute bottom-0 flex flex-col items-center">
                <span className="text-2xl font-mono font-bold text-[#2D2D24]">{capacityPct}%</span>
                <span className="text-[10px] text-[#787668] font-bold uppercase">Optimal Band</span>
              </div>
            </div>
            <div className="text-xs text-[#787668] max-w-[240px]">
              Cell operating within safe thermal envelope. Headroom: <span className="font-mono font-bold text-[#5A5A40]">14%</span> before secondary line dispatch.
            </div>
          </div>
        );
      }

      // 23. CONVERSION FUNNEL DIAGRAM
      case 'chart_funnel_pipeline': {
        const funnelSteps = [
          { stage: 'Inbound Inquiries & Expos', count: 128, dropPct: '100%' },
          { stage: 'Engineering RFQ Qualified', count: 64, dropPct: '50%' },
          { stage: 'Sample Prototyping Passed', count: 32, dropPct: '25%' },
          { stage: 'OEM Master Contract Won', count: 18, dropPct: '14%' },
        ];
        return (
          <div className="space-y-2">
            {funnelSteps.map((st, idx) => (
              <div
                key={st.stage}
                className="bg-[#F5F5F0] border border-[#E5E5DE] p-2 rounded-xl flex items-center justify-between text-xs"
                style={{ marginLeft: `${idx * 8}px`, marginRight: `${idx * 8}px` }}
              >
                <span className="font-semibold text-[#2D2D24]">{st.stage}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#5A5A40]">{st.count} Deals</span>
                  <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-[#E5E5DE] text-[#787668]">
                    {st.dropPct}
                  </span>
                </div>
              </div>
            ))}
          </div>
        );
      }

      // 24. GEOSPATIAL LOGISTICS MAP
      case 'geospatial_map_fleet': {
        return (
          <div className="space-y-3">
            <div className="bg-[#2D2D24] rounded-2xl p-4 text-[#E9E9E0] relative overflow-hidden border border-[#5A5A40]/30 min-h-[140px] flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-[#A09E8E] font-bold uppercase">Active Freight Corridors</span>
                  <h4 className="text-sm font-serif italic text-white mt-0.5">Pacific &amp; Trans-Atlantic Supply Lines</h4>
                </div>
                <span className="text-[10px] bg-[#5A5A40] text-white px-2 py-0.5 rounded-full font-mono">
                  4 Vessels En Route
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-[#3D3D32]">
                <div className="bg-[#3D3D32] p-2 rounded-xl">
                  <span className="text-[10px] text-[#A09E8E] block">Port of LA</span>
                  <span className="font-mono font-bold text-white">ETA 2 Days</span>
                </div>
                <div className="bg-[#3D3D32] p-2 rounded-xl">
                  <span className="text-[10px] text-[#A09E8E] block">Rotterdam</span>
                  <span className="font-mono font-bold text-white">Customs Clear</span>
                </div>
                <div className="bg-[#3D3D32] p-2 rounded-xl">
                  <span className="text-[10px] text-[#A09E8E] block">Yokohama Gate</span>
                  <span className="font-mono font-bold text-white">Departed</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-[#787668]">
              <span>GPS Telemetry refresh: 15s</span>
              <button
                onClick={() => onNavigateTab('supply_chain')}
                className="text-[#5A5A40] hover:underline font-semibold cursor-pointer flex items-center gap-1"
              >
                <span>Live Satellite View</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        );
      }

      // 25. SINGLE-VALUE KPI METRIC TILE
      case 'kpi_metric_tile': {
        const val = widget.settings?.kpiValue || '$4.82M';
        const sub = widget.settings?.kpiSubtext || '+12.4% vs past 30 days';
        const trend = widget.settings?.kpiTrend ?? 12.4;
        return (
          <div className="flex flex-col justify-between h-full py-1">
            <div className="flex items-center justify-between">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-[#2D2D24]">{val}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                  trend >= 0 ? 'bg-[#5A5A40]/15 text-[#5A5A40]' : 'bg-[#B85D36]/15 text-[#B85D36]'
                }`}
              >
                {trend >= 0 ? `+${trend}%` : `${trend}%`}
              </span>
            </div>
            <div className="text-xs text-[#787668] mt-2">{sub}</div>
          </div>
        );
      }

      // 26. KPI DELTA COMPARISON CARD
      case 'kpi_comparison_card': {
        const val = widget.settings?.kpiValue || '$1,850,000 / $2,000,000';
        const sub = widget.settings?.kpiSubtext || '92.5% attainment of monthly operating budget';
        return (
          <div className="space-y-3 py-1">
            <div className="flex justify-between items-baseline">
              <span className="text-xl font-mono font-bold text-[#2D2D24]">{val}</span>
              <span className="text-xs font-mono font-bold text-[#5A5A40]">92.5%</span>
            </div>
            <div className="w-full bg-[#E5E5DE] h-2.5 rounded-full overflow-hidden">
              <div className="bg-[#5A5A40] h-full rounded-full" style={{ width: '92.5%' }}></div>
            </div>
            <div className="text-xs text-[#787668]">{sub}</div>
          </div>
        );
      }

      // 27. INTERACTIVE DATA PIVOT TABLE
      case 'interactive_data_pivot_table': {
        return <InteractivePivotTableWidget globalFilter={globalFilter} />;
      }

      // 28. EMBEDDED WEB FRAME (iFRAME)
      case 'rich_media_iframe': {
        const url = widget.settings?.iframeUrl || 'https://example.com/plant-camera-feed';
        return (
          <div className="space-y-2">
            <div className="bg-[#2D2D24] rounded-2xl h-40 flex flex-col items-center justify-center text-center p-4 border border-[#3D3D32]">
              <ExternalLink className="w-6 h-6 text-[#A09E8E] mb-2" />
              <span className="text-xs text-white font-medium">Embedded Secure Industrial Portal / CAD Stream</span>
              <span className="text-[10px] text-[#8B7E66] font-mono mt-1">{url}</span>
              <span className="text-[10px] bg-[#3D3D32] text-[#A09E8E] px-2 py-0.5 rounded-full mt-2">
                Sandbox: allow-scripts allow-same-origin
              </span>
            </div>
          </div>
        );
      }

      // 29. FORMATTED MARKDOWN BLOCK
      case 'rich_markdown_note': {
        const content =
          widget.settings?.markdownContent ||
          `### Standard Operating Protocol - Shift Handoff\n- **Safety**: Ensure emergency stop pull-cords are tested on Bays A & B.\n- **Quality**: Batch #AL-889 requires 100% CMM dimensional inspection.\n- **ERP Sign-off**: Record scrap parts directly in the Digital Traveler before changeover.`;
        return (
          <div className="p-3 bg-[#F9F9F7] rounded-2xl border border-[#E5E5DE] text-xs text-[#2D2D24] space-y-1.5 leading-relaxed font-sans">
            <div className="text-[10px] uppercase font-bold text-[#8B7E66] mb-1">Operating Protocol &amp; Guidelines</div>
            <div className="whitespace-pre-line text-xs text-[#2D2D24]">{content}</div>
          </div>
        );
      }

      // 30. ACTIONABLE BANNER CTA
      case 'rich_banner_cta': {
        return (
          <div className="bg-[#5A5A40] text-white p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Plant-Wide Annual Preventative Maintenance Window</h4>
                <p className="text-xs text-white/80 mt-0.5">
                  Scheduled for this Saturday 02:00 - 08:00 UTC. Secondary lines will absorb high-priority work orders.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('maintenance')}
              className="bg-white hover:bg-[#F5F5F0] text-[#5A5A40] px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors shrink-0 shadow-xs"
            >
              Review Schedule
            </button>
          </div>
        );
      }

      // 31. ACTION BUTTON WORKFLOW TRIGGER
      case 'action_button_workflow': {
        return (
          <div className="flex flex-col justify-center h-full space-y-2">
            <button
              onClick={() => onNavigateTab('workflows')}
              className="w-full bg-[#5A5A40] hover:bg-[#474732] text-white py-3 px-4 rounded-2xl font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Play className="w-4 h-4" />
              <span>Trigger Low-Code Automation</span>
            </button>
            <span className="text-[10px] text-center text-[#787668]">
              Dispatches automated webhook &amp; rebalances active work orders
            </span>
          </div>
        );
      }

      default:
        return <div className="text-xs text-[#8B7E66]">Widget type not recognized.</div>;
    }
  };

  return (
    <div
      id={`widget-${widget.id}`}
      draggable={isEditMode}
      onDragStart={(e) => onDragStart && onDragStart(e, widget.id)}
      onDragOver={(e) => onDragOver && onDragOver(e, widget.id)}
      onDrop={(e) => onDrop && onDrop(e, widget.id)}
      className={`${getColSpanClass(widget.colSpan)} bg-white rounded-3xl border ${
        isDragOver
          ? 'border-[#5A5A40] ring-2 ring-[#5A5A40]/30 shadow-lg'
          : 'border-[#E5E5DE]'
      } p-5 shadow-sm transition-all duration-200 relative group flex flex-col justify-between`}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-[#E5E5DE]">
        <div className="flex items-center gap-2 min-w-0">
          {/* Drag Handle in Edit Mode */}
          {isEditMode && (
            <div
              className="cursor-grab active:cursor-grabbing p-1 rounded-lg hover:bg-[#F5F5F0] text-[#787668]"
              title="Drag to reorder widget in grid"
            >
              <GripVertical className="w-4 h-4" />
            </div>
          )}

          <h3 className="font-serif font-bold text-sm text-[#2D2D24] truncate" title={widget.title}>
            {widget.title}
          </h3>
        </div>

        {/* Edit Controls Toolbar */}
        {isEditMode ? (
          <div className="flex items-center gap-1 shrink-0">
            {/* Move Left / Right for accessibility */}
            <button
              onClick={() => onMove && onMove(widget.id, 'left')}
              className="p-1 rounded-lg hover:bg-[#F5F5F0] text-[#787668] cursor-pointer"
              title="Move Widget Left / Up"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onMove && onMove(widget.id, 'right')}
              className="p-1 rounded-lg hover:bg-[#F5F5F0] text-[#787668] cursor-pointer"
              title="Move Widget Right / Down"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Resize Dropdown */}
            <select
              value={widget.colSpan}
              onChange={(e) =>
                onResize && onResize(widget.id, parseInt(e.target.value) as 1 | 2 | 3 | 4)
              }
              className="text-[10px] bg-[#F5F5F0] border border-[#E5E5DE] rounded-lg px-2 py-0.5 text-[#2D2D24] font-medium outline-hidden cursor-pointer"
              title="Change Column Span"
            >
              <option value={1}>1 Col (25%)</option>
              <option value={2}>2 Col (50%)</option>
              <option value={3}>3 Col (75%)</option>
              <option value={4}>Full Width</option>
            </select>

            {/* Remove Widget */}
            <button
              onClick={() => onRemove && onRemove(widget.id)}
              className="p-1 rounded-lg hover:bg-[#FFF5F5] text-[#B33A3A] cursor-pointer"
              title="Remove widget from dashboard"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5A5A40] animate-pulse" />
            <span className="text-[10px] uppercase tracking-wider text-[#8B7E66] font-bold">
              Live
            </span>
          </div>
        )}
      </div>

      {/* Widget Interactive Body with Per-Widget Error Boundary */}
      <div className="flex-1">
        <WidgetErrorBoundary
          widgetId={widget.id}
          widgetTitle={widget.title}
          onRemove={() => onRemove && onRemove(widget.id)}
        >
          {renderWidgetBody()}
        </WidgetErrorBoundary>
      </div>
    </div>
  );
};
