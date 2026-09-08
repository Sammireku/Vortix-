import React, { useState } from 'react';
import {
  X,
  Printer,
  Mail,
  Download,
  FileText,
  CheckCircle2,
  Receipt,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Banknote,
  Building2,
  Bed,
  Globe,
  Award,
  ChevronDown,
} from 'lucide-react';
import {
  PosOrder,
  PosCurrency,
  PosTaxRegionConfig,
  PosCustomerProfile,
} from '../../types';
import { formatCurrency } from '../../data/posData';

interface ReceiptPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: PosOrder | null;
  currency: PosCurrency;
  taxRegion: PosTaxRegionConfig;
  customerProfile?: PosCustomerProfile;
  onPrint?: () => void;
  onEmailReceipt?: (email: string) => void;
  onOpenInvoice?: () => void;
  onNewSale?: () => void;
  onShowNotification?: (title: string, message: string, type?: 'success' | 'warning' | 'info') => void;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({
  isOpen,
  onClose,
  order,
  currency,
  taxRegion,
  customerProfile,
  onPrint,
  onEmailReceipt,
  onOpenInvoice,
  onNewSale,
  onShowNotification,
}) => {
  const [emailInput, setEmailInput] = useState<string>(() => {
    return order?.customerEmail || customerProfile?.email || '';
  });
  const [isEmailSent, setIsEmailSent] = useState<boolean>(false);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [showEmailForm, setShowEmailForm] = useState<boolean>(false);

  if (!isOpen || !order) return null;

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      onShowNotification?.('Invalid Email', 'Please enter a valid email address.', 'warning');
      return;
    }
    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      setIsEmailSent(true);
      if (onEmailReceipt) {
        onEmailReceipt(emailInput);
      }
      onShowNotification?.(
        'Receipt Emailed',
        `Stylized digital receipt successfully dispatched to ${emailInput}`,
        'success'
      );
    }, 800);
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
    onShowNotification?.('Print Command Sent', 'Receipt sent to local thermal or standard printer.', 'info');
  };

  const handleDownloadText = () => {
    const lines = [
      '==========================================',
      '         VORTIX INDUSTRIAL DEPOT & POS    ',
      '      Midwest Machining & Campus Hub      ',
      '            Tax ID: 84-2918841-B          ',
      '==========================================',
      `Order #:       ${order.orderNumber}`,
      `Receipt #:     ${order.receiptNumber}`,
      `Date & Time:   ${order.timestamp}`,
      `Cashier:       ${order.cashierName}`,
      `Customer:      ${order.customerName || 'Walk-In Customer'}`,
      customerProfile ? `Loyalty Tier:  ${customerProfile.tier} (${customerProfile.loyaltyPoints} pts)` : '',
      `Tender Method: ${order.paymentMethod.toUpperCase()}`,
      '------------------------------------------',
      'ITEMS:',
      ...order.items.map(
        (i) =>
          `${i.quantity}x ${i.product.name.padEnd(25)} $${(i.unitPrice * i.quantity).toFixed(2)}`
      ),
      '------------------------------------------',
      `Subtotal:      $${order.subtotal.toFixed(2)}`,
      order.cashDiscountAmount && order.cashDiscountAmount > 0
        ? `Cash Discount: -$${order.cashDiscountAmount.toFixed(2)}`
        : '',
      order.discountTotal > 0 && !order.cashDiscountAmount
        ? `Discount:      -$${order.discountTotal.toFixed(2)}`
        : '',
      order.loyaltyDiscountAmount && order.loyaltyDiscountAmount > 0
        ? `Loyalty Points: -$${order.loyaltyDiscountAmount.toFixed(2)}`
        : '',
      `Tax (${order.taxLabel || taxRegion.taxLabel} @ ${((order.taxRateApplied ?? taxRegion.rate) * 100).toFixed(2)}%): $${order.taxTotal.toFixed(2)}`,
      `GRAND TOTAL:   $${order.grandTotal.toFixed(2)} USD`,
      currency.code !== 'USD'
        ? `CONVERTED:     ${formatCurrency(order.grandTotal, currency)}`
        : '',
      order.paymentMethod === 'cash'
        ? `Amount Paid:   $${(order.amountTendered || order.grandTotal).toFixed(2)}\nChange Due:    $${(order.changeDue || 0).toFixed(2)}`
        : '',
      '==========================================',
      ' Thank you for choosing Vortix Solutions! ',
      '==========================================',
    ]
      .filter(Boolean)
      .join('\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${order.receiptNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    onShowNotification?.('Receipt Downloaded', `Saved ${order.receiptNumber}.txt`, 'success');
  };

  const getTenderIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="w-4 h-4 text-emerald-700" />;
      case 'credit_card':
        return <CreditCard className="w-4 h-4 text-blue-700" />;
      case 'room_folio_charge':
        return <Bed className="w-4 h-4 text-amber-700" />;
      case 'corporate_po':
        return <Building2 className="w-4 h-4 text-purple-700" />;
      default:
        return <Receipt className="w-4 h-4 text-[#5A5A40]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-sm text-[#2D2D24]">Digital Receipt Confirmation</h3>
              <p className="text-[11px] text-[#8B7E66]">{order.receiptNumber} &bull; Approved</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8B7E66] hover:text-[#2D2D24] hover:bg-[#E9E9E0] transition-colors cursor-pointer"
            title="Close Receipt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FAF9F5]">
          {/* Main Stylized Thermal Card */}
          <div className="bg-white border border-[#E5E5DE] rounded-2xl p-5 shadow-xs font-mono text-xs text-[#2D2D24] space-y-3 relative">
            {/* Top Store Header */}
            <div className="text-center space-y-1 border-b border-dashed border-[#C5C5BA] pb-3">
              <div className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] text-[10px] font-sans font-bold tracking-wide">
                <Sparkles className="w-3 h-3 text-[#5A5A40]" />
                <span>OFFICIAL STORE RECEIPT</span>
              </div>
              <div className="font-bold text-base tracking-wider pt-1">VORTIX INDUSTRIAL DEPOT</div>
              <div className="text-[11px] text-[#7A7A6E]">Midwest Machining & High-Precision Hub</div>
              <div className="text-[10px] text-[#8B7E66]">Tax ID: 84-2918841-B &bull; Station #01</div>
              <div className="text-[10px] text-[#8B7E66]">{order.timestamp}</div>
            </div>

            {/* Order & Cashier Meta */}
            <div className="text-[11px] space-y-0.5 text-[#4D4D42] py-1 border-b border-dashed border-[#C5C5BA]">
              <div className="flex justify-between">
                <span className="text-[#8B7E66]">ORDER NUMBER:</span>
                <span className="font-bold">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B7E66]">RECEIPT ID:</span>
                <span className="font-bold">{order.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B7E66]">CASHIER:</span>
                <span>{order.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B7E66]">CUSTOMER:</span>
                <span className="font-semibold">{order.customerName || 'Walk-In Customer'}</span>
              </div>
              <div className="flex justify-between items-center pt-0.5">
                <span className="text-[#8B7E66]">PAYMENT METHOD:</span>
                <span className="inline-flex items-center gap-1 font-semibold capitalize">
                  {getTenderIcon(order.paymentMethod)}
                  <span>{order.paymentMethod.replace('_', ' ')}</span>
                </span>
              </div>
            </div>

            {/* Customer Loyalty Tracker Banner */}
            {customerProfile && (
              <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#5A5A40]/25 font-sans space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#5A5A40]">
                    <Award className="w-3.5 h-3.5" />
                    <span>Loyalty Member: {customerProfile.name}</span>
                  </div>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-[#5A5A40] text-white">
                    {customerProfile.tier}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px] text-center pt-1 border-t border-[#E5E5DE]">
                  <div>
                    <div className="text-[#8B7E66]">Earned</div>
                    <div className="font-bold text-emerald-700">
                      +{order.loyaltyPointsEarned || Math.floor(order.grandTotal)} pts
                    </div>
                  </div>
                  <div>
                    <div className="text-[#8B7E66]">Redeemed</div>
                    <div className="font-bold text-amber-700">
                      -{order.loyaltyPointsRedeemed || 0} pts
                    </div>
                  </div>
                  <div>
                    <div className="text-[#8B7E66]">New Balance</div>
                    <div className="font-bold text-[#2D2D24] font-mono">
                      {customerProfile.loyaltyPoints} pts
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Currency Conversion Alert Banner if non-USD */}
            {currency.code !== 'USD' && (
              <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-200 font-sans flex items-center justify-between text-[11px] text-blue-900">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Globe className="w-3.5 h-3.5 text-blue-700" />
                  <span>Display Currency: {currency.code} ({currency.symbol})</span>
                </div>
                <div className="font-mono text-[10px] text-blue-800">
                  1 USD = {currency.rate} {currency.code}
                </div>
              </div>
            )}

            {/* Itemized Cart List */}
            <div className="space-y-1.5 py-1 border-b border-dashed border-[#C5C5BA]">
              <div className="flex justify-between text-[10px] text-[#8B7E66] uppercase font-sans font-semibold">
                <span>Item & Description</span>
                <span>Amount</span>
              </div>
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-[11px] gap-2">
                  <div className="truncate max-w-[210px]">
                    <div className="truncate font-semibold">{item.product.name}</div>
                    <div className="text-[10px] text-[#8B7E66]">
                      {item.quantity} x ${item.unitPrice.toFixed(2)}{' '}
                      {currency.code !== 'USD' && (
                        <span>({formatCurrency(item.unitPrice, currency)})</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <div className="font-bold font-mono">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </div>
                    {currency.code !== 'USD' && (
                      <div className="text-[10px] text-[#7A7A6E]">
                        {formatCurrency(item.unitPrice * item.quantity, currency)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Totals Breakdown */}
            <div className="space-y-1 text-xs py-1">
              <div className="flex justify-between">
                <span className="text-[#8B7E66]">SUBTOTAL:</span>
                <span className="font-mono font-medium">${order.subtotal.toFixed(2)}</span>
              </div>

              {/* Cash Discount */}
              {order.cashDiscountAmount && order.cashDiscountAmount > 0 ? (
                <div className="flex justify-between text-emerald-700">
                  <span className="font-semibold">CASH DISCOUNT:</span>
                  <span className="font-mono font-bold">-${order.cashDiscountAmount.toFixed(2)}</span>
                </div>
              ) : null}

              {/* Standard or Percentage Discount */}
              {order.discountTotal > 0 && (!order.cashDiscountAmount || order.discountTotal > order.cashDiscountAmount) ? (
                <div className="flex justify-between text-emerald-700">
                  <span>DISCOUNT:</span>
                  <span className="font-mono font-bold">
                    -${(order.discountTotal - (order.cashDiscountAmount || 0)).toFixed(2)}
                  </span>
                </div>
              ) : null}

              {/* Loyalty Discount */}
              {order.loyaltyDiscountAmount && order.loyaltyDiscountAmount > 0 ? (
                <div className="flex justify-between text-amber-700">
                  <span>LOYALTY REWARDS DEDUCTION:</span>
                  <span className="font-mono font-bold">
                    -${order.loyaltyDiscountAmount.toFixed(2)}
                  </span>
                </div>
              ) : null}

              {/* Regional Tax */}
              <div className="flex justify-between">
                <span className="text-[#8B7E66]">
                  TAX ({order.taxLabel || taxRegion.taxLabel} @{' '}
                  {((order.taxRateApplied ?? taxRegion.rate) * 100).toFixed(2)}%):
                </span>
                <span className="font-mono font-medium">${order.taxTotal.toFixed(2)}</span>
              </div>

              {/* Final Grand Total in USD */}
              <div className="flex justify-between font-bold text-sm pt-2 border-t-2 border-[#2D2D24] text-[#2D2D24]">
                <span>TOTAL DUE:</span>
                <span className="font-mono">${order.grandTotal.toFixed(2)} USD</span>
              </div>

              {/* Converted Currency Dual Total */}
              {currency.code !== 'USD' && (
                <div className="flex justify-between font-bold text-xs pt-1 text-[#5A5A40] bg-[#FAF9F5] p-1.5 rounded-lg border border-[#E5E5DE]">
                  <span>CONVERTED ({currency.code}):</span>
                  <span className="font-mono">
                    {formatCurrency(order.grandTotal, currency)}
                  </span>
                </div>
              )}

              {/* Cash Paid / Change Due */}
              {order.paymentMethod === 'cash' && (
                <div className="pt-2 border-t border-dashed border-[#C5C5BA] space-y-0.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-[#8B7E66]">CASH TENDERED:</span>
                    <span className="font-mono">${(order.amountTendered || order.grandTotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>CHANGE RETURNED:</span>
                    <span className="font-mono">${(order.changeDue || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Barcode / Security Stamp */}
            <div className="pt-3 border-t border-dashed border-[#C5C5BA] text-center space-y-1">
              <div className="tracking-[5px] font-bold text-sm">||||| | ||||| ||| |||||||</div>
              <div className="text-[9px] text-[#8B7E66]">
                AUTH TOKEN: {order.orderNumber}-{Math.abs(order.grandTotal * 100).toFixed(0)}
              </div>
              <div className="text-[10px] text-[#8B7E66] italic font-sans pt-1">
                Thank you for your business & partnership!
              </div>
            </div>
          </div>

          {/* Email Receipt Accordion / Box */}
          <div className="bg-white border border-[#E5E5DE] rounded-2xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-[#2D2D24]">
                <Mail className="w-4 h-4 text-[#5A5A40]" />
                <span>Email Digital Receipt Confirmation</span>
              </div>
              {isEmailSent && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Dispatched
                </span>
              )}
            </div>

            <form onSubmit={handleSendEmail} className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setIsEmailSent(false);
                  }}
                  placeholder="customer@domain.com"
                  className="flex-1 px-3 py-2 text-xs bg-[#FAF9F5] border border-[#E5E5DE] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                />
                <button
                  type="submit"
                  disabled={isSendingEmail || !emailInput}
                  className="px-3.5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#474732] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {isSendingEmail ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Action Controls Footer */}
        <div className="p-4 border-t border-[#E5E5DE] bg-white flex flex-col gap-2 shrink-0">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl border border-[#E5E5DE] hover:bg-[#F5F5F0] text-xs font-semibold text-[#5A5A40] flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadText}
              className="py-2.5 px-3 rounded-xl border border-[#E5E5DE] hover:bg-[#F5F5F0] text-xs font-semibold text-[#5A5A40] flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            {onOpenInvoice ? (
              <button
                type="button"
                onClick={() => {
                  onOpenInvoice();
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl bg-[#FAF9F5] hover:bg-[#F5F5F0] border border-[#5A5A40]/30 text-[#5A5A40] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Invoice</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="py-2.5 px-3 rounded-xl border border-[#E5E5DE] hover:bg-[#F5F5F0] text-xs font-semibold text-[#5A5A40] flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (onNewSale) onNewSale();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-bold cursor-pointer transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <span>Start Next Transaction</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
