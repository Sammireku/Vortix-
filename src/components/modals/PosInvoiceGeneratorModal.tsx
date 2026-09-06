import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  FileText,
  Printer,
  Download,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  Building2,
  Calendar,
  DollarSign,
  Percent,
  Package,
  Layers,
  ArrowRight,
  Eye,
  Edit3,
  Copy,
  ShoppingCart,
  ShieldCheck,
  Tag,
  Clock,
} from 'lucide-react';
import {
  PosProduct,
  PosCartItem,
  PosInvoice,
  PosInvoiceItem,
  Invoice,
  AppUser,
} from '../../types';

interface PosInvoiceGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  products: PosProduct[];
  initialItems?: PosCartItem[];
  customerDefault?: {
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    address?: string;
    poReference?: string;
  };
  onAddInvoiceToLedger?: (invoice: Invoice) => void;
  onLoadItemsToCart?: (items: PosCartItem[]) => void;
  onShowNotification?: (title: string, message: string, type?: 'success' | 'warning' | 'info') => void;
}

export const PosInvoiceGeneratorModal: React.FC<PosInvoiceGeneratorModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  products,
  initialItems = [],
  customerDefault,
  onAddInvoiceToLedger,
  onLoadItemsToCart,
  onShowNotification,
}) => {
  // Mode: Editor vs Document Preview
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Item Scope Mode: 'single' vs 'multiple'
  const [itemScopeMode, setItemScopeMode] = useState<'single' | 'multiple'>(() =>
    initialItems.length === 1 ? 'single' : 'multiple'
  );

  // Invoice Metadata
  const [invoiceNumber, setInvoiceNumber] = useState(
    () => `INV-${new Date().getFullYear()}-POS-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = useState<'Due on Receipt' | 'Net 15' | 'Net 30' | 'Net 60'>('Net 30');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [status, setStatus] = useState<'draft' | 'issued' | 'paid' | 'pending'>('issued');
  const [poReference, setPoReference] = useState('PO-VRTX-2026-A1');

  // Customer / Bill-To details
  const [customerName, setCustomerName] = useState(customerDefault?.name || 'Boeing Commercial Airplanes');
  const [customerCompany, setCustomerCompany] = useState(customerDefault?.company || 'Commercial Aircraft Division');
  const [customerEmail, setCustomerEmail] = useState(customerDefault?.email || 'procurement@boeing.com');
  const [customerPhone, setCustomerPhone] = useState(customerDefault?.phone || '+1 (425) 266-2121');
  const [customerAddress, setCustomerAddress] = useState(
    customerDefault?.address || '7755 E Marginal Way S, Seattle, WA 98108'
  );

  // Line items state
  const [lineItems, setLineItems] = useState<PosInvoiceItem[]>(() => {
    if (initialItems.length > 0) {
      return initialItems.map((item, idx) => ({
        id: `inv-item-${idx}-${Date.now()}`,
        sku: item.product.sku,
        description: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.product.taxRate,
        total: item.unitPrice * item.quantity,
        category: item.product.category,
        notes: item.notes || '',
      }));
    }

    // Default sample item if none provided
    const sampleProduct = products[0] || {
      name: 'Precision Titanium Hex Bolt M8x40',
      sku: 'FAS-TI-M8-40',
      price: 18.5,
      taxRate: 0.0825,
      category: 'Fasteners & Hardware',
    };

    return [
      {
        id: `inv-item-init-${Date.now()}`,
        sku: sampleProduct.sku,
        description: sampleProduct.name,
        quantity: 1,
        unitPrice: sampleProduct.price,
        taxRate: sampleProduct.taxRate,
        total: sampleProduct.price,
        category: sampleProduct.category,
        notes: 'Factory calibrated high-tensile specification',
      },
    ];
  });

  // Selected product to append from catalog
  const [selectedCatalogProductId, setSelectedCatalogProductId] = useState<string>('');

  // Discount configuration (presets + manual % or $)
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [manualDiscountInput, setManualDiscountInput] = useState<string>('0');
  const [discountReason, setDiscountReason] = useState<string>('');

  // Notes
  const [invoiceNotes, setInvoiceNotes] = useState(
    'Payment is due according to specified terms. Remit payment via ACH / Wire to Vortix Depot Operations or settle at depot register. All industrial components certified under ISO 9001:2015.'
  );

  // Print ref
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Synchronize due date when terms change
  const handlePaymentTermsChange = (newTerms: 'Due on Receipt' | 'Net 15' | 'Net 30' | 'Net 60') => {
    setPaymentTerms(newTerms);
    const d = new Date(issueDate);
    if (newTerms === 'Due on Receipt') {
      setDueDate(issueDate);
    } else if (newTerms === 'Net 15') {
      d.setDate(d.getDate() + 15);
      setDueDate(d.toISOString().split('T')[0]);
    } else if (newTerms === 'Net 30') {
      d.setDate(d.getDate() + 30);
      setDueDate(d.toISOString().split('T')[0]);
    } else if (newTerms === 'Net 60') {
      d.setDate(d.getDate() + 60);
      setDueDate(d.toISOString().split('T')[0]);
    }
  };

  // Synchronize itemScopeMode when lineItems change length
  useEffect(() => {
    if (lineItems.length === 1 && itemScopeMode !== 'single') {
      // Keep user choice, but allow single item focus
    }
  }, [lineItems.length]);

  // Calculations
  const rawSubtotal = lineItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Discount amount calculation
  let calculatedDiscountAmount = 0;
  if (discountType === 'percentage') {
    const pct = Math.min(100, Math.max(0, discountValue));
    calculatedDiscountAmount = rawSubtotal * (pct / 100);
  } else {
    calculatedDiscountAmount = Math.min(rawSubtotal, Math.max(0, discountValue));
  }

  const discountedSubtotal = Math.max(0, rawSubtotal - calculatedDiscountAmount);

  // Effective discount ratio applied across line items
  const effectiveDiscountRatio = rawSubtotal > 0 ? calculatedDiscountAmount / rawSubtotal : 0;

  // Tax calculation on discounted items
  const calculatedTax = lineItems.reduce((sum, item) => {
    const itemSub = item.unitPrice * item.quantity * (1 - effectiveDiscountRatio);
    return sum + itemSub * (item.taxRate || 0.0825);
  }, 0);

  const grandTotal = discountedSubtotal + calculatedTax;

  // Handler to apply preset discount
  const handleApplyPresetDiscount = (pct: number) => {
    setDiscountType('percentage');
    setDiscountValue(pct);
    setManualDiscountInput(pct.toString());
  };

  // Handler for manual discount change
  const handleManualDiscountChange = (valStr: string) => {
    setManualDiscountInput(valStr);
    const num = parseFloat(valStr) || 0;
    setDiscountValue(Math.max(0, num));
  };

  // Preset accounts quick fill
  const handleApplyQuickAccount = (type: 'boeing' | 'lockheed' | 'guest' | 'walkin') => {
    if (type === 'boeing') {
      setCustomerName('Boeing Commercial Airplanes');
      setCustomerCompany('Commercial Aircraft Division');
      setCustomerEmail('procurement@boeing.com');
      setCustomerPhone('+1 (425) 266-2121');
      setCustomerAddress('7755 E Marginal Way S, Seattle, WA 98108');
      setPoReference('PO-BOEING-88210');
      setPaymentTerms('Net 30');
    } else if (type === 'lockheed') {
      setCustomerName('Lockheed Martin Aeronautics');
      setCustomerCompany('Fleet Sustainment Group');
      setCustomerEmail('mro.billing@lockheedmartin.com');
      setCustomerPhone('+1 (817) 777-2000');
      setCustomerAddress('1 Lockheed Blvd, Fort Worth, TX 76108');
      setPoReference('PO-LMT-99412');
      setPaymentTerms('Net 60');
    } else if (type === 'guest') {
      setCustomerName('Dr. Richard Thorne');
      setCustomerCompany('In-House Campus Guest (Suite 101)');
      setCustomerEmail('richard.thorne@mit.edu');
      setCustomerPhone('+1 (617) 253-1000');
      setCustomerAddress('Vortix Executive Residence, Suite 101');
      setPoReference('ROOM-FOLIO-101');
      setPaymentTerms('Due on Receipt');
    } else {
      setCustomerName('Walk-In Retail Customer');
      setCustomerCompany('Individual Client');
      setCustomerEmail('counter.sales@vortix.io');
      setCustomerPhone('+1 (800) 555-0199');
      setCustomerAddress('In-Person Depot Counter');
      setPoReference('DEPOT-CASH-SALE');
      setPaymentTerms('Due on Receipt');
    }
  };

  // Add line item from catalog
  const handleAddFromCatalog = () => {
    if (!selectedCatalogProductId) return;
    const prod = products.find((p) => p.id === selectedCatalogProductId);
    if (!prod) return;

    const newItem: PosInvoiceItem = {
      id: `inv-item-${Date.now()}`,
      sku: prod.sku,
      description: prod.name,
      quantity: 1,
      unitPrice: prod.price,
      taxRate: prod.taxRate,
      total: prod.price,
      category: prod.category,
      notes: prod.description || '',
    };

    setLineItems((prev) => [...prev, newItem]);
    setSelectedCatalogProductId('');
    if (itemScopeMode === 'single') {
      setItemScopeMode('multiple');
    }
  };

  // Add custom service or blank item
  const handleAddCustomItem = () => {
    const newItem: PosInvoiceItem = {
      id: `inv-item-custom-${Date.now()}`,
      sku: 'SRV-CUSTOM-' + Math.floor(100 + Math.random() * 900),
      description: 'Precision MRO Machine Calibration & Overhaul Labor',
      quantity: 1,
      unitPrice: 150.0,
      taxRate: 0.0825,
      total: 150.0,
      category: 'Services & Labor',
      notes: 'Standard certified technician service',
    };

    setLineItems((prev) => [...prev, newItem]);
    if (itemScopeMode === 'single') {
      setItemScopeMode('multiple');
    }
  };

  // Update item field
  const handleUpdateItem = (
    itemId: string,
    field: keyof PosInvoiceItem,
    value: string | number
  ) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            const q = field === 'quantity' ? Number(value) : item.quantity;
            const p = field === 'unitPrice' ? Number(value) : item.unitPrice;
            updated.total = q * p;
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Remove line item
  const handleRemoveItem = (itemId: string) => {
    if (lineItems.length <= 1) {
      onShowNotification?.('Minimum Line Required', 'An invoice must contain at least one line item.', 'warning');
      return;
    }
    setLineItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Save to Finance Ledger
  const handleSaveToFinanceLedger = () => {
    if (!onAddInvoiceToLedger) {
      onShowNotification?.('Notice', 'Finance ledger connection is not active.');
      return;
    }

    const financeInvoice: Invoice = {
      id: `inv-fin-${Date.now()}`,
      invoiceNumber: invoiceNumber,
      type: 'receivable',
      counterparty: customerCompany ? `${customerName} (${customerCompany})` : customerName,
      amount: Math.round(grandTotal * 100) / 100,
      issueDate: issueDate,
      dueDate: dueDate,
      status: status === 'paid' ? 'paid' : 'pending',
      referenceOrder: poReference || 'POS Commercial Order',
      paymentTerms: paymentTerms,
      taxAmount: Math.round(calculatedTax * 100) / 100,
      lineItems: lineItems.map((item) => ({
        description: item.sku ? `[${item.sku}] ${item.description}` : item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
    };

    onAddInvoiceToLedger(financeInvoice);
    onShowNotification?.(
      'Invoice Saved to Ledger',
      `${invoiceNumber} posted to Accounts Receivable in Finance Module.`,
      'success'
    );
  };

  // Push items into active POS Cart
  const handleLoadToPosCart = () => {
    if (!onLoadItemsToCart) return;

    const cartItems: PosCartItem[] = lineItems.map((item) => {
      const matchProd = products.find((p) => p.sku === item.sku || p.name === item.description);
      const productObj: PosProduct = matchProd || {
        id: `prod-inv-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: item.description,
        sku: item.sku || 'INV-ITEM',
        barcode: '990000' + Math.floor(1000 + Math.random() * 9000),
        category: (item.category as any) || 'Industrial Components',
        price: item.unitPrice,
        cost: item.unitPrice * 0.6,
        stockQty: 999,
        taxRate: item.taxRate || 0.0825,
        unit: 'each',
        description: item.notes,
      };

      return {
        id: `cart-${Date.now()}-${item.id}`,
        product: productObj,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPct: 0,
        notes: item.notes,
      };
    });

    onLoadItemsToCart(cartItems);
    onShowNotification?.(
      'Loaded to POS Cart',
      `${lineItems.length} item(s) transferred into the active POS register for checkout.`,
      'success'
    );
    onClose();
  };

  // Download invoice as JSON
  const handleDownloadJson = () => {
    const invoicePayload: PosInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      referenceOrder: poReference,
      issueDate,
      dueDate,
      paymentTerms,
      status,
      customerName,
      customerCompany,
      customerEmail,
      customerPhone,
      customerAddress,
      poReference,
      items: lineItems,
      subtotal: rawSubtotal,
      discountType,
      discountValue,
      discountTotal: calculatedDiscountAmount,
      discountReason,
      taxTotal: calculatedTax,
      grandTotal,
      notes: invoiceNotes,
      cashierName: currentUser.fullName,
      terminalName: 'Depot Register #01',
    };

    const blob = new Blob([JSON.stringify(invoicePayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoiceNumber}.json`;
    link.click();
    URL.revokeObjectURL(url);

    onShowNotification?.('Export Complete', `Exported ${invoiceNumber} as structured JSON.`);
  };

  // Download invoice as Standalone HTML file
  const handleDownloadHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoiceNumber} - Vortix Depot</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #2D2D24; background: #fff; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #5A5A40; padding-bottom: 20px; }
    .title { font-size: 24px; font-weight: bold; color: #5A5A40; }
    .meta { font-size: 12px; color: #666; margin-top: 4px; }
    .inv-title { font-size: 28px; font-weight: bold; color: #2D2D24; text-align: right; }
    .inv-meta { text-align: right; font-size: 12px; color: #555; }
    .grid { display: flex; justify-content: space-between; margin: 30px 0; }
    .col { width: 48%; }
    .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #5A5A40; margin-bottom: 6px; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { text-align: left; padding: 10px; background: #F5F5F0; font-size: 12px; font-weight: 600; border-bottom: 1px solid #ddd; }
    td { padding: 10px; font-size: 13px; border-bottom: 1px solid #eee; }
    .text-right { text-align: right; }
    .totals { margin-top: 20px; width: 320px; margin-left: auto; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
    .grand-total { border-top: 2px solid #2D2D24; font-size: 18px; font-weight: bold; padding-top: 10px; margin-top: 6px; }
    .footer { margin-top: 50px; font-size: 11px; color: #777; border-top: 1px solid #eee; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">VORTIX INDUSTRIAL & DEPOT</div>
      <div class="meta">Midwest Advanced Machining & Campus Logistics</div>
      <div class="meta">Tax ID: 84-2918841-B &bull; Phone: (800) 555-VRTX &bull; invoicing@vortix.io</div>
    </div>
    <div>
      <div class="inv-title">INVOICE</div>
      <div class="inv-meta"><strong>Invoice #:</strong> ${invoiceNumber}</div>
      <div class="inv-meta"><strong>Issue Date:</strong> ${issueDate}</div>
      <div class="inv-meta"><strong>Due Date:</strong> ${dueDate} (${paymentTerms})</div>
      <div class="inv-meta"><strong>PO / Ref:</strong> ${poReference}</div>
    </div>
  </div>

  <div class="grid">
    <div class="col">
      <div class="section-title">BILLED TO:</div>
      <div style="font-weight:bold; font-size:14px;">${customerName}</div>
      ${customerCompany ? `<div>${customerCompany}</div>` : ''}
      <div>${customerAddress}</div>
      <div>Email: ${customerEmail}</div>
      <div>Phone: ${customerPhone}</div>
    </div>
    <div class="col" style="text-align: right;">
      <div class="section-title">PAYMENT STATUS:</div>
      <div style="font-weight:bold; color:#5A5A40; font-size:16px;">${status.toUpperCase()}</div>
      <div style="font-size:12px; color:#666; margin-top:4px;">Cashier: ${currentUser.fullName}</div>
      <div style="font-size:12px; color:#666;">Depot Terminal #01</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Item Description</th>
        <th>SKU</th>
        <th class="text-right">Qty</th>
        <th class="text-right">Unit Price</th>
        <th class="text-right">Line Total</th>
      </tr>
    </thead>
    <tbody>
      ${lineItems
        .map(
          (item, idx) => `<tr>
        <td>${idx + 1}</td>
        <td><strong>${item.description}</strong>${item.notes ? `<div style="font-size:11px;color:#777;">${item.notes}</div>` : ''}</td>
        <td><code>${item.sku || '-'}</code></td>
        <td class="text-right">${item.quantity}</td>
        <td class="text-right">$${item.unitPrice.toFixed(2)}</td>
        <td class="text-right"><strong>$${item.total.toFixed(2)}</strong></td>
      </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="total-row"><span>Subtotal:</span><span>$${rawSubtotal.toFixed(2)}</span></div>
    ${
      calculatedDiscountAmount > 0
        ? `<div class="total-row" style="color:#059669;"><span>Discount (${discountType === 'percentage' ? `${discountValue}%` : `$${discountValue.toFixed(2)}`}):</span><span>-$${calculatedDiscountAmount.toFixed(2)}</span></div>`
        : ''
    }
    <div class="total-row"><span>Tax (Calculated):</span><span>$${calculatedTax.toFixed(2)}</span></div>
    <div class="total-row grand-total"><span>Grand Total Due:</span><span>$${grandTotal.toFixed(2)}</span></div>
  </div>

  <div class="footer">
    <p><strong>Remittance & Payment Instructions:</strong> ${invoiceNotes}</p>
    <p>Depot Operations &bull; Vortix Cloud Orchestration &bull; Generated on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoiceNumber}.html`;
    link.click();
    URL.revokeObjectURL(url);

    onShowNotification?.('Download Ready', `Clean HTML invoice ${invoiceNumber} downloaded.`);
  };

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      id="pos-invoice-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="pos-invoice-modal-card"
        className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-serif text-[#2D2D24]">
                  Commercial Invoice Generator
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] font-semibold">
                  {lineItems.length} {lineItems.length === 1 ? 'Item' : 'Items'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  {status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-[#8B7E66]">
                Generate certified invoices with single or multiple line items, customized discounts, and direct ERP posting.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Tab Switcher */}
            <div className="flex items-center bg-[#F5F5F0] p-1 rounded-xl border border-[#E5E5DE]">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-white text-[#2D2D24] shadow-2xs'
                    : 'text-[#8B7E66] hover:text-[#2D2D24]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-white text-[#2D2D24] shadow-2xs'
                    : 'text-[#8B7E66] hover:text-[#2D2D24]'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Document Preview</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#8B7E66] hover:text-[#2D2D24] hover:bg-[#F5F5F0] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'editor' ? (
            /* ========================================================= */
            /* 1. INTERACTIVE INVOICE BUILDER & EDITOR                   */
            /* ========================================================= */
            <div className="space-y-6">
              {/* Quick Customer Selection Pills */}
              <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E5DE] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Quick Populate Customer Account
                  </span>
                  <span className="text-[11px] text-[#8B7E66]">Click to auto-fill billing details</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleApplyQuickAccount('boeing')}
                    className="px-3 py-1 rounded-xl bg-white border border-[#E5E5DE] hover:border-[#5A5A40] text-xs font-medium text-[#2D2D24] hover:bg-[#F5F5F0] transition-colors cursor-pointer"
                  >
                    ✈️ Boeing Commercial Airplanes (Net 30)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyQuickAccount('lockheed')}
                    className="px-3 py-1 rounded-xl bg-white border border-[#E5E5DE] hover:border-[#5A5A40] text-xs font-medium text-[#2D2D24] hover:bg-[#F5F5F0] transition-colors cursor-pointer"
                  >
                    🛡️ Lockheed Martin MRO (Net 60)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyQuickAccount('guest')}
                    className="px-3 py-1 rounded-xl bg-white border border-[#E5E5DE] hover:border-[#5A5A40] text-xs font-medium text-[#2D2D24] hover:bg-[#F5F5F0] transition-colors cursor-pointer"
                  >
                    🏨 Campus Guest (Suite 101)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyQuickAccount('walkin')}
                    className="px-3 py-1 rounded-xl bg-white border border-[#E5E5DE] hover:border-[#5A5A40] text-xs font-medium text-[#2D2D24] hover:bg-[#F5F5F0] transition-colors cursor-pointer"
                  >
                    🛒 Depot Walk-In Client
                  </button>
                </div>
              </div>

              {/* Top Details Grid: Invoice Metadata & Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left: Customer Billing Information */}
                <div className="p-4 rounded-2xl border border-[#E5E5DE] bg-white space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#E5E5DE] pb-2">
                    <span className="text-xs font-bold text-[#2D2D24] uppercase tracking-wider">
                      1. Customer / Bill-To Entity
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-[#8B7E66]">Contact / Client Name *</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#E5E5DE] bg-[#FAF9F5] focus:outline-none focus:border-[#5A5A40]"
                        placeholder="e.g. John Doe / Procurement Dept"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-[#8B7E66]">Company / Entity</label>
                      <input
                        type="text"
                        value={customerCompany}
                        onChange={(e) => setCustomerCompany(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#E5E5DE] bg-[#FAF9F5] focus:outline-none focus:border-[#5A5A40]"
                        placeholder="e.g. Acme Aerospace Corp"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-[#8B7E66]">Email Address</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#E5E5DE] bg-[#FAF9F5] focus:outline-none focus:border-[#5A5A40]"
                        placeholder="billing@company.com"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-[#8B7E66]">Phone Number</label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#E5E5DE] bg-[#FAF9F5] focus:outline-none focus:border-[#5A5A40]"
                        placeholder="+1 (555) 012-3456"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-[11px] font-medium text-[#8B7E66]">Billing Address</label>
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#E5E5DE] bg-[#FAF9F5] focus:outline-none focus:border-[#5A5A40]"
                        placeholder="Street address, City, State, ZIP"
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Invoice Control Metadata */}
                <div className="p-4 rounded-2xl border border-[#E5E5DE] bg-white space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#E5E5DE] pb-2">
                    <span className="text-xs font-bold text-[#2D2D24] uppercase tracking-wider">
                      2. Invoice Terms & Dates
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-[#8B7E66]">Invoice Number *</label>
                      <input
                        type="text"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#E5E5DE] bg-[#FAF9F5] font-mono font-semibold text-[#5A5A40] focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-[#8B7E66]">PO / Reference Ref</label>
                      <input
                        type="text"
                        value={poReference}
                        onChange={(e) => setPoReference(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#E5E5DE] bg-[#FAF9F5] focus:outline-none focus:border-[#5A5A40]"
                        placeholder="PO-XXXXX"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-[#8B7E66]">Issue Date</label>
                      <input
                        type="date"
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#E5E5DE] bg-[#FAF9F5] focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-[#8B7E66]">Payment Terms</label>
                      <select
                        value={paymentTerms}
                        onChange={(e) =>
                          handlePaymentTermsChange(e.target.value as any)
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-[#E5E5DE] bg-[#FAF9F5] focus:outline-none focus:border-[#5A5A40]"
                      >
                        <option value="Due on Receipt">Due on Receipt</option>
                        <option value="Net 15">Net 15 Days</option>
                        <option value="Net 30">Net 30 Days</option>
                        <option value="Net 60">Net 60 Days</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-[#8B7E66]">Due Date</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#E5E5DE] bg-[#FAF9F5] focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-[#8B7E66]">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#E5E5DE] bg-[#FAF9F5] focus:outline-none focus:border-[#5A5A40] capitalize"
                      >
                        <option value="issued">Issued / Sent</option>
                        <option value="draft">Draft</option>
                        <option value="paid">Paid & Settled</option>
                        <option value="pending">Pending Authorization</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* LINE ITEMS SECTION: SINGLE OR MULTIPLE ITEMS */}
              <div className="p-4 sm:p-5 rounded-2xl border border-[#E5E5DE] bg-white space-y-4 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5DE] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#2D2D24] uppercase tracking-wider">
                        3. Invoice Line Items ({lineItems.length})
                      </h3>
                      {/* Scope Badge */}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-[#E5E5DE] font-semibold text-[#5A5A40]">
                        {lineItems.length === 1 ? 'Single Item Mode' : 'Multi-Item Itemized Mode'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8B7E66]">
                      {lineItems.length === 1
                        ? 'Single product/service mode active. You can add more items at any time.'
                        : 'Listing multiple items. Add from catalog or insert custom MRO services.'}
                    </p>
                  </div>

                  {/* Add Items Toolbar */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={selectedCatalogProductId}
                        onChange={(e) => setSelectedCatalogProductId(e.target.value)}
                        className="text-xs px-2.5 py-1.5 rounded-xl border border-[#E5E5DE] bg-[#FAF9F5] max-w-[200px] truncate focus:outline-none focus:border-[#5A5A40]"
                      >
                        <option value="">-- Add Catalog Item --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (${p.price.toFixed(2)})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddFromCatalog}
                        disabled={!selectedCatalogProductId}
                        className="px-3 py-1.5 rounded-xl bg-[#5A5A40] hover:bg-[#474732] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCustomItem}
                      className="px-3 py-1.5 rounded-xl border border-[#E5E5DE] hover:bg-[#F5F5F0] text-[#2D2D24] text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#5A5A40]" />
                      <span>Custom Service</span>
                    </button>
                  </div>
                </div>

                {/* LINE ITEMS TABLE */}
                {lineItems.length === 1 && itemScopeMode === 'single' ? (
                  /* Highlighted Single-Item Dedicated Layout */
                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E5DE] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#5A5A40] text-white text-xs font-bold flex items-center justify-center">
                          1
                        </span>
                        <span className="text-xs font-bold text-[#2D2D24]">Single Item Focus</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setItemScopeMode('multiple')}
                        className="text-[11px] text-[#5A5A40] hover:underline cursor-pointer"
                      >
                        Switch to Multi-Item Grid View
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                      <div className="sm:col-span-5 space-y-1">
                        <label className="block text-[11px] font-medium text-[#8B7E66]">Item Description *</label>
                        <input
                          type="text"
                          value={lineItems[0].description}
                          onChange={(e) => handleUpdateItem(lineItems[0].id, 'description', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-[#E5E5DE] rounded-xl font-medium"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-[11px] font-medium text-[#8B7E66]">SKU / Part Code</label>
                        <input
                          type="text"
                          value={lineItems[0].sku || ''}
                          onChange={(e) => handleUpdateItem(lineItems[0].id, 'sku', e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-[#E5E5DE] rounded-xl font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-[11px] font-medium text-[#8B7E66]">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={lineItems[0].quantity}
                          onChange={(e) => handleUpdateItem(lineItems[0].id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-3 py-1.5 bg-white border border-[#E5E5DE] rounded-xl text-center font-bold"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="block text-[11px] font-medium text-[#8B7E66]">Unit Price ($)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B7E66]">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={lineItems[0].unitPrice}
                            onChange={(e) => handleUpdateItem(lineItems[0].id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full pl-6 pr-3 py-1.5 bg-white border border-[#E5E5DE] rounded-xl text-right font-bold"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-12 space-y-1 pt-1">
                        <label className="block text-[11px] font-medium text-[#8B7E66]">
                          Item Technical Specifications / Warranty Note
                        </label>
                        <input
                          type="text"
                          value={lineItems[0].notes || ''}
                          onChange={(e) => handleUpdateItem(lineItems[0].id, 'notes', e.target.value)}
                          placeholder="e.g. Serial # SN-98124, 1-Year MRO Overhaul Warranty Included"
                          className="w-full px-3 py-1.5 bg-white border border-[#E5E5DE] rounded-xl text-xs text-[#5A5A40]"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E5E5DE] flex justify-between items-center text-xs">
                      <span className="text-[#8B7E66]">Line Total:</span>
                      <span className="text-base font-bold font-mono text-[#2D2D24]">
                        ${lineItems[0].total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Standard Multi-Item Table */
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#E5E5DE] text-[11px] font-semibold text-[#8B7E66] uppercase tracking-wider">
                          <th className="py-2 px-2 w-10">#</th>
                          <th className="py-2 px-2">Item Description & Notes</th>
                          <th className="py-2 px-2 w-28">SKU</th>
                          <th className="py-2 px-2 w-20 text-center">Qty</th>
                          <th className="py-2 px-2 w-28 text-right">Unit Price</th>
                          <th className="py-2 px-2 w-28 text-right">Line Total</th>
                          <th className="py-2 px-2 w-12 text-center">Del</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5DE]">
                        {lineItems.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-[#FAF9F5] group">
                            <td className="py-2.5 px-2 font-mono text-[#8B7E66]">{idx + 1}</td>
                            <td className="py-2.5 px-2">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-[#E5E5DE] focus:border-[#5A5A40] focus:bg-white rounded-lg font-medium"
                              />
                              <input
                                type="text"
                                placeholder="Add optional line note / spec..."
                                value={item.notes || ''}
                                onChange={(e) => handleUpdateItem(item.id, 'notes', e.target.value)}
                                className="w-full px-2 py-0.5 bg-transparent border border-transparent hover:border-[#E5E5DE] focus:border-[#5A5A40] focus:bg-white rounded text-[10px] text-[#8B7E66]"
                              />
                            </td>
                            <td className="py-2.5 px-2">
                              <input
                                type="text"
                                value={item.sku || ''}
                                onChange={(e) => handleUpdateItem(item.id, 'sku', e.target.value)}
                                className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-[#E5E5DE] focus:border-[#5A5A40] focus:bg-white rounded-lg font-mono text-xs"
                              />
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                                }
                                className="w-16 px-1.5 py-1 bg-white border border-[#E5E5DE] rounded-lg text-center font-bold"
                              />
                            </td>
                            <td className="py-2.5 px-2 text-right">
                              <input
                                type="number"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                                }
                                className="w-20 px-1.5 py-1 bg-white border border-[#E5E5DE] rounded-lg text-right font-medium"
                              />
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono font-bold text-[#2D2D24]">
                              ${item.total.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="p-1 rounded-lg text-[#8B7E66] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* DISCOUNT & FINANCIAL SUMMARY ENGINE */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Left (7 cols): Preset & Manual Discount Controls */}
                <div className="md:col-span-7 p-4 sm:p-5 rounded-2xl border border-[#E5E5DE] bg-white space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#E5E5DE] pb-2">
                    <span className="text-xs font-bold text-[#2D2D24] uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#5A5A40]" /> 4. Discount Configuration (Presets & Manual)
                    </span>
                    {calculatedDiscountAmount > 0 && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        -${calculatedDiscountAmount.toFixed(2)} Off
                      </span>
                    )}
                  </div>

                  {/* Preset Buttons */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-[#8B7E66]">
                      Quick Preset Percentages:
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { label: '0% (None)', val: 0 },
                        { label: '5%', val: 5 },
                        { label: '10%', val: 10 },
                        { label: '15%', val: 15 },
                        { label: '20%', val: 20 },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleApplyPresetDiscount(preset.val)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            discountType === 'percentage' && discountValue === preset.val
                              ? 'bg-[#5A5A40] text-white shadow-2xs'
                              : 'bg-[#FAF9F5] text-[#5A5A40] border border-[#E5E5DE] hover:bg-[#F5F5F0]'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual Discount Entry: % vs $ */}
                  <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E5E5DE] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#2D2D24]">Manual Custom Discount:</span>
                      {/* Toggle Type: % vs $ */}
                      <div className="flex items-center bg-white p-0.5 rounded-lg border border-[#E5E5DE]">
                        <button
                          type="button"
                          onClick={() => {
                            setDiscountType('percentage');
                            setDiscountValue(parseFloat(manualDiscountInput) || 0);
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                            discountType === 'percentage'
                              ? 'bg-[#5A5A40] text-white'
                              : 'text-[#8B7E66] hover:text-[#2D2D24]'
                          }`}
                        >
                          % Percentage
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDiscountType('amount');
                            setDiscountValue(parseFloat(manualDiscountInput) || 0);
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                            discountType === 'amount'
                              ? 'bg-[#5A5A40] text-white'
                              : 'text-[#8B7E66] hover:text-[#2D2D24]'
                          }`}
                        >
                          $ Fixed Dollar
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-[#8B7E66] mb-1">
                          {discountType === 'percentage' ? 'Custom Discount Rate (%)' : 'Custom Flat Discount ($)'}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8B7E66]">
                            {discountType === 'percentage' ? '%' : '$'}
                          </span>
                          <input
                            type="number"
                            step={discountType === 'percentage' ? '0.5' : '1.00'}
                            min="0"
                            max={discountType === 'percentage' ? '100' : rawSubtotal}
                            value={manualDiscountInput}
                            onChange={(e) => handleManualDiscountChange(e.target.value)}
                            className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-[#E5E5DE] bg-white text-xs font-bold focus:outline-none focus:border-[#5A5A40]"
                            placeholder={discountType === 'percentage' ? 'e.g. 12.5' : 'e.g. 50.00'}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#8B7E66] mb-1">
                          Discount Justification / Code
                        </label>
                        <input
                          type="text"
                          value={discountReason}
                          onChange={(e) => setDiscountReason(e.target.value)}
                          placeholder="e.g. Volume tier, Client loyalty"
                          className="w-full px-3 py-1.5 rounded-xl border border-[#E5E5DE] bg-white text-xs focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes to Client */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-[#8B7E66]">
                      Invoice Payment Terms & Remittance Notes:
                    </label>
                    <textarea
                      rows={2}
                      value={invoiceNotes}
                      onChange={(e) => setInvoiceNotes(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-[#E5E5DE] bg-[#FAF9F5] text-xs focus:outline-none focus:border-[#5A5A40]"
                    />
                  </div>
                </div>

                {/* Right (5 cols): Financial Summary Card */}
                <div className="md:col-span-5 p-4 sm:p-5 rounded-2xl border border-[#E5E5DE] bg-[#FAF9F5] space-y-3 flex flex-col justify-between shadow-2xs">
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-[#2D2D24] uppercase tracking-wider block border-b border-[#E5E5DE] pb-2">
                      5. Statement Summary
                    </span>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-[#8B7E66]">
                        <span>Items Subtotal ({lineItems.length} lines):</span>
                        <span className="font-mono text-[#2D2D24]">${rawSubtotal.toFixed(2)}</span>
                      </div>

                      {calculatedDiscountAmount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-medium">
                          <span className="flex items-center gap-1">
                            Discount ({discountType === 'percentage' ? `${discountValue}%` : `$${discountValue.toFixed(2)}`}):
                          </span>
                          <span className="font-mono">-${calculatedDiscountAmount.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-[#8B7E66]">
                        <span>Effective Tax (8.25% weighted):</span>
                        <span className="font-mono text-[#2D2D24]">${calculatedTax.toFixed(2)}</span>
                      </div>

                      <div className="pt-3 border-t border-[#E5E5DE] flex justify-between items-baseline">
                        <div>
                          <span className="text-sm font-bold text-[#2D2D24] block">Grand Total Due</span>
                          <span className="text-[10px] text-[#8B7E66]">USD Remittance</span>
                        </div>
                        <span className="text-xl font-bold font-serif text-[#5A5A40]">
                          ${grandTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Export Tools */}
                  <div className="pt-4 border-t border-[#E5E5DE] space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleSaveToFinanceLedger}
                        className="w-full py-2 px-2.5 rounded-xl bg-white border border-[#E5E5DE] hover:bg-[#F5F5F0] text-xs font-semibold text-[#5A5A40] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Post to Ledger</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleLoadToPosCart}
                        className="w-full py-2 px-2.5 rounded-xl bg-white border border-[#E5E5DE] hover:bg-[#F5F5F0] text-xs font-semibold text-[#5A5A40] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Load to Register</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className="w-full py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Review Document Preview</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* 2. AUTHENTIC CORPORATE DOCUMENT PREVIEW (PRINTABLE)       */
            /* ========================================================= */
            <div className="space-y-4">
              {/* Document Actions Bar */}
              <div className="bg-[#FAF9F5] border border-[#E5E5DE] rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#2D2D24]">Document Ready:</span>
                  <span className="text-xs text-[#8B7E66]">
                    Formatted as standard Corporate Commercial Invoice.
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3.5 py-1.5 rounded-xl bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadHtml}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E5DE] hover:bg-[#F5F5F0] text-[#2D2D24] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>HTML File</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E5DE] hover:bg-[#F5F5F0] text-[#2D2D24] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>JSON Data</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onShowNotification?.(
                        'Invoice Dispatched',
                        `Official invoice ${invoiceNumber} emailed to ${customerEmail}.`,
                        'success'
                      );
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E5DE] hover:bg-[#F5F5F0] text-[#2D2D24] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Email Invoice</span>
                  </button>
                </div>
              </div>

              {/* Printable Invoice Container (Styled like an A4 / Letterhead Page) */}
              <div
                ref={printContainerRef}
                id="pos-invoice-printable-doc"
                className="bg-white border border-[#D5D5CE] rounded-2xl p-6 sm:p-10 shadow-sm max-w-4xl mx-auto space-y-8 text-[#2D2D24]"
              >
                {/* INVOICE HEADER */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-[#5A5A40] pb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#5A5A40] text-white flex items-center justify-center font-serif font-bold text-base">
                        V
                      </div>
                      <span className="text-xl font-bold font-serif tracking-tight text-[#2D2D24]">
                        VORTIX INDUSTRIAL & DEPOT
                      </span>
                    </div>
                    <p className="text-xs text-[#8B7E66] mt-1">
                      Midwest Advanced Machining & Campus Supply Logistics
                    </p>
                    <p className="text-[11px] text-[#8B7E66]">
                      Tax ID: 84-2918841-B &bull; Phone: (800) 555-VRTX &bull; invoicing@vortix.io
                    </p>
                    <p className="text-[11px] text-[#8B7E66]">
                      Depot Register Terminal #01 &bull; Cashier: {currentUser.fullName}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <div className="text-2xl sm:text-3xl font-bold font-serif text-[#5A5A40]">
                      COMMERCIAL INVOICE
                    </div>
                    <div className="text-xs font-mono font-bold text-[#2D2D24] mt-1">
                      {invoiceNumber}
                    </div>
                    <div className="text-xs text-[#8B7E66] mt-0.5">
                      Issue Date: <strong className="text-[#2D2D24]">{issueDate}</strong>
                    </div>
                    <div className="text-xs text-[#8B7E66]">
                      Due Date: <strong className="text-[#2D2D24]">{dueDate}</strong> ({paymentTerms})
                    </div>
                    {poReference && (
                      <div className="text-xs text-[#8B7E66]">
                        PO / Ref: <strong className="text-[#2D2D24]">{poReference}</strong>
                      </div>
                    )}
                    <div className="mt-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        STATUS: {status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BILLING INFORMATION */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E5DE] space-y-1">
                    <div className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                      BILLED TO:
                    </div>
                    <div className="font-bold text-sm text-[#2D2D24]">{customerName}</div>
                    {customerCompany && <div className="text-xs text-[#5A5A40]">{customerCompany}</div>}
                    <div className="text-[#8B7E66]">{customerAddress}</div>
                    <div className="text-[#8B7E66]">Email: {customerEmail}</div>
                    <div className="text-[#8B7E66]">Phone: {customerPhone}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E5DE] space-y-1 sm:text-right">
                    <div className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-wider mb-1">
                      PAYMENT & FULFILLMENT:
                    </div>
                    <div className="font-semibold text-[#2D2D24]">Depot Counter / Direct Dispatch</div>
                    <div className="text-[#8B7E66]">Terms: {paymentTerms}</div>
                    <div className="text-[#8B7E66]">Currency: USD ($)</div>
                    <div className="text-[#8B7E66]">Origin Facility: Midwest Regional Hub</div>
                  </div>
                </div>

                {/* LINE ITEMS DISPLAY TABLE */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider">
                    {lineItems.length === 1 ? 'Itemized Single Line' : `Itemized Goods & Services (${lineItems.length})`}
                  </div>

                  <div className="overflow-x-auto border border-[#E5E5DE] rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#FAF9F5] border-b border-[#E5E5DE] text-[11px] font-semibold text-[#5A5A40]">
                          <th className="py-2.5 px-3 w-10">#</th>
                          <th className="py-2.5 px-3">Item Description</th>
                          <th className="py-2.5 px-3 w-28">SKU</th>
                          <th className="py-2.5 px-3 w-16 text-center">Qty</th>
                          <th className="py-2.5 px-3 w-24 text-right">Unit Price</th>
                          <th className="py-2.5 px-3 w-24 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5DE]">
                        {lineItems.map((item, idx) => (
                          <tr key={item.id} className={idx % 2 === 1 ? 'bg-[#FCFCFA]' : 'bg-white'}>
                            <td className="py-3 px-3 text-[#8B7E66] font-mono">{idx + 1}</td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-[#2D2D24]">{item.description}</div>
                              {item.notes && (
                                <div className="text-[11px] text-[#8B7E66] italic">{item.notes}</div>
                              )}
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] text-[#5A5A40]">
                              {item.sku || '-'}
                            </td>
                            <td className="py-3 px-3 text-center font-bold">{item.quantity}</td>
                            <td className="py-3 px-3 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-[#2D2D24]">
                              ${item.total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* TOTALS BREAKDOWN */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4">
                  <div className="max-w-md space-y-2 text-xs">
                    <div className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider">
                      Remittance & Wire Instructions:
                    </div>
                    <p className="text-[11px] text-[#8B7E66] leading-relaxed bg-[#FAF9F5] p-3 rounded-xl border border-[#E5E5DE]">
                      {invoiceNotes}
                    </p>
                  </div>

                  <div className="w-full sm:w-72 space-y-2 text-xs">
                    <div className="flex justify-between text-[#8B7E66]">
                      <span>Subtotal:</span>
                      <span className="font-mono text-[#2D2D24]">${rawSubtotal.toFixed(2)}</span>
                    </div>

                    {calculatedDiscountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>
                          Discount ({discountType === 'percentage' ? `${discountValue}%` : `$${discountValue.toFixed(2)}`}):
                        </span>
                        <span className="font-mono">-${calculatedDiscountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-[#8B7E66]">
                      <span>Tax (Estimated 8.25%):</span>
                      <span className="font-mono text-[#2D2D24]">${calculatedTax.toFixed(2)}</span>
                    </div>

                    <div className="pt-2 border-t-2 border-[#2D2D24] flex justify-between items-baseline font-bold">
                      <span className="text-sm font-serif">TOTAL DUE:</span>
                      <span className="text-lg font-mono text-[#5A5A40]">
                        ${grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SIGNATURE AND STAMP */}
                <div className="pt-8 border-t border-dashed border-[#E5E5DE] grid grid-cols-2 gap-6 text-xs text-[#8B7E66]">
                  <div>
                    <div className="h-10 border-b border-[#2D2D24]/40 w-48 mb-1"></div>
                    <div>Authorized Representative Signature</div>
                    <div className="text-[10px] text-[#8B7E66]">{currentUser.fullName} &bull; Depot Lead</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] tracking-wider uppercase font-semibold text-[#5A5A40]">
                      Certified Quality Compliance
                    </div>
                    <div className="text-[10px] text-[#8B7E66]">ISO 9001:2015 &bull; AS9100D Depot Accredited</div>
                    <div className="text-[9px] text-[#8B7E66] font-mono mt-1">HASH: {invoiceNumber}-VRTX-OK</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 border-t border-[#E5E5DE] bg-[#FAF9F5] flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#8B7E66]">
            Total Amount: <span className="font-bold text-[#2D2D24] font-mono">${grandTotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E5E5DE] text-xs font-semibold text-[#2D2D24] hover:bg-[#F5F5F0] transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="px-4 py-2 rounded-xl bg-white border border-[#E5E5DE] hover:bg-[#F5F5F0] text-xs font-semibold text-[#5A5A40] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download HTML</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
