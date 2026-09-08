import React, { useState } from 'react';
import {
  Award,
  User,
  History,
  Coins,
  ChevronDown,
  ChevronUp,
  Plus,
  Building2,
  Bed,
  Check,
  Sparkles,
  Phone,
  Mail,
  X,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  PosCustomerProfile,
  PropertyReservation,
} from '../../types';
import { LOYALTY_REDEMPTION_RATE_PER_POINT } from '../../data/posData';

interface PosCustomerLoyaltyPanelProps {
  customers: PosCustomerProfile[];
  selectedCustomer: PosCustomerProfile | undefined;
  onSelectCustomer: (customer: PosCustomerProfile | undefined) => void;
  selectedCustomerType: 'loyalty' | 'walk_in' | 'corporate' | 'room_guest';
  onChangeCustomerType: (type: 'loyalty' | 'walk_in' | 'corporate' | 'room_guest') => void;
  pointsToRedeem: number;
  onPointsToRedeemChange: (pts: number) => void;
  maxRedeemablePoints: number;
  activeReservations: PropertyReservation[];
  selectedReservationId: string;
  onSelectReservationId: (id: string) => void;
  corporateCustomerName: string;
  onCorporateCustomerNameChange: (name: string) => void;
  onAddNewCustomer: (newCustomer: PosCustomerProfile) => void;
  onShowNotification?: (title: string, message: string, type?: 'success' | 'warning' | 'info') => void;
}

