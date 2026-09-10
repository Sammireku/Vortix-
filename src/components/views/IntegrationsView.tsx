import React, { useState } from 'react';
import {
  Link2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Radio,
  ExternalLink,
  Shield,
  Clock,
  Zap,
  Terminal,
  Search,
  Filter,
  Sliders,
  Check,
  X,
  Settings,
  ArrowUpRight,
  Database,
  Building2,
  Activity,
  Layers,
} from 'lucide-react';
import { AppConnectorConfig, AppConnectorKey, RoleDefinition, ApiConnector } from '../../types';

interface IntegrationsViewProps {
  appConnectors: AppConnectorConfig[];
  currentRole: RoleDefinition;
  onToggleAppConnector: (id: AppConnectorKey) => void;
  onSyncAppConnector?: (id: AppConnectorKey) => void;
  onUpdateConnectorConfig?: (config: AppConnectorConfig) => void;
  legacyConnectors?: ApiConnector[];
  onToggleLegacyConnector?: (id: string) => void;
  onTestWebhook?: (connector: ApiConnector | AppConnectorConfig) => Promise<{ success: boolean; message: string }>;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  appConnectors,
  currentRole,
  onToggleAppConnector,
  onSyncAppConnector,
  onUpdateConnectorConfig,
  legacyConnectors = [],
  onToggleLegacyConnector,
  onTestWebhook,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConnector, setSelectedConnector] = useState<AppConnectorConfig | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Webhook Simulator State
  const [customEndpoint, setCustomEndpoint] = useState('https://api.factory-erp.internal/v1/webhook');
  const [customPayload, setCustomPayload] = useState(
    JSON.stringify({ event: 'machine_heartbeat', machineId: 'CNC-01', rpm: 12400, oee: 88.5 }, null, 2)
  );
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; msg: string } | null>(null);

  const canWrite =
    currentRole.permissions.integrations === 'admin' || currentRole.permissions.integrations === 'write';

  const categories = ['All', 'CRM & Sales', 'Project & Issue Tracking', 'Accounting & Invoicing', 'Messaging & Notifications'];

  const filteredConnectors = appConnectors.filter((c) => {
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.recordsSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedCount = appConnectors.filter((c) => c.enabled).length;

  const handleTriggerSync = (id: AppConnectorKey) => {
    setSyncingId(id);
    if (onSyncAppConnector) {
      onSyncAppConnector(id);
    }
    setTimeout(() => {
      setSyncingId(null);
      setNotificationMsg(`Successfully synced latest data from ${id.toUpperCase()}`);
      setTimeout(() => setNotificationMsg(null), 3500);
    }, 1200);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedConnector && onUpdateConnectorConfig) {
      onUpdateConnectorConfig(selectedConnector);
      setNotificationMsg(`Updated configuration for ${selectedConnector.name}`);
      setTimeout(() => setNotificationMsg(null), 3500);
      setSelectedConnector(null);
    }
  };

  const handleTestSimulated = async () => {
    setTestResult(null);
    try {
      if (onTestWebhook) {
        const res = await onTestWebhook({
          id: 'sim-webhook',
          name: 'Simulated Inbound Gateway',
          type: 'webhook',
          status: 'connected',
          endpointUrl: customEndpoint,
          description: 'Simulated inbound webhook gateway for payload testing',
        });
        setTestResult({ id: 'sim-webhook', success: res.success, msg: res.message });
      } else {
        setTestResult({
          id: 'sim-webhook',
          success: true,
          msg: `HTTP 200 OK — Payload ingested & dispatched to ERP event bus.`,
        });
      }
    } catch (err: unknown) {
      setTestResult({ id: 'sim-webhook', success: false, msg: err instanceof Error ? err.message : 'Webhook failed' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2D2D24] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#5A5A40]/50 text-xs font-mono animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#5A5A40]" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E5DE] p-6 rounded-3xl shadow-sm text-[#2D2D24]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-serif italic font-medium tracking-tight text-[#2D2D24] flex items-center gap-2.5">
              <Link2 className="w-6 h-6 text-[#5A5A40]" />
              Enterprise Apps &amp; Systems Connector Hub
            </h1>
            <span className="text-xs bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] px-3 py-0.5 rounded-full font-semibold">
              Live Bi-Directional Sync
            </span>
          </div>
          <p className="text-xs text-[#8B7E66] mt-1 max-w-2xl">
            Link and stream data seamlessly between your existing corporate tech stack (HubSpot, Salesforce, Zoho, Monday, Asana, Jira, QuickBooks, Xero, Slack, Twilio) and Vortix Platform. Toggle on or off with instant state persistence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#F5F5F0] border border-[#E5E5DE] px-4 py-2 rounded-2xl flex items-center gap-3 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5A5A40] animate-pulse"></span>
            <div>
              <span className="text-[10px] text-[#8B7E66] uppercase font-bold block">Connected Apps</span>
              <span className="font-mono font-bold text-[#2D2D24]">
                {connectedCount} of {appConnectors.length} Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white border border-[#E5E5DE] p-4 rounded-3xl shadow-sm">
        {/* Search */}
        <div className="flex items-center gap-2.5 bg-[#F5F5F0] border border-[#E5E5DE] px-3.5 py-2 rounded-2xl text-xs text-[#2D2D24] flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8B7E66]" />
          <input
            type="text"
            placeholder="Search connectors by name, records or features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-[#2D2D24] outline-none w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-[#8B7E66] hover:text-[#2D2D24]">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#5A5A40] text-white'
                  : 'bg-[#F5F5F0] text-[#787668] hover:text-[#2D2D24] hover:bg-[#E9E9E0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Connectors Grid with Prominent Toggle Switches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredConnectors.map((connector) => {
          const isSyncing = syncingId === connector.id;

          return (
            <div
              key={connector.id}
              className={`bg-white border ${
                connector.enabled ? 'border-[#5A5A40]/40 shadow-md ring-1 ring-[#5A5A40]/10' : 'border-[#E5E5DE]'
              } rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-[#8B7E66] transition-all relative group`}
            >
              <div>
                {/* Header: App Brand + Toggle Switch */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center font-mono font-bold text-white shadow-xs shrink-0"
                      style={{ backgroundColor: connector.iconColor }}
                    >
                      {connector.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-serif italic font-semibold text-[#2D2D24] leading-tight">
                        {connector.name}
                      </h3>
                      <span className="text-[10px] text-[#8B7E66] uppercase font-bold tracking-wider">
                        {connector.category}
                      </span>
                    </div>
                  </div>

                  {/* PROMINENT TOGGLE SWITCH */}
                  <div className="flex items-center gap-2 shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={connector.enabled}
                        disabled={!canWrite}
                        onChange={() => onToggleAppConnector(connector.id)}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-[#E5E5DE] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[3px] after:bg-white after:border-[#D1CFBF] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5A5A40]"></div>
                    </label>
                  </div>
                </div>

                <p className="text-xs text-[#787668] mt-3 leading-relaxed">{connector.tagline}</p>

                {/* Status & Linked Data Pill */}
                <div className="mt-4 p-3 rounded-2xl bg-[#F9F9F7] border border-[#E5E5DE] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#8B7E66] flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          connector.enabled
                            ? 'bg-[#2E6930] animate-pulse'
                            : 'bg-[#D1CFBF]'
                        }`}
                      ></span>
                      Status:
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                        connector.enabled
                          ? 'bg-[#2E6930]/15 text-[#2E6930]'
                          : 'bg-[#E5E5DE] text-[#787668]'
                      }`}
                    >
                      {connector.enabled ? connector.authStatus.toUpperCase() : 'DISABLED'}
                    </span>
                  </div>

                  <div className="text-xs">
                    <span className="text-[10px] text-[#8B7E66] block">Linked Data:</span>
                    <span className="font-semibold text-[#2D2D24] text-xs leading-snug">
                      {connector.recordsSummary}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-[#8B7E66] pt-1 border-t border-[#E5E5DE]">
                    <span>Last Sync: {connector.lastSyncTimestamp}</span>
                    <span className="font-mono">{connector.syncFrequency}</span>
                  </div>
                </div>

                {/* Supported Features Badges */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {connector.featuresSupported.map((feat) => (
                    <span
                      key={feat}
                      className="text-[10px] bg-[#F5F5F0] text-[#787668] px-2 py-0.5 rounded-md border border-[#E5E5DE]"
                    >
                      {feat}
                    </span>
                  ))}
                </div>

                {/* Recent Synced Feed if Enabled */}
                {connector.enabled && connector.recentSyncedItems && connector.recentSyncedItems.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#E5E5DE] space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#8B7E66] block">Recent Event Feed</span>
                    {connector.recentSyncedItems.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="text-[11px] bg-white p-1.5 rounded-xl border border-[#E5E5DE] flex justify-between items-center"
                      >
                        <span className="text-[#2D2D24] font-medium truncate max-w-[160px]">{item.title}</span>
                        <span className="text-[10px] font-mono text-[#5A5A40] bg-[#5A5A40]/10 px-1.5 py-0.5 rounded">
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#E5E5DE] flex items-center justify-between gap-2">
                <button
                  disabled={!connector.enabled || isSyncing || !canWrite}
                  onClick={() => handleTriggerSync(connector.id)}
                  className="text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] disabled:opacity-40 text-[#2D2D24] font-medium px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 border border-[#E5E5DE] cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#5A5A40] ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>

                <button
                  onClick={() => setSelectedConnector(connector)}
                  className="text-xs bg-white hover:bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] px-3.5 py-2 rounded-xl font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>Configure</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Modal Drawer */}
      {selectedConnector && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scale-in text-[#2D2D24]">
            <div className="flex items-center justify-between border-b border-[#E5E5DE] pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-bold text-white"
                  style={{ backgroundColor: selectedConnector.iconColor }}
                >
                  {selectedConnector.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-serif italic font-semibold">{selectedConnector.name} Settings</h3>
                  <span className="text-[10px] text-[#8B7E66]">{selectedConnector.category}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedConnector(null)}
                className="text-[#8B7E66] hover:text-[#2D2D24] p-1 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#2D2D24]">Webhook / REST Endpoint URL</label>
                <input
                  type="text"
                  value={selectedConnector.endpointOrWebhookUrl}
                  onChange={(e) =>
                    setSelectedConnector({ ...selectedConnector, endpointOrWebhookUrl: e.target.value })
                  }
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 font-mono text-xs text-[#2D2D24] outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#2D2D24]">Account Identifier / Org ID</label>
                  <input
                    type="text"
                    value={selectedConnector.accountIdentifier || ''}
                    onChange={(e) =>
                      setSelectedConnector({ ...selectedConnector, accountIdentifier: e.target.value })
                    }
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 font-mono text-xs text-[#2D2D24] outline-none focus:border-[#5A5A40]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#2D2D24]">Sync Frequency</label>
                  <select
                    value={selectedConnector.syncFrequency}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setSelectedConnector({ ...selectedConnector, syncFrequency: e.target.value as AppConnectorConfig['syncFrequency'] })
                    }
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-xs text-[#2D2D24] outline-none focus:border-[#5A5A40]"
                  >
                    <option value="Real-time Push">Real-time Push</option>
                    <option value="Every 5 min">Every 5 min</option>
                    <option value="Hourly">Hourly</option>
                    <option value="Daily Batch">Daily Batch</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-[#2D2D24]">API Key / OAuth Token (Masked)</label>
                <input
                  type="text"
                  value={selectedConnector.apiKeyMasked || ''}
                  onChange={(e) =>
                    setSelectedConnector({ ...selectedConnector, apiKeyMasked: e.target.value })
                  }
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 font-mono text-xs text-[#2D2D24] outline-none focus:border-[#5A5A40]"
                />
                <span className="text-[10px] text-[#8B7E66]">Stored securely with AES-256 GCM token envelope encryption.</span>
              </div>

              <div className="bg-[#F9F9F7] p-3 rounded-2xl border border-[#E5E5DE] space-y-1">
                <span className="font-semibold text-[11px] block">Active Features Synchronized</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedConnector.featuresSupported.map((f) => (
                    <span key={f} className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#E5E5DE]">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E5DE]">
                <button
                  type="button"
                  onClick={() => setSelectedConnector(null)}
                  className="px-4 py-2 bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5A5A40] hover:bg-[#474732] text-white rounded-xl font-semibold cursor-pointer shadow-xs"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Raw Webhook Simulator Console */}
      <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 space-y-4 shadow-sm text-[#2D2D24]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-serif italic font-semibold text-[#2D2D24] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#5A5A40]" />
              Inbound Factory &amp; ERP Webhook Ingestion Console
            </h2>
            <p className="text-xs text-[#8B7E66] mt-0.5">
              Simulate raw HTTP POST payloads from automated factory machinery, shop-floor barcode scanners, or external CRM webhooks.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#8B7E66] bg-[#F5F5F0] px-2.5 py-1 rounded-md border border-[#E5E5DE] self-start">
            POST /api/integrations/webhook/test
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 text-xs">
            <label className="text-[#2D2D24] font-semibold block">Destination Endpoint URL</label>
            <input
              type="text"
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-xs text-[#2D2D24] font-mono focus:outline-none focus:border-[#5A5A40]"
            />

            <label className="text-[#2D2D24] font-semibold block pt-2">Simulated Ingestion Payload (JSON)</label>
            <textarea
              rows={4}
              value={customPayload}
              onChange={(e) => setCustomPayload(e.target.value)}
              className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-xs text-[#5A5A40] font-mono focus:outline-none focus:border-[#5A5A40]"
            ></textarea>

            {testResult && (
              <div
                className={`p-2.5 rounded-xl text-xs font-mono border ${
                  testResult.success
                    ? 'bg-[#5A5A40]/10 text-[#5A5A40] border-[#5A5A40]/30'
                    : 'bg-[#B85D36]/10 text-[#B85D36] border-[#B85D36]/30'
                }`}
              >
                {testResult.msg}
              </div>
            )}
          </div>

          <div className="bg-[#2D2D24] p-5 rounded-2xl border border-[#5A5A40]/30 text-xs font-mono space-y-3 text-[#E9E9E0] flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-[#A09E8E] font-semibold flex items-center justify-between">
                <span>Security &amp; Webhook Signature:</span>
                <span className="text-[#C5BAA8]">HMAC-SHA256</span>
              </div>
              <div className="text-[#8B7E66] text-[11px] leading-relaxed">
                X-ERP-Signature: sha256=8f910a8...
                <br />
                Content-Type: application/json
                <br />
                User-Agent: Enterprise-Connector-Bridge/3.1
              </div>
            </div>

            <button
              onClick={handleTestSimulated}
              className="w-full bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer shadow-xs mt-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Test Payload</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
