import React, { useState } from 'react';
import {
  GitBranch,
  Layers,
  DollarSign,
  AlertCircle,
  Clock,
  Package,
  ShoppingCart,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Filter,
  CheckCircle2,
  Cpu,
  FileSpreadsheet,
} from 'lucide-react';
import { BomNode, MrpRequirement, RoleDefinition } from '../../types';

interface BomMrpViewProps {
  bomData: BomNode[];
  currentRole: RoleDefinition;
  onDraftPurchaseOrder: (mrpItem: MrpRequirement) => void;
  onExportBomCsv?: () => void;
}

export const BomMrpView: React.FC<BomMrpViewProps> = ({
  bomData,
  currentRole,
  onDraftPurchaseOrder,
  onExportBomCsv,
}) => {
  const [selectedAssemblyId, setSelectedAssemblyId] = useState<string>(bomData[0]?.id || '');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'bom-root-1': true,
    'bom-sub-1': true,
    'bom-sub-2': true,
    'bom-sub-3': true,
  });
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'tree' | 'mrp'>('tree');

  const rootAssembly = bomData.find((b) => b.id === selectedAssemblyId) || bomData[0];

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Flatten BOM tree for calculation
  const flattenBom = (nodes: BomNode[]): BomNode[] => {
    const list: BomNode[] = [];
    const traverse = (item: BomNode) => {
      list.push(item);
      if (item.children) {
        item.children.forEach(traverse);
      }
    };
    nodes.forEach(traverse);
    return list;
  };

  const allItems = rootAssembly ? flattenBom([rootAssembly]) : [];

  // Compute MRP Requirements based on scheduled work order units (e.g. 50 finished goods)
  const scheduledFgUnits = 50;
  const mrpList: MrpRequirement[] = allItems
    .filter((item) => item.level > 0)
    .map((item) => {
      const totalRequired = item.quantityRequired * scheduledFgUnits;
      const netShortage = Math.max(0, totalRequired - (item.currentInventory + item.onOrder));
      return {
        id: `mrp-${item.sku}`,
        sku: item.sku,
        name: item.name,
        totalRequired,
        stockOnHand: item.currentInventory,
        onOrder: item.onOrder,
        netShortage,
        leadTimeDays: item.leadTimeDays,
        supplier: item.supplier,
        estimatedCost: netShortage * item.unitCost,
        unit: item.unit,
        status: netShortage > 0 ? 'shortage' : 'sufficient',
        suggestedOrderDate: '2026-09-04',
      };
    });

  const totalBomCost = rootAssembly?.children?.reduce((acc, sub) => acc + sub.unitCost, 0) || rootAssembly?.unitCost || 0;
  const shortagesCount = mrpList.filter((m) => m.status === 'shortage').length;
  const totalProcurementBudget = mrpList.reduce((acc, m) => acc + (m.status === 'shortage' ? m.estimatedCost : 0), 0);

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: BomNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[node.id] ?? true;

    if (categoryFilter !== 'all' && node.category !== categoryFilter && node.level > 0) {
      return null;
    }

    const isShortage = node.currentInventory < node.reorderPoint;

    return (
      <div key={node.id} className="space-y-1">
        <div
          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
            node.level === 0
              ? 'bg-[#5A5A40]/10 border-[#5A5A40]/30 font-semibold'
              : node.level === 1
              ? 'bg-[#F5F5F0] border-[#E5E5DE] ml-4'
              : 'bg-white border-[#E5E5DE] ml-8'
          }`}
        >
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(node.id)}
                className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-[#E9E9E0] text-[#5A5A40] transition-colors cursor-pointer"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="w-5 h-5 flex items-center justify-center text-[#C1C1B8]">&bull;</div>
            )}

            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#E9E9E0] text-[#5A5A40] font-semibold">
              L{node.level}
            </span>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#2D2D24] truncate">{node.name}</span>
                <span className="text-[10px] font-mono text-[#8B7E66]">{node.sku}</span>
              </div>
              <div className="text-[10px] text-[#787668] flex items-center gap-2">
                <span>Supplier: {node.supplier}</span>
                <span>&bull;</span>
                <span>Lead Time: {node.leadTimeDays}d</span>
                {node.scrapRatePct > 0 && <span>&bull; Scrap: {node.scrapRatePct}%</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-[#8B7E66] block font-sans">Qty / Assy</span>
              <span className="font-semibold text-[#2D2D24]">
                {node.quantityRequired} {node.unit}
              </span>
            </div>

            <div className="text-right w-20">
              <span className="text-[10px] text-[#8B7E66] block font-sans">Unit Cost</span>
              <span className="font-semibold text-[#2D2D24]">${node.unitCost.toFixed(2)}</span>
            </div>

            <div className="text-right w-24">
              <span className="text-[10px] text-[#8B7E66] block font-sans">Warehouse Stock</span>
              <span className={`font-semibold ${isShortage ? 'text-red-600' : 'text-emerald-700'}`}>
                {node.currentInventory} {node.unit}
              </span>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E5DE] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-md bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] font-semibold">
              Engineering & Procurement
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] font-medium font-mono">
              BOM Rev: 4.2.1
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2D2D24] tracking-tight">
            Multi-Level Bill of Materials & MRP Shortage Engine
          </h2>
          <p className="text-xs text-[#787668]">
            Full recursive assembly tree explosion, cost rollups, lead times, and scheduled material shortage replenishment.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Tab Switcher */}
          <div className="flex items-center bg-[#F5F5F0] p-1 rounded-xl border border-[#E5E5DE] text-xs font-medium">
            <button
              onClick={() => setActiveTab('tree')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'tree' ? 'bg-white text-[#5A5A40] shadow-xs font-semibold' : 'text-[#787668]'
              }`}
            >
              Hierarchical Tree
            </button>
            <button
              onClick={() => setActiveTab('mrp')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'mrp' ? 'bg-white text-[#5A5A40] shadow-xs font-semibold' : 'text-[#787668]'
              }`}
            >
              <span>MRP Shortages</span>
              {shortagesCount > 0 && (
                <span className="w-4 h-4 bg-red-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {shortagesCount}
                </span>
              )}
            </button>
          </div>

          {onExportBomCsv && (
            <button
              onClick={onExportBomCsv}
              className="flex items-center gap-1.5 text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE] font-medium px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#5A5A40]" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E5E5DE] shadow-xs">
          <div className="text-[11px] text-[#8B7E66] font-medium">Total Rolled-Up Unit Cost</div>
          <div className="text-2xl font-serif font-bold text-[#2D2D24] mt-1">
            ${totalBomCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#5A5A40] font-medium mt-1">
            Margin at $2,100 MSRP: 30.9%
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E5DE] shadow-xs">
          <div className="text-[11px] text-[#8B7E66] font-medium">Scheduled Run Demand</div>
          <div className="text-2xl font-serif font-bold text-[#2D2D24] mt-1">
            {scheduledFgUnits} <span className="text-sm font-sans font-normal text-[#787668]">Finished Units</span>
          </div>
          <div className="text-[11px] text-[#787668] mt-1">
            Target production: Week 36
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E5DE] shadow-xs">
          <div className="text-[11px] text-[#8B7E66] font-medium">Critical Material Shortages</div>
          <div className="text-2xl font-serif font-bold text-red-600 mt-1">
            {shortagesCount} Items
          </div>
          <div className="text-[11px] text-red-600/80 mt-1 font-medium">
            Immediate PO drafting required
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E5DE] shadow-xs">
          <div className="text-[11px] text-[#8B7E66] font-medium">Estimated Replenishment Cost</div>
          <div className="text-2xl font-serif font-bold text-[#2D2D24] mt-1">
            ${totalProcurementBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#8B7E66] mt-1">
            Weighted lead time: 24 days max
          </div>
        </div>
      </div>

      {activeTab === 'tree' ? (
        /* Hierarchical Multi-Level Tree View */
        <div className="bg-white rounded-2xl border border-[#E5E5DE] shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5DE]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#5A5A40]" />
              <h3 className="font-serif font-bold text-lg text-[#2D2D24]">
                Assembly Breakdown Tree ({rootAssembly?.name})
              </h3>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-[#8B7E66]" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-2.5 py-1 text-[#2D2D24] font-medium focus:ring-1 focus:ring-[#5A5A40] outline-hidden cursor-pointer"
              >
                <option value="all">All Material Types</option>
                <option value="raw_metal">Raw Metals</option>
                <option value="fastener">Fasteners & Seals</option>
                <option value="electronic">Electronics & ICs</option>
                <option value="subassembly">Sub-Assemblies</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {rootAssembly && renderTreeNode(rootAssembly)}
          </div>
        </div>
      ) : (
        /* MRP Material Requirements & Shortage Table */
        <div className="bg-white rounded-2xl border border-[#E5E5DE] shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E5DE] bg-[#F5F5F0]/50 flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2D2D24]">
                MRP Explosion & Auto-Procurement Planning
              </h3>
              <p className="text-xs text-[#787668]">
                Net shortage calculation = Required for 50x FG Units - (Stock on Hand + Already on Order).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E5E5DE] bg-[#F5F5F0] text-[10px] font-bold text-[#8B7E66] uppercase tracking-wider">
                  <th className="py-3 px-4">Component / SKU</th>
                  <th className="py-3 px-4">Required Qty</th>
                  <th className="py-3 px-4">Stock on Hand</th>
                  <th className="py-3 px-4">On Order</th>
                  <th className="py-3 px-4">Net Shortage</th>
                  <th className="py-3 px-4">Lead Time</th>
                  <th className="py-3 px-4">Est. PO Cost</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DE]">
                {mrpList.map((mrp) => {
                  const hasShortage = mrp.status === 'shortage';
                  return (
                    <tr
                      key={mrp.id}
                      className={`hover:bg-[#F5F5F0]/60 transition-colors ${
                        hasShortage ? 'bg-red-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#2D2D24]">{mrp.name}</div>
                        <div className="text-[10px] font-mono text-[#8B7E66]">{mrp.sku} &bull; {mrp.supplier}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-[#2D2D24]">
                        {mrp.totalRequired} {mrp.unit}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#787668]">
                        {mrp.stockOnHand} {mrp.unit}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#787668]">
                        {mrp.onOrder} {mrp.unit}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        {hasShortage ? (
                          <span className="text-red-600 bg-red-100 px-2 py-0.5 rounded-md">
                            -{mrp.netShortage} {mrp.unit}
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Covered
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#787668]">
                        {mrp.leadTimeDays} days
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-[#2D2D24]">
                        ${mrp.estimatedCost.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {hasShortage ? (
                          <button
                            onClick={() => onDraftPurchaseOrder(mrp)}
                            className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Draft PO</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#8B7E66] font-medium flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
