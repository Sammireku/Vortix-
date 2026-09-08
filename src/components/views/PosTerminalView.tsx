import React, { useState } from 'react';
import {
  ShoppingCart,
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Building2,
  Bed,
  CheckCircle2,
  Printer,
  RotateCcw,
  Sparkles,
  PauseCircle,
  PlayCircle,
  Receipt,
  User,
  Percent,
  X,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  DollarSign,
  Package,
  ChevronRight,
  FileText,
  Sliders,
  Tag,
  Globe,
  Award,
  Coins,
  History,
  MapPin,
} from 'lucide-react';
import {
  PosProduct,
  PosCartItem,
  PosOrder,
  PosRegisterShift,
  AppUser,
  PropertyReservation,
  Invoice,
  PosCustomerProfile,
  PosCurrency,
  PosTaxRegionConfig,
} from '../../types';
import { PosInvoiceGeneratorModal } from '../modals/PosInvoiceGeneratorModal';
import { ReceiptPreviewModal } from '../modals/ReceiptPreviewModal';
import { PosTaxConfigModal } from '../modals/PosTaxConfigModal';
import { PosCurrencyModal } from '../modals/PosCurrencyModal';
import { PosCustomerLoyaltyPanel } from '../pos/PosCustomerLoyaltyPanel';
import { PosCashDiscountPanel } from '../pos/PosCashDiscountPanel';
import {
  initialCustomerProfiles,
  initialCurrencies,
  initialTaxRegions,
  calculateLoyaltyPointsEarned,
  LOYALTY_REDEMPTION_RATE_PER_POINT,
  formatCurrency,
} from '../../data/posData';

interface PosTerminalViewProps {
  currentUser: AppUser;
  products: PosProduct[];
  onUpdateProducts?: (updatedProducts: PosProduct[]) => void;
  onUpdateProduct?: (updatedProduct: PosProduct) => void;
  activeReservations: PropertyReservation[];
  onAddFolioCharge?: (reservationId: string, description: string, amount: number) => void;
  onProcessOrder?: (order: PosOrder) => void;
  onShowNotification?: (title: string, message: string, type?: 'success' | 'warning' | 'info') => void;
  onAddInvoice?: (invoice: Invoice) => void;
}

