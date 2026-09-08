import React, { useState } from 'react';
import {
  X,
  Percent,
  MapPin,
  Check,
  Plus,
  Trash2,
  Edit2,
  ShieldCheck,
  Globe,
  DollarSign,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { PosTaxRegionConfig } from '../../types';

interface PosTaxConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  taxRegions: PosTaxRegionConfig[];
  activeTaxRegion: PosTaxRegionConfig;
  onSelectTaxRegion: (region: PosTaxRegionConfig) => void;
  onSaveTaxRegions: (regions: PosTaxRegionConfig[]) => void;
  onShowNotification?: (title: string, message: string, type?: 'success' | 'warning' | 'info') => void;
}

export const PosTaxConfigModal: React.FC<PosTaxConfigModalProps> = ({
  isOpen,
  onClose,
  taxRegions,
  activeTaxRegion,
  onSelectTaxRegion,
  onSaveTaxRegions,
  onShowNotification,
}) => {
  const [regions, setRegions] = useState<PosTaxRegionConfig[]>(taxRegions);
  const [selectedId, setSelectedId] = useState<string>(activeTaxRegion.id);
  const [isCreatingCustom, setIsCreatingCustom] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for add/edit
  const [formRegionName, setFormRegionName] = useState('');
  const [formTaxLabel, setFormTaxLabel] = useState('Sales & Local Tax');
  const [formRatePercent, setFormRatePercent] = useState<string>('8.25');
  const [formJurisdiction, setFormJurisdiction] = useState('');
  const [formCountryCode, setFormCountryCode] = useState('US');
  const [formNotes, setFormNotes] = useState('');
  const [isExemptMode, setIsExemptMode] = useState(false);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setIsCreatingCustom(true);
    setEditingId(null);
    setFormRegionName('');
    setFormTaxLabel('Sales & Use Tax');
    setFormRatePercent('8.25');
    setFormJurisdiction('State Department of Revenue');
    setFormCountryCode('US');
    setFormNotes('');
    setIsExemptMode(false);
  };

  const handleStartEdit = (region: PosTaxRegionConfig) => {
    setEditingId(region.id);
    setIsCreatingCustom(true);
    setFormRegionName(region.regionName);
    setFormTaxLabel(region.taxLabel);
    setFormRatePercent((region.rate * 100).toFixed(3).replace(/\.?0+$/, ''));
    setFormJurisdiction(region.jurisdiction);
    setFormCountryCode(region.countryCode);
    setFormNotes(region.notes || '');
    setIsExemptMode(region.rate === 0);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRegionName.trim()) {
      onShowNotification?.('Missing Name', 'Please specify a region or jurisdiction name.', 'warning');
      return;
    }

    const rateNum = isExemptMode ? 0 : (parseFloat(formRatePercent) || 0) / 100;

    if (editingId) {
      const updated = regions.map((r) =>
        r.id === editingId
          ? {
              ...r,
              regionName: formRegionName.trim(),
              taxLabel: formTaxLabel.trim(),
              rate: Math.max(0, rateNum),
              jurisdiction: formJurisdiction.trim(),
              countryCode: formCountryCode.trim().toUpperCase(),
              notes: formNotes.trim(),
            }
          : r
      );
      setRegions(updated);
      onSaveTaxRegions(updated);
      if (selectedId === editingId) {
        const found = updated.find((r) => r.id === editingId);
        if (found) onSelectTaxRegion(found);
      }
      onShowNotification?.('Tax Region Updated', `Saved settings for ${formRegionName}.`, 'success');
    } else {
      const newRegion: PosTaxRegionConfig = {
        id: `tax-custom-${Date.now()}`,
        regionName: formRegionName.trim(),
        taxLabel: formTaxLabel.trim(),
        rate: Math.max(0, rateNum),
        jurisdiction: formJurisdiction.trim() || 'Custom Jurisdiction',
        countryCode: formCountryCode.trim().toUpperCase() || 'US',
        notes: formNotes.trim() || 'Custom regional profile',
      };
      const updated = [...regions, newRegion];
      setRegions(updated);
      onSaveTaxRegions(updated);
      setSelectedId(newRegion.id);
      onSelectTaxRegion(newRegion);
      onShowNotification?.('New Tax Region Added', `Created ${newRegion.regionName} (${(newRegion.rate * 100).toFixed(2)}%).`, 'success');
    }

    setIsCreatingCustom(false);
    setEditingId(null);
  };

  const handleDeleteRegion = (id: string, name: string) => {
    if (regions.length <= 1) {
      onShowNotification?.('Action Denied', 'At least one tax region must remain configured.', 'warning');
      return;
    }
    const updated = regions.filter((r) => r.id !== id);
    setRegions(updated);
    onSaveTaxRegions(updated);
    if (selectedId === id) {
      const fallback = updated[0];
      setSelectedId(fallback.id);
      onSelectTaxRegion(fallback);
    }
    onShowNotification?.('Tax Region Removed', `Removed ${name} from regional configurations.`, 'info');
  };

  const handleApplySelected = (region: PosTaxRegionConfig) => {
    setSelectedId(region.id);
    onSelectTaxRegion(region);
    onShowNotification?.(
      'Regional Tax Applied',
      `Terminal set to ${region.regionName} (${region.taxLabel} @ ${(region.rate * 100).toFixed(2)}%).`,
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-base text-[#2D2D24]">Regional Tax Configuration</h3>
              <p className="text-xs text-[#8B7E66]">
                Configure statutory sales tax, VAT, and GST rates for the POS register & invoices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8B7E66] hover:text-[#2D2D24] hover:bg-[#E9E9E0] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Active Banner */}
          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#5A5A40]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#5A5A40] text-white flex items-center justify-center font-bold text-xs">
                {activeTaxRegion.countryCode}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#2D2D24]">{activeTaxRegion.regionName}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Active on Terminal
                  </span>
                </div>
                <div className="text-[11px] text-[#5A5A40]">
                  {activeTaxRegion.taxLabel} &bull; <strong className="font-mono">{(activeTaxRegion.rate * 100).toFixed(2)}%</strong>{' '}
                  ({activeTaxRegion.jurisdiction})
                </div>
              </div>
            </div>

            <div className="text-right text-[11px] text-[#8B7E66] font-mono shrink-0">
              Tax on $100 sale: <strong className="text-[#2D2D24] font-bold">${(100 * activeTaxRegion.rate).toFixed(2)}</strong>
            </div>
          </div>

          {/* Add / Edit Form if active */}
          {isCreatingCustom ? (
            <form
              onSubmit={handleSaveForm}
              className="p-4 rounded-2xl border-2 border-[#5A5A40]/30 bg-[#FCFCFA] space-y-4 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between border-b border-[#E5E5DE] pb-2">
                <span className="font-bold text-sm text-[#2D2D24]">
                  {editingId ? 'Edit Regional Tax Profile' : 'Define New Regional Tax Profile'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingCustom(false);
                    setEditingId(null);
                  }}
                  className="text-xs text-[#8B7E66] hover:text-[#2D2D24] cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1">
                    Region / State Name: *
                  </label>
                  <input
                    type="text"
                    required
                    value={formRegionName}
                    onChange={(e) => setFormRegionName(e.target.value)}
                    placeholder="e.g. Nevada - Clark County, UK - Standard VAT"
                    className="w-full px-3 py-2 bg-white border border-[#E5E5DE] rounded-xl text-xs focus:ring-1 focus:ring-[#5A5A40]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1">
                    Tax Label on Invoices & Receipts: *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTaxLabel}
                    onChange={(e) => setFormTaxLabel(e.target.value)}
                    placeholder="e.g. Sales Tax, VAT, HST/GST"
                    className="w-full px-3 py-2 bg-white border border-[#E5E5DE] rounded-xl text-xs focus:ring-1 focus:ring-[#5A5A40]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-[#2D2D24]">
                      Tax Rate Percentage (%): *
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#5A5A40]">
                      <input
                        type="checkbox"
                        checked={isExemptMode}
                        onChange={(e) => setIsExemptMode(e.target.checked)}
                        className="rounded accent-[#5A5A40]"
                      />
                      <span>Zero Tax / Wholesale</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      max="100"
                      disabled={isExemptMode}
                      value={isExemptMode ? '0.00' : formRatePercent}
                      onChange={(e) => setFormRatePercent(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 bg-white border border-[#E5E5DE] rounded-xl text-xs font-mono disabled:bg-[#F5F5F0]"
                    />
                    <span className="absolute right-3 top-2.5 text-[#8B7E66] font-bold">%</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1">
                    Country Code (2-letter):
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formCountryCode}
                    onChange={(e) => setFormCountryCode(e.target.value.toUpperCase())}
                    placeholder="US, GB, DE, CA, AU, JP"
                    className="w-full px-3 py-2 bg-white border border-[#E5E5DE] rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#2D2D24] mb-1">
                    Jurisdiction / Authority Notes:
                  </label>
                  <input
                    type="text"
                    value={formJurisdiction}
                    onChange={(e) => setFormJurisdiction(e.target.value)}
                    placeholder="e.g. State Comptroller & City District, HMRC, CRA"
                    className="w-full px-3 py-2 bg-white border border-[#E5E5DE] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E5DE]">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingCustom(false);
                    setEditingId(null);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-[#E5E5DE] text-[#8B7E66] hover:bg-[#F5F5F0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#5A5A40] hover:bg-[#474732] text-white font-bold cursor-pointer transition-colors shadow-xs"
                >
                  {editingId ? 'Update Region' : 'Add Tax Region'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#2D2D24] uppercase tracking-wider">
                Available Regional Tax Profiles ({regions.length})
              </span>
              <button
                type="button"
                onClick={handleStartCreate}
                className="px-3 py-1.5 rounded-xl bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Region</span>
              </button>
            </div>
          )}

          {/* Regions Grid List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {regions.map((region) => {
              const isActive = region.id === selectedId;
              return (
                <div
                  key={region.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                    isActive
                      ? 'border-[#5A5A40] bg-[#FAF9F5] shadow-xs ring-2 ring-[#5A5A40]/15'
                      : 'border-[#E5E5DE] bg-white hover:border-[#5A5A40]/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-[#E9E9E0] text-[10px] font-bold text-[#5A5A40]">
                        {region.countryCode}
                      </span>
                      <span className="font-bold text-xs text-[#2D2D24]">{region.regionName}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(region)}
                        className="p-1 rounded text-[#8B7E66] hover:text-[#2D2D24] hover:bg-[#E9E9E0] cursor-pointer"
                        title="Edit region details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRegion(region.id, region.regionName)}
                        className="p-1 rounded text-[#8B7E66] hover:text-red-700 hover:bg-red-50 cursor-pointer"
                        title="Remove tax region"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between text-xs pt-1 border-t border-[#E5E5DE]">
                    <div>
                      <div className="text-[11px] text-[#8B7E66]">{region.taxLabel}</div>
                      <div className="text-[10px] text-[#5A5A40] truncate max-w-[160px]">
                        {region.jurisdiction}
                      </div>
                    </div>
                    <div className="font-mono text-sm font-bold text-[#2D2D24]">
                      {(region.rate * 100).toFixed(2)}%
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <Check className="w-3.5 h-3.5" /> Active Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApplySelected(region)}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#E9E9E0] text-[11px] font-semibold text-[#5A5A40] border border-[#5A5A40]/30 transition-colors cursor-pointer"
                      >
                        Set as Active
                      </button>
                    )}
                    <span className="text-[10px] text-[#8B7E66]">
                      ${(100 * region.rate).toFixed(2)} per $100
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E5E5DE] bg-[#FAF9F5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[#8B7E66]">
            <ShieldCheck className="w-4 h-4 text-[#5A5A40]" />
            <span>Tax adjustments auto-propagate to cart, checkout modal, and invoices</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
