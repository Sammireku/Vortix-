import React, { useState } from 'react';
import { X, Plus, Megaphone, DollarSign, Target, TrendingUp } from 'lucide-react';
import { MarketingCampaign } from '../../types';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (campaign: MarketingCampaign) => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<MarketingCampaign['channel']>('Trade Expo');
  const [budget, setBudget] = useState<number | ''>(25000);
  const [targetLeads, setTargetLeads] = useState<number | ''>(35);
  const [roiMultiplier, setRoiMultiplier] = useState<number>(4.2);
  const [status, setStatus] = useState<MarketingCampaign['status']>('active');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !budget || Number(budget) <= 0) return;

    const newCampaign: MarketingCampaign = {
      id: `camp-${Date.now()}`,
      name: name.trim(),
      channel,
      budget: Number(budget),
      spent: Math.round(Number(budget) * 0.35),
      leadsGenerated: Number(targetLeads) || 15,
      qualifiedDeals: Math.max(1, Math.round((Number(targetLeads) || 15) * 0.4)),
      roiMultiplier,
      status,
    };

    onSave(newCampaign);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2D24]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E5DE] shadow-2xl space-y-4 animate-in fade-in duration-150 text-[#2D2D24]">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DE]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F5F5F0] text-[#5A5A40] flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#2D2D24]">
                Launch B2B Marketing Campaign
              </h3>
              <p className="text-xs text-[#8B7E66]">
                Track demand generation, OEM trade shows, and customer acquisition costs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F5F5F0] text-[#787668] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-[#2D2D24] block mb-1">Campaign Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. IMTS 2026 Chicago Precision Pavilion, AeroSpace ABM"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">Marketing Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
              >
                <option value="Trade Expo">Trade Expo / Industrial Show</option>
                <option value="OEM Direct Outreach">OEM Direct Key Account (ABM)</option>
                <option value="Industry Publications">Technical Publications & Whitepapers</option>
                <option value="Digital B2B">Digital B2B / Industrial Search</option>
                <option value="Supplier Network">Supplier & Distributor Network</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
              >
                <option value="active">Active & Running</option>
                <option value="planned">Planned (Upcoming Quarter)</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">Allocated Budget ($) *</label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-[#8B7E66] absolute left-3 top-3" />
                <input
                  type="number"
                  required
                  min="500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] font-mono font-bold text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">Target Leads</label>
              <input
                type="number"
                min="1"
                value={targetLeads}
                onChange={(e) => setTargetLeads(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] font-mono text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">Target ROI (x)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                value={roiMultiplier}
                onChange={(e) => setRoiMultiplier(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] font-mono text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E5DE]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[#787668] hover:bg-[#F5F5F0] font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !budget || Number(budget) <= 0}
              className="bg-[#5A5A40] hover:bg-[#474732] disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Launch Campaign</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
