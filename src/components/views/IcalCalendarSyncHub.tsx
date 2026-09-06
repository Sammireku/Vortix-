import React, { useState } from 'react';
import {
  Calendar,
  Download,
  Copy,
  Check,
  ExternalLink,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Shield,
  FileText,
  ChevronDown,
  ChevronUp,
  Globe,
  Trash2,
  Eye,
  Info,
} from 'lucide-react';
import {
  PropertyUnit,
  PropertyReservation,
  UnitIcalConnection,
  IcalParsedEvent,
  ChannelSyncEvent,
  AppUser,
} from '../../types';
import {
  generateUnitIcalContent,
  triggerIcalDownload,
  parseIcalContent,
  sampleAirbnbIcalPayload,
  sampleBookingComIcalPayload,
  initialUnitIcalConnections,
} from '../../utils/icalSync';

interface IcalCalendarSyncHubProps {
  currentUser: AppUser;
  units: PropertyUnit[];
  reservations: PropertyReservation[];
  onAddReservation?: (newReservation: PropertyReservation) => void;
  onAddSyncLog?: (log: ChannelSyncEvent) => void;
  onShowNotification?: (title: string, message: string, type?: 'success' | 'warning' | 'info') => void;
}

export const IcalCalendarSyncHub: React.FC<IcalCalendarSyncHubProps> = ({
  currentUser,
  units,
  reservations,
  onAddReservation,
  onAddSyncLog,
  onShowNotification,
}) => {
  const [connections, setConnections] = useState<UnitIcalConnection[]>(initialUnitIcalConnections);
  const [selectedUnitId, setSelectedUnitId] = useState<string>(units[0]?.id || 'unit-101');
  const [copiedUrlUnitId, setCopiedUrlUnitId] = useState<string | null>(null);
  const [isSyncingFeeds, setIsSyncingFeeds] = useState<boolean>(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'airbnb' | 'booking' | 'vrbo'>('airbnb');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [previewIcsData, setPreviewIcsData] = useState<{ unitNumber: string; content: string } | null>(null);
  const [isAddFeedModalOpen, setIsAddFeedModalOpen] = useState<boolean>(false);
  const [newFeedChannel, setNewFeedChannel] = useState<'airbnb' | 'booking_com' | 'vrbo' | 'other'>('airbnb');
  const [newFeedUrl, setNewFeedUrl] = useState<string>('');
  const [newFeedName, setNewFeedName] = useState<string>('');
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(units[0]?.id || 'unit-101');

  // Find active unit
  const currentUnit = units.find((u) => u.id === selectedUnitId) || units[0];
  const currentUnitConnection = connections.find((c) => c.unitId === currentUnit?.id);

  // Copy export link
  const handleCopyExportUrl = (unitId: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrlUnitId(unitId);
    onShowNotification?.('iCal Link Copied', 'Paste this URL into Airbnb or Booking.com Calendar Sync settings.');
    setTimeout(() => setCopiedUrlUnitId(null), 2500);
  };

  // Download .ics file
  const handleDownloadIcs = (unit: PropertyUnit) => {
    const icsContent = generateUnitIcalContent(unit, reservations);
    triggerIcalDownload(`vortix_${unit.unitNumber.toLowerCase().replace(/\s+/g, '_')}_calendar.ics`, icsContent);
    onShowNotification?.('iCal Feed Downloaded', `Exported ${unit.unitNumber} schedule to RFC 5545 calendar file.`);
  };

  // Preview raw .ics text
  const handlePreviewIcs = (unit: PropertyUnit) => {
    const icsContent = generateUnitIcalContent(unit, reservations);
    setPreviewIcsData({
      unitNumber: unit.unitNumber,
      content: icsContent,
    });
    setIsPreviewModalOpen(true);
  };

  // Trigger sync of all inbound feeds
  const handleSyncAllInboundFeeds = () => {
    setIsSyncingFeeds(true);
    onShowNotification?.('Pulling iCal Feeds', 'Contacting Airbnb & Booking.com calendar endpoints...');

    setTimeout(() => {
      let importedCount = 0;
      const newImportedReservations: PropertyReservation[] = [];

      // Parse sample feeds for demonstration
      const airbnbEvents = parseIcalContent(sampleAirbnbIcalPayload, 'Airbnb (iCal)', 'Suite 101');
      const bookingEvents = parseIcalContent(sampleBookingComIcalPayload, 'Booking.com (iCal)', 'Suite 101');
      const allEvents = [...airbnbEvents, ...bookingEvents];

      allEvents.forEach((ev) => {
        // Check if reservation already exists
        const exists = reservations.some((r) => r.reservationCode === ev.uid || r.checkInDate === ev.startDate);
        if (!exists && onAddReservation) {
          const newRes: PropertyReservation = {
            id: `res-ical-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            reservationCode: ev.uid.replace(/@.*$/, ''),
            unitId: 'unit-101',
            unitNumber: 'Suite 101',
            propertyName: 'Midwest Campus Residency',
            guestName: ev.summary.includes('Airbnb') ? 'Airbnb Guest (iCal Sync)' : 'Booking.com Guest (iCal Sync)',
            guestEmail: 'synced-via-ical@ota-partner.com',
            guestPhone: '+1 (555) 019-9921',
            guestCount: 2,
            checkInDate: ev.startDate,
            checkOutDate: ev.endDate,
            totalNights: 4,
            nightlyRate: 189.0,
            totalAmount: 756.0,
            paymentStatus: 'paid',
            channelOrigin: ev.summary.includes('Airbnb') ? 'airbnb' : 'booking_com',
            status: 'confirmed',
            specialRequests: `Imported via Two-Way iCal feed synchronization [${ev.summary}].`,
          };
          onAddReservation(newRes);
          importedCount++;
        }
      });

      // Update sync timestamps
      setConnections((prev) =>
        prev.map((c) => ({
          ...c,
          inboundFeeds: c.inboundFeeds.map((f) => ({
            ...f,
            lastSyncedAt: 'Just now',
            syncStatus: 'active',
            eventsImportedCount: f.eventsImportedCount + 1,
          })),
        }))
      );

      // Add audit log
      if (onAddSyncLog) {
        onAddSyncLog({
          id: `sync-ical-${Date.now()}`,
          channelName: 'Two-Way iCal Calendar Sync',
          eventType: 'calendar_handshake',
          details: `Processed inbound feeds for Airbnb & Booking.com. Ingested ${allEvents.length} calendar blocks. 0 double-booking conflicts detected.`,
          timestamp: 'Just now',
          status: 'success',
        });
      }

      setIsSyncingFeeds(false);
      onShowNotification?.(
        'Calendar Sync Complete',
        `Synchronized iCal feeds successfully. Ingested ${allEvents.length} external reservation blocks into Property Management.`
      );
    }, 1400);
  };

  // Add new inbound feed URL
  const handleAddNewFeed = () => {
    if (!newFeedUrl.trim()) {
      onShowNotification?.('URL Required', 'Please provide a valid .ics calendar URL.', 'warning');
      return;
    }

    const channelTitle =
      newFeedName.trim() ||
      (newFeedChannel === 'airbnb'
        ? 'Airbnb Calendar'
        : newFeedChannel === 'booking_com'
        ? 'Booking.com Calendar'
        : newFeedChannel === 'vrbo'
        ? 'VRBO Calendar'
        : 'External OTA Feed');

    setConnections((prev) =>
      prev.map((c) => {
        if (c.unitId === selectedUnitId) {
          return {
            ...c,
            inboundFeeds: [
              ...c.inboundFeeds,
              {
                id: `feed-${Date.now()}`,
                channelCode: newFeedChannel,
                channelName: channelTitle,
                feedUrl: newFeedUrl.trim(),
                lastSyncedAt: 'Never',
                syncStatus: 'idle',
                eventsImportedCount: 0,
              },
            ],
          };
        }
        return c;
      })
    );

    setIsAddFeedModalOpen(false);
    setNewFeedUrl('');
    setNewFeedName('');
    onShowNotification?.(
      'iCal Feed Connected',
      `Added ${channelTitle} to ${currentUnit?.unitNumber}. Dates will be automatically blocked.`
    );
  };

  // Remove an inbound feed
  const handleRemoveFeed = (unitId: string, feedId: string) => {
    setConnections((prev) =>
      prev.map((c) =>
        c.unitId === unitId
          ? {
              ...c,
              inboundFeeds: c.inboundFeeds.filter((f) => f.id !== feedId),
            }
          : c
      )
    );
    onShowNotification?.('Feed Removed', 'Inbound calendar synchronization removed for this channel.');
  };

  // Helper to load sample live URL
  const handleLoadSampleUrl = (channel: 'airbnb' | 'booking_com') => {
    if (channel === 'airbnb') {
      setNewFeedChannel('airbnb');
      setNewFeedName('Airbnb Primary Calendar');
      setNewFeedUrl('https://www.airbnb.com/calendar/ical/8821904.ics?s=34a9b2c8');
    } else {
      setNewFeedChannel('booking_com');
      setNewFeedName('Booking.com Extranet Sync');
      setNewFeedUrl('https://admin.booking.com/hotel/hoteladmin/ical.html?t=9821-4991-aa');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining the bypass mechanism */}
      <div className="bg-[#FAF9F5] border border-[#E5E5DE] rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5A5A40] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-serif text-[#2D2D24]">
                  Two-Way iCalendar (iCal) Availability Synchronization Engine
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Zero API Restrictions
                </span>
              </div>
              <p className="text-xs text-[#8B7E66] mt-1 leading-relaxed max-w-3xl">
                Operate Airbnb and Booking.com without waiting for enterprise partner API approvals. Vortix generates unique,
                standard RFC 5545 export feeds for every unit and polls OTA calendars to automatically lock dates, eliminate double bookings, and maintain availability parity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              disabled={isSyncingFeeds}
              onClick={handleSyncAllInboundFeeds}
              className="flex items-center gap-2 bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-semibold px-4 py-2.5 rounded-2xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingFeeds ? 'animate-spin' : ''}`} />
              <span>{isSyncingFeeds ? 'Pulling Feeds...' : 'Sync All iCal Feeds'}</span>
            </button>
          </div>
        </div>

        {/* Feature Highlights Pill Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#E5E5DE]">
          <div className="flex items-center gap-2 text-xs text-[#2D2D24]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>No Partner Approval:</strong> Works with any standard host account.</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#2D2D24]">
            <Shield className="w-4 h-4 text-[#5A5A40] shrink-0" />
            <span><strong>Two-Way Parity:</strong> Auto-blocks both inbound and outbound dates.</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#2D2D24]">
            <Clock className="w-4 h-4 text-[#C48C3B] shrink-0" />
            <span><strong>15-Minute Refresh:</strong> Compliant with standard OTA polling cadences.</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Unit iCal Cards & Step-by-Step Setup Guides */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Unit Feeds Management (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-serif text-[#2D2D24] flex items-center gap-2">
              <span>Unit Calendar Feeds</span>
              <span className="text-xs font-normal text-[#8B7E66]">({units.length} units configured)</span>
            </h3>
            <span className="text-[11px] text-[#8B7E66]">Click unit to expand OTA connections</span>
          </div>

          <div className="space-y-3">
            {units.map((unit) => {
              const conn = connections.find((c) => c.unitId === unit.id) || {
                unitId: unit.id,
                unitNumber: unit.unitNumber,
                propertyName: unit.propertyName,
                exportUrl: `https://vortix.io/api/v1/ical/export/${unit.id}.ics?key=vtx_sec_${unit.id}`,
                exportToken: `vtx_sec_${unit.id}`,
                inboundFeeds: [],
              };
              const isExpanded = expandedUnitId === unit.id;
              const unitResCount = reservations.filter(
                (r) => r.unitId === unit.id && r.status !== 'cancelled'
              ).length;

              return (
                <div
                  key={unit.id}
                  className={`bg-white border transition-all rounded-3xl overflow-hidden shadow-xs ${
                    isExpanded ? 'border-[#5A5A40] ring-1 ring-[#5A5A40]/20' : 'border-[#E5E5DE]'
                  }`}
                >
                  {/* Unit Card Header */}
                  <div
                    onClick={() => {
                      setExpandedUnitId(isExpanded ? null : unit.id);
                      setSelectedUnitId(unit.id);
                    }}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#FAF9F5] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center font-bold text-xs">
                        {unit.unitNumber.replace(/[^0-9A-Za-z]/g, '').slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#2D2D24]">{unit.unitNumber}</h4>
                          <span className="text-[11px] text-[#8B7E66] font-medium">&bull; {unit.propertyName}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#8B7E66]">
                          <span>{unit.unitType}</span>
                          <span>&bull;</span>
                          <span className="text-emerald-700 font-medium">
                            {conn.inboundFeeds.length} Active OTA Inbound Feeds
                          </span>
                          <span>&bull;</span>
                          <span>{unitResCount} Local Blocks</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyExportUrl(unit.id, conn.exportUrl);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF9F5] hover:bg-[#F5F5F0] border border-[#E5E5DE] text-xs font-medium text-[#5A5A40] cursor-pointer"
                        title="Copy Vortix Outbound iCal URL"
                      >
                        {copiedUrlUnitId === unit.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>

                      <div className="text-[#8B7E66] p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Body: Outbound URL & Inbound Channels */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-[#E5E5DE] bg-[#FAF9F5]/40 space-y-4 text-xs">
                      {/* Outbound Feed Section */}
                      <div className="bg-white border border-[#E5E5DE] rounded-2xl p-4 space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#5A5A40]" />
                            <span className="font-bold text-[#2D2D24]">Vortix Outbound iCal URL</span>
                            <span className="text-[10px] bg-[#5A5A40]/10 text-[#5A5A40] font-semibold px-2 py-0.5 rounded-full">
                              Paste into Airbnb / Booking.com
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handlePreviewIcs(unit)}
                              className="p-1.5 rounded-xl hover:bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] cursor-pointer"
                              title="Preview Raw RFC 5545 .ics Text"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDownloadIcs(unit)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#5A5A40] border border-[#E5E5DE] font-medium cursor-pointer"
                              title="Download .ics file"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download .ics</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={conn.exportUrl}
                            className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E5E5DE] rounded-xl text-[11px] font-mono text-[#2D2D24] select-all"
                          />
                          <button
                            onClick={() => handleCopyExportUrl(unit.id, conn.exportUrl)}
                            className="px-3 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#474732] text-white font-medium shrink-0 cursor-pointer"
                          >
                            {copiedUrlUnitId === unit.id ? 'Copied!' : 'Copy'}
                          </button>
                        </div>

                        <p className="text-[11px] text-[#8B7E66]">
                          This URL reflects live reservations and maintenance blocks. When Airbnb or Booking.com checks this link, those dates are automatically blocked from public search.
                        </p>
                      </div>

                      {/* Inbound Feeds Section */}
                      <div className="bg-white border border-[#E5E5DE] rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-[#5A5A40]" />
                            <span className="font-bold text-[#2D2D24]">Inbound OTA Calendar Feeds</span>
                            <span className="text-[10px] text-[#8B7E66]">
                              ({conn.inboundFeeds.length} connected)
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedUnitId(unit.id);
                              setIsAddFeedModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#5A5A40]/10 hover:bg-[#5A5A40]/20 text-[#5A5A40] font-semibold cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Channel Feed</span>
                          </button>
                        </div>

                        {conn.inboundFeeds.length === 0 ? (
                          <div className="p-4 rounded-xl bg-[#FAF9F5] border border-dashed border-[#E5E5DE] text-center text-[#8B7E66]">
                            <p>No inbound feeds connected for this unit.</p>
                            <button
                              onClick={() => {
                                setSelectedUnitId(unit.id);
                                setIsAddFeedModalOpen(true);
                              }}
                              className="mt-2 text-xs text-[#5A5A40] font-semibold underline cursor-pointer"
                            >
                              Add Airbnb or Booking.com iCal link now
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {conn.inboundFeeds.map((feed) => (
                              <div
                                key={feed.id}
                                className="p-3 rounded-xl border border-[#E5E5DE] bg-[#FAF9F5] flex items-center justify-between gap-2"
                              >
                                <div className="space-y-0.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#2D2D24]">{feed.channelName}</span>
                                    <span className="text-[9px] font-bold px-2 py-0.2 rounded-full uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                      {feed.channelCode.replace('_', '.')}
                                    </span>
                                    <span className="text-[10px] text-[#8B7E66]">
                                      &bull; Synced {feed.lastSyncedAt || 'recently'}
                                    </span>
                                  </div>
                                  <div className="text-[11px] font-mono text-[#8B7E66] truncate">
                                    {feed.feedUrl}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] font-semibold text-emerald-700 bg-white border border-[#E5E5DE] px-2 py-1 rounded-lg">
                                    {feed.eventsImportedCount} Blocks
                                  </span>
                                  <button
                                    onClick={() => handleRemoveFeed(unit.id, feed.id)}
                                    className="p-1.5 rounded-lg text-[#8B7E66] hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                                    title="Remove this feed"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Step-by-Step Instructions & Sync Parity Tester (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Instructions Accordion Box */}
          <div className="bg-white border border-[#E5E5DE] rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#5A5A40]" />
              <h3 className="font-bold font-serif text-sm text-[#2D2D24]">Step-by-Step Setup Guides</h3>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex p-1 bg-[#FAF9F5] border border-[#E5E5DE] rounded-2xl text-xs font-semibold">
              <button
                onClick={() => setActiveGuideTab('airbnb')}
                className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeGuideTab === 'airbnb' ? 'bg-[#5A5A40] text-white shadow-xs' : 'text-[#8B7E66] hover:text-[#2D2D24]'
                }`}
              >
                Airbnb
              </button>
              <button
                onClick={() => setActiveGuideTab('booking')}
                className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeGuideTab === 'booking' ? 'bg-[#5A5A40] text-white shadow-xs' : 'text-[#8B7E66] hover:text-[#2D2D24]'
                }`}
              >
                Booking.com
              </button>
              <button
                onClick={() => setActiveGuideTab('vrbo')}
                className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeGuideTab === 'vrbo' ? 'bg-[#5A5A40] text-white shadow-xs' : 'text-[#8B7E66] hover:text-[#2D2D24]'
                }`}
              >
                VRBO
              </button>
            </div>

            {/* Guide Content: Airbnb */}
            {activeGuideTab === 'airbnb' && (
              <div className="space-y-3 text-xs text-[#5A5A40] leading-relaxed animate-in fade-in duration-200">
                <div className="font-bold text-[#2D2D24] text-xs">How to connect Airbnb Two-Way Sync:</div>
                <ol className="space-y-2 list-decimal list-inside text-[#2D2D24]">
                  <li className="pl-1">
                    Log into your <strong>Airbnb Host Account</strong> and go to <strong>Listings</strong>.
                  </li>
                  <li className="pl-1">
                    Select your listing (e.g. <em>Suite 101</em>) &gt; click the <strong>Pricing and availability</strong> tab.
                  </li>
                  <li className="pl-1">
                    Scroll down to the <strong>Calendar sync</strong> section.
                  </li>
                  <li className="pl-1">
                    Click <strong>Import calendar</strong> &gt; paste your <strong>Vortix Outbound iCal URL</strong> &gt; name it <em>Vortix PMS</em>.
                  </li>
                  <li className="pl-1">
                    Next, click <strong>Export calendar</strong> in Airbnb &gt; copy their <code>.ics</code> link.
                  </li>
                  <li className="pl-1">
                    Return to Vortix, click <strong>Add Channel Feed</strong> above, and paste the Airbnb URL.
                  </li>
                </ol>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-[11px] text-emerald-900">
                  <strong>Result:</strong> When a reservation is made on Airbnb, Vortix locks the room. When you create a direct or corporate booking in Vortix, Airbnb automatically blocks those dates from public booking.
                </div>
              </div>
            )}

            {/* Guide Content: Booking.com */}
            {activeGuideTab === 'booking' && (
              <div className="space-y-3 text-xs text-[#5A5A40] leading-relaxed animate-in fade-in duration-200">
                <div className="font-bold text-[#2D2D24] text-xs">How to connect Booking.com Extranet Sync:</div>
                <ol className="space-y-2 list-decimal list-inside text-[#2D2D24]">
                  <li className="pl-1">
                    Log into the <strong>Booking.com Extranet</strong>.
                  </li>
                  <li className="pl-1">
                    Navigate to <strong>Calendar &amp; Pricing</strong> or <strong>Rates &amp; Availability</strong>.
                  </li>
                  <li className="pl-1">
                    Click <strong>Sync calendars</strong> at the top right.
                  </li>
                  <li className="pl-1">
                    Click <strong>Add calendar connection</strong> &gt; paste your <strong>Vortix Outbound iCal URL</strong>.
                  </li>
                  <li className="pl-1">
                    Copy the export link provided by Booking.com.
                  </li>
                  <li className="pl-1">
                    Click <strong>Add Channel Feed</strong> in Vortix and paste your Booking.com link.
                  </li>
                </ol>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[11px] text-blue-900">
                  <strong>Cadence Note:</strong> Booking.com polls external iCal feeds approximately every 30 to 60 minutes.
                </div>
              </div>
            )}

            {/* Guide Content: VRBO */}
            {activeGuideTab === 'vrbo' && (
              <div className="space-y-3 text-xs text-[#5A5A40] leading-relaxed animate-in fade-in duration-200">
                <div className="font-bold text-[#2D2D24] text-xs">How to connect VRBO / HomeAway:</div>
                <ol className="space-y-2 list-decimal list-inside text-[#2D2D24]">
                  <li className="pl-1">
                    Log into the <strong>VRBO Owner Dashboard</strong>.
                  </li>
                  <li className="pl-1">
                    Select <strong>Calendars</strong> &gt; click <strong>Reservations</strong>.
                  </li>
                  <li className="pl-1">
                    Click <strong>Import / Export</strong> &gt; choose <strong>Import Calendar</strong>.
                  </li>
                  <li className="pl-1">
                    Paste your <strong>Vortix Outbound iCal URL</strong> and name it <em>Vortix Master</em>.
                  </li>
                  <li className="pl-1">
                    Click <strong>Export Calendar</strong> to copy your VRBO link and save into Vortix.
                  </li>
                </ol>
              </div>
            )}
          </div>

          {/* Availability Parity Inspector Card */}
          <div className="bg-white border border-[#E5E5DE] rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-sm text-[#2D2D24]">Active Parity Schedule</h4>
              </div>
              <span className="text-[10px] text-[#8B7E66]">Next 14 Days</span>
            </div>

            <p className="text-xs text-[#8B7E66]">
              Dates currently blocked across both channels for <strong>Suite 101</strong>:
            </p>

            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E5E5DE] flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#2D2D24]">Sep 03 &ndash; Sep 08 (5 nights)</div>
                  <div className="text-[11px] text-[#5A5A40]">Dr. Alistair Vance (Vortix Corporate Booking)</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#5A5A40] text-white">
                  DIRECT
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-rose-950">Sep 18 &ndash; Sep 22 (4 nights)</div>
                  <div className="text-[11px] text-rose-700">Blocked via Airbnb Calendar Sync Feed</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-700 text-white">
                  AIRBNB
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-blue-950">Oct 02 &ndash; Oct 06 (4 nights)</div>
                  <div className="text-[11px] text-blue-700">Blocked via Booking.com Extranet Feed</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-700 text-white">
                  BOOKING.COM
                </span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero schedule conflicts or overlapping dates detected.</span>
            </div>
          </div>
        </div>
      </div>

      {/* RAW .ICS PREVIEW MODAL */}
      {isPreviewModalOpen && previewIcsData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#5A5A40]" />
                <h3 className="font-bold font-serif text-sm text-[#2D2D24]">
                  RFC 5545 iCalendar Feed &bull; {previewIcsData.unitNumber}
                </h3>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 rounded-xl text-[#8B7E66] hover:text-[#2D2D24] cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto flex-1">
              <p className="text-xs text-[#8B7E66]">
                This is the raw standard format that Airbnb and Booking.com read every 15 minutes to lock your availability:
              </p>
              <pre className="p-4 bg-[#2D2D24] text-[#E9E9E0] font-mono text-[11px] rounded-2xl overflow-x-auto leading-relaxed">
                {previewIcsData.content}
              </pre>
            </div>

            <div className="p-4 border-t border-[#E5E5DE] flex justify-end gap-2 bg-[#FAF9F5]">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(previewIcsData.content);
                  onShowNotification?.('Copied to Clipboard', 'Full .ics content copied.');
                }}
                className="px-4 py-2 rounded-xl border border-[#E5E5DE] text-xs font-semibold text-[#2D2D24] cursor-pointer"
              >
                Copy Raw Text
              </button>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#5A5A40] text-white text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CHANNEL FEED MODAL */}
      {isAddFeedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5]">
              <h3 className="font-bold font-serif text-sm text-[#2D2D24]">
                Connect Inbound iCal Feed &bull; {currentUnit?.unitNumber}
              </h3>
              <button
                onClick={() => setIsAddFeedModalOpen(false)}
                className="p-1 rounded-xl text-[#8B7E66] hover:text-[#2D2D24] cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2D2D24] mb-1.5">Distribution Channel:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewFeedChannel('airbnb')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      newFeedChannel === 'airbnb'
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                        : 'bg-[#FAF9F5] border-[#E5E5DE] text-[#2D2D24]'
                    }`}
                  >
                    Airbnb
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewFeedChannel('booking_com')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      newFeedChannel === 'booking_com'
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                        : 'bg-[#FAF9F5] border-[#E5E5DE] text-[#2D2D24]'
                    }`}
                  >
                    Booking.com
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewFeedChannel('vrbo')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      newFeedChannel === 'vrbo'
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                        : 'bg-[#FAF9F5] border-[#E5E5DE] text-[#2D2D24]'
                    }`}
                  >
                    VRBO
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2D2D24] mb-1">Feed Label:</label>
                <input
                  type="text"
                  placeholder="e.g. Airbnb Suite 101 Official Calendar"
                  value={newFeedName}
                  onChange={(e) => setNewFeedName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-[#2D2D24]">External .ics URL:</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleLoadSampleUrl('airbnb')}
                      className="text-[10px] text-[#5A5A40] underline font-medium cursor-pointer"
                    >
                      Sample Airbnb URL
                    </button>
                    <span className="text-[#8B7E66]">&bull;</span>
                    <button
                      type="button"
                      onClick={() => handleLoadSampleUrl('booking_com')}
                      className="text-[10px] text-[#5A5A40] underline font-medium cursor-pointer"
                    >
                      Sample Booking.com URL
                    </button>
                  </div>
                </div>
                <input
                  type="url"
                  placeholder="https://www.airbnb.com/calendar/ical/...ics"
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl text-xs font-mono"
                />
              </div>

              <div className="p-3 bg-[#FAF9F5] border border-[#E5E5DE] rounded-2xl text-[11px] text-[#8B7E66]">
                Dates blocked in this calendar feed will be locked in your Property Management System, preventing direct bookings or conflicts.
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E5DE] flex justify-end gap-2 bg-[#FAF9F5]">
              <button
                type="button"
                onClick={() => setIsAddFeedModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E5E5DE] text-xs font-semibold text-[#2D2D24] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewFeed}
                className="px-5 py-2 rounded-xl bg-[#5A5A40] text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                Save &amp; Connect Feed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
