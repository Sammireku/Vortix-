import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, AlertTriangle, FileSpreadsheet, BookOpen } from 'lucide-react';
import { JournalEntry, ChartOfAccount } from '../../types';

interface PostJournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: ChartOfAccount[];
  onSave: (entry: JournalEntry) => void;
}

interface FormLine {
  id: string;
  accountCode: string;
  debit: number;
  credit: number;
}

export const PostJournalEntryModal: React.FC<PostJournalEntryModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onSave,
}) => {
  const [entryNumber, setEntryNumber] = useState(
    () => `JE-2026-${Math.floor(100 + Math.random() * 900)}`
  );
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('Manufacturing Touch Labor Allocation - Stamping Cell');
  const [referenceDoc, setReferenceDoc] = useState('WO-BATCH-09');

  const [lines, setLines] = useState<FormLine[]>([
    { id: '1', accountCode: '1220', debit: 15400, credit: 0 },
    { id: '2', accountCode: '2110', debit: 0, credit: 15400 },
  ]);

  if (!isOpen) return null;

  const totalDebits = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredits = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01 && totalDebits > 0;

  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      { id: Date.now().toString(), accountCode: accounts[0]?.code || '1010', debit: 0, credit: 0 },
    ]);
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length <= 2) return;
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const handleUpdateLine = (id: string, field: keyof FormLine, value: any) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        return { ...l, [field]: value };
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced || !description.trim()) return;

    const populatedLines = lines.map((l) => {
      const acc = accounts.find((a) => a.code === l.accountCode);
      return {
        id: `jel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        accountCode: l.accountCode,
        accountName: acc ? acc.name : 'Unassigned Account',
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
      };
    });

    const newEntry: JournalEntry = {
      id: `je-${Date.now()}`,
      entryNumber: entryNumber.trim(),
      date,
      description: description.trim(),
      referenceDoc: referenceDoc.trim() || undefined,
      postedBy: 'Cost Accounting Lead',
      lines: populatedLines,
      status: 'posted',
    };

    onSave(newEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2D24]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-[#E5E5DE] shadow-2xl space-y-4 animate-in fade-in duration-150 text-[#2D2D24]">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DE]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F5F5F0] text-[#5A5A40] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#2D2D24]">
                Post General Ledger Journal Entry
              </h3>
              <p className="text-xs text-[#8B7E66]">
                Double-entry bookkeeping: Debits must balance Credits exactly
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">Entry Number *</label>
              <input
                type="text"
                required
                value={entryNumber}
                onChange={(e) => setEntryNumber(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] font-mono font-semibold text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
              />
            </div>
            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">Posting Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
              />
            </div>
            <div>
              <label className="font-semibold text-[#2D2D24] block mb-1">Reference Doc</label>
              <input
                type="text"
                value={referenceDoc}
                onChange={(e) => setReferenceDoc(e.target.value)}
                placeholder="PO/WO/INV/WIRE #"
                className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] font-mono text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#2D2D24] block mb-1">Transaction Description *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Allocation of Direct Labor, Tooling Wear Expense, Raw Steel Receipt"
              className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
            />
          </div>

          {/* Lines Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#2D2D24]">Accounting Ledger Splits</span>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-[11px] text-[#5A5A40] hover:text-[#2D2D24] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Split Row</span>
              </button>
            </div>

            <div className="border border-[#E5E5DE] rounded-2xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F5F0] text-[#787668] uppercase text-[10px] font-bold border-b border-[#E5E5DE]">
                  <tr>
                    <th className="p-2.5">Chart of Account</th>
                    <th className="p-2.5 text-right w-32">Debit ($)</th>
                    <th className="p-2.5 text-right w-32">Credit ($)</th>
                    <th className="p-2.5 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5DE]">
                  {lines.map((line) => (
                    <tr key={line.id}>
                      <td className="p-2">
                        <select
                          value={line.accountCode}
                          onChange={(e) => handleUpdateLine(line.id, 'accountCode', e.target.value)}
                          className="w-full p-2 rounded-lg bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
                        >
                          {accounts.map((acc) => (
                            <option key={acc.code} value={acc.code}>
                              {acc.code} - {acc.name} ({acc.category.toUpperCase()})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={line.debit || ''}
                          onChange={(e) =>
                            handleUpdateLine(line.id, 'debit', e.target.value === '' ? 0 : Number(e.target.value))
                          }
                          placeholder="0.00"
                          className="w-full p-2 text-right font-mono rounded-lg bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={line.credit || ''}
                          onChange={(e) =>
                            handleUpdateLine(line.id, 'credit', e.target.value === '' ? 0 : Number(e.target.value))
                          }
                          placeholder="0.00"
                          className="w-full p-2 text-right font-mono rounded-lg bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
                        />
                      </td>
                      <td className="p-2 text-center">
                        {lines.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(line.id)}
                            className="text-[#B33A3A] hover:text-[#8C1C1C] p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Balancing Audit Footer */}
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between font-mono text-xs ${
              isBalanced
                ? 'bg-[#EBF3ED] border-[#CDE5D2] text-[#2E6930]'
                : 'bg-[#FFF5F5] border-[#FCDAD7] text-[#B33A3A]'
            }`}
          >
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#2E6930]" />
                  <span className="font-semibold">Balanced: Debits equal Credits</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-[#B33A3A]" />
                  <span className="font-semibold">
                    Out of Balance: Difference of $
                    {Math.abs(totalDebits - totalCredits).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] text-[#787668] block">Total Debits</span>
                <span className="font-bold">${totalDebits.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#787668] block">Total Credits</span>
                <span className="font-bold">${totalCredits.toLocaleString()}</span>
              </div>
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
              disabled={!isBalanced || !description.trim()}
              className="bg-[#5A5A40] hover:bg-[#474732] disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Post to General Ledger</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