export const PosTerminalView: React.FC<PosTerminalViewProps> = ({
  currentUser,
  products,
  onUpdateProducts,
  onUpdateProduct,
  activeReservations,
  onAddFolioCharge,
  onProcessOrder,
  onShowNotification,
  onAddInvoice,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<PosCartItem[]>([]);

  // Multi-Currency state
  const [currencies, setCurrencies] = useState<PosCurrency[]>(initialCurrencies);
  const [activeCurrency, setActiveCurrency] = useState<PosCurrency>(initialCurrencies[0]); // USD
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState<boolean>(false);

  // Dynamic Regional Tax state
  const [taxRegions, setTaxRegions] = useState<PosTaxRegionConfig[]>(initialTaxRegions);
  const [activeTaxRegion, setActiveTaxRegion] = useState<PosTaxRegionConfig>(initialTaxRegions[0]); // Texas 8.25%
  const [isTaxConfigModalOpen, setIsTaxConfigModalOpen] = useState<boolean>(false);

  // Customer Profiles & Loyalty state
  const [customers, setCustomers] = useState<PosCustomerProfile[]>(initialCustomerProfiles);
  const [selectedCustomer, setSelectedCustomer] = useState<PosCustomerProfile | undefined>(initialCustomerProfiles[0]);
  const [selectedCustomerType, setSelectedCustomerType] = useState<'loyalty' | 'walk_in' | 'corporate' | 'room_guest'>('loyalty');
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);

  // Manual Cash Discount typing state
  const [manualCashDiscount, setManualCashDiscount] = useState<number>(0);
  const [manualCashInput, setManualCashInput] = useState<string>('');
  const [cashDiscountReason, setCashDiscountReason] = useState<string>('');

  // Preset percentage / flat discount state
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [manualDiscountInput, setManualDiscountInput] = useState<string>('');
  const [discountReason, setDiscountReason] = useState<string>('');
  const [isManualDiscountOpen, setIsManualDiscountOpen] = useState<boolean>(false);

  // Invoice Generator modal state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [invoiceInitialItems, setInvoiceInitialItems] = useState<PosCartItem[]>([]);
  const [invoiceCustomerPreset, setInvoiceCustomerPreset] = useState<{
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    address?: string;
    poReference?: string;
  } | undefined>(undefined);

  const [selectedReservationId, setSelectedReservationId] = useState<string>(activeReservations[0]?.id || '');
  const [corporateCustomerName, setCorporateCustomerName] = useState('Boeing Commercial Airplanes');

  // Checkout modal states
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'cash' | 'corporate_po' | 'room_folio_charge'>('credit_card');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<PosOrder | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Shift state
  const [shift, setShift] = useState<PosRegisterShift>({
    id: 'shift-001',
    registerNumber: 'Register #01 (Main Depot)',
    cashierId: currentUser.id,
    cashierName: currentUser.fullName,
    openedAt: '08:00 AM',
    openingCash: 350.0,
    currentCash: 542.5,
    expectedCash: 542.5,
    totalCardSales: 1820.0,
    totalCashSales: 192.5,
    totalRoomCharges: 342.5,
    status: 'open',
  });
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  // Parked orders
  const [parkedOrders, setParkedOrders] = useState<Array<{ id: string; time: string; items: PosCartItem[]; customer: string }>>([]);

  const categories = [
    'all',
    'Fasteners & Hardware',
    'Industrial Components',
    'Safety & PPE',
    'Hospitality & Retail',
    'Services & Labor',
    'Replacement Spares',
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery);
    return matchesCategory && matchesQuery;
  });

  const addToCart = (product: PosProduct) => {
    if (product.stockQty <= 0) {
      onShowNotification?.('Out of Stock', `${product.name} is currently out of stock.`, 'warning');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQty) {
          onShowNotification?.('Max Stock Reached', `Only ${product.stockQty} units available in inventory.`, 'warning');
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${product.id}`,
          product,
          quantity: 1,
          unitPrice: product.price,
          discountPct: 0,
        },
      ];
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const nextQty = item.quantity + delta;
            if (nextQty > item.product.stockQty) {
              onShowNotification?.('Max Stock', `Maximum available stock is ${item.product.stockQty}.`, 'warning');
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  // Calculations
  const rawSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // 1. Standard preset percentage or flat discount
  let standardDiscountAmount = 0;
  if (discountType === 'percentage') {
    const clampedPct = Math.min(100, Math.max(0, discountValue));
    standardDiscountAmount = rawSubtotal * (clampedPct / 100);
  } else {
    standardDiscountAmount = Math.min(rawSubtotal, Math.max(0, discountValue));
  }

  // 2. Manual cash discount (manually typed in cash)
  const remainingAfterStandard = Math.max(0, rawSubtotal - standardDiscountAmount);
  const cashDiscountAmount = Math.min(remainingAfterStandard, Math.max(0, manualCashDiscount));

  // 3. Loyalty points redemption (flat discount)
  const remainingAfterCash = Math.max(0, remainingAfterStandard - cashDiscountAmount);
  const maxRedeemablePoints =
    selectedCustomer && selectedCustomerType === 'loyalty'
      ? Math.min(selectedCustomer.loyaltyPoints, Math.floor(remainingAfterCash / LOYALTY_REDEMPTION_RATE_PER_POINT))
      : 0;
  const clampedPointsToRedeem = Math.min(pointsToRedeem, maxRedeemablePoints);
  const loyaltyDiscountAmount = clampedPointsToRedeem * LOYALTY_REDEMPTION_RATE_PER_POINT;

  // Total discount and taxable subtotal
  const totalDiscountAmount = standardDiscountAmount + cashDiscountAmount + loyaltyDiscountAmount;
  const discountedSubtotal = Math.max(0, rawSubtotal - totalDiscountAmount);

  // 4. Dynamic Regional Tax Calculation (with optional wholesale exemption)
  const isWholesale = activeTaxRegion.exemptWholesale && selectedCustomerType === 'corporate';
  const effectiveTaxRate = isWholesale ? 0 : activeTaxRegion.rate;
  const taxTotal = discountedSubtotal * effectiveTaxRate;
  const grandTotal = discountedSubtotal + taxTotal;

  // Converted Currency equivalents
  const convertedGrandTotal = grandTotal * activeCurrency.rate;
  const convertedTaxTotal = taxTotal * activeCurrency.rate;

  // Loyalty points earned on this sale
  const pointsEarnedOnSale =
    selectedCustomer && selectedCustomerType === 'loyalty'
      ? calculateLoyaltyPointsEarned(grandTotal, selectedCustomer.tier)
      : 0;

  const handleApplyPresetDiscount = (pct: number) => {
    if (!currentUser.dataAccess.canOverrideDiscounts && pct > 0) {
      onShowNotification?.(
        'Permission Restricted',
        'Your user role does not have authorization to override POS discounts.',
        'warning'
      );
      return;
    }
    setDiscountType('percentage');
    setDiscountValue(pct);
    setManualDiscountInput(pct > 0 ? pct.toString() : '');
  };

  const handleApplyManualDiscount = (type: 'percentage' | 'amount', val: number, reason?: string) => {
    if (!currentUser.dataAccess.canOverrideDiscounts && val > 0) {
      onShowNotification?.(
        'Permission Restricted',
        'Your user role does not have authorization to override POS discounts.',
        'warning'
      );
      return;
    }
    setDiscountType(type);
    setDiscountValue(Math.max(0, val));
    if (reason !== undefined) setDiscountReason(reason);
  };

  const handleClearDiscount = () => {
    setDiscountType('percentage');
    setDiscountValue(0);
    setManualDiscountInput('');
    setDiscountReason('');
  };

  const handleParkOrder = () => {
    if (cart.length === 0) return;
    const newParked = {
      id: `park-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: [...cart],
      customer:
        selectedCustomerType === 'loyalty' && selectedCustomer
          ? `${selectedCustomer.name} (${selectedCustomer.tier})`
          : selectedCustomerType === 'room_guest'
          ? `Guest: ${activeReservations.find((r) => r.id === selectedReservationId)?.guestName || 'Room'}`
          : selectedCustomerType === 'corporate'
          ? corporateCustomerName
          : 'Walk-in Customer',
    };
    setParkedOrders((prev) => [newParked, ...prev]);
    setCart([]);
    onShowNotification?.('Order Held', 'Current cart parked successfully. Ready for next customer.');
  };

  const handleRecallOrder = (parkedId: string) => {
    const order = parkedOrders.find((p) => p.id === parkedId);
    if (!order) return;
    setCart(order.items);
    setParkedOrders((prev) => prev.filter((p) => p.id !== parkedId));
    onShowNotification?.('Order Recalled', 'Parked transaction restored to active register.');
  };

  const handleStartCheckout = () => {
    if (cart.length === 0) {
      onShowNotification?.('Cart Empty', 'Please add items before proceeding to checkout.', 'warning');
      return;
    }
    setCashTendered(Math.ceil(grandTotal));
    setIsCheckoutModalOpen(true);
  };

  const handleCompleteTransaction = () => {
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);

      const targetReservation =
        paymentMethod === 'room_folio_charge'
          ? activeReservations.find((r) => r.id === selectedReservationId)
          : undefined;

      const orderCustomerName =
        selectedCustomerType === 'loyalty' && selectedCustomer
          ? selectedCustomer.name
          : selectedCustomerType === 'room_guest' && targetReservation
          ? targetReservation.guestName
          : selectedCustomerType === 'corporate'
          ? corporateCustomerName
          : 'Walk-In Customer';

      const orderRecord: PosOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        receiptNumber: `RCP-VX-${Math.floor(1000 + Math.random() * 9000)}`,
        items: [...cart],
        subtotal: rawSubtotal,
        taxTotal,
        discountTotal: totalDiscountAmount,
        grandTotal,
        paymentMethod,
        paymentStatus: 'completed',
        cashierId: currentUser.id,
        cashierName: currentUser.fullName,
        customerName: orderCustomerName,
        roomChargeDetails: targetReservation
          ? {
              reservationId: targetReservation.id,
              unitNumber: targetReservation.unitNumber,
              guestName: targetReservation.guestName,
            }
          : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amountTendered: paymentMethod === 'cash' ? cashTendered : grandTotal,
        changeDue: paymentMethod === 'cash' ? Math.max(0, cashTendered - grandTotal) : 0,
        // Loyalty tracking link
        customerId: selectedCustomerType === 'loyalty' ? selectedCustomer?.id : undefined,
        loyaltyPointsEarned: pointsEarnedOnSale,
        loyaltyPointsRedeemed: clampedPointsToRedeem,
        loyaltyDiscountAmount: loyaltyDiscountAmount,
        cashDiscountAmount: cashDiscountAmount,
        // Multi-currency details
        currencyCode: activeCurrency.code,
        currencyRate: activeCurrency.rate,
        currencySymbol: activeCurrency.symbol,
        // Dynamic Regional Tax details
        taxRegionId: activeTaxRegion.id,
        taxRegionName: activeTaxRegion.regionName,
        taxLabel: activeTaxRegion.taxLabel,
        taxRateApplied: effectiveTaxRate,
      };

      // Decrement product inventory
      const updatedProducts = products.map((prod) => {
        const itemInCart = cart.find((c) => c.product.id === prod.id);
        if (itemInCart) {
          return {
            ...prod,
            stockQty: Math.max(0, prod.stockQty - itemInCart.quantity),
          };
        }
        return prod;
      });
      if (onUpdateProducts) {
        onUpdateProducts(updatedProducts);
      }
      if (onProcessOrder) {
        onProcessOrder(orderRecord);
      }

      // If room folio charge, push to property management
      if (paymentMethod === 'room_folio_charge' && targetReservation && onAddFolioCharge) {
        onAddFolioCharge(
          targetReservation.id,
          `POS Purchase ${orderRecord.orderNumber} (${cart.length} items)`,
          grandTotal
        );
      }

      // Update customer loyalty points and order history log
      if (selectedCustomerType === 'loyalty' && selectedCustomer) {
        const historyEntry = {
          orderId: orderRecord.id,
          orderNumber: orderRecord.orderNumber,
          date: new Date().toISOString().split('T')[0],
          total: grandTotal,
          pointsEarned: pointsEarnedOnSale,
          pointsRedeemed: clampedPointsToRedeem,
          currency: activeCurrency.code,
        };

        setCustomers((prev) =>
          prev.map((c) => {
            if (c.id === selectedCustomer.id) {
              const netPoints = Math.max(0, c.loyaltyPoints - clampedPointsToRedeem) + pointsEarnedOnSale;
              const updatedCustomer: PosCustomerProfile = {
                ...c,
                loyaltyPoints: netPoints,
                lifetimePointsEarned: c.lifetimePointsEarned + pointsEarnedOnSale,
                lifetimeSpend: c.lifetimeSpend + grandTotal,
                orderHistory: [historyEntry, ...(c.orderHistory || [])],
              };
              setSelectedCustomer(updatedCustomer);
              return updatedCustomer;
            }
            return c;
          })
        );
      }

      // Update shift stats
      setShift((prev) => ({
        ...prev,
        currentCash:
          paymentMethod === 'cash' ? prev.currentCash + grandTotal : prev.currentCash,
        totalCashSales:
          paymentMethod === 'cash' ? prev.totalCashSales + grandTotal : prev.totalCashSales,
        totalCardSales:
          paymentMethod === 'credit_card' ? prev.totalCardSales + grandTotal : prev.totalCardSales,
        totalRoomCharges:
          paymentMethod === 'room_folio_charge'
            ? prev.totalRoomCharges + grandTotal
            : prev.totalRoomCharges,
      }));

      setCompletedOrder(orderRecord);
      setIsReceiptModalOpen(true);
      setIsCheckoutModalOpen(false);
      setCart([]);
      handleClearDiscount();
      setManualCashDiscount(0);
      setManualCashInput('');
      setCashDiscountReason('');
      setPointsToRedeem(0);

      onShowNotification?.(
        'Payment Approved',
        `Transaction ${orderRecord.orderNumber} processed successfully ($${grandTotal.toFixed(2)} USD).`,
        'success'
      );
    }, 900);
  };

  const handleSimulateScan = () => {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    if (randomProduct) {
      addToCart(randomProduct);
      onShowNotification?.('Barcode Scanned', `Scanned [${randomProduct.barcode}] - ${randomProduct.name}`);
    }
  };

  const handleOpenInvoiceModal = (customItems?: PosCartItem[]) => {
    const itemsToInvoice = customItems || cart;
    setInvoiceInitialItems(itemsToInvoice);
    setInvoiceCustomerPreset(
      selectedCustomerType === 'loyalty' && selectedCustomer
        ? {
            name: selectedCustomer.name,
            company: selectedCustomer.company,
            email: selectedCustomer.email,
            phone: selectedCustomer.phone,
            poReference: `LOYALTY-${selectedCustomer.id.slice(-4).toUpperCase()}`,
          }
        : selectedCustomerType === 'corporate'
        ? { name: corporateCustomerName, company: 'Commercial Account' }
        : selectedCustomerType === 'room_guest'
        ? {
            name: activeReservations.find((r) => r.id === selectedReservationId)?.guestName || 'In-House Guest',
            company: 'Campus Residence Guest',
            address: `Suite ${activeReservations.find((r) => r.id === selectedReservationId)?.unitNumber || '101'}`,
          }
        : { name: 'Walk-In Customer' }
    );
    setIsInvoiceModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Top POS Header */}
      <div className="bg-white border border-[#E5E5DE] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-serif text-[#2D2D24]">Vortix POS Terminal & Depot</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                Online & Synced
              </span>
            </div>
            <p className="text-xs text-[#8B7E66]">
              Industrial hardware sales, MRO parts checkout, and campus hospitality room charge settlement.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Multi-Currency Conversion Button */}
          <button
            onClick={() => setIsCurrencyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#F5F5F0] border border-[#5A5A40]/30 text-xs font-semibold text-[#5A5A40] rounded-xl transition-colors cursor-pointer shadow-xs"
            title="Convert and select active currency"
          >
            <Globe className="w-4 h-4 text-[#5A5A40]" />
            <span className="font-mono">{activeCurrency.code} ({activeCurrency.symbol})</span>
            {activeCurrency.rate !== 1 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#5A5A40]/10 font-normal">
                x{activeCurrency.rate}
              </span>
            )}
          </button>

          {/* Regional Tax Configuration Button */}
          <button
            onClick={() => setIsTaxConfigModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#F5F5F0] border border-[#5A5A40]/30 text-xs font-semibold text-[#5A5A40] rounded-xl transition-colors cursor-pointer shadow-xs"
            title="Configure POS dynamic regional tax rates"
          >
            <MapPin className="w-4 h-4 text-[#5A5A40]" />
            <span>Tax: {activeTaxRegion.regionName} ({(effectiveTaxRate * 100).toFixed(1)}%)</span>
          </button>

          <button
            onClick={() => handleOpenInvoiceModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#F5F5F0] border border-[#5A5A40]/30 text-xs font-semibold text-[#5A5A40] rounded-xl transition-colors cursor-pointer shadow-xs"
            title="Generate custom single or multi-item official invoice"
          >
            <FileText className="w-4 h-4 text-[#5A5A40]" />
            <span>Invoice</span>
          </button>

          <button
            onClick={handleSimulateScan}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#F5F5F0] border border-[#E5E5DE] text-xs font-semibold text-[#5A5A40] rounded-xl transition-colors cursor-pointer"
          >
            <Barcode className="w-4 h-4" />
            <span>Scan</span>
          </button>

          <button
            onClick={() => setIsShiftModalOpen(true)}
            className="flex items-center gap-2 bg-[#F5F5F0] hover:bg-[#E9E9E0] border border-[#E5E5DE] text-xs font-medium text-[#2D2D24] px-3.5 py-1.5 rounded-xl cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>Drawer: ${shift.currentCash.toFixed(2)}</span>
          </button>

          <div className="text-xs px-3 py-1.5 rounded-xl bg-[#5A5A40]/10 text-[#5A5A40] font-medium">
            Cashier: <span className="font-bold">{currentUser.fullName}</span>
          </div>
        </div>
      </div>

      {/* Main Terminal Layout: Left Product Catalog, Right Interactive Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT: Product Catalog (7 or 8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Category Tabs & Search */}
          <div className="bg-white border border-[#E5E5DE] rounded-2xl p-3 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#8B7E66] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search item, SKU, or enter barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="text-xs text-[#8B7E66]">
                {filteredProducts.length} items available
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#5A5A40] text-white font-semibold'
                      : 'bg-[#F5F5F0] text-[#5A5A40] hover:bg-[#E9E9E0]'
                  }`}
                >
                  {cat === 'all' ? 'All Catalog' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[640px] overflow-y-auto pr-1">
            {filteredProducts.map((product) => {
              const inCartItem = cart.find((c) => c.product.id === product.id);
              const isOutOfStock = product.stockQty <= 0;

              return (
                <div
                  key={product.id}
                  onClick={() => !isOutOfStock && addToCart(product)}
                  className={`bg-white border rounded-2xl p-3 flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group select-none shadow-2xs ${
                    isOutOfStock
                      ? 'opacity-60 border-red-200 bg-red-50/20 cursor-not-allowed'
                      : inCartItem
                      ? 'border-[#5A5A40] ring-2 ring-[#5A5A40]/15'
                      : 'border-[#E5E5DE] hover:border-[#5A5A40]/60 hover:shadow-xs'
                  }`}
                >
                  {inCartItem && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#5A5A40] text-white text-[10px] font-bold flex items-center justify-center">
                      {inCartItem.quantity}
                    </div>
                  )}

                  <div>
                    <div className="w-full h-24 rounded-xl bg-[#F5F5F0] overflow-hidden mb-2.5 relative">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#8B7E66]">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono">
                        {product.sku}
                      </div>
                    </div>

                    <div className="font-semibold text-[#2D2D24] text-xs line-clamp-2 leading-snug">
                      {product.name}
                    </div>
                    <div className="text-[10px] text-[#8B7E66] mt-0.5">{product.unit}</div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#E5E5DE] flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold font-serif text-[#2D2D24]">
                        {activeCurrency.code === 'USD' ? (
                          <span>${product.price.toFixed(2)}</span>
                        ) : (
                          <div className="flex flex-col">
                            <span>{formatCurrency(product.price, activeCurrency)}</span>
                            <span className="text-[10px] text-[#8B7E66] font-mono font-normal">
                              ${product.price.toFixed(2)} USD
                            </span>
                          </div>
                        )}
                      </div>
                      <div
                        className={`text-[10px] font-medium ${
                          product.stockQty <= 15 ? 'text-amber-700' : 'text-[#8B7E66]'
                        }`}
                      >
                        {isOutOfStock ? 'Out of Stock' : `${product.stockQty} in stock`}
                      </div>
                    </div>

                    <button
                      disabled={isOutOfStock}
                      className="w-7 h-7 rounded-xl bg-[#F5F5F0] group-hover:bg-[#5A5A40] text-[#5A5A40] group-hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Register Cart & Tender Panel (5 or 4 cols) */}
        <div id="pos-cart-panel" className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl p-4 shadow-xs flex flex-col h-full min-h-[580px]">
            {/* Cart Header */}
            <div className="flex items-center justify-between border-b border-[#E5E5DE] pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#5A5A40]" />
                <span className="font-bold font-serif text-sm text-[#2D2D24]">Active Order</span>
                <span className="text-xs px-2 py-0.2 rounded-full bg-[#F5F5F0] text-[#5A5A40] font-medium">
                  {cart.reduce((s, i) => s + i.quantity, 0)} items
                </span>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-[11px] text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* Customer & Loyalty Account Link */}
            <div className="mt-3">
              <PosCustomerLoyaltyPanel
                customers={customers}
                selectedCustomer={selectedCustomer}
                onSelectCustomer={setSelectedCustomer}
                selectedCustomerType={selectedCustomerType}
                onChangeCustomerType={setSelectedCustomerType}
                pointsToRedeem={pointsToRedeem}
                onPointsToRedeemChange={setPointsToRedeem}
                maxRedeemablePoints={maxRedeemablePoints}
                activeReservations={activeReservations}
                selectedReservationId={selectedReservationId}
                onSelectReservationId={setSelectedReservationId}
                corporateCustomerName={corporateCustomerName}
                onCorporateCustomerNameChange={setCorporateCustomerName}
                onAddNewCustomer={(newCust) => {
                  setCustomers((prev) => [newCust, ...prev]);
                  setSelectedCustomer(newCust);
                  setSelectedCustomerType('loyalty');
                  onShowNotification?.('Customer Profile Added', `${newCust.name} enrolled in loyalty program.`, 'success');
                }}
                onShowNotification={onShowNotification}
              />
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto my-3 divide-y divide-[#E5E5DE] max-h-[260px] pr-1">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#8B7E66]">
                  <ShoppingCart className="w-10 h-10 stroke-1 mb-2 opacity-40" />
                  <p className="text-xs">No items scanned.</p>
                  <p className="text-[11px] opacity-70">Click items on the left or simulate barcode scan.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#2D2D24] truncate">
                        {item.product.name}
                      </div>
                      <div className="text-[10px] text-[#8B7E66]">
                        ${item.unitPrice.toFixed(2)} each &bull; SKU: {item.product.sku}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-[#F5F5F0] hover:bg-[#E9E9E0] flex items-center justify-center text-[#5A5A40] cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-[#F5F5F0] hover:bg-[#E9E9E0] flex items-center justify-center text-[#5A5A40] cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[55px]">
                      <div className="text-xs font-bold text-[#2D2D24]">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#8B7E66] hover:text-red-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Discount and Cart Action Controls */}
            {cart.length > 0 && (
              <div className="pt-2 border-t border-[#E5E5DE] space-y-2.5 text-xs">
                {/* Preset & Manual Percentage Discount Buttons */}
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-[#8B7E66] flex items-center gap-1">
                    <Tag className="w-3 h-3 text-[#5A5A40]" /> Preset %:
                  </span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {[0, 5, 10, 15, 20].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => handleApplyPresetDiscount(pct)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                          discountType === 'percentage' && discountValue === pct && !isManualDiscountOpen
                            ? 'bg-[#5A5A40] text-white'
                            : 'bg-[#F5F5F0] text-[#5A5A40] hover:bg-[#E9E9E0]'
                        }`}
                      >
                        {pct === 0 ? 'None' : `${pct}%`}
                      </button>
                    ))}
                    <button
                      onClick={() => setIsManualDiscountOpen(!isManualDiscountOpen)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5 cursor-pointer transition-colors ${
                        isManualDiscountOpen || (discountValue > 0 && (discountType === 'amount' || ![5, 10, 15, 20].includes(discountValue)))
                          ? 'bg-[#2D2D24] text-white'
                          : 'bg-[#FAF9F5] border border-[#E5E5DE] text-[#5A5A40] hover:bg-[#F5F5F0]'
                      }`}
                      title="Apply manual percentage or flat dollar discount"
                    >
                      <Sliders className="w-2.5 h-2.5" />
                      <span>Custom %</span>
                    </button>
                  </div>
                </div>

                {/* Expandable Manual Percentage/Flat Discount Entry Panel */}
                {isManualDiscountOpen && (
                  <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E5DE] space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-wider">
                        Percentage / Flat Discount
                      </span>
                      <div className="flex items-center bg-white p-0.5 rounded-lg border border-[#E5E5DE] text-[10px]">
                        <button
                          onClick={() => {
                            setDiscountType('percentage');
                            const num = parseFloat(manualDiscountInput) || 0;
                            setDiscountValue(Math.min(100, Math.max(0, num)));
                          }}
                          className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                            discountType === 'percentage'
                              ? 'bg-[#5A5A40] text-white'
                              : 'text-[#8B7E66] hover:text-[#2D2D24]'
                          }`}
                        >
                          % Pct
                        </button>
                        <button
                          onClick={() => {
                            setDiscountType('amount');
                            const num = parseFloat(manualDiscountInput) || 0;
                            setDiscountValue(Math.min(rawSubtotal, Math.max(0, num)));
                          }}
                          className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                            discountType === 'amount'
                              ? 'bg-[#5A5A40] text-white'
                              : 'text-[#8B7E66] hover:text-[#2D2D24]'
                          }`}
                        >
                          $ Flat
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8B7E66]">
                          {discountType === 'percentage' ? '%' : '$'}
                        </span>
                        <input
                          type="number"
                          step={discountType === 'percentage' ? '0.5' : '1.00'}
                          min="0"
                          max={discountType === 'percentage' ? '100' : rawSubtotal}
                          placeholder={discountType === 'percentage' ? 'e.g. 12.5' : 'e.g. 25.00'}
                          value={manualDiscountInput}
                          onChange={(e) => {
                            const valStr = e.target.value;
                            setManualDiscountInput(valStr);
                            const num = parseFloat(valStr) || 0;
                            handleApplyManualDiscount(discountType, num);
                          }}
                          className="w-full pl-6 pr-2 py-1 bg-white border border-[#E5E5DE] rounded-lg text-xs font-bold text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>

                      <button
                        onClick={handleClearDiscount}
                        className="px-2 py-1 bg-white hover:bg-[#F5F5F0] border border-[#E5E5DE] text-[10px] text-red-600 rounded-lg cursor-pointer font-medium"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Discount Reason Tag */}
                    <div>
                      <input
                        type="text"
                        placeholder="Reason (e.g. Clearance, Damaged, Staff)"
                        value={discountReason}
                        onChange={(e) => setDiscountReason(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-[#E5E5DE] rounded-lg text-[11px] text-[#5A5A40] placeholder:text-[#8B7E66]/60 focus:outline-none focus:border-[#5A5A40]"
                      />
                    </div>
                  </div>
                )}

                {/* Manually Typing Discount Amount in Cash Panel */}
                <PosCashDiscountPanel
                  manualCashDiscount={manualCashDiscount}
                  manualCashInput={manualCashInput}
                  onManualCashInputChange={setManualCashInput}
                  onApplyCashDiscount={setManualCashDiscount}
                  cashDiscountReason={cashDiscountReason}
                  onCashDiscountReasonChange={setCashDiscountReason}
                  rawSubtotal={rawSubtotal}
                  currency={activeCurrency}
                  canOverrideDiscounts={currentUser.dataAccess.canOverrideDiscounts}
                  onShowNotification={onShowNotification}
                />

                {/* Cart Action Buttons: Hold, Invoice, Recall */}
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={handleParkOrder}
                    className="flex-1 py-1.5 rounded-xl border border-[#E5E5DE] bg-[#FAF9F5] hover:bg-[#F5F5F0] text-[11px] font-medium text-[#5A5A40] flex items-center justify-center gap-1 cursor-pointer"
                    title="Park this cart to hold items temporarily"
                  >
                    <PauseCircle className="w-3.5 h-3.5" /> Hold
                  </button>

                  <button
                    onClick={() => handleOpenInvoiceModal()}
                    className="flex-1 py-1.5 rounded-xl border border-[#5A5A40]/30 bg-[#FAF9F5] hover:bg-[#5A5A40]/10 text-[11px] font-semibold text-[#5A5A40] flex items-center justify-center gap-1 cursor-pointer"
                    title="Generate formal single or multi-item invoice from cart"
                  >
                    <FileText className="w-3.5 h-3.5" /> Invoice
                  </button>

                  {parkedOrders.length > 0 && (
                    <button
                      onClick={() => handleRecallOrder(parkedOrders[0].id)}
                      className="py-1.5 px-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-[11px] font-medium text-amber-800 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <PlayCircle className="w-3.5 h-3.5" /> ({parkedOrders.length})
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div className="mt-3 pt-3 border-t border-[#E5E5DE] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#8B7E66]">
                <span>Catalog Subtotal:</span>
                <span>
                  ${rawSubtotal.toFixed(2)} USD
                  {activeCurrency.code !== 'USD' && ` • ${formatCurrency(rawSubtotal, activeCurrency)}`}
                </span>
              </div>

              {/* Cash Discount */}
              {cashDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span className="flex items-center gap-1">
                    <span>
                      Cash Discount ({cashDiscountReason || 'Manually Typed'}):
                    </span>
                    <button
                      onClick={() => {
                        setManualCashDiscount(0);
                        setManualCashInput('');
                        setCashDiscountReason('');
                      }}
                      className="text-[11px] text-red-500 hover:text-red-700 ml-1 cursor-pointer font-bold"
                      title="Clear cash discount"
                    >
                      ×
                    </button>
                  </span>
                  <span>-${cashDiscountAmount.toFixed(2)} USD</span>
                </div>
              )}

              {/* Standard Discount */}
              {standardDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span className="flex items-center gap-1">
                    <span>
                      Discount ({discountType === 'percentage' ? `${discountValue}%` : `$${discountValue.toFixed(2)}`}
                      {discountReason ? ` • ${discountReason}` : ''}):
                    </span>
                    <button
                      onClick={handleClearDiscount}
                      className="text-[11px] text-red-500 hover:text-red-700 ml-1 cursor-pointer font-bold"
                      title="Clear discount"
                    >
                      ×
                    </button>
                  </span>
                  <span>-${standardDiscountAmount.toFixed(2)} USD</span>
                </div>
              )}

              {/* Loyalty Discount */}
              {loyaltyDiscountAmount > 0 && (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span className="flex items-center gap-1">
                    <span>Loyalty Rewards ({clampedPointsToRedeem} pts):</span>
                    <button
                      onClick={() => setPointsToRedeem(0)}
                      className="text-[11px] text-red-500 hover:text-red-700 ml-1 cursor-pointer font-bold"
                      title="Remove loyalty redemption"
                    >
                      ×
                    </button>
                  </span>
                  <span>-${loyaltyDiscountAmount.toFixed(2)} USD</span>
                </div>
              )}

              {/* Regional Tax */}
              <div className="flex justify-between text-[#8B7E66]">
                <span className="flex items-center gap-1">
                  <span>Tax ({activeTaxRegion.taxLabel} @ {(effectiveTaxRate * 100).toFixed(2)}%):</span>
                  <button
                    onClick={() => setIsTaxConfigModalOpen(true)}
                    className="text-[10px] text-[#5A5A40] underline hover:text-[#2D2D24] cursor-pointer"
                  >
                    {activeTaxRegion.regionName}
                  </button>
                </span>
                <span>
                  ${taxTotal.toFixed(2)} USD
                  {activeCurrency.code !== 'USD' && ` • ${formatCurrency(taxTotal, activeCurrency)}`}
                </span>
              </div>

              {/* Grand Total */}
              <div className="pt-2 border-t border-[#E5E5DE]">
                <div className="flex justify-between items-baseline text-base font-bold font-serif text-[#2D2D24]">
                  <span>Grand Total:</span>
                  <span>${grandTotal.toFixed(2)} USD</span>
                </div>
                {activeCurrency.code !== 'USD' && (
                  <div className="flex justify-between items-baseline text-xs font-mono font-bold text-blue-800 mt-0.5">
                    <span>Converted ({activeCurrency.code}):</span>
                    <span>{formatCurrency(grandTotal, activeCurrency)}</span>
                  </div>
                )}
                {selectedCustomerType === 'loyalty' && selectedCustomer && (
                  <div className="text-[10px] text-amber-800 mt-1 flex items-center justify-between bg-amber-50/70 p-1.5 rounded-lg border border-amber-200/60">
                    <span>Reward on checkout:</span>
                    <span className="font-bold">+{pointsEarnedOnSale} points</span>
                  </div>
                )}
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              disabled={cart.length === 0}
              onClick={handleStartCheckout}
              className="mt-4 w-full py-3 rounded-2xl bg-[#5A5A40] hover:bg-[#474732] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <span>
                Collect ${grandTotal.toFixed(2)} USD
                {activeCurrency.code !== 'USD' ? ` • ${formatCurrency(grandTotal, activeCurrency)}` : ''}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Floating Cart Action Bar */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 animate-in slide-in-from-bottom-4 duration-200">
          <div className="bg-[#2D2D24] text-white p-3 rounded-2xl shadow-xl border border-[#5A5A40] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#5A5A40] flex items-center justify-center text-white shrink-0">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold font-serif">
                  {cart.reduce((s, i) => s + i.quantity, 0)} items &bull; ${grandTotal.toFixed(2)}
                </div>
                <div className="text-[10px] text-[#C1C1B8] truncate">Tax incl. &bull; Ready to Tender</div>
              </div>
            </div>
            <button
              onClick={() => {
                const cartEl = document.getElementById('pos-cart-panel');
                if (cartEl) {
                  cartEl.scrollIntoView({ behavior: 'smooth' });
                } else {
                  handleStartCheckout();
                }
              }}
              className="px-3.5 py-2 bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>View Cart</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold font-serif text-base text-[#2D2D24]">Checkout & Payment Tender</h3>
                  <p className="text-[11px] text-[#8B7E66]">Total Due: ${grandTotal.toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="p-1 rounded-xl text-[#8B7E66] hover:text-[#2D2D24] hover:bg-[#E9E9E0] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto">
              {/* Payment Tender Tabs */}
              <div>
                <label className="block text-xs font-semibold text-[#2D2D24] mb-2">
                  Select Tender Method:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 cursor-pointer ${
                      paymentMethod === 'credit_card'
                        ? 'border-[#5A5A40] bg-[#FAF9F5] ring-2 ring-[#5A5A40]/15'
                        : 'border-[#E5E5DE] hover:bg-[#FAF9F5]'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-[#5A5A40]" />
                    <div>
                      <div className="font-bold text-[#2D2D24]">Credit / Debit Card</div>
                      <div className="text-[10px] text-[#8B7E66]">Chip, Tap & EMV Contactless</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'border-[#5A5A40] bg-[#FAF9F5] ring-2 ring-[#5A5A40]/15'
                        : 'border-[#E5E5DE] hover:bg-[#FAF9F5]'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-[#5A5A40]" />
                    <div>
                      <div className="font-bold text-[#2D2D24]">Cash Tender</div>
                      <div className="text-[10px] text-[#8B7E66]">Drawer change calculator</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('room_folio_charge')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 cursor-pointer ${
                      paymentMethod === 'room_folio_charge'
                        ? 'border-[#5A5A40] bg-[#FAF9F5] ring-2 ring-[#5A5A40]/15'
                        : 'border-[#E5E5DE] hover:bg-[#FAF9F5]'
                    }`}
                  >
                    <Bed className="w-5 h-5 text-[#5A5A40]" />
                    <div>
                      <div className="font-bold text-[#2D2D24]">Room Folio Charge</div>
                      <div className="text-[10px] text-[#8B7E66]">Direct PMS sync billing</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('corporate_po')}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 cursor-pointer ${
                      paymentMethod === 'corporate_po'
                        ? 'border-[#5A5A40] bg-[#FAF9F5] ring-2 ring-[#5A5A40]/15'
                        : 'border-[#E5E5DE] hover:bg-[#FAF9F5]'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-[#5A5A40]" />
                    <div>
                      <div className="font-bold text-[#2D2D24]">Corporate Net-30 PO</div>
                      <div className="text-[10px] text-[#8B7E66]">Direct invoice billing</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Method Specific Details */}
              {paymentMethod === 'cash' && (
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E5DE] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#2D2D24]">Amount Tendered:</span>
                    <div className="flex items-center gap-1 font-mono text-sm font-bold text-[#2D2D24]">
                      <span>$</span>
                      <input
                        type="number"
                        step="1"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(parseFloat(e.target.value) || 0)}
                        className="w-24 px-2 py-1 bg-white border border-[#E5E5DE] rounded-xl text-right"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#8B7E66]">Quick:</span>
                    {[
                      { label: 'Exact', val: grandTotal },
                      { label: '$20', val: 20 },
                      { label: '$50', val: 50 },
                      { label: '$100', val: 100 },
                      { label: '$200', val: 200 },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={() => setCashTendered(btn.val)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E5DE] text-[11px] font-semibold text-[#5A5A40] hover:bg-[#F5F5F0] cursor-pointer"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#E5E5DE] flex justify-between items-center">
                    <span className="font-bold text-[#2D2D24]">Change Due to Customer:</span>
                    <span className="font-mono text-base font-bold text-emerald-700">
                      ${Math.max(0, cashTendered - grandTotal).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod === 'room_folio_charge' && (
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E5DE] space-y-2">
                  <div className="font-semibold text-[#2D2D24]">Charging to Property Guest:</div>
                  <div className="text-xs text-[#5A5A40]">
                    {activeReservations.find((r) => r.id === selectedReservationId)?.guestName || 'Selected Guest'}{' '}
                    &bull; Unit:{' '}
                    {activeReservations.find((r) => r.id === selectedReservationId)?.unitNumber || 'Suite 101'}
                  </div>
                  <p className="text-[11px] text-[#8B7E66]">
                    This charge will immediately post to the guest's folio in the Property Management System.
                  </p>
                </div>
              )}

              {paymentMethod === 'credit_card' && (
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E5DE] text-center space-y-2">
                  <div className="font-semibold text-[#2D2D24]">Ready for Card Contact / Tap</div>
                  <div className="text-xs text-[#8B7E66]">
                    Terminal #01 EMV Contactless PinPad armed. Click "Authorize & Process" to simulate chip authorization.
                  </div>
                </div>
              )}

              {paymentMethod === 'corporate_po' && (
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E5DE] space-y-2">
                  <div className="font-semibold text-[#2D2D24]">Billing to Account:</div>
                  <div className="text-xs font-bold text-[#5A5A40]">{corporateCustomerName}</div>
                  <p className="text-[11px] text-[#8B7E66]">
                    Net-30 invoice will be recorded in the Finance ledger under accounts receivable.
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-[#E5E5DE] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E5DE] text-[#2D2D24] hover:bg-[#F5F5F0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessingPayment || (paymentMethod === 'cash' && cashTendered < grandTotal)}
                  onClick={handleCompleteTransaction}
                  className="px-5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#474732] disabled:opacity-50 text-white font-bold cursor-pointer shadow-xs flex items-center gap-2"
                >
                  {isProcessingPayment ? (
                    <span>Processing Tender...</span>
                  ) : (
                    <span>Authorize & Process (${grandTotal.toFixed(2)})</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STYLIZED DIGITAL RECEIPT PREVIEW MODAL */}
      <ReceiptPreviewModal
        isOpen={isReceiptModalOpen && !!completedOrder}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setCompletedOrder(null);
        }}
        order={completedOrder}
        currency={activeCurrency}
        taxRegion={activeTaxRegion}
        customerProfile={customers.find((c) => c.id === completedOrder?.customerId)}
        onPrint={() => {
          onShowNotification?.(
            'Thermal Dispatch',
            `Receipt #${completedOrder?.receiptNumber} dispatched to receipt printer with applied discounts and tax breakdown.`,
            'info'
          );
        }}
        onEmailReceipt={(email) => {
          onShowNotification?.(
            'Receipt Dispatched',
            `Itemized digital receipt emailed to ${email}.`,
            'success'
          );
        }}
        onOpenInvoice={() => {
          if (completedOrder) {
            setInvoiceInitialItems(completedOrder.items);
            setInvoiceCustomerPreset({
              name: completedOrder.customerName || 'Customer',
              poReference: completedOrder.orderNumber,
              email: completedOrder.customerEmail,
            });
            setIsReceiptModalOpen(false);
            setIsInvoiceModalOpen(true);
          }
        }}
        onNewSale={() => {
          setIsReceiptModalOpen(false);
          setCompletedOrder(null);
        }}
        onShowNotification={onShowNotification}
      />

      {/* REGIONAL TAX CONFIGURATION MODAL */}
      <PosTaxConfigModal
        isOpen={isTaxConfigModalOpen}
        onClose={() => setIsTaxConfigModalOpen(false)}
        taxRegions={taxRegions}
        activeTaxRegion={activeTaxRegion}
        onSelectTaxRegion={(region) => {
          setActiveTaxRegion(region);
          onShowNotification?.(
            'Tax Region Selected',
            `Applied ${region.regionName} (${(region.taxRate * 100).toFixed(2)}% ${region.taxLabel}).`,
            'info'
          );
        }}
        onSaveTaxRegions={(updated) => {
          setTaxRegions(updated);
        }}
        onShowNotification={onShowNotification}
      />

      {/* MULTI-CURRENCY CONVERSION MODAL */}
      <PosCurrencyModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        currencies={currencies}
        activeCurrency={activeCurrency}
        onSelectCurrency={(curr) => {
          setActiveCurrency(curr);
          onShowNotification?.(
            'Currency Updated',
            `Active POS currency set to ${curr.name} (${curr.code} ${curr.symbol}). Conversion rate: ${curr.rate}`,
            'info'
          );
        }}
        onUpdateCurrencyRate={(code, newRate) => {
          setCurrencies((prev) =>
            prev.map((c) => (c.code === code ? { ...c, rate: newRate } : c))
          );
          if (activeCurrency.code === code) {
            setActiveCurrency((prev) => ({ ...prev, rate: newRate }));
          }
        }}
        currentUser={currentUser}
        onShowNotification={onShowNotification}
      />

      {/* POS INVOICE GENERATOR MODAL */}
      <PosInvoiceGeneratorModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        currentUser={currentUser}
        availableProducts={products}
        initialItems={invoiceInitialItems}
        customerPreset={invoiceCustomerPreset}
        regionalTaxRate={effectiveTaxRate}
        regionalTaxLabel={activeTaxRegion.taxLabel}
        currency={activeCurrency}
        onLoadItemsToCart={(items) => {
          setCart(items);
          onShowNotification?.(
            'Cart Synchronized',
            `Loaded ${items.length} item(s) from invoice generator into active terminal cart.`
          );
        }}
        onAddInvoiceToLedger={(invoice) => {
          onAddInvoice?.(invoice);
          onShowNotification?.(
            'Invoice Logged',
            `Official invoice ${invoice.invoiceNumber} recorded to finance accounts ledger ($${invoice.totalAmount.toFixed(2)}).`
          );
        }}
      />

      {/* SHIFT & DRAWER MODAL */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5]">
              <h3 className="font-bold font-serif text-sm text-[#2D2D24]">Shift & Cash Drawer Summary</h3>
              <button
                onClick={() => setIsShiftModalOpen(false)}
                className="p-1 rounded-xl text-[#8B7E66] hover:text-[#2D2D24] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="flex justify-between p-2 rounded-xl bg-[#FAF9F5]">
                <span className="text-[#8B7E66]">Register & Station:</span>
                <span className="font-semibold text-[#2D2D24]">{shift.registerNumber}</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-[#FAF9F5]">
                <span className="text-[#8B7E66]">Opening Cash Balance:</span>
                <span className="font-semibold text-[#2D2D24]">${shift.openingCash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-[#FAF9F5]">
                <span className="text-[#8B7E66]">Cash Sales (Today):</span>
                <span className="font-semibold text-emerald-700">+${shift.totalCashSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-[#FAF9F5]">
                <span className="text-[#8B7E66]">Card / EMV Sales:</span>
                <span className="font-semibold text-[#2D2D24]">${shift.totalCardSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-[#FAF9F5]">
                <span className="text-[#8B7E66]">Room Folio Charges:</span>
                <span className="font-semibold text-[#2D2D24]">${shift.totalRoomCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 text-sm font-bold">
                <span className="text-[#2D2D24]">Total Cash in Drawer:</span>
                <span className="text-[#5A5A40]">${shift.currentCash.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E5DE] flex items-center justify-end gap-2">
              <button
                onClick={() => setIsShiftModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#5A5A40] text-white text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
