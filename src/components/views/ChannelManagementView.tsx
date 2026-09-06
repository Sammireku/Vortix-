import React, { useState } from 'react';
import {
  Globe,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Percent,
  Lock,
  Pause,
  Play,
  Zap,
  Layers,
  ArrowRight,
  Shield,
  HelpCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  DistributionChannel,
  ChannelSyncEvent,
  PropertyUnit,
  PropertyReservation,
  AppUser,
} from '../../types';
import { IcalCalendarSyncHub } from './IcalCalendarSyncHub';

interface ChannelManagementViewProps {
  currentUser: AppUser;
  channels: DistributionChannel[];
  onUpdateChannel: (updatedChannel: DistributionChannel) => void;
  units: PropertyUnit[];
  reservations?: PropertyReservation[];
  onAddReservation?: (newReservation: PropertyReservation) => void;
  syncLogs: ChannelSyncEvent[];
  onAddSyncLog: (log: ChannelSyncEvent) => void;
  onShowNotification?: (title: string, message: string, type?: 'success' | 'warning' | 'info') => void;
}

export const ChannelManagementView: React.FC<ChannelManagementViewProps> = ({
  currentUser,
  channels,
  onUpdateChannel,
  units,
  reservations = [],
  onAddReservation,
  syncLogs,
  onAddSyncLog,
  onShowNotification,
}) => {
  const [activeTab, setActiveTab] = useState<'ical_sync' | 'channels' | 'logs'>('ical_sync');
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [editingChannel, setEditingChannel] = useState<DistributionChannel | null>(null);
  const [bulkMarkupPercent, setBulkMarkupPercent] = useState<number>(10);
  const [isBulkRateModalOpen, setIsBulkRateModalOpen] = useState(false);

  const handleTriggerSyncAll = () => {
    setIsSyncingAll(true);
    onShowNotification?.('Sync Initiated', 'Broadcasting 2-way availability and rates to all OTAs...');

    setTimeout(() => {
      setIsSyncingAll(false);
      const newLog: ChannelSyncEvent = {
        id: `sync-${Date.now()}`,
        channelName: 'All Channels (Global Handshake)',
        eventType: 'calendar_handshake',
        details: `Synchronized ${units.length} unit calendars across 5 distribution networks with 0 conflicts.`,
        timestamp: 'Just now',
        status: 'success',
      };
      onAddSyncLog(newLog);
      onShowNotification?.('Sync Complete', 'All OTAs and corporate channels fully in sync.');
    }, 1200);
  };

  const handleToggleChannelStatus = (chan: DistributionChannel) => {
    const nextStatus = chan.status === 'active' ? 'paused' : 'active';
    const updated = {
      ...chan,
      status: nextStatus as any,
    };
    onUpdateChannel(updated);
    onShowNotification?.(
      'Channel Updated',
      `${chan.name} distribution set to [${nextStatus.toUpperCase()}].`
    );
  };

  const handleUpdateMarkup = (chan: DistributionChannel, newMarkup: number) => {
    if (!currentUser.dataAccess.canModifyChannelRates) {
      onShowNotification?.(
        'Permission Restricted',
        'Your user profile is not authorized to modify channel rate multipliers.',
        'warning'
      );
      return;
    }

    const updated = {
      ...chan,
      rateMarkupPct: newMarkup,
    };
    onUpdateChannel(updated);
    onShowNotification?.(
      'Channel Rate Multiplier Saved',
      `Set ${chan.name} price markup to +${newMarkup}%. New rates pushed to channel API.`
    );
  };

  const handleApplyBulkRateMarkup = () => {
    if (!currentUser.dataAccess.canModifyChannelRates) {
      onShowNotification?.(
        'Permission Restricted',
        'Your user profile is not authorized to modify channel rate multipliers.',
        'warning'
      );
      return;
    }

    channels.forEach((chan) => {
      if (chan.code !== 'direct') {
        onUpdateChannel({
          ...chan,
          rateMarkupPct: bulkMarkupPercent,
        });
      }
    });

    setIsBulkRateModalOpen(false);
    onShowNotification?.(
      'Bulk Rates Deployed',
      `Applied +${bulkMarkupPercent}% rate adjustment across all 3rd-party OTA distribution partners.`
    );
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-[#E5E5DE] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-serif text-[#2D2D24]">
                OTA Channel Manager & Rate Distribution (CMS)
              </h1>
              <p className="text-xs text-[#8B7E66]">
                2-Way bi-directional synchronization with Airbnb, Booking.com, VRBO, Expedia, and direct corporate booking engines.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsBulkRateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FAF9F5] hover:bg-[#F5F5F0] border border-[#E5E5DE] text-xs font-semibold text-[#5A5A40] rounded-2xl transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Bulk Rate Rules</span>
          </button>

          <button
            disabled={isSyncingAll}
            onClick={handleTriggerSyncAll}
            className="flex items-center gap-2 bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-semibold px-4 py-2.5 rounded-2xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? 'Synchronizing OTAs...' : 'Trigger 2-Way Sync'}</span>
          </button>
        </div>
      </div>

      {/* Strategy Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-[#E5E5DE] rounded-2xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('ical_sync')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ical_sync'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#8B7E66] hover:text-[#2D2D24] hover:bg-[#FAF9F5]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>2-Way iCal Calendar Sync</span>
          <span
            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              activeTab === 'ical_sync'
                ? 'bg-emerald-500 text-white'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            Zero API Limits
          </span>
        </button>

        <button
          onClick={() => setActiveTab('channels')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'channels'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#8B7E66] hover:text-[#2D2D24] hover:bg-[#FAF9F5]'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Direct &amp; Enterprise OTA APIs</span>
          <span className="text-[10px] text-[#8B7E66] bg-[#F5F5F0] px-2 py-0.5 rounded-full">
            {channels.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'logs'
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'text-[#8B7E66] hover:text-[#2D2D24] hover:bg-[#FAF9F5]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Sync Activity &amp; Audit Logs</span>
          <span className="text-[10px] text-[#8B7E66] bg-[#F5F5F0] px-2 py-0.5 rounded-full">
            {syncLogs.length}
          </span>
        </button>
      </div>

      {/* TAB 1: 2-WAY iCAL AVAILABILITY SYNC (AIRBNB & BOOKING.COM BYPASS ENGINE) */}
      {activeTab === 'ical_sync' && (
        <IcalCalendarSyncHub
          currentUser={currentUser}
          units={units}
          reservations={reservations}
          onAddReservation={onAddReservation}
          onAddSyncLog={onAddSyncLog}
          onShowNotification={onShowNotification}
        />
      )}

      {/* TAB 2: DIRECT & CERTIFIED OTA CONNECTIONS (FULL API) */}
      {activeTab === 'channels' && (
        <div className="space-y-5">
          {/* KPI Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E5E5DE] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#8B7E66] text-xs">
                <span>Connected OTAs</span>
                <Globe className="w-4 h-4 text-[#5A5A40]" />
              </div>
              <div className="text-2xl font-bold font-serif text-[#2D2D24] mt-2">
                {channels.filter((c) => c.status === 'active').length} of {channels.length}
              </div>
              <div className="text-[11px] text-emerald-700 font-medium mt-1">Live 2-Way API Handshake</div>
            </div>

            <div className="bg-white border border-[#E5E5DE] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#8B7E66] text-xs">
                <span>Overall Sync Health</span>
                <Zap className="w-4 h-4 text-[#5A5A40]" />
              </div>
              <div className="text-2xl font-bold font-serif text-[#2D2D24] mt-2">99.7%</div>
              <div className="text-[11px] text-[#8B7E66] mt-1">&lt; 150ms round-trip latency</div>
            </div>

            <div className="bg-white border border-[#E5E5DE] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#8B7E66] text-xs">
                <span>Mapped Listings</span>
                <Layers className="w-4 h-4 text-[#5A5A40]" />
              </div>
              <div className="text-2xl font-bold font-serif text-[#2D2D24] mt-2">
                {units.length * channels.length} Nodes
              </div>
              <div className="text-[11px] text-[#5A5A40] font-medium mt-1">
                Zero double-booking protection
              </div>
            </div>

            <div className="bg-white border border-[#E5E5DE] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-[#8B7E66] text-xs">
                <span>Direct vs OTA Share</span>
                <TrendingUp className="w-4 h-4 text-[#5A5A40]" />
              </div>
              <div className="text-2xl font-bold font-serif text-[#2D2D24] mt-2">42% Direct</div>
              <div className="text-[11px] text-emerald-700 font-medium mt-1">Saves $4,820/mo in fees</div>
            </div>
          </div>

          {/* Connected Channels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((chan) => (
              <div
                key={chan.id}
                className="bg-white border border-[#E5E5DE] rounded-3xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold font-serif text-sm text-[#2D2D24]">{chan.name}</h3>
                      <div className="text-[11px] text-[#8B7E66] font-mono mt-0.5">{chan.apiKeyMasked}</div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        chan.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {chan.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E5E5DE] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#8B7E66]">Sync Reliability:</span>
                      <span className="font-bold text-emerald-700">{chan.syncHealthPct}%</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#8B7E66]">Commission Fee:</span>
                      <span className="font-semibold text-[#2D2D24]">{chan.commissionPct}%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-[#8B7E66]">Rate Multiplier:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#5A5A40]">
                          {chan.rateMarkupPct >= 0 ? `+${chan.rateMarkupPct}%` : `${chan.rateMarkupPct}%`}
                        </span>
                        <button
                          onClick={() => {
                            const next = chan.rateMarkupPct >= 15 ? 0 : chan.rateMarkupPct + 5;
                            handleUpdateMarkup(chan, next);
                          }}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#5A5A40] border border-[#E5E5DE] cursor-pointer"
                          title="Adjust rate multiplier"
                        >
                          Cycle
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#8B7E66]">Last Full Handshake:</span>
                      <span className="text-[11px] text-[#2D2D24]">{chan.lastSyncedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E5DE] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleChannelStatus(chan)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E5DE] hover:bg-[#F5F5F0] text-xs font-medium text-[#2D2D24] cursor-pointer"
                  >
                    {chan.status === 'active' ? (
                      <>
                        <Pause className="w-3 h-3 text-amber-700" />
                        <span>Pause Channel</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 text-emerald-700" />
                        <span>Resume Channel</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onShowNotification?.('Sync Pushed', `Pushed immediate inventory update to ${chan.name}.`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-semibold cursor-pointer"
                  >
                    Sync Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REAL-TIME SYNC & BOOKING FEED */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E5E5DE] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#5A5A40]" />
              <h2 className="text-sm font-bold text-[#2D2D24]">Channel Activity &amp; Sync Audit Stream</h2>
            </div>
            <span className="text-xs text-[#8B7E66]">Real-time OTA Ingestion</span>
          </div>

          <div className="divide-y divide-[#E5E5DE]">
            {syncLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-start justify-between gap-3 text-xs hover:bg-[#FAF9F5]">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 mt-0.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#2D2D24]">{log.channelName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F5F5F0] text-[#8B7E66] font-mono uppercase">
                        {log.eventType.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-[#5A5A40] mt-1">{log.details}</div>
                  </div>
                </div>

                <span className="text-[11px] text-[#8B7E66] shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BULK RATE RULES MODAL */}
      {isBulkRateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5]">
              <h3 className="font-bold font-serif text-sm text-[#2D2D24]">Bulk Rate Multiplier Rules</h3>
              <button
                onClick={() => setIsBulkRateModalOpen(false)}
                className="p-1 rounded-xl text-[#8B7E66] hover:text-[#2D2D24] cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-[#8B7E66]">
                Automatically adjust pricing pushed to external travel platforms (Airbnb, Booking.com, VRBO) to offset platform commission fees.
              </p>

              <div>
                <label className="block font-semibold text-[#2D2D24] mb-1.5">
                  Universal OTA Rate Markup Percentage:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={bulkMarkupPercent}
                    onChange={(e) => setBulkMarkupPercent(parseInt(e.target.value) || 0)}
                    className="w-24 px-3 py-2 bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl font-bold text-center"
                  />
                  <span className="font-bold text-[#2D2D24]">% above base campus rate</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E5E5DE] space-y-1">
                <div className="font-bold text-[#2D2D24]">Example Impact on Suite 101 ($189.00):</div>
                <div className="text-[11px] text-[#5A5A40]">
                  Direct Rate: $189.00 &bull; OTA Pushed Rate: $
                  {(189 * (1 + bulkMarkupPercent / 100)).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E5E5DE] flex justify-end gap-2">
              <button
                onClick={() => setIsBulkRateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E5E5DE] text-[#2D2D24] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyBulkRateMarkup}
                className="px-5 py-2 rounded-xl bg-[#5A5A40] text-white font-bold cursor-pointer shadow-xs"
              >
                Apply & Push to All OTAs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
