import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  Bed,
  Users,
  DollarSign,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Receipt,
  X,
  Brush,
  Wrench,
  Layers,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import {
  PropertyUnit,
  PropertyReservation,
  AppUser,
} from '../../types';

interface PropertyManagementViewProps {
  currentUser: AppUser;
  units: PropertyUnit[];
  onUpdateUnit: (updated: PropertyUnit) => void;
  reservations: PropertyReservation[];
  onAddReservation: (newRes: PropertyReservation) => void;
  onUpdateReservation: (updatedRes: PropertyReservation) => void;
  onNavigateToChannels?: () => void;
  onShowNotification?: (title: string, message: string, type?: 'success' | 'warning' | 'info') => void;
}

export const PropertyManagementView: React.FC<PropertyManagementViewProps> = ({
  currentUser,
  units,
  onUpdateUnit,
  reservations,
  onAddReservation,
  onUpdateReservation,
  onNavigateToChannels,
  onShowNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'tape_chart' | 'units' | 'reservations' | 'housekeeping'>('tape_chart');
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [activeFolioReservation, setActiveFolioReservation] = useState<PropertyReservation | null>(null);

  // New Booking Form State
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [newUnitId, setNewUnitId] = useState(units[0]?.id || '');
  const [newCheckIn, setNewCheckIn] = useState('2026-09-10');
  const [newCheckOut, setNewCheckOut] = useState('2026-09-15');
  const [newChannelOrigin, setNewChannelOrigin] = useState<PropertyReservation['channelOrigin']>('direct');
  const [newSpecialRequests, setNewSpecialRequests] = useState('');

  // Calendar dates (next 10 days)
  const calendarDates = [
    { day: 'Wed', date: '09/02' },
    { day: 'Thu', date: '09/03' },
    { day: 'Fri', date: '09/04' },
    { day: 'Sat', date: '09/05' },
    { day: 'Sun', date: '09/06' },
    { day: 'Mon', date: '09/07' },
    { day: 'Tue', date: '09/08' },
    { day: 'Wed', date: '09/09' },
    { day: 'Thu', date: '09/10' },
    { day: 'Fri', date: '09/11' },
  ];

  const propertiesList = Array.from(new Set(units.map((u) => u.propertyName)));

  const filteredUnits = units.filter((u) => {
    const matchesProp = selectedPropertyFilter === 'all' || u.propertyName === selectedPropertyFilter;
    const matchesQuery =
      u.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.unitType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.currentGuestName && u.currentGuestName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesProp && matchesQuery;
  });

  // KPI Calculations
  const totalUnitsCount = units.length;
  const occupiedUnitsCount = units.filter((u) => u.occupancyStatus === 'occupied').length;
  const occupancyRatePct = totalUnitsCount > 0 ? (occupiedUnitsCount / totalUnitsCount) * 100 : 0;
  const averageDailyRate =
    units.reduce((sum, u) => sum + u.baseRate, 0) / (totalUnitsCount || 1);
  const revPar = (occupancyRatePct / 100) * averageDailyRate;
  const totalMonthlyRev = reservations.reduce((sum, r) => sum + r.totalAmount, 0);

  const handleCleaningStatusChange = (unit: PropertyUnit, newStatus: PropertyUnit['cleaningStatus']) => {
    const updated: PropertyUnit = {
      ...unit,
      cleaningStatus: newStatus,
    };
    onUpdateUnit(updated);
    onShowNotification?.('Housekeeping Updated', `Set ${unit.unitNumber} cleaning status to [${newStatus.toUpperCase()}].`);
  };

  const handleCheckInToggle = (res: PropertyReservation) => {
    const nextStatus = res.status === 'checked_in' ? 'checked_out' : 'checked_in';
    const updatedRes: PropertyReservation = {
      ...res,
      status: nextStatus,
    };
    onUpdateReservation(updatedRes);

    // Also update unit occupancy
    const targetUnit = units.find((u) => u.id === res.unitId);
    if (targetUnit) {
      const updatedUnit: PropertyUnit = {
        ...targetUnit,
        occupancyStatus: nextStatus === 'checked_in' ? 'occupied' : 'vacant',
        cleaningStatus: nextStatus === 'checked_out' ? 'dirty' : targetUnit.cleaningStatus,
        currentGuestName: nextStatus === 'checked_in' ? res.guestName : undefined,
      };
      onUpdateUnit(updatedUnit);
    }

    onShowNotification?.(
      'Reservation Updated',
      `Guest ${res.guestName} has been ${nextStatus === 'checked_in' ? 'Checked In' : 'Checked Out'}.`
    );
  };

  const handleCreateReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUnit = units.find((u) => u.id === newUnitId);
    if (!targetUnit) return;

    // Approximate nights count
    const nights = 5;
    const totalAmount = nights * targetUnit.baseRate;

    const newRes: PropertyReservation = {
      id: `res-${Date.now().toString().slice(-4)}`,
      reservationCode: `RES-DIR-${Math.floor(1000 + Math.random() * 9000)}`,
      unitId: targetUnit.id,
      unitNumber: targetUnit.unitNumber,
      propertyName: targetUnit.propertyName,
      guestName: newGuestName,
      guestEmail: newGuestEmail,
      guestPhone: newGuestPhone || '+1 (555) 012-3456',
      guestCount: 2,
      checkInDate: newCheckIn,
      checkOutDate: newCheckOut,
      totalNights: nights,
      nightlyRate: targetUnit.baseRate,
      totalAmount,
      paymentStatus: 'deposit_paid',
      channelOrigin: newChannelOrigin,
      status: 'confirmed',
      specialRequests: newSpecialRequests,
      folioCharges: [
        {
          id: `fol-${Date.now()}-1`,
          description: `Room Rental (${nights} nights @ $${targetUnit.baseRate}/nt)`,
          amount: totalAmount,
          date: newCheckIn,
          category: 'room',
        },
      ],
    };

    onAddReservation(newRes);
    setIsNewBookingModalOpen(false);
    setNewGuestName('');
    setNewGuestEmail('');
    setNewSpecialRequests('');
    onShowNotification?.(
      'Reservation Booked',
      `Confirmed booking #${newRes.reservationCode} for ${newRes.guestName} in ${targetUnit.unitNumber}.`
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-[#E5E5DE] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-serif text-[#2D2D24]">
                Campus & Property Management (PMS)
              </h1>
              <p className="text-xs text-[#8B7E66]">
                Multi-unit executive residency, guest reservation tape chart, housekeeping turnover, and folio billing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {onNavigateToChannels && (
            <button
              onClick={onNavigateToChannels}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-[#FAF9F5] hover:bg-[#F5F5F0] border border-[#E5E5DE] text-xs font-semibold text-[#5A5A40] rounded-2xl transition-colors cursor-pointer shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Airbnb &amp; Booking iCal Sync</span>
            </button>
          )}

          <button
            onClick={() => setIsNewBookingModalOpen(true)}
            className="flex items-center gap-2 bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-semibold px-4 py-2.5 rounded-2xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E5DE] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#8B7E66] text-xs">
            <span>Occupancy Rate</span>
            <Bed className="w-4 h-4 text-[#5A5A40]" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#2D2D24] mt-2">
            {occupancyRatePct.toFixed(1)}%
          </div>
          <div className="text-[11px] text-[#5A5A40] font-medium mt-1">
            {occupiedUnitsCount} of {totalUnitsCount} units occupied
          </div>
        </div>

        <div className="bg-white border border-[#E5E5DE] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#8B7E66] text-xs">
            <span>Average Daily Rate (ADR)</span>
            <DollarSign className="w-4 h-4 text-[#5A5A40]" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#2D2D24] mt-2">
            ${averageDailyRate.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#8B7E66] mt-1">Across executive suites & pods</div>
        </div>

        <div className="bg-white border border-[#E5E5DE] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#8B7E66] text-xs">
            <span>RevPAR</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#2D2D24] mt-2">
            ${revPar.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">+8.4% vs last period</div>
        </div>

        <div className="bg-white border border-[#E5E5DE] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#8B7E66] text-xs">
            <span>Monthly Booked Value</span>
            <Receipt className="w-4 h-4 text-[#5A5A40]" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#2D2D24] mt-2">
            ${totalMonthlyRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#8B7E66] mt-1">{reservations.length} total reservations</div>
        </div>
      </div>

      {/* Sub-Tabs & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E5DE] pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('tape_chart')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'tape_chart'
                ? 'bg-[#5A5A40] text-white'
                : 'bg-white text-[#5A5A40] hover:bg-[#F5F5F0] border border-[#E5E5DE]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Tape Chart (Calendar)</span>
          </button>

          <button
            onClick={() => setActiveTab('units')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'units'
                ? 'bg-[#5A5A40] text-white'
                : 'bg-white text-[#5A5A40] hover:bg-[#F5F5F0] border border-[#E5E5DE]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Units & Rooms ({units.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'reservations'
                ? 'bg-[#5A5A40] text-white'
                : 'bg-white text-[#5A5A40] hover:bg-[#F5F5F0] border border-[#E5E5DE]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Reservations & Folios</span>
          </button>

          <button
            onClick={() => setActiveTab('housekeeping')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'housekeeping'
                ? 'bg-[#5A5A40] text-white'
                : 'bg-white text-[#5A5A40] hover:bg-[#F5F5F0] border border-[#E5E5DE]'
            }`}
          >
            <Brush className="w-3.5 h-3.5" />
            <span>Housekeeping Board</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPropertyFilter}
            onChange={(e) => setSelectedPropertyFilter(e.target.value)}
            className="text-xs bg-white border border-[#E5E5DE] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#5A5A40]"
          >
            <option value="all">All Properties</option>
            {propertiesList.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TAB 1: TAPE CHART / CALENDAR GRID */}
      {activeTab === 'tape_chart' && (
        <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-xs overflow-hidden">
          <div className="p-4 bg-[#FAF9F5] border-b border-[#E5E5DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#5A5A40]" />
              <span className="font-bold text-xs text-[#2D2D24]">10-Day Availability & Tape Chart</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Airbnb
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Booking.com
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> VRBO
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Corporate PO
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Direct Engine
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F5F5F0] text-[#5A5A40] font-semibold border-b border-[#E5E5DE]">
                <tr>
                  <th className="p-3.5 min-w-[200px] sticky left-0 bg-[#F5F5F0] z-10 border-r border-[#E5E5DE]">
                    Unit & Property
                  </th>
                  {calendarDates.map((cd) => (
                    <th key={`cal-header-${cd.day}-${cd.date}`} className="p-2.5 text-center min-w-[95px] border-l border-[#E5E5DE]">
                      <div className="text-[10px] text-[#8B7E66]">{cd.day}</div>
                      <div className="font-bold text-[#2D2D24]">{cd.date}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DE]">
                {filteredUnits.map((unit) => {
                  const unitRes = reservations.find(
                    (r) => r.unitId === unit.id && (r.status === 'checked_in' || r.status === 'confirmed')
                  );

                  return (
                    <tr key={unit.id} className="hover:bg-[#FAF9F5]/60 transition-colors">
                      <td className="p-3.5 bg-white sticky left-0 z-10 border-r border-[#E5E5DE]">
                        <div className="font-bold text-[#2D2D24]">{unit.unitNumber}</div>
                        <div className="text-[11px] text-[#8B7E66]">{unit.unitType} &bull; ${unit.baseRate}/nt</div>
                      </td>

                      {/* Mock booking representation across 10 days */}
                      {calendarDates.map((_, dayIndex) => {
                        // If there is an active reservation, display ribbon block
                        const isBooked =
                          unitRes &&
                          ((unit.id === 'unit-101' && dayIndex >= 1 && dayIndex <= 6) ||
                            (unit.id === 'unit-202' && dayIndex >= 3 && dayIndex <= 8) ||
                            (unit.id === 'unit-301' && dayIndex <= 5) ||
                            (unit.id === 'unit-401' && dayIndex >= 2 && dayIndex <= 9));

                        let channelClass = 'bg-emerald-100 text-emerald-900 border-emerald-300';
                        if (unitRes?.channelOrigin === 'airbnb') {
                          channelClass = 'bg-rose-100 text-rose-900 border-rose-300';
                        } else if (unitRes?.channelOrigin === 'booking_com') {
                          channelClass = 'bg-blue-100 text-blue-900 border-blue-300';
                        } else if (unitRes?.channelOrigin === 'corporate_po') {
                          channelClass = 'bg-purple-100 text-purple-900 border-purple-300';
                        }

                        return (
                          <td
                            key={dayIndex}
                            className={`p-1 text-center border-l border-[#E5E5DE] h-12 ${
                              unit.cleaningStatus === 'maintenance' ? 'bg-amber-50/50' : ''
                            }`}
                          >
                            {unit.cleaningStatus === 'maintenance' && dayIndex === 3 ? (
                              <span className="text-[10px] text-amber-800 font-medium flex items-center justify-center gap-1">
                                <Wrench className="w-3 h-3" /> Blocked
                              </span>
                            ) : isBooked ? (
                              <div
                                onClick={() => setActiveFolioReservation(unitRes)}
                                className={`w-full py-1.5 px-1 rounded-lg text-[10px] font-bold border truncate cursor-pointer transition-transform hover:scale-105 shadow-2xs ${channelClass}`}
                                title={`${unitRes.guestName} (${unitRes.channelOrigin.toUpperCase()}) - Click to view folio`}
                              >
                                {dayIndex === 2 || dayIndex === 4 ? unitRes.guestName.split(' ')[0] : '● Booked'}
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setNewUnitId(unit.id);
                                  setIsNewBookingModalOpen(true);
                                }}
                                className="w-full h-full rounded text-[10px] text-transparent hover:text-[#8B7E66] hover:bg-[#F5F5F0] transition-colors cursor-pointer flex items-center justify-center"
                              >
                                + Book
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: UNITS & ROOMS */}
      {activeTab === 'units' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUnits.map((unit) => (
            <div
              key={unit.id}
              className="bg-white border border-[#E5E5DE] rounded-3xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF9F5] text-[#8B7E66] border border-[#E5E5DE] font-mono">
                      Floor {unit.floor} &bull; {unit.maxGuests} Guests
                    </span>
                    <h3 className="text-base font-bold font-serif text-[#2D2D24] mt-1.5">
                      {unit.unitNumber}
                    </h3>
                    <p className="text-xs text-[#8B7E66]">{unit.propertyName}</p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      unit.occupancyStatus === 'occupied'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : unit.occupancyStatus === 'reserved'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : unit.occupancyStatus === 'blocked'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {unit.occupancyStatus.toUpperCase()}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E5DE] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8B7E66]">Unit Type:</span>
                    <span className="font-semibold text-[#2D2D24]">{unit.unitType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B7E66]">Base Nightly Rate:</span>
                    <span className="font-bold text-[#2D2D24]">${unit.baseRate.toFixed(2)}/night</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8B7E66]">Cleaning Status:</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        unit.cleaningStatus === 'clean'
                          ? 'bg-emerald-50 text-emerald-800'
                          : unit.cleaningStatus === 'dirty'
                          ? 'bg-red-50 text-red-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {unit.cleaningStatus.toUpperCase()}
                    </span>
                  </div>
                  {unit.currentGuestName && (
                    <div className="flex justify-between">
                      <span className="text-[#8B7E66]">Current Guest:</span>
                      <span className="font-semibold text-[#5A5A40]">{unit.currentGuestName}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {unit.amenities.map((a) => (
                    <span key={a} className="text-[9px] px-2 py-0.5 rounded bg-[#F5F5F0] text-[#5A5A40]">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5E5DE] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      handleCleaningStatusChange(
                        unit,
                        unit.cleaningStatus === 'clean' ? 'dirty' : 'clean'
                      )
                    }
                    className="px-2.5 py-1 rounded-xl bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[11px] font-medium text-[#2D2D24] cursor-pointer"
                  >
                    Mark {unit.cleaningStatus === 'clean' ? 'Dirty' : 'Clean'}
                  </button>
                </div>

                <button
                  onClick={() => {
                    setNewUnitId(unit.id);
                    setIsNewBookingModalOpen(true);
                  }}
                  className="px-3 py-1 rounded-xl bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-semibold cursor-pointer"
                >
                  Book Unit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: RESERVATIONS & FOLIOS */}
      {activeTab === 'reservations' && (
        <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E5E5DE] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#2D2D24]">Guest Reservations Registry</h2>
            <span className="text-xs text-[#8B7E66]">{reservations.length} Bookings Recorded</span>
          </div>

          <div className="divide-y divide-[#E5E5DE]">
            {reservations.map((res) => (
              <div
                key={res.id}
                className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#FAF9F5] transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center shrink-0 mt-0.5">
                    <Bed className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#2D2D24]">{res.guestName}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#F5F5F0] text-[#5A5A40] font-mono">
                        {res.reservationCode}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                          res.channelOrigin === 'airbnb'
                            ? 'bg-rose-50 text-rose-800'
                            : res.channelOrigin === 'booking_com'
                            ? 'bg-blue-50 text-blue-800'
                            : res.channelOrigin === 'corporate_po'
                            ? 'bg-purple-50 text-purple-800'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {res.channelOrigin.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs text-[#8B7E66] mt-1 flex items-center gap-2 flex-wrap">
                      <span>{res.propertyName} &bull; <strong>{res.unitNumber}</strong></span>
                      <span>&bull;</span>
                      <span>
                        {res.checkInDate} &rarr; {res.checkOutDate} ({res.totalNights} nights)
                      </span>
                      <span>&bull;</span>
                      <span>{res.guestEmail}</span>
                    </div>

                    {res.specialRequests && (
                      <div className="text-[11px] text-[#5A5A40] mt-1 italic">
                        &ldquo;{res.specialRequests}&rdquo;
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="font-bold font-serif text-sm text-[#2D2D24]">
                      ${res.totalAmount.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-medium">
                      Status: {res.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveFolioReservation(res)}
                    className="px-3 py-1.5 rounded-xl border border-[#E5E5DE] hover:bg-[#F5F5F0] text-xs font-medium text-[#5A5A40] flex items-center gap-1 cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Folio ({res.folioCharges?.length || 1})</span>
                  </button>

                  <button
                    onClick={() => handleCheckInToggle(res)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                      res.status === 'checked_in'
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                        : 'bg-[#5A5A40] hover:bg-[#474732] text-white'
                    }`}
                  >
                    {res.status === 'checked_in' ? 'Check Out Guest' : 'Check In Guest'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: HOUSEKEEPING & TURNOVER */}
      {activeTab === 'housekeeping' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DE] text-xs">
              <span className="font-bold text-red-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Dirty / Turnover Needed
              </span>
              <span className="font-mono text-[#8B7E66]">
                {units.filter((u) => u.cleaningStatus === 'dirty').length}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {units
                .filter((u) => u.cleaningStatus === 'dirty')
                .map((u) => (
                  <div key={u.id} className="p-3 rounded-2xl bg-red-50/50 border border-red-200 text-xs">
                    <div className="font-bold text-[#2D2D24]">{u.unitNumber}</div>
                    <div className="text-[11px] text-[#8B7E66]">{u.propertyName}</div>
                    <button
                      onClick={() => handleCleaningStatusChange(u, 'clean')}
                      className="mt-2 w-full py-1 rounded-xl bg-white border border-red-300 text-red-800 text-[11px] font-semibold hover:bg-red-50 cursor-pointer"
                    >
                      Mark Turned & Cleaned
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white border border-[#E5E5DE] rounded-3xl p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DE] text-xs">
              <span className="font-bold text-amber-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Maintenance / Inspecting
              </span>
              <span className="font-mono text-[#8B7E66]">
                {units.filter((u) => u.cleaningStatus === 'maintenance' || u.cleaningStatus === 'inspecting').length}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {units
                .filter((u) => u.cleaningStatus === 'maintenance' || u.cleaningStatus === 'inspecting')
                .map((u) => (
                  <div key={u.id} className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs">
                    <div className="font-bold text-[#2D2D24]">{u.unitNumber}</div>
                    <div className="text-[11px] text-amber-900 mt-1">{u.notes || 'HVAC filter inspection'}</div>
                    <button
                      onClick={() => handleCleaningStatusChange(u, 'clean')}
                      className="mt-2 w-full py-1 rounded-xl bg-white border border-amber-300 text-amber-900 text-[11px] font-semibold hover:bg-amber-50 cursor-pointer"
                    >
                      Pass Inspection & Clear
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white border border-[#E5E5DE] rounded-3xl p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DE] text-xs">
              <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Ready & Inspected Clean
              </span>
              <span className="font-mono text-[#8B7E66]">
                {units.filter((u) => u.cleaningStatus === 'clean').length}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {units
                .filter((u) => u.cleaningStatus === 'clean')
                .map((u) => (
                  <div key={u.id} className="p-3 rounded-2xl bg-emerald-50/40 border border-emerald-200 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#2D2D24]">{u.unitNumber}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">Ready</span>
                    </div>
                    <div className="text-[11px] text-[#8B7E66]">{u.propertyName}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* NEW RESERVATION MODAL */}
      {isNewBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold font-serif text-base text-[#2D2D24]">Create Property Reservation</h3>
                  <p className="text-[11px] text-[#8B7E66]">Manual or direct booking with instant rate quote.</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewBookingModalOpen(false)}
                className="p-1 rounded-xl text-[#8B7E66] hover:text-[#2D2D24] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReservationSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#2D2D24] mb-1">Guest Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jennifer Wu"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2D2D24] mb-1">Guest Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="jennifer.wu@company.com"
                    value={newGuestEmail}
                    onChange={(e) => setNewGuestEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D2D24] mb-1">Channel Origin</label>
                  <select
                    value={newChannelOrigin}
                    onChange={(e) => setNewChannelOrigin(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl focus:outline-none focus:border-[#5A5A40]"
                  >
                    <option value="direct">Direct Engine</option>
                    <option value="corporate_po">Corporate PO Account</option>
                    <option value="airbnb">Airbnb Pro</option>
                    <option value="booking_com">Booking.com</option>
                    <option value="vrbo">VRBO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2D24] mb-1">Select Unit</label>
                <select
                  value={newUnitId}
                  onChange={(e) => setNewUnitId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl focus:outline-none focus:border-[#5A5A40]"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.unitNumber} - {u.propertyName} (${u.baseRate}/night)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2D2D24] mb-1">Check-In Date</label>
                  <input
                    type="date"
                    value={newCheckIn}
                    onChange={(e) => setNewCheckIn(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2D2D24] mb-1">Check-Out Date</label>
                  <input
                    type="date"
                    value={newCheckOut}
                    onChange={(e) => setNewCheckOut(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2D24] mb-1">Special Requests</label>
                <textarea
                  rows={2}
                  placeholder="Late check-in, dietary preferences, extra keycard..."
                  value={newSpecialRequests}
                  onChange={(e) => setNewSpecialRequests(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E5DE] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewBookingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E5DE] text-[#2D2D24] hover:bg-[#F5F5F0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold cursor-pointer shadow-xs"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GUEST FOLIO MODAL */}
      {activeFolioReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold font-serif text-base text-[#2D2D24]">
                    Guest Folio: {activeFolioReservation.guestName}
                  </h3>
                  <p className="text-[11px] text-[#8B7E66]">
                    {activeFolioReservation.unitNumber} &bull; Code: {activeFolioReservation.reservationCode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveFolioReservation(null)}
                className="p-1 rounded-xl text-[#8B7E66] hover:text-[#2D2D24] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E5E5DE] grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#8B7E66]">Stay Dates:</span>
                  <div className="font-semibold text-[#2D2D24]">
                    {activeFolioReservation.checkInDate} to {activeFolioReservation.checkOutDate}
                  </div>
                </div>
                <div>
                  <span className="text-[#8B7E66]">Origin Channel:</span>
                  <div className="font-bold text-[#5A5A40] uppercase">
                    {activeFolioReservation.channelOrigin}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#2D2D24] mb-2">Itemized Charges & POS Posts:</h4>
                <div className="divide-y divide-[#E5E5DE] border border-[#E5E5DE] rounded-2xl overflow-hidden">
                  {(activeFolioReservation.folioCharges || []).map((chg) => (
                    <div key={chg.id} className="p-3 flex justify-between items-center hover:bg-[#FAF9F5]">
                      <div>
                        <div className="font-semibold text-[#2D2D24]">{chg.description}</div>
                        <div className="text-[10px] text-[#8B7E66]">{chg.date} &bull; {chg.category.toUpperCase()}</div>
                      </div>
                      <div className="font-bold font-mono text-[#2D2D24]">${chg.amount.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex justify-between items-center text-sm font-bold">
                <span className="text-[#2D2D24]">Total Outstanding Balance:</span>
                <span className="text-[#5A5A40]">
                  $
                  {(
                    activeFolioReservation.folioCharges?.reduce((s, c) => s + c.amount, 0) ||
                    activeFolioReservation.totalAmount
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E5DE] flex justify-end">
              <button
                onClick={() => setActiveFolioReservation(null)}
                className="px-5 py-2 rounded-xl bg-[#5A5A40] text-white text-xs font-semibold cursor-pointer"
              >
                Close Folio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
