import React, { useState } from 'react';
import {
  Printer,
  Barcode,
  QrCode,
  X,
  Download,
  CheckCircle2,
  Layers,
} from 'lucide-react';

interface PrintLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSku?: string;
  defaultName?: string;
  defaultLot?: string;
  defaultQty?: number;
}

export const PrintLabelModal: React.FC<PrintLabelModalProps> = ({
  isOpen,
  onClose,
  defaultSku = 'PRD-VALVE-01',
  defaultName = 'Precision Hydraulic Control Valve',
  defaultLot = 'LOT-2026-088',
  defaultQty = 24,
}) => {
  const [sku, setSku] = useState(defaultSku);
  const [name, setName] = useState(defaultName);
  const [lot, setLot] = useState(defaultLot);
  const [qty, setQty] = useState(defaultQty);
  const [binLocation, setBinLocation] = useState('BIN-A4-RACK-02');
  const [inspectorBadge, setInspectorBadge] = useState('QA-449');
  const [labelFormat, setLabelFormat] = useState<'4x6' | '2x4'>('4x6');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2D24]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-[#E5E5DE] shadow-2xl animate-in zoom-in-95 duration-150 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DE]">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#5A5A40]" />
            <h3 className="font-serif font-bold text-lg text-[#2D2D24]">
              Industrial Thermal Barcode Label Generator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F5F5F0] text-[#787668] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Customizable Fields */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[#8B7E66] font-medium block mb-1">Part SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-1.5 text-[#2D2D24] font-mono focus:ring-1 focus:ring-[#5A5A40] outline-hidden"
            />
          </div>
          <div>
            <label className="text-[#8B7E66] font-medium block mb-1">Lot / Batch #</label>
            <input
              type="text"
              value={lot}
              onChange={(e) => setLot(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-1.5 text-[#2D2D24] font-mono focus:ring-1 focus:ring-[#5A5A40] outline-hidden"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[#8B7E66] font-medium block mb-1">Part Description</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-1.5 text-[#2D2D24] focus:ring-1 focus:ring-[#5A5A40] outline-hidden"
            />
          </div>
          <div>
            <label className="text-[#8B7E66] font-medium block mb-1">Quantity</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value) || 0)}
              className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-1.5 text-[#2D2D24] font-mono focus:ring-1 focus:ring-[#5A5A40] outline-hidden"
            />
          </div>
          <div>
            <label className="text-[#8B7E66] font-medium block mb-1">Bin Location</label>
            <input
              type="text"
              value={binLocation}
              onChange={(e) => setBinLocation(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-1.5 text-[#2D2D24] font-mono focus:ring-1 focus:ring-[#5A5A40] outline-hidden"
            />
          </div>
        </div>

        {/* Live Thermal Label Preview Canvas */}
        <div className="bg-[#F5F5F0] p-4 rounded-2xl border border-[#E5E5DE]">
          <div className="text-[10px] uppercase font-bold text-[#8B7E66] mb-2 tracking-wider">
            Print Output Preview (Standard 4" &times; 6" Thermal Direct)
          </div>

          <div className="bg-white p-5 rounded-xl border-2 border-dashed border-[#2D2D24] text-black shadow-xs space-y-3 font-sans">
            <div className="flex justify-between items-start border-b-2 border-black pb-2">
              <div>
                <div className="text-[10px] font-mono font-black uppercase tracking-widest text-[#5A5A40]">
                  VANGUARD PRECISION MFG
                </div>
                <div className="text-sm font-black tracking-tight">{name}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold">QTY: {qty} PCS</div>
                <div className="text-[10px] font-mono">BIN: {binLocation}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono border-b border-black pb-2">
              <div>
                <span className="text-gray-500 block">SKU:</span>
                <span className="font-bold">{sku}</span>
              </div>
              <div>
                <span className="text-gray-500 block">BATCH LOT:</span>
                <span className="font-bold">{lot}</span>
              </div>
              <div>
                <span className="text-gray-500 block">INSP STAMP:</span>
                <span className="font-bold">{inspectorBadge} (PASS)</span>
              </div>
            </div>

            {/* High-Contrast Code-128 Barcode Simulation */}
            <div className="flex flex-col items-center justify-center py-2 space-y-1">
              <svg className="w-full h-12 max-w-[280px]" viewBox="0 0 200 40">
                <rect x="0" y="0" width="4" height="40" fill="#000" />
                <rect x="6" y="0" width="2" height="40" fill="#000" />
                <rect x="10" y="0" width="6" height="40" fill="#000" />
                <rect x="18" y="0" width="2" height="40" fill="#000" />
                <rect x="24" y="0" width="8" height="40" fill="#000" />
                <rect x="34" y="0" width="4" height="40" fill="#000" />
                <rect x="40" y="0" width="2" height="40" fill="#000" />
                <rect x="46" y="0" width="6" height="40" fill="#000" />
                <rect x="56" y="0" width="4" height="40" fill="#000" />
                <rect x="62" y="0" width="8" height="40" fill="#000" />
                <rect x="74" y="0" width="2" height="40" fill="#000" />
                <rect x="80" y="0" width="6" height="40" fill="#000" />
                <rect x="90" y="0" width="4" height="40" fill="#000" />
                <rect x="98" y="0" width="2" height="40" fill="#000" />
                <rect x="104" y="0" width="6" height="40" fill="#000" />
                <rect x="114" y="0" width="8" height="40" fill="#000" />
                <rect x="126" y="0" width="4" height="40" fill="#000" />
                <rect x="134" y="0" width="2" height="40" fill="#000" />
                <rect x="140" y="0" width="6" height="40" fill="#000" />
                <rect x="150" y="0" width="4" height="40" fill="#000" />
                <rect x="158" y="0" width="8" height="40" fill="#000" />
                <rect x="170" y="0" width="2" height="40" fill="#000" />
                <rect x="176" y="0" width="6" height="40" fill="#000" />
                <rect x="186" y="0" width="4" height="40" fill="#000" />
                <rect x="194" y="0" width="6" height="40" fill="#000" />
              </svg>
              <div className="font-mono text-[11px] font-bold tracking-widest text-black">
                *{sku}-{lot}*
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onClose}
            className="text-xs px-4 py-2 rounded-xl text-[#787668] hover:bg-[#F5F5F0] font-medium cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Label</span>
          </button>
        </div>
      </div>
    </div>
  );
};
