import React, { useState } from 'react';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  ArrowDownToLine,
  Warehouse,
  Shield,
  Zap,
} from 'lucide-react';
import { InventoryItem, InventoryCategory, RoleDefinition } from '../../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
  currentRole: RoleDefinition;
  onRestockItem: (itemId: string, quantityToAdd: number) => void;
  onTriggerReorderWorkflow: (item: InventoryItem) => void;
  onOpenAddItemModal: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  currentRole,
  onRestockItem,
  onTriggerReorderWorkflow,
  onOpenAddItemModal,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [restockModalItem, setRestockModalItem] = useState<InventoryItem | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(500);

  const canWrite =
    currentRole.permissions.inventory === 'admin' ||
    currentRole.permissions.inventory === 'write';

  const filteredItems = inventory.filter((item) => {
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.warehouseLocation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalValuation = inventory.reduce(
    (acc, i) => acc + i.quantityOnHand * i.unitCost,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E5DE] p-6 rounded-3xl shadow-sm text-[#2D2D24]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-serif italic font-medium tracking-tight text-[#2D2D24] flex items-center gap-2.5">
              <Boxes className="w-5 h-5 text-[#5A5A40]" />
              Inventory &amp; Lot Control Management
            </h1>
            <span className="text-xs bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] px-3 py-0.5 rounded-full font-semibold">
              WMS / Lot Traceability
            </span>
          </div>
          <p className="text-xs text-[#8B7E66] mt-1">
            Raw materials, work-in-progress (WIP), finished goods, lot quarantine states, and automated reorder points.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <span className="text-[10px] uppercase font-bold text-[#8B7E66] block tracking-wider">Total Valuation</span>
            <span className="text-base font-bold text-[#5A5A40] font-mono">
              ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {canWrite && (
            <button
              onClick={onOpenAddItemModal}
              className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-medium px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#E9E9E0]" />
              <span>Add Stock Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Category Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-[#E5E5DE] p-4 rounded-3xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#A09E8E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU, item name, lot #, or bay..."
            className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2D2D24] placeholder-[#A09E8E] focus:outline-none focus:border-[#5A5A40]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-[#787668] flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {[
            { id: 'all', label: 'All Items' },
            { id: 'raw_material', label: 'Raw Materials' },
            { id: 'wip', label: 'WIP Stages' },
            { id: 'finished_goods', label: 'Finished Goods' },
            { id: 'tooling_supplies', label: 'Tooling & Fasteners' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-[#5A5A40] text-white shadow-xs'
                  : 'bg-[#F5F5F0] text-[#787668] hover:bg-[#E9E9E0] hover:text-[#2D2D24]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-[#E5E5DE] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#2D2D24]">
            <thead className="bg-[#F5F5F0] text-[#787668] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E5DE]">
              <tr>
                <th className="py-3 px-4">Item SKU &amp; Lot</th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Warehouse Bin</th>
                <th className="py-3 px-4 text-right">On Hand Qty</th>
                <th className="py-3 px-4 text-right">Min Safety Stock</th>
                <th className="py-3 px-4 text-right">Unit Cost</th>
                <th className="py-3 px-4 text-right">Total Value</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5DE]">
              {filteredItems.map((item) => {
                const isCritical = item.status === 'critical';
                const isLow = item.status === 'low_stock';
                const itemTotalVal = item.quantityOnHand * item.unitCost;

                return (
                  <tr key={item.id} className="hover:bg-[#F9F9F7] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#2D2D24]">
                      <div>{item.sku}</div>
                      <div className="text-[10px] text-[#A09E8E] font-normal">{item.lotNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#2D2D24]">{item.name}</div>
                      <div className="text-[10px] text-[#787668]">{item.supplier}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F5F5F0] text-[#787668] border border-[#E5E5DE] capitalize">
                        {item.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#787668]">
                      <div className="flex items-center gap-1.5">
                        <Warehouse className="w-3.5 h-3.5 text-[#8B7E66]" />
                        {item.warehouseLocation}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono">
                      <span className={`font-bold ${isCritical ? 'text-[#B85D36]' : isLow ? 'text-[#8B7E66]' : 'text-[#2D2D24]'}`}>
                        {item.quantityOnHand.toLocaleString()}
                      </span>
                      <span className="text-[#A09E8E] text-[10px] block">{item.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#787668]">
                      {item.minSafetyStock.toLocaleString()} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#787668]">
                      ${item.unitCost.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#5A5A40]">
                      ${itemTotalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                          isCritical
                            ? 'bg-[#B85D36]/15 text-[#B85D36]'
                            : isLow
                            ? 'bg-[#8B7E66]/20 text-[#8B7E66]'
                            : 'bg-[#5A5A40]/15 text-[#5A5A40]'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {canWrite && (
                          <>
                            <button
                              onClick={() => {
                                setRestockModalItem(item);
                                setRestockAmount(item.minSafetyStock);
                              }}
                              className="p-1.5 hover:bg-[#E9E9E0] text-[#5A5A40] rounded-lg transition-colors cursor-pointer"
                              title="Receive / Restock Batch"
                            >
                              <ArrowDownToLine className="w-3.5 h-3.5" />
                            </button>
                            {(isLow || isCritical) && (
                              <button
                                onClick={() => onTriggerReorderWorkflow(item)}
                                className="p-1.5 hover:bg-[#E9E9E0] text-[#8B7E66] rounded-lg transition-colors cursor-pointer"
                                title="Run Low-Code Auto PO Trigger"
                              >
                                <Zap className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 bg-[#2D2D24]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl max-w-md w-full p-6 text-[#2D2D24] space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E5E5DE] pb-3">
              <h3 className="font-serif italic font-semibold text-lg text-[#5A5A40]">Receive &amp; Restock Inventory</h3>
              <button
                onClick={() => setRestockModalItem(null)}
                className="text-[#8B7E66] hover:text-[#2D2D24] text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-1 text-xs bg-[#F5F5F0] p-3.5 rounded-2xl border border-[#E5E5DE]">
              <div className="font-semibold text-[#2D2D24]">{restockModalItem.name}</div>
              <div className="font-mono text-[#787668]">SKU: {restockModalItem.sku} • Supplier: {restockModalItem.supplier}</div>
              <div className="text-[#8B7E66] font-medium">Current Qty: {restockModalItem.quantityOnHand} {restockModalItem.unit}</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5A5A40] block">
                Quantity Received ({restockModalItem.unit})
              </label>
              <input
                type="number"
                value={restockAmount}
                onChange={(e) => setRestockAmount(Number(e.target.value))}
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-xs text-[#2D2D24] font-mono focus:outline-none focus:border-[#5A5A40]"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E5E5DE]">
              <button
                onClick={() => setRestockModalItem(null)}
                className="text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] px-4 py-2 rounded-xl font-medium cursor-pointer border border-[#E5E5DE]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRestockItem(restockModalItem.id, restockAmount);
                  setRestockModalItem(null);
                }}
                className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold px-4 py-2 rounded-xl cursor-pointer shadow-xs"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
