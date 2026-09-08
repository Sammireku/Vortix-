import React, { useState } from 'react';
import {
  X,
  Globe,
  Check,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Sliders,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { PosCurrency, AppUser } from '../../types';

interface PosCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencies: PosCurrency[];
  activeCurrency: PosCurrency;
  onSelectCurrency: (currency: PosCurrency) => void;
  onUpdateCurrencyRate?: (code: string, newRate: number) => void;
  currentUser: AppUser;
  onShowNotification?: (title: string, message: string, type?: 'success' | 'warning' | 'info') => void;
}

export const PosCurrencyModal: React.FC<PosCurrencyModalProps> = ({
  isOpen,
  onClose,
  currencies,
  activeCurrency,
  onSelectCurrency,
  onUpdateCurrencyRate,
  currentUser,
  onShowNotification,
}) => {
  const [currencyList, setCurrencyList] = useState<PosCurrency[]>(currencies);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editRateValue, setEditRateValue] = useState<string>('');
  const [calculatorUsd, setCalculatorUsd] = useState<number>(100);

  if (!isOpen) return null;

  const handleSelect = (curr: PosCurrency) => {
    onSelectCurrency(curr);
    onShowNotification?.(
      'Currency Switched',
      `Terminal display and transactions now converted to ${curr.code} (${curr.symbol}).`,
      'success'
    );
  };

  const handleStartEdit = (curr: PosCurrency) => {
    setEditingCode(curr.code);
    setEditRateValue(curr.rate.toString());
  };

  const handleSaveRate = (code: string) => {
    const parsed = parseFloat(editRateValue);
    if (!parsed || parsed <= 0) {
      onShowNotification?.('Invalid Rate', 'Exchange rate must be greater than zero.', 'warning');
      return;
    }
    const updated = currencyList.map((c) =>
      c.code === code ? { ...c, rate: parsed } : c
    );
    setCurrencyList(updated);
    if (onUpdateCurrencyRate) {
      onUpdateCurrencyRate(code, parsed);
    }
    if (activeCurrency.code === code) {
      const activeObj = updated.find((c) => c.code === code);
      if (activeObj) onSelectCurrency(activeObj);
    }
    setEditingCode(null);
    onShowNotification?.('Exchange Rate Updated', `1 USD = ${parsed} ${code}`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-base text-[#2D2D24]">Multi-Currency & Conversion</h3>
              <p className="text-xs text-[#8B7E66]">
                Configure real-time currencies for Cashier ({currentUser.fullName}) & Sub-users
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Active Banner */}
          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#5A5A40]/25 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeCurrency.flag}</span>
              <div>
                <div className="font-bold text-sm text-[#2D2D24] flex items-center gap-2">
                  <span>{activeCurrency.name} ({activeCurrency.code})</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Active on Register
                  </span>
                </div>
                <div className="text-[11px] text-[#5A5A40]">
                  Symbol: <strong className="font-mono">{activeCurrency.symbol}</strong> &bull; Exchange Rate: 1 USD = {activeCurrency.rate} {activeCurrency.code}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Currency Converter Simulation */}
          <div className="p-3 rounded-2xl bg-[#FCFCFA] border border-[#E5E5DE] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-[#2D2D24] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Instant Currency Conversion Simulator</span>
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-[11px] text-[#8B7E66]">$ USD Base:</span>
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={calculatorUsd}
                  onChange={(e) => setCalculatorUsd(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-20 px-2 py-1 bg-white border border-[#E5E5DE] rounded-lg text-right font-bold text-xs"
                />
              </div>
            </div>
            <div className="text-[11px] text-[#5A5A40] font-mono flex items-center justify-between bg-white p-2 rounded-xl border border-[#E5E5DE]">
              <span>Equivalent in {activeCurrency.name}:</span>
              <strong className="text-sm text-[#2D2D24]">
                {activeCurrency.symbol}
                {(calculatorUsd * activeCurrency.rate).toLocaleString(undefined, {
                  minimumFractionDigits: activeCurrency.decimals,
                  maximumFractionDigits: activeCurrency.decimals,
                })}{' '}
                {activeCurrency.code}
              </strong>
            </div>
          </div>

          {/* Currency Grid */}
          <div>
            <div className="font-bold text-xs text-[#2D2D24] uppercase tracking-wider mb-2.5">
              Available Global Currencies ({currencyList.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currencyList.map((curr) => {
                const isActive = curr.code === activeCurrency.code;
                const isEditing = editingCode === curr.code;

                return (
                  <div
                    key={curr.code}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2 ${
                      isActive
                        ? 'border-[#5A5A40] bg-[#FAF9F5] shadow-xs ring-2 ring-[#5A5A40]/15'
                        : 'border-[#E5E5DE] bg-white hover:border-[#5A5A40]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{curr.flag}</span>
                        <div>
                          <div className="font-bold text-xs text-[#2D2D24] flex items-center gap-1.5">
                            <span>{curr.code}</span>
                            <span className="text-[#8B7E66] font-normal">({curr.symbol})</span>
                          </div>
                          <div className="text-[10px] text-[#7A7A6E]">{curr.name}</div>
                        </div>
                      </div>

                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelect(curr)}
                          className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#E9E9E0] text-[11px] font-semibold text-[#5A5A40] border border-[#5A5A40]/30 transition-colors cursor-pointer"
                        >
                          Select
                        </button>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#E5E5DE] flex items-center justify-between text-[11px]">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 w-full">
                          <span className="text-[10px] text-[#8B7E66] whitespace-nowrap">1 USD =</span>
                          <input
                            type="number"
                            step="0.0001"
                            value={editRateValue}
                            onChange={(e) => setEditRateValue(e.target.value)}
                            className="w-20 px-2 py-0.5 bg-white border border-[#E5E5DE] rounded text-right font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRate(curr.code)}
                            className="px-2 py-0.5 bg-[#5A5A40] text-white rounded font-bold text-[10px]"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCode(null)}
                            className="px-1.5 py-0.5 text-[#8B7E66]"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="font-mono text-[#5A5A40]">
                            1 USD = <strong>{curr.rate}</strong> {curr.code}
                          </div>
                          {curr.code !== 'USD' && (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(curr)}
                              className="text-[10px] text-[#8B7E66] hover:text-[#2D2D24] underline cursor-pointer"
                            >
                              Edit Rate
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E5E5DE] bg-[#FAF9F5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[#8B7E66]">
            <ShieldCheck className="w-4 h-4 text-[#5A5A40]" />
            <span>Dual currency pricing updates on cart totals and official receipts automatically</span>
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
