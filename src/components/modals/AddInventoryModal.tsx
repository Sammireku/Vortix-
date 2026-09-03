import React, { useState } from 'react';
import { Boxes, X } from 'lucide-react';
import { InventoryItem, InventoryCategory } from '../../types';

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: InventoryItem) => void;
}

export const AddInventoryModal: React.FC<AddInventoryModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [sku, setSku] = useState('RAW-TI6AL4V-01');
  const [name, setName] = useState('Titanium Ti-6Al-4V Grade 5 Rod 50mm');
  const [category, setCategory] = useState<InventoryCategory>('raw_material');
  const [quantityOnHand, setQuantityOnHand] = useState(1500);
  const [minSafetyStock, setMinSafetyStock] = useState(500);
  const [unit, setUnit] = useState('meters');
  const [unitCost, setUnitCost] = useState(48.5);
  const [warehouseLocation, setWarehouseLocation] = useState('Rack M-04 / Shelf B');
  const [supplier, setSupplier] = useState('ATI Specialty Metals');
  const [lotNumber, setLotNumber] = useState('LOT-TI-2026-90');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: InventoryItem = {
      id: `inv-${Date.now().toString().slice(-4)}`,
      sku,
      name,
      category,
      quantityOnHand: Number(quantityOnHand),
      minSafetyStock: Number(minSafetyStock),
      unit,
      unitCost: Number(unitCost),
      warehouseLocation,
      supplier,
      lotNumber,
      status: Number(quantityOnHand) <= Number(minSafetyStock) ? 'low_stock' : 'optimal',
      lastRestocked: new Date().toISOString().split('T')[0],
    };
    onAdd(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2D24]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E5DE] rounded-3xl max-w-lg w-full p-6 text-[#2D2D24] space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E5DE] pb-3">
          <h3 className="font-serif italic font-semibold text-[#2D2D24] text-base flex items-center gap-2">
            <Boxes className="w-4 h-4 text-[#5A5A40]" />
            Add Inventory / Stock Item
          </h3>
          <button onClick={onClose} className="text-[#787668] hover:text-[#2D2D24] text-lg font-bold cursor-pointer">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#2D2D24] font-semibold mb-1">SKU Code</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] font-mono focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
            <div>
              <label className="block text-[#2D2D24] font-semibold mb-1">Lot / Heat #</label>
              <input
                type="text"
                required
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] font-mono focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#2D2D24] font-semibold mb-1">Item / Material Description</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#2D2D24] font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
              >
                <option value="raw_material">Raw Material</option>
                <option value="wip">Work-In-Progress (WIP)</option>
                <option value="finished_goods">Finished Goods</option>
                <option value="tooling_supplies">Tooling &amp; Fasteners</option>
              </select>
            </div>
            <div>
              <label className="block text-[#2D2D24] font-semibold mb-1">Unit of Measure</label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="meters, kg, units, reels..."
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#2D2D24] font-semibold mb-1">Initial Qty</label>
              <input
                type="number"
                required
                value={quantityOnHand}
                onChange={(e) => setQuantityOnHand(Number(e.target.value))}
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] font-mono focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
            <div>
              <label className="block text-[#2D2D24] font-semibold mb-1">Safety Stock</label>
              <input
                type="number"
                required
                value={minSafetyStock}
                onChange={(e) => setMinSafetyStock(Number(e.target.value))}
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] font-mono focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
            <div>
              <label className="block text-[#2D2D24] font-semibold mb-1">Unit Cost ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] font-mono focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#2D2D24] font-semibold mb-1">Warehouse Location / Bin</label>
              <input
                type="text"
                required
                value={warehouseLocation}
                onChange={(e) => setWarehouseLocation(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
            <div>
              <label className="block text-[#2D2D24] font-semibold mb-1">Primary Supplier</label>
              <input
                type="text"
                required
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E5DE]">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] px-4 py-2 rounded-xl font-medium cursor-pointer border border-[#E5E5DE]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold px-4 py-2 rounded-xl cursor-pointer shadow-xs"
            >
              Save Stock Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
