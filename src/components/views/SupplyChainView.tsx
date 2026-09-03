import React, { useState } from 'react';
import {
  Truck,
  Ship,
  Plane,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Navigation,
  RefreshCw,
  Search,
  Filter,
  BarChart3,
  Award,
} from 'lucide-react';
import { Shipment, SupplierScorecard, RoleDefinition } from '../../types';

interface SupplyChainViewProps {
  shipments: Shipment[];
  suppliers: SupplierScorecard[];
  currentRole: RoleDefinition;
  onRefreshTracking: () => void;
  onSimulateCustomsClearance: (shipmentId: string) => void;
}

export const SupplyChainView: React.FC<SupplyChainViewProps> = ({
  shipments,
  suppliers,
  currentRole,
  onRefreshTracking,
  onSimulateCustomsClearance,
}) => {
  const [selectedShipment, setSelectedShipment] = useState<Shipment>(shipments[0]);
  const [activeTab, setActiveTab] = useState<'tracking' | 'suppliers'>('tracking');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredShipments = shipments.filter(
    (s) =>
      s.trackingNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.supplier.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.materialType.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E5DE] p-6 rounded-3xl shadow-sm text-[#2D2D24]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-serif italic font-medium tracking-tight text-[#2D2D24] flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-[#5A5A40]" />
              Real-Time Supply Chain Tracking &amp; Vendor Radar
            </h1>
            <span className="text-xs bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] px-3 py-0.5 rounded-full font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5A5A40] animate-pulse"></span>
              Live GPS Feed
            </span>
          </div>
          <p className="text-xs text-[#8B7E66] mt-1">
            End-to-end inbound material visibility, carrier transit stages, customs clearance, and supplier performance scorecards.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefreshTracking}
            className="text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] font-medium px-4 py-2 rounded-xl border border-[#E5E5DE] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>Poll Live Carriers</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E5DE] text-xs font-semibold gap-2">
        <button
          onClick={() => setActiveTab('tracking')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'tracking'
              ? 'border-[#5A5A40] text-[#5A5A40]'
              : 'border-transparent text-[#787668] hover:text-[#2D2D24]'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Active Inbound Freights ({shipments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'suppliers'
              ? 'border-[#5A5A40] text-[#5A5A40]'
              : 'border-transparent text-[#787668] hover:text-[#2D2D24]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Supplier Scorecards ({suppliers.length})</span>
        </button>
      </div>

      {activeTab === 'tracking' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Shipment List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#A09E8E]" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by tracking #, supplier, material..."
                className="w-full bg-white border border-[#E5E5DE] rounded-2xl pl-9 pr-3 py-2 text-xs text-[#2D2D24] placeholder-[#A09E8E] focus:outline-none focus:border-[#5A5A40] shadow-xs"
              />
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredShipments.map((shipment) => {
                const isSelected = selectedShipment.id === shipment.id;
                const isHighRisk = shipment.riskFactor === 'high';
                const isCustomsHold = shipment.status === 'customs_hold';

                return (
                  <div
                    key={shipment.id}
                    onClick={() => setSelectedShipment(shipment)}
                    className={`p-4 rounded-3xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#F9F9F7] border-[#8B7E66] shadow-sm'
                        : 'bg-white border-[#E5E5DE] hover:border-[#8B7E66]/50 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#2D2D24] flex items-center gap-1.5">
                        {shipment.carrier.includes('Ocean') ? (
                          <Ship className="w-3.5 h-3.5 text-[#5A5A40]" />
                        ) : shipment.carrier.includes('Air') ? (
                          <Plane className="w-3.5 h-3.5 text-[#8B7E66]" />
                        ) : (
                          <Truck className="w-3.5 h-3.5 text-[#5A5A40]" />
                        )}
                        {shipment.trackingNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          isCustomsHold
                            ? 'bg-[#B85D36]/15 text-[#B85D36] border border-[#B85D36]/20'
                            : shipment.status === 'out_for_delivery'
                            ? 'bg-[#5A5A40]/15 text-[#5A5A40] border border-[#5A5A40]/20'
                            : 'bg-[#E9E9E0] text-[#787668]'
                        }`}
                      >
                        {shipment.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-semibold text-sm text-[#2D2D24] mt-2 truncate">{shipment.materialType}</h3>
                    <div className="flex items-center justify-between text-xs text-[#787668] mt-1">
                      <span>{shipment.supplier}</span>
                      <span className="font-mono text-[#2D2D24] font-medium">{shipment.quantityUnits}</span>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#E5E5DE] flex items-center justify-between text-[11px]">
                      <span className="text-[#787668]">ETA: <strong className="text-[#2D2D24]">{shipment.eta}</strong></span>
                      {isHighRisk && (
                        <span className="text-[#B85D36] flex items-center gap-1 font-semibold">
                          <AlertTriangle className="w-3 h-3" /> Risk Alert
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Shipment Map & Stage Visualizer (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#E5E5DE] rounded-3xl p-6 space-y-6 shadow-sm text-[#2D2D24]">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-[#5A5A40]">
                    {selectedShipment.carrier}
                  </span>
                  <span className="text-xs text-[#8B7E66]">• Departed {selectedShipment.departureDate}</span>
                </div>
                <h2 className="text-lg font-serif italic font-semibold text-[#2D2D24] mt-0.5">{selectedShipment.materialType}</h2>
                <p className="text-xs text-[#787668]">
                  Shipper: {selectedShipment.supplier} • Quantity: {selectedShipment.quantityUnits}
                </p>
              </div>

              {selectedShipment.status === 'customs_hold' && (
                <button
                  onClick={() => onSimulateCustomsClearance(selectedShipment.id)}
                  className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-medium px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Clear Customs
                </button>
              )}
            </div>

            {/* Visual Transit Stage Bar */}
            <div className="bg-[#F5F5F0] p-5 rounded-3xl border border-[#E5E5DE]">
              <div className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider mb-4">
                Shipment Transit Lifecycle
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs relative">
                {/* Step 1 */}
                <div className="space-y-1.5">
                  <div className="w-8 h-8 mx-auto rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    1
                  </div>
                  <span className="font-semibold text-[#2D2D24] block">Origin Dock</span>
                  <span className="text-[10px] text-[#787668] block">{selectedShipment.origin.split(',')[0]}</span>
                </div>

                {/* Step 2 */}
                <div className="space-y-1.5">
                  <div className="w-8 h-8 mx-auto rounded-full bg-[#8B7E66] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    2
                  </div>
                  <span className="font-semibold text-[#2D2D24] block">In Transit</span>
                  <span className="text-[10px] text-[#787668] block">Freight Carrier</span>
                </div>

                {/* Step 3 */}
                <div className="space-y-1.5">
                  <div
                    className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                      selectedShipment.status === 'customs_hold'
                        ? 'bg-[#B85D36] text-white animate-pulse'
                        : selectedShipment.status === 'out_for_delivery' || selectedShipment.status === 'delivered'
                        ? 'bg-[#5A5A40] text-white'
                        : 'bg-[#E9E9E0] text-[#787668] border border-[#E5E5DE]'
                    }`}
                  >
                    3
                  </div>
                  <span className="font-semibold text-[#2D2D24] block">Customs / Port</span>
                  <span className="text-[10px] text-[#787668] block">
                    {selectedShipment.status === 'customs_hold' ? 'Inspection Hold' : 'Cleared'}
                  </span>
                </div>

                {/* Step 4 */}
                <div className="space-y-1.5">
                  <div
                    className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                      selectedShipment.status === 'out_for_delivery'
                        ? 'bg-[#8B7E66] text-white animate-pulse'
                        : selectedShipment.status === 'delivered'
                        ? 'bg-[#5A5A40] text-white'
                        : 'bg-[#E9E9E0] text-[#787668] border border-[#E5E5DE]'
                    }`}
                  >
                    4
                  </div>
                  <span className="font-semibold text-[#2D2D24] block">Receiving Dock</span>
                  <span className="text-[10px] text-[#787668] block">Facility Plant 1</span>
                </div>
              </div>
            </div>

            {/* Simulated Live GPS Radar & Checkpoint Log */}
            <div className="bg-[#F5F5F0] p-5 rounded-3xl border border-[#E5E5DE] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#2D2D24] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#5A5A40]" />
                  Current Geolocation Telemetry
                </span>
                <span className="text-[11px] font-mono text-[#8B7E66]">
                  {selectedShipment.coordinates ? `${selectedShipment.coordinates.lat}° N, ${Math.abs(selectedShipment.coordinates.lng)}° W` : 'Satellite Fix'}
                </span>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-[#E5E5DE] text-xs shadow-xs">
                <div className="font-semibold text-[#2D2D24] flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#5A5A40]" />
                  {selectedShipment.currentLocation}
                </div>
                <div className="text-[#787668] text-[11px] mt-1">
                  Destination: {selectedShipment.destination} • Estimated Delivery: {selectedShipment.eta}
                </div>
              </div>

              {selectedShipment.riskReason && (
                <div className="p-3.5 rounded-2xl bg-[#B85D36]/10 border border-[#B85D36]/30 text-xs text-[#B85D36] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-[#B85D36]" />
                    Automated Supply Chain Risk Alert
                  </div>
                  <p className="text-[11px] text-[#2D2D24]">{selectedShipment.riskReason}</p>
                  <p className="text-[10px] text-[#787668]">
                    Low-code rule "wf-03: Inbound Shipment Delay Risk Compensator" has notified Plant Supervisor.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUPPLIER SCORECARDS */}
      {activeTab === 'suppliers' && (
        <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 space-y-4 shadow-sm text-[#2D2D24]">
          <div>
            <h2 className="text-base font-serif italic font-semibold text-[#5A5A40] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#5A5A40]" />
              Strategic Supplier Quality &amp; On-Time Delivery Ratings
            </h2>
            <p className="text-xs text-[#8B7E66] mt-0.5">
              Continuously audited lead times, incoming defect quotas, and preferred contract tiers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {suppliers.map((sup) => (
              <div
                key={sup.id}
                className="bg-[#F9F9F7] border border-[#E5E5DE] rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-[#2D2D24]">{sup.name}</h3>
                    <span className="text-[11px] text-[#787668]">{sup.category}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      sup.contractStatus === 'preferred'
                        ? 'bg-[#5A5A40]/15 text-[#5A5A40]'
                        : 'bg-[#E9E9E0] text-[#787668]'
                    }`}
                  >
                    {sup.contractStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E5DE] text-xs">
                  <div>
                    <span className="text-[#8B7E66] block text-[10px]">On-Time Delivery</span>
                    <span className="font-mono font-bold text-[#2D2D24]">{sup.onTimeDeliveryRate}%</span>
                  </div>
                  <div>
                    <span className="text-[#8B7E66] block text-[10px]">Quality Rating</span>
                    <span className="font-mono font-bold text-[#5A5A40]">{sup.qualityRating}%</span>
                  </div>
                  <div>
                    <span className="text-[#8B7E66] block text-[10px]">Lead Time</span>
                    <span className="font-mono text-[#2D2D24]">{sup.leadTimeDays} days</span>
                  </div>
                  <div>
                    <span className="text-[#8B7E66] block text-[10px]">Reliability Index</span>
                    <span className="font-mono text-[#2D2D24]">{sup.reliabilityScore} / 100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
