import React, { useState } from 'react';
import { X, Plus, Users, DollarSign, Building, Mail, Package, Award } from 'lucide-react';
import { CrmDeal } from '../../types';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deal: CrmDeal) => void;
}

export const CreateDealModal: React.FC<CreateDealModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [dealValue, setDealValue] = useState<number | ''>(85000);
  const [productCategory, setProductCategory] = useState('Aerospace Impellers & Turbine Shrouds');
  const [estimatedUnits, setEstimatedUnits] = useState<number | ''>(120);
  const [probability, setProbability] = useState<number>(50);
  const [stage, setStage] = useState<CrmDeal['stage']>('rfq_review');
  const [assignedRep, setAssignedRep] = useState('Elena Vance (VP Commercial)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !dealValue || Number(dealValue) <= 0) return;

    const newDeal: CrmDeal = {
      id: `deal-${Date.now()}`,
      companyName: companyName.trim(),
      contactPerson: contactPerson.trim() || 'Purchasing Director',
      email: email.trim() || `procurement@${companyName.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      dealValue: Number(dealValue),
      productCategory,
      estimatedUnits: Number(estimatedUnits) || 100,
      probability,
      stage,
      lastActivity: 'RFQ submitted for technical engineering review',
      assignedRep,
    };

    onSave(newDeal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2D24]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-[#E5E5DE] shadow-2xl space-y-4 animate-in fade-in duration-150 text-[#2D2D24]">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DE]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F5F5F0] text-[#5A5A40] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#2D2D24]">
                Register New OEM Deal / RFQ
              </h3>
              <p className="text-xs text-[#8B7E66]">
                Add commercial contract opportunity into the sales pipeline
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">Company / OEM Account *</label>
              <input
                type="text"
                required
                placeholder="e.g. Northrop Grumman, Rivian Automotive"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
              />
            </div>
            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">Contact Person</label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="procurement@oem.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
              />
            </div>
            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">Assigned Sales Lead</label>
              <input
                type="text"
                value={assignedRep}
                onChange={(e) => setAssignedRep(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#2D2D24] block mb-1">Product Scope / Part Category</label>
            <input
              type="text"
              required
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              placeholder="e.g. Medical Titanium Housing, EV Inverter Stator, Hydraulic Valve"
              className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">Contract Value ($) *</label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-[#8B7E66] absolute left-3 top-3" />
                <input
                  type="number"
                  required
                  min="100"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] font-mono font-bold text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">Target Lot Units</label>
              <input
                type="number"
                min="1"
                value={estimatedUnits}
                onChange={(e) => setEstimatedUnits(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] font-mono text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">Win Probability</label>
              <select
                value={probability}
                onChange={(e) => setProbability(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] font-mono text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
              >
                <option value={20}>20% (Early Lead)</option>
                <option value={40}>40% (RFQ Review)</option>
                <option value={60}>60% (Prototyping)</option>
                <option value={80}>80% (Negotiation)</option>
                <option value={100}>100% (Contract Won)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#2D2D24] block mb-1">Sales Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as any)}
              className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
            >
              <option value="lead">Inbound Lead</option>
              <option value="rfq_review">RFQ & Technical Review</option>
              <option value="sample_prototyping">Sample Prototyping & CMM</option>
              <option value="negotiation">Commercial Negotiation</option>
              <option value="won_contract">Won & Ready for ERP Allocation</option>
            </select>
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
              disabled={!companyName.trim() || !dealValue || Number(dealValue) <= 0}
              className="bg-[#5A5A40] hover:bg-[#474732] disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Pipeline</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
