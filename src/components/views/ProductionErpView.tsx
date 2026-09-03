import React, { useState } from 'react';
import {
  Factory,
  Layers,
  Plus,
  Clock,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Wrench,
  Search,
  Filter,
  FileSpreadsheet,
  Info,
  ChevronRight,
  Shield,
} from 'lucide-react';
import {
  ProductionLine,
  WorkOrder,
  BillOfMaterialItem,
  RoleDefinition,
} from '../../types';

interface ProductionErpViewProps {
  lines: ProductionLine[];
  workOrders: WorkOrder[];
  bomItems: BillOfMaterialItem[];
  currentRole: RoleDefinition;
  onUpdateLineStatus: (lineId: string, newStatus: ProductionLine['status']) => void;
  onOpenCreateWorkOrder: () => void;
  onUpdateWorkOrderStatus: (orderId: string, newStatus: WorkOrder['status']) => void;
}

export const ProductionErpView: React.FC<ProductionErpViewProps> = ({
  lines,
  workOrders,
  bomItems,
  currentRole,
  onUpdateLineStatus,
  onOpenCreateWorkOrder,
  onUpdateWorkOrderStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'lines' | 'work_orders' | 'bom' | 'erp_flow'>('work_orders');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);

  const canWrite =
    currentRole.permissions.production === 'admin' ||
    currentRole.permissions.production === 'write';

  const filteredOrders = workOrders.filter((wo) => {
    const matchesStatus = statusFilter === 'all' || wo.status === statusFilter;
    const matchesQuery =
      wo.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header & Sub-navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E5DE] p-6 rounded-3xl shadow-sm text-[#2D2D24]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-serif italic font-medium tracking-tight text-[#2D2D24] flex items-center gap-2.5">
              <Factory className="w-5 h-5 text-[#5A5A40]" />
              Production &amp; Line ERP System
            </h1>
            <span className="text-xs bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] px-3 py-0.5 rounded-full font-semibold">
              MES / Floor Control
            </span>
          </div>
          <p className="text-xs text-[#8B7E66] mt-1">
            Manage work order routing, machine line state, bill of materials (BOM), and scrap tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canWrite ? (
            <button
              onClick={onOpenCreateWorkOrder}
              className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-medium px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#E9E9E0]" />
              <span>Create Work Order</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-[#787668] bg-[#F5F5F0] px-3 py-1.5 rounded-xl border border-[#E5E5DE]">
              <Shield className="w-3.5 h-3.5 text-[#8B7E66]" />
              <span>Read-Only (Role Restricted)</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E5DE] text-xs font-semibold gap-2">
        <button
          onClick={() => setActiveTab('work_orders')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'work_orders'
              ? 'border-[#5A5A40] text-[#5A5A40]'
              : 'border-transparent text-[#787668] hover:text-[#2D2D24]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Work Orders ({workOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('lines')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'lines'
              ? 'border-[#5A5A40] text-[#5A5A40]'
              : 'border-transparent text-[#787668] hover:text-[#2D2D24]'
          }`}
        >
          <Factory className="w-4 h-4" />
          <span>Production Lines ({lines.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bom')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'bom'
              ? 'border-[#5A5A40] text-[#5A5A40]'
              : 'border-transparent text-[#787668] hover:text-[#2D2D24]'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Bill of Materials (BOM)</span>
        </button>

        <button
          onClick={() => setActiveTab('erp_flow')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'erp_flow'
              ? 'border-[#5A5A40] text-[#5A5A40]'
              : 'border-transparent text-[#787668] hover:text-[#2D2D24]'
          }`}
        >
          <Gauge className="w-4 h-4" />
          <span>Cross-Module ERP Flow</span>
        </button>
      </div>

      {/* TAB 1: WORK ORDERS */}
      {activeTab === 'work_orders' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-[#E5E5DE] p-4 rounded-3xl shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#A09E8E]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order #, customer, SKU, or batch..."
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2D2D24] placeholder-[#A09E8E] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs text-[#787668] flex items-center gap-1 font-medium">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {['all', 'in_progress', 'quality_check', 'scheduled', 'completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`text-[11px] font-medium px-3 py-1.5 rounded-xl transition-colors capitalize cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#5A5A40] text-white shadow-xs'
                      : 'bg-[#F5F5F0] text-[#787668] hover:bg-[#E9E9E0] hover:text-[#2D2D24]'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Work Orders Table */}
          <div className="bg-white border border-[#E5E5DE] rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#2D2D24]">
                <thead className="bg-[#F5F5F0] text-[#787668] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E5DE]">
                  <tr>
                    <th className="py-3 px-4">Order / Batch</th>
                    <th className="py-3 px-4">Product Name &amp; SKU</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Assigned Line</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4 text-right">Qty Produced</th>
                    <th className="py-3 px-4 text-right">Scrap Rate</th>
                    <th className="py-3 px-4 text-right">Unit Cost</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5DE]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-[#A09E8E]">
                        No work orders found matching the filter.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((wo) => {
                      const assignedLine = lines.find((l) => l.id === wo.assignedLineId);
                      const percentComplete = Math.min(
                        100,
                        Math.round((wo.quantityProduced / (wo.quantityOrdered || 1)) * 100)
                      );
                      const orderScrapPct = (
                        (wo.scrappedUnits / (wo.quantityProduced + wo.scrappedUnits || 1)) * 100
                      ).toFixed(1);

                      return (
                        <tr key={wo.id} className="hover:bg-[#F9F9F7] transition-colors">
                          <td className="py-3.5 px-4 font-mono font-semibold text-[#2D2D24]">
                            <div>{wo.orderNumber}</div>
                            <div className="text-[10px] text-[#A09E8E] font-normal">{wo.batchNumber}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[#2D2D24]">{wo.productName}</div>
                            <div className="text-[10px] font-mono text-[#787668]">{wo.sku}</div>
                          </td>
                          <td className="py-3.5 px-4 text-[#787668] font-medium">{wo.customer}</td>
                          <td className="py-3.5 px-4">
                            <div className="text-[#2D2D24] font-medium">{assignedLine?.name.split(' ')[0] || 'Unassigned'}</div>
                            <div className="text-[10px] text-[#A09E8E] font-mono">{assignedLine?.code}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] px-2.5 py-0.5 rounded-md font-semibold uppercase tracking-wider ${
                                wo.status === 'in_progress'
                                  ? 'bg-[#8B7E66]/20 text-[#5A5A40]'
                                  : wo.status === 'quality_check'
                                  ? 'bg-[#A88846]/20 text-[#6B5528]'
                                  : wo.status === 'completed'
                                  ? 'bg-[#5A5A40]/20 text-[#5A5A40]'
                                  : wo.status === 'scheduled'
                                  ? 'bg-[#E9E9E0] text-[#787668]'
                                  : 'bg-[#E9E9E0] text-[#787668]'
                              }`}
                            >
                              {wo.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${
                                wo.priority === 'urgent'
                                  ? 'text-[#B85D36]'
                                  : wo.priority === 'high'
                                  ? 'text-[#8B7E66]'
                                  : 'text-[#787668]'
                              }`}
                            >
                              {wo.priority}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono">
                            <span className="font-bold text-[#2D2D24]">{wo.quantityProduced}</span>
                            <span className="text-[#A09E8E]"> / {wo.quantityOrdered}</span>
                            <div className="text-[10px] text-[#787668]">{percentComplete}% done</div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono">
                            <span className={Number(orderScrapPct) > 2.0 ? 'text-[#B85D36] font-bold' : 'text-[#787668]'}>
                              {orderScrapPct}%
                            </span>
                            <div className="text-[10px] text-[#A09E8E]">{wo.scrappedUnits} scrap</div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono">
                            <div className="font-semibold text-[#2D2D24]">${wo.actualUnitCost.toFixed(2)}</div>
                            <div className="text-[10px] text-[#A09E8E]">tgt ${wo.unitCostTarget.toFixed(2)}</div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {canWrite && wo.status === 'scheduled' && (
                                <button
                                  onClick={() => onUpdateWorkOrderStatus(wo.id, 'in_progress')}
                                  className="p-1.5 hover:bg-[#E9E9E0] text-[#5A5A40] rounded-lg cursor-pointer"
                                  title="Start Production"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {canWrite && wo.status === 'in_progress' && (
                                <button
                                  onClick={() => onUpdateWorkOrderStatus(wo.id, 'quality_check')}
                                  className="p-1.5 hover:bg-[#E9E9E0] text-[#8B7E66] rounded-lg cursor-pointer"
                                  title="Move to Quality Check"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {canWrite && wo.status === 'quality_check' && (
                                <button
                                  onClick={() => onUpdateWorkOrderStatus(wo.id, 'completed')}
                                  className="p-1.5 hover:bg-[#E9E9E0] text-[#5A5A40] rounded-lg cursor-pointer"
                                  title="Approve & Complete"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedWorkOrder(wo)}
                                className="p-1.5 hover:bg-[#E9E9E0] text-[#A09E8E] hover:text-[#2D2D24] rounded-lg cursor-pointer"
                                title="Inspect Batch Details"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTION LINES */}
      {activeTab === 'lines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lines.map((line) => (
            <div
              key={line.id}
              className="bg-white border border-[#E5E5DE] rounded-3xl p-6 space-y-4 shadow-sm text-[#2D2D24]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#5A5A40]">{line.code}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        line.status === 'running'
                          ? 'bg-[#5A5A40]/15 text-[#5A5A40] border border-[#5A5A40]/20'
                          : line.status === 'bottleneck'
                          ? 'bg-[#B85D36]/15 text-[#B85D36] border border-[#B85D36]/20'
                          : 'bg-[#E9E9E0] text-[#787668]'
                      }`}
                    >
                      {line.status}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-[#2D2D24] mt-1">{line.name}</h3>
                  <p className="text-xs text-[#8B7E66] font-medium">Supervisor: {line.supervisor} • {line.activeShift}</p>
                </div>

                {canWrite && (
                  <div className="flex items-center gap-1 bg-[#F5F5F0] p-1 rounded-xl border border-[#E5E5DE]">
                    <button
                      onClick={() => onUpdateLineStatus(line.id, 'running')}
                      className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        line.status === 'running' ? 'bg-[#5A5A40] text-white' : 'text-[#787668] hover:text-[#2D2D24]'
                      }`}
                      title="Set Line to Running"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onUpdateLineStatus(line.id, 'idle')}
                      className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        line.status === 'idle' ? 'bg-[#8B7E66] text-white' : 'text-[#787668] hover:text-[#2D2D24]'
                      }`}
                      title="Pause Line (Idle)"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onUpdateLineStatus(line.id, 'maintenance')}
                      className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        line.status === 'maintenance' ? 'bg-[#B85D36] text-white' : 'text-[#787668] hover:text-[#2D2D24]'
                      }`}
                      title="Scheduled Maintenance"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Current Job */}
              <div className="p-3.5 bg-[#F9F9F7] border border-[#E5E5DE] rounded-2xl text-xs">
                <span className="text-[#8B7E66] block uppercase text-[10px] tracking-wider font-bold">
                  Active Manufacturing Run
                </span>
                <span className="font-semibold text-[#2D2D24]">{line.currentProduct}</span>
              </div>

              {/* OEE Breakdown Gauge Bar */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-[#787668] font-medium">Overall Equipment Effectiveness (OEE)</span>
                  <span className="font-mono font-bold text-[#2D2D24] text-sm">{line.oeeScore}%</span>
                </div>
                <div className="w-full bg-[#E9E9E0] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#5A5A40] h-full rounded-full"
                    style={{ width: `${line.oeeScore}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs pt-3 border-t border-[#E5E5DE]">
                  <div className="bg-[#F5F5F0] p-2.5 rounded-xl border border-[#E5E5DE]">
                    <span className="text-[#8B7E66] block text-[10px]">Availability</span>
                    <span className="font-mono font-bold text-[#2D2D24]">{line.availability}%</span>
                  </div>
                  <div className="bg-[#F5F5F0] p-2.5 rounded-xl border border-[#E5E5DE]">
                    <span className="text-[#8B7E66] block text-[10px]">Performance</span>
                    <span className="font-mono font-bold text-[#2D2D24]">{line.performance}%</span>
                  </div>
                  <div className="bg-[#F5F5F0] p-2.5 rounded-xl border border-[#E5E5DE]">
                    <span className="text-[#8B7E66] block text-[10px]">Quality</span>
                    <span className="font-mono font-bold text-[#2D2D24]">{line.qualityRate}%</span>
                  </div>
                </div>
              </div>

              {/* Live IoT Sensor Stats */}
              <div className="flex items-center justify-between text-xs text-[#787668] pt-3 border-t border-[#E5E5DE]">
                <span>Vibration: <strong className="text-[#2D2D24] font-mono">{line.vibrationMmS ?? '0.8'} mm/s</strong></span>
                <span>Thermal: <strong className="text-[#2D2D24] font-mono">{line.temperatureC ?? '39.0'}&deg;C</strong></span>
                <span>Output: <strong className="text-[#2D2D24] font-mono">{line.completedUnits} / {line.targetUnits}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: BILL OF MATERIALS (BOM) */}
      {activeTab === 'bom' && (
        <div className="bg-white border border-[#E5E5DE] rounded-3xl overflow-hidden p-6 shadow-sm text-[#2D2D24]">
          <div className="mb-4">
            <h2 className="text-base font-serif italic font-semibold text-[#5A5A40] flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#5A5A40]" />
              Standard Master Bill of Materials (BOM)
            </h2>
            <p className="text-xs text-[#8B7E66] mt-0.5">
              Component breakdowns, unit weights, stock reservations, and supplier pricing contracts
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2D2D24]">
              <thead className="bg-[#F5F5F0] text-[#787668] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E5DE]">
                <tr>
                  <th className="py-3 px-3">Component SKU</th>
                  <th className="py-3 px-3">Component Description</th>
                  <th className="py-3 px-3 text-right">Qty / Assembly</th>
                  <th className="py-3 px-3 text-right">Current Stock</th>
                  <th className="py-3 px-3 text-right">Unit Cost</th>
                  <th className="py-3 px-3">Primary Supplier</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DE]">
                {bomItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F9F9F7]">
                    <td className="py-3.5 px-3 font-mono font-semibold text-[#2D2D24]">{item.componentSku}</td>
                    <td className="py-3.5 px-3 font-medium text-[#2D2D24]">{item.componentName}</td>
                    <td className="py-3.5 px-3 text-right font-mono text-[#787668]">
                      {item.quantityPerAssembly} {item.unit}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-[#2D2D24]">
                      {item.currentStock.toLocaleString()} {item.unit}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-[#5A5A40] font-semibold">
                      ${item.unitCost.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-[#787668]">{item.supplier}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-[#5A5A40]/15 text-[#5A5A40]">
                        Allocated
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ERP CROSS-FUNCTIONAL FLOW AUDIT */}
      {activeTab === 'erp_flow' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 shadow-sm text-[#2D2D24] space-y-4">
            <div>
              <h2 className="text-base font-serif italic font-semibold text-[#5A5A40] flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[#5A5A40]" />
                End-to-End Manufacturing ERP Traceability Flow
              </h2>
              <p className="text-xs text-[#8B7E66] mt-0.5">
                Complete closed-loop enterprise flow: Commercial Demand &rarr; Production Planning &rarr; Material Requirements &rarr; Shop Execution &rarr; Financial Settlement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 pt-2">
              <div className="bg-[#F5F5F0] border border-[#E5E5DE] p-3.5 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#8B7E66] uppercase">1. Commercial</span>
                  <span className="w-2 h-2 rounded-full bg-[#5A5A40]"></span>
                </div>
                <h4 className="font-bold text-xs text-[#2D2D24]">CRM &amp; RFQ Won</h4>
                <p className="text-[11px] text-[#787668]">Customer scope, specifications, target delivery date.</p>
                <div className="text-[10px] font-mono text-[#5A5A40] pt-1">Syncs with CRM Pipeline</div>
              </div>

              <div className="bg-[#F5F5F0] border border-[#E5E5DE] p-3.5 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#8B7E66] uppercase">2. Order ERP</span>
                  <span className="w-2 h-2 rounded-full bg-[#5A5A40]"></span>
                </div>
                <h4 className="font-bold text-xs text-[#2D2D24]">Work Order Release</h4>
                <p className="text-[11px] text-[#787668]">Routing, assigned cell bay, priority scheduling.</p>
                <div className="text-[10px] font-mono text-[#5A5A40] pt-1">{workOrders.length} Active Orders</div>
              </div>

              <div className="bg-[#F5F5F0] border border-[#E5E5DE] p-3.5 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#8B7E66] uppercase">3. BOM &amp; MRP</span>
                  <span className="w-2 h-2 rounded-full bg-[#5A5A40]"></span>
                </div>
                <h4 className="font-bold text-xs text-[#2D2D24]">Materials Explosion</h4>
                <p className="text-[11px] text-[#787668]">Part requirements, scrap factor, auto PO drafting.</p>
                <div className="text-[10px] font-mono text-[#5A5A40] pt-1">Multi-Level Tree</div>
              </div>

              <div className="bg-[#F5F5F0] border border-[#E5E5DE] p-3.5 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#8B7E66] uppercase">4. Sourcing</span>
                  <span className="w-2 h-2 rounded-full bg-[#5A5A40]"></span>
                </div>
                <h4 className="font-bold text-xs text-[#2D2D24]">Inbound Logistics</h4>
                <p className="text-[11px] text-[#787668]">PO tracking, customs clearance, warehouse binning.</p>
                <div className="text-[10px] font-mono text-[#5A5A40] pt-1">GPS Telemetry</div>
              </div>

              <div className="bg-[#F5F5F0] border border-[#E5E5DE] p-3.5 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#8B7E66] uppercase">5. Execution</span>
                  <span className="w-2 h-2 rounded-full bg-[#5A5A40]"></span>
                </div>
                <h4 className="font-bold text-xs text-[#2D2D24]">Shop Digital Traveler</h4>
                <p className="text-[11px] text-[#787668]">CMM tolerances, operator torque, QA sign-off.</p>
                <div className="text-[10px] font-mono text-[#5A5A40] pt-1">Paperless SOP</div>
              </div>

              <div className="bg-[#F5F5F0] border border-[#E5E5DE] p-3.5 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#8B7E66] uppercase">6. Accounting</span>
                  <span className="w-2 h-2 rounded-full bg-[#5A5A40]"></span>
                </div>
                <h4 className="font-bold text-xs text-[#2D2D24]">Invoicing &amp; GL</h4>
                <p className="text-[11px] text-[#787668]">COGS absorption, AR invoice, balancing journal entry.</p>
                <div className="text-[10px] font-mono text-[#5A5A40] pt-1">Double-Entry Ledger</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 shadow-sm text-[#2D2D24] space-y-3">
              <span className="text-xs font-bold text-[#8B7E66] uppercase">Manufacturing Cell Health</span>
              <div className="text-2xl font-mono font-bold text-[#5A5A40]">
                {lines.filter((l) => l.status === 'running').length} / {lines.length} Lines Active
              </div>
              <p className="text-xs text-[#787668]">
                Average plant floor OEE currently operating at 86.4%, exceeding world-class manufacturing standards.
              </p>
            </div>

            <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 shadow-sm text-[#2D2D24] space-y-3">
              <span className="text-xs font-bold text-[#8B7E66] uppercase">Schedule Adherence</span>
              <div className="text-2xl font-mono font-bold text-[#2D2D24]">
                97.2% On-Time
              </div>
              <p className="text-xs text-[#787668]">
                Work order batch schedules dynamically buffered against inbound vendor freight lead times.
              </p>
            </div>

            <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 shadow-sm text-[#2D2D24] space-y-3">
              <span className="text-xs font-bold text-[#8B7E66] uppercase">Cost Absorption Tracking</span>
              <div className="text-2xl font-mono font-bold text-[#5A5A40]">
                94.8% Attainment
              </div>
              <p className="text-xs text-[#787668]">
                Standard hour absorption on CNC and Stamping cells closely aligned with General Ledger COGS bookings.
              </p>
            </div>
          </div>
        </div>
      )}
      {selectedWorkOrder && (
        <div className="fixed inset-0 z-50 bg-[#2D2D24]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl max-w-lg w-full p-6 text-[#2D2D24] space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E5E5DE] pb-3">
              <div>
                <span className="text-[11px] font-mono text-[#8B7E66] uppercase tracking-wider font-semibold">
                  Batch Inspection &amp; Telemetry
                </span>
                <h3 className="text-lg font-serif italic font-semibold text-[#5A5A40]">{selectedWorkOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedWorkOrder(null)}
                className="text-[#8B7E66] hover:text-[#2D2D24] text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#F5F5F0] border border-[#E5E5DE] p-3 rounded-2xl">
                <span className="text-[#8B7E66] block text-[10px]">Product / Part</span>
                <span className="font-semibold text-[#2D2D24]">{selectedWorkOrder.productName}</span>
                <span className="block font-mono text-[11px] text-[#787668]">{selectedWorkOrder.sku}</span>
              </div>
              <div className="bg-[#F5F5F0] border border-[#E5E5DE] p-3 rounded-2xl">
                <span className="text-[#8B7E66] block text-[10px]">Customer / Account</span>
                <span className="font-semibold text-[#2D2D24]">{selectedWorkOrder.customer}</span>
                <span className="block text-[11px] text-[#787668]">Due: {selectedWorkOrder.dueDate}</span>
              </div>
            </div>

            <div className="bg-[#F5F5F0] border border-[#E5E5DE] p-4 rounded-2xl text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-[#787668]">Quantity Ordered:</span>
                <span className="font-mono text-[#2D2D24] font-semibold">{selectedWorkOrder.quantityOrdered} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#787668]">Quantity Produced:</span>
                <span className="font-mono text-[#5A5A40] font-bold">{selectedWorkOrder.quantityProduced} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#787668]">Scrapped / Non-Conforming:</span>
                <span className="font-mono text-[#B85D36] font-semibold">{selectedWorkOrder.scrappedUnits} units</span>
              </div>
              <div className="flex justify-between border-t border-[#E5E5DE] pt-2">
                <span className="text-[#787668]">Unit Cost Actual vs Target:</span>
                <span className="font-mono text-[#2D2D24] font-semibold">
                  ${selectedWorkOrder.actualUnitCost.toFixed(2)} / target ${selectedWorkOrder.unitCostTarget.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="text-right">
              <button
                onClick={() => setSelectedWorkOrder(null)}
                className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white px-4 py-2 rounded-xl font-medium cursor-pointer shadow-xs"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
