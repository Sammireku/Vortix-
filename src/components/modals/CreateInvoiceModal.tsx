import React, { useState } from 'react';
import { X, Receipt, Plus, Trash2, DollarSign, Building, Calendar, FileText } from 'lucide-react';
import { Invoice } from '../../types';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<'receivable' | 'payable'>('receivable');
  const [counterparty, setCounterparty] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(
    () => `INV-2026-${Math.floor(100 + Math.random() * 900)}`
  );
  const [amount, setAmount] = useState<number | ''>(18500);
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('2026-10-02');
  const [paymentTerms, setPaymentTerms] = useState<'Net 15' | 'Net 30' | 'Net 60' | 'Due on Receipt'>('Net 30');
  const [referenceOrder, setReferenceOrder] = useState('WO-1002');
  const [lineItemDesc, setLineItemDesc] = useState('Batch Precision Machined Titanium Impellers');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterparty.trim() || !amount || Number(amount) <= 0) return;

    const numAmount = Number(amount);
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNumber.trim() || `INV-${Date.now().toString().slice(-4)}`,
      type,
      counterparty: counterparty.trim(),
      amount: numAmount,
      issueDate,
      dueDate,
      status: 'pending',
      referenceOrder: referenceOrder.trim() || 'PO/WO General',
      paymentTerms,
      taxAmount: Math.round(numAmount * 0.0825),
      lineItems: [
        {
          description: lineItemDesc || 'Manufacturing Deliverables',
          quantity: 1,
          unitPrice: numAmount,
          total: numAmount,
        },
      ],
    };

    onSave(newInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2D24]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-[#E5E5DE] shadow-2xl space-y-4 animate-in fade-in duration-150 text-[#2D2D24]">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DE]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F5F5F0] text-[#5A5A40] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#2D2D24]">
                Issue Commercial Invoice / Bill
              </h3>
              <p className="text-xs text-[#8B7E66]">
                Record Accounts Receivable (AR) or Supplier Bill (AP) in Accounting Ledger
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
          {/* Invoice Type Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F5F5F0] rounded-2xl border border-[#E5E5DE]">
            <button
              type="button"
              onClick={() => {
                setType('receivable');
                setInvoiceNumber(`INV-AR-${Math.floor(100 + Math.random() * 900)}`);
              }}
              className={`py-2 rounded-xl font-semibold transition-all cursor-pointer text-center ${
                type === 'receivable'
                  ? 'bg-white text-[#5A5A40] shadow-xs'
                  : 'text-[#787668] hover:text-[#2D2D24]'
              }`}
            >
              Customer Receivable (AR)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('payable');
                setInvoiceNumber(`BILL-AP-${Math.floor(100 + Math.random() * 900)}`);
              }}
              className={`py-2 rounded-xl font-semibold transition-all cursor-pointer text-center ${
                type === 'payable'
                  ? 'bg-white text-[#B85D36] shadow-xs'
                  : 'text-[#787668] hover:text-[#2D2D24]'
              }`}
            >
              Vendor Bill (AP)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">
                Invoice / Bill Number *
              </label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] font-mono text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">
                {type === 'receivable' ? 'Customer Account *' : 'Vendor / Supplier *'}
              </label>
              <input
                type="text"
                required
                placeholder={type === 'receivable' ? 'e.g. Boeing Aerospace, Tesla Energy' : 'e.g. Allegheny Steel Corp'}
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">
                Invoice Total ($) *
              </label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-[#8B7E66] absolute left-3 top-3" />
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] font-mono font-bold text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">
                Payment Terms
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
              >
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 60">Net 60 Days</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">
                Ref Work/Purchase Order
              </label>
              <input
                type="text"
                placeholder="WO-1002 / PO-7421"
                value={referenceOrder}
                onChange={(e) => setReferenceOrder(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] font-mono text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
              />
            </div>
            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#2D2D24] block mb-1">
              Line Item Scope Description
            </label>
            <input
              type="text"
              value={lineItemDesc}
              onChange={(e) => setLineItemDesc(e.target.value)}
              placeholder="e.g. Precision CNC Machining Lot, Tooling Calibration, Raw Steel Inbound"
              className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
            />
          </div>

          <div className="p-3 bg-[#F5F5F0] border border-[#E5E5DE] rounded-2xl flex items-center justify-between text-xs">
            <span className="text-[#8B7E66]">Estimated Sales Tax (8.25%):</span>
            <span className="font-mono font-bold text-[#2D2D24]">
              ${Math.round((Number(amount) || 0) * 0.0825).toLocaleString()}
            </span>
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
              disabled={!counterparty.trim() || !amount || Number(amount) <= 0}
              className="bg-[#5A5A40] hover:bg-[#474732] disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post to Ledger</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