export const PosCustomerLoyaltyPanel: React.FC<PosCustomerLoyaltyPanelProps> = ({
  customers,
  selectedCustomer,
  onSelectCustomer,
  selectedCustomerType,
  onChangeCustomerType,
  pointsToRedeem,
  onPointsToRedeemChange,
  maxRedeemablePoints,
  activeReservations,
  selectedReservationId,
  onSelectReservationId,
  corporateCustomerName,
  onCorporateCustomerNameChange,
  onAddNewCustomer,
  onShowNotification,
}) => {
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showEnrollModal, setShowEnrollModal] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Enroll form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newTier, setNewTier] = useState<PosCustomerProfile['tier']>('Bronze');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchFilter.toLowerCase())) ||
      c.phone.includes(searchFilter)
  );

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created: PosCustomerProfile = {
      id: `cust-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim() || 'customer@client.com',
      phone: newPhone.trim() || '+1 (555) 000-0000',
      company: newCompany.trim() || undefined,
      tier: newTier,
      loyaltyPoints: 100, // 100 welcome bonus points!
      lifetimePointsEarned: 100,
      lifetimeSpend: 0,
      joinedDate: new Date().toISOString().split('T')[0],
      orderHistory: [],
      notes: 'Enrolled at POS Register station.',
    };

    onAddNewCustomer(created);
    onSelectCustomer(created);
    onChangeCustomerType('loyalty');
    setShowEnrollModal(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewCompany('');
    onShowNotification?.(
      'Member Enrolled',
      `Enrolled ${created.name} into ${created.tier} Rewards (+100 welcome bonus points).`,
      'success'
    );
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'Platinum':
        return 'bg-slate-900 text-white border-slate-700';
      case 'Gold':
        return 'bg-amber-600 text-white border-amber-500';
      case 'Silver':
        return 'bg-zinc-600 text-white border-zinc-500';
      case 'Bronze':
      default:
        return 'bg-[#5A5A40] text-white border-[#474732]';
    }
  };

  return (
    <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E5E5DE] space-y-2.5 text-xs">
      {/* Type Selector Tabs */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#8B7E66] uppercase tracking-wider flex items-center gap-1">
          <User className="w-3 h-3 text-[#5A5A40]" />
          <span>Customer & Rewards</span>
        </span>
        <button
          type="button"
          onClick={() => setShowEnrollModal(true)}
          className="text-[10px] font-semibold text-[#5A5A40] hover:text-[#2D2D24] flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Enroll Member</span>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1 text-[11px]">
        <button
          type="button"
          onClick={() => onChangeCustomerType('loyalty')}
          className={`py-1.5 px-1 rounded-xl font-medium transition-all text-center cursor-pointer ${
            selectedCustomerType === 'loyalty'
              ? 'bg-[#5A5A40] text-white shadow-xs font-semibold'
              : 'bg-white text-[#2D2D24] border border-[#E5E5DE] hover:bg-[#F5F5F0]'
          }`}
        >
          Member
        </button>

        <button
          type="button"
          onClick={() => onChangeCustomerType('walk_in')}
          className={`py-1.5 px-1 rounded-xl font-medium transition-all text-center cursor-pointer ${
            selectedCustomerType === 'walk_in'
              ? 'bg-[#5A5A40] text-white shadow-xs font-semibold'
              : 'bg-white text-[#2D2D24] border border-[#E5E5DE] hover:bg-[#F5F5F0]'
          }`}
        >
          Walk-In
        </button>

        <button
          type="button"
          onClick={() => onChangeCustomerType('room_guest')}
          className={`py-1.5 px-1 rounded-xl font-medium transition-all text-center cursor-pointer ${
            selectedCustomerType === 'room_guest'
              ? 'bg-[#5A5A40] text-white shadow-xs font-semibold'
              : 'bg-white text-[#2D2D24] border border-[#E5E5DE] hover:bg-[#F5F5F0]'
          }`}
        >
          Room
        </button>

        <button
          type="button"
          onClick={() => onChangeCustomerType('corporate')}
          className={`py-1.5 px-1 rounded-xl font-medium transition-all text-center cursor-pointer ${
            selectedCustomerType === 'corporate'
              ? 'bg-[#5A5A40] text-white shadow-xs font-semibold'
              : 'bg-white text-[#2D2D24] border border-[#E5E5DE] hover:bg-[#F5F5F0]'
          }`}
        >
          Corp PO
        </button>
      </div>

      {/* LOYALTY MEMBER DETAILS & REDEMPTION */}
      {selectedCustomerType === 'loyalty' && (
        <div className="space-y-2 pt-1">
          {/* Customer Dropdown */}
          <div>
            <select
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const found = customers.find((c) => c.id === e.target.value);
                onSelectCustomer(found);
                onPointsToRedeemChange(0);
              }}
              className="w-full text-xs bg-white border border-[#E5E5DE] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#5A5A40] font-medium"
            >
              {customers.map((cust) => (
                <option key={cust.id} value={cust.id}>
                  {cust.name} ({cust.tier} &bull; {cust.loyaltyPoints} pts) - {cust.company || 'Private'}
                </option>
              ))}
            </select>
          </div>

          {/* Active Loyalty Profile Card */}
          {selectedCustomer && (
            <div className="p-2.5 rounded-xl bg-white border border-[#E5E5DE] space-y-2 shadow-2xs">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-xs text-[#2D2D24] flex items-center gap-1.5">
                    <span>{selectedCustomer.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${getTierColor(
                        selectedCustomer.tier
                      )}`}
                    >
                      {selectedCustomer.tier}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8B7E66] truncate max-w-[200px]">
                    {selectedCustomer.company || selectedCustomer.email}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowHistoryModal(true)}
                  className="px-2 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#E9E9E0] text-[10px] font-semibold text-[#5A5A40] flex items-center gap-1 transition-colors cursor-pointer border border-[#E5E5DE]"
                  title="View Customer Order History & Points Log"
                >
                  <History className="w-3 h-3" />
                  <span>History ({selectedCustomer.orderHistory?.length || 0})</span>
                </button>
              </div>

              {/* Points Summary Row */}
              <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-[#FAF9F5] border border-[#E5E5DE]">
                <div>
                  <div className="text-[10px] text-[#8B7E66]">Available Points:</div>
                  <div className="text-xs font-bold text-[#2D2D24] font-mono flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>{selectedCustomer.loyaltyPoints} pts</span>
                  </div>
                  <div className="text-[9px] text-[#5A5A40]">
                    Worth ${(selectedCustomer.loyaltyPoints * LOYALTY_REDEMPTION_RATE_PER_POINT).toFixed(2)} off
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-[#8B7E66]">Lifetime Activity:</div>
                  <div className="text-xs font-bold text-[#2D2D24] font-mono">
                    ${selectedCustomer.lifetimeSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[9px] text-emerald-700">
                    Earns {selectedCustomer.tier === 'Platinum' ? '2.0x' : selectedCustomer.tier === 'Gold' ? '1.5x' : selectedCustomer.tier === 'Silver' ? '1.2x' : '1.0x'} pts / $1
                  </div>
                </div>
              </div>

              {/* Loyalty Redemption Controls */}
              <div className="pt-1 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#2D2D24] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#5A5A40]" />
                    <span>Redeem Points for Discount:</span>
                  </span>
                  {pointsToRedeem > 0 && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      -${(pointsToRedeem * LOYALTY_REDEMPTION_RATE_PER_POINT).toFixed(2)} OFF
                    </span>
                  )}
                </div>

                {/* Quick Points Redemption Chips */}
                <div className="flex items-center gap-1 flex-wrap">
                  {[100, 200, 500].map((pts) => {
                    const canRedeem = pts <= selectedCustomer.loyaltyPoints && pts <= maxRedeemablePoints;
                    const isSelected = pointsToRedeem === pts;
                    return (
                      <button
                        key={pts}
                        type="button"
                        disabled={!canRedeem}
                        onClick={() => onPointsToRedeemChange(isSelected ? 0 : pts)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                          isSelected
                            ? 'bg-[#5A5A40] text-white'
                            : 'bg-[#F5F5F0] text-[#5A5A40] hover:bg-[#E9E9E0] border border-[#E5E5DE]'
                        }`}
                      >
                        {pts} pts (-${(pts * LOYALTY_REDEMPTION_RATE_PER_POINT).toFixed(0)})
                      </button>
                    );
                  })}

                  {maxRedeemablePoints > 0 && (
                    <button
                      type="button"
                      onClick={() => onPointsToRedeemChange(maxRedeemablePoints)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                        pointsToRedeem === maxRedeemablePoints
                          ? 'bg-[#2D2D24] text-white'
                          : 'bg-[#FAF9F5] text-[#2D2D24] border border-[#2D2D24]/30 hover:bg-[#F5F5F0]'
                      }`}
                    >
                      Max ({maxRedeemablePoints} pts)
                    </button>
                  )}

                  {pointsToRedeem > 0 && (
                    <button
                      type="button"
                      onClick={() => onPointsToRedeemChange(0)}
                      className="text-[10px] text-red-600 hover:text-red-800 ml-auto cursor-pointer font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ROOM GUEST LINK */}
      {selectedCustomerType === 'room_guest' && (
        <div className="space-y-1">
          <label className="block text-[10px] text-[#5A5A40] font-semibold">
            Select In-House Reservation Guest:
          </label>
          <select
            value={selectedReservationId}
            onChange={(e) => onSelectReservationId(e.target.value)}
            className="w-full text-xs bg-white border border-[#E5E5DE] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#5A5A40]"
          >
            {activeReservations.length === 0 ? (
              <option value="">No Active Guests Checked In</option>
            ) : (
              activeReservations.map((res) => (
                <option key={res.id} value={res.id}>
                  {res.unitNumber} - {res.guestName} ({res.propertyName})
                </option>
              ))
            )}
          </select>
        </div>
      )}

      {/* CORPORATE PO ACCOUNT */}
      {selectedCustomerType === 'corporate' && (
        <div className="space-y-1">
          <label className="block text-[10px] text-[#5A5A40] font-semibold">
            Corporate PO Account Entity:
          </label>
          <input
            type="text"
            value={corporateCustomerName}
            onChange={(e) => onCorporateCustomerNameChange(e.target.value)}
            className="w-full text-xs bg-white border border-[#E5E5DE] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#5A5A40]"
            placeholder="e.g. Boeing Commercial Airplanes, SpaceX MRO"
          />
        </div>
      )}

      {/* CUSTOMER ORDER HISTORY MODAL */}
      {showHistoryModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold font-serif text-sm text-[#2D2D24]">
                    {selectedCustomer.name} &bull; Order History
                  </h3>
                  <p className="text-[11px] text-[#8B7E66]">
                    {selectedCustomer.tier} Member &bull; {selectedCustomer.loyaltyPoints} Current Points
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-xl text-[#8B7E66] hover:text-[#2D2D24] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              {/* Stat Header */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#FAF9F5] border border-[#E5E5DE] text-center">
                <div>
                  <div className="text-[10px] text-[#8B7E66]">Total Spend</div>
                  <div className="font-bold text-[#2D2D24] font-mono">
                    ${selectedCustomer.lifetimeSpend.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#8B7E66]">Total Points Earned</div>
                  <div className="font-bold text-emerald-700 font-mono">
                    +{selectedCustomer.lifetimePointsEarned} pts
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#8B7E66]">Joined Date</div>
                  <div className="font-medium text-[#2D2D24] font-mono">
                    {selectedCustomer.joinedDate}
                  </div>
                </div>
              </div>

              {/* Order List */}
              <div className="space-y-2">
                <span className="font-bold text-xs text-[#2D2D24] uppercase tracking-wider">
                  Linked Order Records ({selectedCustomer.orderHistory?.length || 0})
                </span>

                {(!selectedCustomer.orderHistory || selectedCustomer.orderHistory.length === 0) ? (
                  <div className="p-6 text-center text-[#8B7E66] bg-[#FAF9F5] rounded-2xl border border-dashed border-[#C5C5BA]">
                    No past transactions on file for this member yet.
                  </div>
                ) : (
                  selectedCustomer.orderHistory.map((hist) => (
                    <div
                      key={hist.orderId}
                      className="p-3 rounded-xl border border-[#E5E5DE] bg-white flex items-center justify-between hover:border-[#5A5A40]/40 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-[#2D2D24] flex items-center gap-2">
                          <span>{hist.orderNumber}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F5F5F0] text-[#5A5A40] font-mono">
                            {hist.date}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#8B7E66] pt-0.5">
                          Total Paid: <strong className="font-mono">${hist.total.toFixed(2)} {hist.currency || 'USD'}</strong>
                        </div>
                      </div>

                      <div className="text-right text-[11px]">
                        <div className="font-bold text-emerald-700 font-mono">
                          +{hist.pointsEarned} pts earned
                        </div>
                        {hist.pointsRedeemed && hist.pointsRedeemed > 0 ? (
                          <div className="text-[10px] text-amber-700 font-mono">
                            -{hist.pointsRedeemed} pts redeemed
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-3 border-t border-[#E5E5DE] bg-[#FAF9F5] flex justify-end">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-1.5 rounded-xl bg-[#5A5A40] text-white font-semibold text-xs cursor-pointer hover:bg-[#474732]"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENROLL NEW MEMBER MODAL */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5]">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#5A5A40]" />
                <h3 className="font-bold font-serif text-sm text-[#2D2D24]">Enroll New Loyalty Member</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="p-1 rounded-xl text-[#8B7E66] hover:text-[#2D2D24] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#2D2D24] mb-1">Full Name: *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Liam Montgomery"
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E5E5DE] rounded-xl text-xs focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1">Email:</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E5E5DE] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1">Phone:</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E5E5DE] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2D2D24] mb-1">Company / Organization:</label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. Apex Industrial Systems"
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E5E5DE] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D2D24] mb-1">Initial Rewards Tier:</label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value as PosCustomerProfile['tier'])}
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E5E5DE] rounded-xl text-xs font-semibold"
                >
                  <option value="Bronze">Bronze (1.0x pts)</option>
                  <option value="Silver">Silver (1.2x pts)</option>
                  <option value="Gold">Gold (1.5x pts)</option>
                  <option value="Platinum">Platinum (2.0x pts)</option>
                </select>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>New members receive a <strong>100-point welcome bonus ($5.00 value)</strong>.</span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#E5E5DE]">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-[#E5E5DE] text-[#8B7E66] hover:bg-[#F5F5F0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#5A5A40] hover:bg-[#474732] text-white font-bold cursor-pointer"
                >
                  Enroll Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
