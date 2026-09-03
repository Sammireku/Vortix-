import React, { useState } from 'react';
import { Layers, X, Plus } from 'lucide-react';
import { WorkOrder, ProductionLine } from '../../types';

interface CreateWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  lines: ProductionLine[];
  onCreate: (order: WorkOrder) => void;
}

export const CreateWorkOrderModal: React.FC<CreateWorkOrderModalProps> = ({
  isOpen,
  onClose,
  lines,
  onCreate,
}) => {
  const [productName, setProductName] = useState('Titanium Medical Bone Plate 40mm');
  const [sku, setSku] = useState('MED-BPL-40MM');
  const [customer, setCustomer] = useState('Stryker Orthopedics');
  const [quantityOrdered, setQuantityOrdered] = useState(1200);
  const [assignedLineId, setAssignedLineId] = useState(lines[0]?.id || 'line-1');
  const [priority, setPriority] = useState<WorkOrder['priority']>('high');
  const [dueDate, setDueDate] = useState('2026-09-22');
  const [unitCostTarget, setUnitCostTarget] = useState(14.5);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newWo: WorkOrder = {
      id: `wo-${Date.now().toString().slice(-4)}`,
      orderNumber: `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      productName,
      sku,
      batchNumber: `LOT-2026-B${Math.floor(10 + Math.random() * 90)}`,
      customer,
      assignedLineId,
      quantityOrdered: Number(quantityOrdered),
      quantityProduced: 0,
      scrappedUnits: 0,
      status: 'scheduled',
      priority,
      startDate: new Date().toISOString().split('T')[0],
      dueDate,
      unitCostTarget: Number(unitCostTarget),
      actualUnitCost: Number(unitCostTarget) * 0.98,
      billOfMaterialsId: 'bom-01',
    };
    onCreate(newWo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2D24]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E5DE] rounded-3xl max-w-lg w-full p-6 text-[#2D2D24] space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E5E5DE] pb-3">
          <h3 className="font-serif italic font-semibold text-[#2D2D24] text-base flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#5A5A40]" />
            Create Manufacturing Work Order
          </h3>
          <button onClick={onClose} className="text-[#787668] hover:text-[#2D2D24] text-lg font-bold cursor-pointer">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-[#2D2D24] font-semibold mb-1">Product Description</label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#2D2D24] font-semibold mb-1">Product SKU</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] font-mono focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
            <div>
              <label className="block text-[#2D2D24] font-semibold mb-1">OEM Customer / Account</label>
              <input
                type="text"
                required
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#2D2D24] font-semibold mb-1">Order Quantity (Units)</label>
              <input
                type="number"
                required
                value={quantityOrdered}
                onChange={(e) => setQuantityOrdered(Number(e.target.value))}
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] font-mono focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
            <div>
              <label className="block text-[#2D2D24] font-semibold mb-1">Target Unit Cost ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={unitCostTarget}
                onChange={(e) => setUnitCostTarget(Number(e.target.value))}
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] font-mono focus:outline-none focus:border-[#5A5A40]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#2D2D24] font-semibold mb-1">Assigned Machine Line</label>
              <select
                value={assignedLineId}
                onChange={(e) => setAssignedLineId(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
              >
                {lines.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.code} - {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#2D2D24] font-semibold mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#2D2D24] font-semibold mb-1">Target Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
            />
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
              Create Work Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
