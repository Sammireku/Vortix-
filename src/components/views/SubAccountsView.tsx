import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Shield,
  Check,
  X,
  Users,
  TrendingUp,
  DollarSign,
  Factory,
  Boxes,
  Briefcase,
  AlertTriangle,
  Clock,
  ChevronRight,
  Filter,
  Search,
  ExternalLink,
  Activity,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Eye,
} from 'lucide-react';
import { SubAccount, RoleDefinition, SubAccountFeaturePermissions, ViewTab } from '../../types';
import { calculateMasterRollup } from '../../data/subAccountsData';

interface SubAccountsViewProps {
  subAccounts: SubAccount[];
  currentRole: RoleDefinition;
  onCreateSubAccount: (account: SubAccount) => void;
  onUpdateSubAccount: (account: SubAccount) => void;
  activeViewingSubAccountId: string | null;
  onSetActiveViewingSubAccountId: (id: string | null) => void;
  onNavigateTab: (tab: ViewTab) => void;
}

export const SubAccountsView: React.FC<SubAccountsViewProps> = ({
  subAccounts,
  currentRole,
  onCreateSubAccount,
  onUpdateSubAccount,
  activeViewingSubAccountId,
  onSetActiveViewingSubAccountId,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSubAccount, setSelectedSubAccount] = useState<SubAccount | null>(null);

  // New sub account form state
  const [newAccount, setNewAccount] = useState({
    name: '',
    code: '',
    entityType: 'Subsidiary Plant' as SubAccount['entityType'],
    region: 'North America',
    location: '',
    managerName: '',
    managerEmail: '',
    monthlyRevenue: 1200000,
    activeWorkOrders: 10,
    averageOee: 82.5,
    inventoryValue: 1500000,
    openDealsCount: 5,
    dealPipelineValue: 2100000,
    employeeCount: 65,
    features: {
      production: true,
      crm_marketing: false,
      inventory: true,
      finance: true,
      supply_chain: true,
      maintenance: true,
      projects: true,
    } as SubAccountFeaturePermissions,
  });

  const canManage =
    currentRole.permissions.rbac === 'admin' ||
    currentRole.permissions.production === 'admin' ||
    currentRole.title.toLowerCase().includes('controller') ||
    currentRole.title.toLowerCase().includes('manager');

  const masterRollup = calculateMasterRollup(subAccounts);

  const filteredSubs = subAccounts.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.managerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleFeature = (sub: SubAccount, featureKey: keyof SubAccountFeaturePermissions) => {
    if (!canManage) return;
    const updated: SubAccount = {
      ...sub,
      enabledFeatures: {
        ...sub.enabledFeatures,
        [featureKey]: !sub.enabledFeatures[featureKey],
      },
    };
    onUpdateSubAccount(updated);
    if (selectedSubAccount?.id === sub.id) {
      setSelectedSubAccount(updated);
    }
  };

  const handleToggleStatus = (sub: SubAccount) => {
    if (!canManage) return;
    const updated: SubAccount = {
      ...sub,
      status: sub.status === 'active' ? 'suspended' : 'active',
    };
    onUpdateSubAccount(updated);
    if (selectedSubAccount?.id === sub.id) {
      setSelectedSubAccount(updated);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name || !newAccount.code) return;

    const created: SubAccount = {
      id: `sub-${Date.now().toString(36)}`,
      code: newAccount.code.toUpperCase(),
      name: newAccount.name,
      entityType: newAccount.entityType,
      region: newAccount.region,
      location: newAccount.location || 'Industrial Park Sector 4',
      managerName: newAccount.managerName || 'Plant Operations Lead',
      managerEmail: newAccount.managerEmail || `ops@${newAccount.code.toLowerCase()}.mfgcorp.com`,
      status: 'active',
      enabledFeatures: newAccount.features,
      metricsFeed: {
        monthlyRevenue: Number(newAccount.monthlyRevenue),
        activeWorkOrders: Number(newAccount.activeWorkOrders),
        averageOee: Number(newAccount.averageOee),
        inventoryValue: Number(newAccount.inventoryValue),
        openDealsCount: Number(newAccount.openDealsCount),
        dealPipelineValue: Number(newAccount.dealPipelineValue),
        activeIncidents: 0,
        employeeCount: Number(newAccount.employeeCount),
        onTimeFulfillmentRate: 95.0,
      },
      lastDataSync: 'Just now',
      activeUsersCount: Math.round(Number(newAccount.employeeCount) * 0.3),
      createdAt: new Date().toISOString().split('T')[0],
    };

    onCreateSubAccount(created);
    setIsCreateModalOpen(false);
    // Reset form
    setNewAccount({
      name: '',
      code: '',
      entityType: 'Subsidiary Plant',
      region: 'North America',
      location: '',
      managerName: '',
      managerEmail: '',
      monthlyRevenue: 1200000,
      activeWorkOrders: 10,
      averageOee: 82.5,
      inventoryValue: 1500000,
      openDealsCount: 5,
      dealPipelineValue: 2100000,
      employeeCount: 65,
      features: {
        production: true,
        crm_marketing: false,
        inventory: true,
        finance: true,
        supply_chain: true,
        maintenance: true,
        projects: true,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Simulation Banner if viewing as a specific sub-account */}
      {activeViewingSubAccountId && (
        <div className="bg-[#5A5A40] text-white p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-[#E9E9E0]" />
            <div>
              <span className="text-xs font-semibold text-[#E9E9E0] uppercase tracking-wider block">
                Sub-Account View Simulation
              </span>
              <span className="text-sm font-serif italic text-white font-medium">
                Viewing system scoped as:{' '}
                <strong>
                  {subAccounts.find((s) => s.id === activeViewingSubAccountId)?.name} (
                  {subAccounts.find((s) => s.id === activeViewingSubAccountId)?.code})
                </strong>
              </span>
            </div>
          </div>
          <button
            onClick={() => onSetActiveViewingSubAccountId(null)}
            className="bg-white hover:bg-[#F5F5F0] text-[#5A5A40] px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs shrink-0"
          >
            Return to Master Manager Rollup
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E5DE] p-6 rounded-3xl shadow-sm text-[#2D2D24]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-serif italic font-medium tracking-tight text-[#2D2D24] flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-[#5A5A40]" />
              Multi-Tenant Sub-Accounts &amp; Master Manager Rollup
            </h1>
            <span className="text-xs bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] px-3 py-0.5 rounded-full font-semibold">
              Hierarchical Enterprise Architecture
            </span>
          </div>
          <p className="text-xs text-[#8B7E66] mt-1 max-w-2xl">
            Provision isolated sub-accounts for subsidiary plants, regional divisions, OEM partners, or franchise branches with granular feature toggles. All operational, commercial, and financial metrics feed continuously to this central Master Headquarters page.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={!canManage}
          className="bg-[#5A5A40] hover:bg-[#474732] disabled:opacity-40 text-white px-5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Sub-Account</span>
        </button>
      </div>

      {/* Master Manager Consolidated Rollup KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-[#E5E5DE] p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] text-[#787668] uppercase font-bold block">Consolidated Revenue</span>
          <span className="text-xl font-mono font-bold text-[#2D2D24] mt-0.5 block">
            ${(masterRollup.totalRevenue / 1000000).toFixed(2)}M
          </span>
          <span className="text-[10px] text-[#2E6930] font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            Across {masterRollup.activeSubAccountsCount} Plants
          </span>
        </div>

        <div className="bg-white border border-[#E5E5DE] p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] text-[#787668] uppercase font-bold block">Active Work Orders</span>
          <span className="text-xl font-mono font-bold text-[#5A5A40] mt-0.5 block">
            {masterRollup.totalWorkOrders} Active WOs
          </span>
          <span className="text-[10px] text-[#8B7E66] block mt-1">Real-time floor feed</span>
        </div>

        <div className="bg-white border border-[#E5E5DE] p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] text-[#787668] uppercase font-bold block">Weighted Group OEE</span>
          <span className="text-xl font-mono font-bold text-[#2D2D24] mt-0.5 block">
            {masterRollup.weightedOee}%
          </span>
          <span className="text-[10px] text-[#2E6930] block mt-1">Target: &gt;85.0%</span>
        </div>

        <div className="bg-white border border-[#E5E5DE] p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] text-[#787668] uppercase font-bold block">Global Inventory Value</span>
          <span className="text-xl font-mono font-bold text-[#2D2D24] mt-0.5 block">
            ${(masterRollup.totalInventoryValue / 1000000).toFixed(2)}M
          </span>
          <span className="text-[10px] text-[#8B7E66] block mt-1">Raw, WIP &amp; Finished</span>
        </div>

        <div className="bg-white border border-[#E5E5DE] p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] text-[#787668] uppercase font-bold block">Group CRM Pipeline</span>
          <span className="text-xl font-mono font-bold text-[#5A5A40] mt-0.5 block">
            ${(masterRollup.totalPipelineValue / 1000000).toFixed(2)}M
          </span>
          <span className="text-[10px] text-[#8B7E66] block mt-1">Rolled up from subs</span>
        </div>

        <div className="bg-white border border-[#E5E5DE] p-4 rounded-2xl shadow-xs">
          <span className="text-[10px] text-[#787668] uppercase font-bold block">Group Workforce</span>
          <span className="text-xl font-mono font-bold text-[#2D2D24] mt-0.5 block">
            {masterRollup.totalEmployees} Staff
          </span>
          <span className="text-[10px] text-[#2E6930] block mt-1">
            {masterRollup.avgFulfillmentRate}% On-Time
          </span>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#E5E5DE] p-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2.5 bg-[#F5F5F0] border border-[#E5E5DE] px-3.5 py-2 rounded-2xl text-xs text-[#2D2D24] flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8B7E66]" />
          <input
            type="text"
            placeholder="Search sub-accounts by code, facility name, location or manager..."
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

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8B7E66] font-medium">Status:</span>
          <div className="flex bg-[#F5F5F0] p-1 rounded-2xl border border-[#E5E5DE] text-xs">
            {(['all', 'active', 'suspended'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-xl font-medium transition-colors cursor-pointer capitalize ${
                  statusFilter === st ? 'bg-white text-[#5A5A40] shadow-xs' : 'text-[#787668] hover:text-[#2D2D24]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-Accounts Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredSubs.map((sub) => {
          const isSelected = selectedSubAccount?.id === sub.id;
          const isViewingAs = activeViewingSubAccountId === sub.id;

          return (
            <div
              key={sub.id}
              className={`bg-white border ${
                isViewingAs
                  ? 'border-[#5A5A40] ring-2 ring-[#5A5A40]/30 shadow-md'
                  : isSelected
                  ? 'border-[#8B7E66] shadow-sm'
                  : 'border-[#E5E5DE]'
              } rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:border-[#8B7E66] transition-all`}
            >
              <div>
                {/* Top Row: Code, Name, Entity Type & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/20">
                        {sub.code}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#8B7E66]">
                        {sub.entityType}
                      </span>
                    </div>
                    <h3 className="text-lg font-serif italic font-semibold text-[#2D2D24] mt-1.5 leading-snug">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-[#787668] mt-0.5">
                      {sub.location} • Manager: <span className="font-medium text-[#2D2D24]">{sub.managerName}</span> ({sub.managerEmail})
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggleStatus(sub)}
                      disabled={!canManage}
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase cursor-pointer transition-colors ${
                        sub.status === 'active'
                          ? 'bg-[#2E6930]/15 text-[#2E6930] hover:bg-[#2E6930]/25'
                          : 'bg-[#B85D36]/15 text-[#B85D36] hover:bg-[#B85D36]/25'
                      }`}
                    >
                      {sub.status.toUpperCase()}
                    </button>
                    <span className="text-[10px] text-[#8B7E66] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Feed: {sub.lastDataSync}
                    </span>
                  </div>
                </div>

                {/* Sub-Account Real-Time Metrics Feed */}
                <div className="mt-4 grid grid-cols-3 gap-2 bg-[#F9F9F7] p-3 rounded-2xl border border-[#E5E5DE] text-xs">
                  <div>
                    <span className="text-[10px] text-[#8B7E66] block">Monthly Rev</span>
                    <span className="font-mono font-bold text-[#2D2D24]">
                      ${(sub.metricsFeed.monthlyRevenue / 1000).toLocaleString()}k
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8B7E66] block">Active Work Orders</span>
                    <span className="font-mono font-bold text-[#5A5A40]">
                      {sub.metricsFeed.activeWorkOrders} WOs
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8B7E66] block">Plant OEE</span>
                    <span className="font-mono font-bold text-[#2E6930]">
                      {sub.metricsFeed.averageOee}%
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#E5E5DE]">
                    <span className="text-[10px] text-[#8B7E66] block">Inventory Value</span>
                    <span className="font-mono font-bold text-[#2D2D24]">
                      ${(sub.metricsFeed.inventoryValue / 1000).toLocaleString()}k
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#E5E5DE]">
                    <span className="text-[10px] text-[#8B7E66] block">CRM Pipeline</span>
                    <span className="font-mono font-bold text-[#5A5A40]">
                      ${(sub.metricsFeed.dealPipelineValue / 1000).toLocaleString()}k
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#E5E5DE]">
                    <span className="text-[10px] text-[#8B7E66] block">Workforce</span>
                    <span className="font-mono font-bold text-[#2D2D24]">
                      {sub.metricsFeed.employeeCount} Personnel
                    </span>
                  </div>
                </div>

                {/* Granular Feature Toggles */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#2D2D24] text-[11px] uppercase tracking-wide">
                      Selected Features Allocation:
                    </span>
                    <span className="text-[10px] text-[#8B7E66]">
                      Click pill to grant/revoke sub-tenant access
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        ['production', 'Production'],
                        ['crm_marketing', 'CRM & Marketing'],
                        ['inventory', 'Inventory'],
                        ['finance', 'Finance & GL'],
                        ['supply_chain', 'Supply Chain'],
                        ['maintenance', 'Maintenance'],
                        ['projects', 'Projects'],
                      ] as const
                    ).map(([featKey, featLabel]) => {
                      const isEnabled = sub.enabledFeatures[featKey];
                      return (
                        <button
                          key={featKey}
                          onClick={() => handleToggleFeature(sub, featKey)}
                          disabled={!canManage}
                          className={`text-xs px-3 py-1 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                            isEnabled
                              ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                              : 'bg-[#F5F5F0] text-[#787668] border-[#E5E5DE] hover:border-[#8B7E66]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isEnabled ? 'bg-white' : 'bg-[#8B7E66]'
                            }`}
                          />
                          <span>{featLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-3 border-t border-[#E5E5DE] flex items-center justify-between gap-3">
                <button
                  onClick={() =>
                    onSetActiveViewingSubAccountId(isViewingAs ? null : sub.id)
                  }
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isViewingAs
                      ? 'bg-[#5A5A40] text-white'
                      : 'bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isViewingAs ? 'Simulating Active' : 'Simulate View'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#8B7E66] font-mono">
                    {sub.activeUsersCount} Active Seats
                  </span>
                  <button
                    onClick={() => onNavigateTab('dashboard')}
                    className="text-xs text-[#5A5A40] hover:text-[#474732] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect Feed</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Provision New Sub-Account Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 animate-scale-in text-[#2D2D24] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E5DE] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif italic font-semibold">Provision New Sub-Account</h3>
                  <span className="text-[10px] text-[#8B7E66]">
                    Configure entity, manager, and feature allocation feeding Master Account
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#8B7E66] hover:text-[#2D2D24] p-1 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#2D2D24]">Facility / Plant Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Austin Advanced Robotics Hub"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-xs text-[#2D2D24] outline-none focus:border-[#5A5A40]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#2D2D24]">Facility Code (Prefix) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUB-ATX"
                    value={newAccount.code}
                    onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 font-mono text-xs text-[#2D2D24] outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#2D2D24]">Entity Classification</label>
                  <select
                    value={newAccount.entityType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewAccount({ ...newAccount, entityType: e.target.value as SubAccount['entityType'] })}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-xs text-[#2D2D24] outline-none focus:border-[#5A5A40]"
                  >
                    <option value="Subsidiary Plant">Subsidiary Plant</option>
                    <option value="Regional Division">Regional Division</option>
                    <option value="OEM Partner">OEM Partner</option>
                    <option value="Franchise Branch">Franchise Branch</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#2D2D24]">Geographic Region</label>
                  <input
                    type="text"
                    placeholder="e.g. North America (Texas)"
                    value={newAccount.region}
                    onChange={(e) => setNewAccount({ ...newAccount, region: e.target.value })}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-xs text-[#2D2D24] outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#2D2D24]">Plant Manager Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Elena Rostova"
                    value={newAccount.managerName}
                    onChange={(e) => setNewAccount({ ...newAccount, managerName: e.target.value })}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-xs text-[#2D2D24] outline-none focus:border-[#5A5A40]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#2D2D24]">Manager Email</label>
                  <input
                    type="email"
                    placeholder="e.g. e.rostova@mfgcorp.com"
                    value={newAccount.managerEmail}
                    onChange={(e) => setNewAccount({ ...newAccount, managerEmail: e.target.value })}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-xs text-[#2D2D24] outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              {/* Initial Metrics Feed Estimates */}
              <div className="bg-[#F9F9F7] p-3 rounded-2xl border border-[#E5E5DE] space-y-2">
                <span className="font-semibold text-[11px] block">Initial Operational Baselines</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-[#8B7E66] block">Target Revenue ($)</label>
                    <input
                      type="number"
                      value={newAccount.monthlyRevenue}
                      onChange={(e) => setNewAccount({ ...newAccount, monthlyRevenue: Number(e.target.value) })}
                      className="w-full bg-white border border-[#E5E5DE] rounded-lg p-1.5 font-mono text-xs text-[#2D2D24]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8B7E66] block">Expected OEE (%)</label>
                    <input
                      type="number"
                      value={newAccount.averageOee}
                      onChange={(e) => setNewAccount({ ...newAccount, averageOee: Number(e.target.value) })}
                      className="w-full bg-white border border-[#E5E5DE] rounded-lg p-1.5 font-mono text-xs text-[#2D2D24]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8B7E66] block">Workforce Count</label>
                    <input
                      type="number"
                      value={newAccount.employeeCount}
                      onChange={(e) => setNewAccount({ ...newAccount, employeeCount: Number(e.target.value) })}
                      className="w-full bg-white border border-[#E5E5DE] rounded-lg p-1.5 font-mono text-xs text-[#2D2D24]"
                    />
                  </div>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-2">
                <label className="font-semibold text-[#2D2D24] block">
                  Select Features Available to this Sub-Account:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ['production', 'Production Execution & OEE'],
                      ['crm_marketing', 'CRM & OEM Deals'],
                      ['inventory', 'Inventory & Warehouse Bins'],
                      ['finance', 'General Ledger & Invoicing'],
                      ['supply_chain', 'Supply Chain & Freight'],
                      ['maintenance', 'CMMS Maintenance Dispatch'],
                      ['projects', 'Project Gantt Sprints'],
                    ] as const
                  ).map(([fKey, fDesc]) => {
                    const isChecked = newAccount.features[fKey];
                    return (
                      <label
                        key={fKey}
                        className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-[#5A5A40]/10 border-[#5A5A40]/30 text-[#2D2D24]'
                            : 'bg-[#F5F5F0] border-[#E5E5DE] text-[#787668]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            setNewAccount({
                              ...newAccount,
                              features: {
                                ...newAccount.features,
                                [fKey]: !isChecked,
                              },
                            })
                          }
                          className="rounded text-[#5A5A40] focus:ring-0"
                        />
                        <span className="text-xs font-medium">{fDesc}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E5DE]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] rounded-xl font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5A5A40] hover:bg-[#474732] text-white rounded-xl font-semibold cursor-pointer shadow-xs"
                >
                  Create &amp; Provision Sub-Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
