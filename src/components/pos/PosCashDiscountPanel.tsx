import React from 'react';
import { Banknote, X, Check, DollarSign, Tag, SlidersHorizontal } from 'lucide-react';
import { PosCurrency } from '../../types';
import { formatCurrency } from '../../data/posData';

interface PosCashDiscountPanelProps {
  manualCashDiscount: number;
  manualCashInput: string;
  onManualCashInputChange: (value: string) => void;
  onApplyCashDiscount: (amount: number) => void;
  cashDiscountReason: string;
  onCashDiscountReasonChange: (reason: string) => void;
  rawSubtotal: number;
  currency: PosCurrency;
  canOverrideDiscounts?: boolean;
  onShowNotification?: (title: string, message: string, type?: 'success' | 'warning' | 'info') => void;
}

export const PosCashDiscountPanel: React.FC<PosCashDiscountPanelProps> = ({
  manualCashDiscount,
  manualCashInput,
  onManualCashInputChange,
  onApplyCashDiscount,
  cashDiscountReason,
  onCashDiscountReasonChange,
  rawSubtotal,
  currency,
  canOverrideDiscounts = true,
  onShowNotification,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    onManualCashInputChange(valStr);

    const num = parseFloat(valStr);
    if (isNaN(num) || num <= 0) {
      onApplyCashDiscount(0);
      return;
    }

    if (!canOverrideDiscounts && num > 0) {
      onShowNotification?.(
        'Permission Restricted',
        'Your user account does not have permission to override manual discounts.',
        'warning'
      );
      return;
    }

    // Cap at raw subtotal
    const clamped = Math.min(rawSubtotal, Math.max(0, num));
    onApplyCashDiscount(clamped);
  };

  const handleQuickAdd = (addAmount: number) => {
    if (!canOverrideDiscounts) {
      onShowNotification?.(
        'Permission Restricted',
        'Your user account does not have permission to override manual discounts.',
        'warning'
      );
      return;
    }
    const current = manualCashDiscount || 0;
    const nextVal = Math.min(rawSubtotal, current + addAmount);
    onManualCashInputChange(nextVal.toFixed(2));
    onApplyCashDiscount(nextVal);
  };

  const handleRoundToDollar = () => {
    if (!canOverrideDiscounts) return;
    const cents = rawSubtotal - Math.floor(rawSubtotal);
    if (cents > 0) {
      const roundedOff = parseFloat(cents.toFixed(2));
      onManualCashInputChange(roundedOff.toFixed(2));
      onApplyCashDiscount(roundedOff);
      if (!cashDiscountReason) {
        onCashDiscountReasonChange('Cash Rounding Courtesy');
      }
    }
  };

  const handleClear = () => {
    onManualCashInputChange('');
    onApplyCashDiscount(0);
    onCashDiscountReasonChange('');
  };

  const quickReasons = [
    'Cash Courtesy',
    'Damaged Box',
    'Floor Demo Item',
    'Volume Cash Deal',
    'Manager Override',
  ];

  return (
    <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E5E5DE] space-y-2.5 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
          <Banknote className="w-3.5 h-3.5 text-[#5A5A40]" />
          <span>Manual Cash Discount ($)</span>
        </span>
        {manualCashDiscount > 0 && (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            -${manualCashDiscount.toFixed(2)} USD applied
          </span>
        )}
      </div>

      {/* Direct cash typing input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8B7E66]">
            $
          </span>
          <input
            type="number"
            step="0.25"
            min="0"
            max={rawSubtotal}
            placeholder="Type discount in cash (e.g. 15.00)"
            value={manualCashInput}
            onChange={handleInputChange}
            className="w-full pl-7 pr-3 py-1.5 bg-white border border-[#E5E5DE] rounded-xl text-xs font-bold text-[#2D2D24] focus:outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40]"
          />
        </div>

        {manualCashDiscount > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="px-2.5 py-1.5 bg-white hover:bg-red-50 border border-[#E5E5DE] hover:border-red-300 text-red-600 rounded-xl text-[11px] font-medium cursor-pointer transition-colors"
            title="Reset cash discount"
          >
            Clear
          </button>
        )}
      </div>

      {/* Currency conversion hint if active currency != USD */}
      {currency.code !== 'USD' && manualCashDiscount > 0 && (
        <div className="text-[10px] text-[#8B7E66] font-mono flex items-center justify-between px-1">
          <span>Converted in {currency.code}:</span>
          <span className="font-bold text-[#2D2D24]">
            -{formatCurrency(manualCashDiscount, currency)}
          </span>
        </div>
      )}

      {/* Quick Add Cash Chips */}
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-[10px] text-[#8B7E66] font-medium">Quick Cash:</span>
        {[1, 5, 10, 20, 50].map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => handleQuickAdd(amt)}
            className="px-2 py-0.5 bg-white border border-[#E5E5DE] hover:border-[#5A5A40] hover:bg-[#F5F5F0] rounded-lg text-[10px] text-[#5A5A40] font-semibold cursor-pointer transition-colors"
          >
            +${amt}
          </button>
        ))}

        <button
          type="button"
          onClick={handleRoundToDollar}
          className="px-2 py-0.5 bg-white border border-amber-300 hover:bg-amber-50 rounded-lg text-[10px] text-amber-800 font-semibold cursor-pointer transition-colors"
          title="Round off cent change to nearest whole dollar"
        >
          Round Cents
        </button>
      </div>

      {/* Reason Tag Input and Quick Tag selection */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center gap-1.5">
          <Tag className="w-3 h-3 text-[#8B7E66]" />
          <input
            type="text"
            placeholder="Reason (e.g. Cash Rounding, Courtesy)"
            value={cashDiscountReason}
            onChange={(e) => onCashDiscountReasonChange(e.target.value)}
            className="w-full px-2.5 py-1 bg-white border border-[#E5E5DE] rounded-lg text-[11px] text-[#2D2D24] placeholder:text-[#8B7E66]/60 focus:outline-none focus:border-[#5A5A40]"
          />
        </div>

        <div className="flex items-center gap-1 flex-wrap pt-0.5">
          {quickReasons.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onCashDiscountReasonChange(r)}
              className={`px-1.5 py-0.2 rounded text-[9px] cursor-pointer transition-colors ${
                cashDiscountReason === r
                  ? 'bg-[#5A5A40] text-white font-semibold'
                  : 'bg-white border border-[#E5E5DE] text-[#8B7E66] hover:text-[#2D2D24]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
