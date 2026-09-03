import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  QrCode,
  Barcode,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Search,
} from 'lucide-react';
import { ViewTab } from '../../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: ViewTab) => void;
  onScanResult?: (code: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onScanResult,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');

  // Preset barcodes for quick simulation on shop-floor
  const presetCodes = [
    { code: 'WO-2026-8801', type: 'Work Order', targetTab: 'digital_traveler' as ViewTab, label: 'WO-2026-8801 (Hydraulic Valve)' },
    { code: 'LOT-2026-088', type: 'Batch Lot', targetTab: 'digital_traveler' as ViewTab, label: 'LOT-2026-088 (Batch Traveler)' },
    { code: 'ELEC-MCU-STM32', type: 'Component SKU', targetTab: 'bom_mrp' as ViewTab, label: 'ELEC-MCU-STM32 (STM32 Chip)' },
    { code: 'CNC-5AX-01', type: 'Machine Cell', targetTab: 'digital_twin' as ViewTab, label: 'CNC-5AX-01 (DMG Mori Mill)' },
    { code: 'EQ-PRS-002', type: 'Maintenance Asset', targetTab: 'maintenance' as ViewTab, label: 'EQ-PRS-002 (300T Stamping Press)' },
  ];

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }
    startCamera();
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      } else {
        setCameraError('Camera API not accessible in this container environment. Use the quick scanner emulator below.');
      }
    } catch (err: any) {
      setCameraError('Camera permission not granted or device camera unavailable. Use the quick scanner below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleScanCode = (code: string) => {
    setScannedCode(code);
    if (onScanResult) onScanResult(code);
  };

  const resolveScannedEntity = (code: string) => {
    const preset = presetCodes.find((p) => p.code.toLowerCase() === code.trim().toLowerCase());
    if (preset) return preset;

    if (code.startsWith('WO-')) {
      return { code, type: 'Work Order', targetTab: 'digital_traveler' as ViewTab, label: `Work Order ${code}` };
    }
    if (code.startsWith('LOT-')) {
      return { code, type: 'Batch Lot', targetTab: 'digital_traveler' as ViewTab, label: `Batch ${code}` };
    }
    if (code.startsWith('CNC-') || code.startsWith('STAMP-') || code.startsWith('SMT-')) {
      return { code, type: 'Machine Cell', targetTab: 'digital_twin' as ViewTab, label: `Machine ${code}` };
    }
    if (code.startsWith('EQ-') || code.startsWith('PM-')) {
      return { code, type: 'Maintenance Asset', targetTab: 'maintenance' as ViewTab, label: `Equipment ${code}` };
    }
    return { code, type: 'Inventory / BOM Item', targetTab: 'bom_mrp' as ViewTab, label: `Part SKU ${code}` };
  };

  if (!isOpen) return null;

  const resolved = scannedCode ? resolveScannedEntity(scannedCode) : null;

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2D24]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-[#E5E5DE] shadow-2xl animate-in zoom-in-95 duration-150 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DE]">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#5A5A40]" />
            <h3 className="font-serif font-bold text-lg text-[#2D2D24]">
              Optical Barcode & QR Code Scanner
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F5F5F0] text-[#787668] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Viewport / Targeting Reticle */}
        <div className="relative bg-[#2D2D24] rounded-2xl overflow-hidden aspect-video flex items-center justify-center border border-[#8B7E66]/40 shadow-inner">
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
            playsInline
            muted
          />

          {!cameraActive && (
            <div className="text-center p-4 text-white/80 space-y-2">
              <Camera className="w-8 h-8 mx-auto text-[#C1C1B8] opacity-60" />
              <div className="text-xs font-medium">Optical Scanner Active</div>
              {cameraError && (
                <div className="text-[11px] text-amber-300 max-w-xs mx-auto">
                  {cameraError}
                </div>
              )}
            </div>
          )}

          {/* Targeting reticle overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-32 border-2 border-[#5A5A40] rounded-xl relative shadow-2xl bg-white/5 backdrop-blur-[1px]">
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400"></div>
              <div className="w-full h-0.5 bg-emerald-400/70 absolute top-1/2 -translate-y-1/2 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Decoded Entity Resolution Result */}
        {resolved && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 animate-in fade-in duration-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                Decoded: {resolved.type}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-800">
                {resolved.code}
              </span>
            </div>
            <div className="text-xs font-bold text-[#2D2D24]">
              {resolved.label}
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  onNavigateTab(resolved.targetTab);
                  onClose();
                }}
                className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Jump to {resolved.type}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Manual Barcode Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter or paste Barcode / QR text..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="flex-1 text-xs bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-[#2D2D24] font-mono focus:ring-1 focus:ring-[#5A5A40] outline-hidden"
          />
          <button
            onClick={() => {
              if (manualCode.trim()) handleScanCode(manualCode.trim());
            }}
            className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Decode
          </button>
        </div>

        {/* Quick Simulator Preset Buttons */}
        <div>
          <label className="text-[11px] text-[#8B7E66] font-medium block mb-2">
            Quick Scan Simulation (Click to simulate shop-floor scan):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presetCodes.map((item) => (
              <button
                key={item.code}
                onClick={() => handleScanCode(item.code)}
                className="text-left p-2.5 rounded-xl border border-[#E5E5DE] hover:border-[#5A5A40] hover:bg-[#F5F5F0] transition-colors cursor-pointer text-xs"
              >
                <div className="font-mono font-bold text-[#5A5A40] text-[11px]">{item.code}</div>
                <div className="text-[10px] text-[#787668] truncate">{item.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
