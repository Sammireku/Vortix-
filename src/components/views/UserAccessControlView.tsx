import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  UserPlus,
  Lock,
  Unlock,
  Key,
  Eye,
  Edit3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  ArrowRightLeft,
  Clock,
  Building2,
  FileText,
  DollarSign,
  Download,
  Check,
  X,
  Sparkles,
  Sliders,
  RefreshCw,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  AppUser,
  SecurityAuditEntry,
  AccessLevel,
  ModulePermissionMap,
  DataAccessRules,
  ViewTab,
} from '../../types';

interface UserAccessControlViewProps {
  currentUser: AppUser;
  allUsers: AppUser[];
  onUpdateUser: (updated: AppUser) => void;
  onCreateSubUser?: (newUser: AppUser) => void;
  onAddUser?: (newUser: AppUser) => void;
  onDeleteUser?: (userId: string) => void;
  onSwitchUser?: (user: AppUser) => void;
  auditLogs: SecurityAuditEntry[];
  onShowNotification?: (title: string, message: string, type?: 'success' | 'warning' | 'info') => void;
}

export const UserAccessControlView: React.FC<UserAccessControlViewProps> = ({
  currentUser,
  allUsers,
  onUpdateUser,
  onCreateSubUser,
  onAddUser,
  onDeleteUser,
  onSwitchUser,
  auditLogs,
  onShowNotification,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'matrix' | 'data_access' | 'audit_log'>('matrix');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  // New sub-user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<AppUser['role']>('operator');
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newDepartment, setNewDepartment] = useState('Manufacturing & Operations');
  const [newFacility, setNewFacility] = useState('Midwest Precision Machining Hub');
  const [newPinCode, setNewPinCode] = useState('1234');
  const [presetTemplate, setPresetTemplate] = useState<'admin' | 'manager' | 'cashier' | 'host' | 'operator'>('operator');

  const modulesList: Array<{ id: keyof ModulePermissionMap; label: string; category: string }> = [
    { id: 'dashboard', label: 'Plant Command Center', category: 'Operations' },
    { id: 'custom_dashboards', label: 'Custom Team Dashboards', category: 'Operations' },
    { id: 'production', label: 'Production & Line ERP', category: 'Operations' },
    { id: 'digital_traveler', label: 'Digital Traveler & SOPs', category: 'Operations' },
    { id: 'digital_twin', label: '2D Plant Digital Twin', category: 'Operations' },
    { id: 'fleet_management', label: 'Fleet & AGV Robotics', category: 'Operations' },
    { id: 'supply_chain', label: 'Supply Chain Tracking', category: 'Operations' },
    { id: 'inventory', label: 'Inventory & Lot Control', category: 'Operations' },
    { id: 'pos_terminal', label: 'Point of Sale (POS)', category: 'Commercial' },
    { id: 'property_management', label: 'Property Management (PMS)', category: 'Commercial' },
    { id: 'channel_management', label: 'Channel Manager (OTA)', category: 'Commercial' },
    { id: 'sub_accounts', label: 'Sub-Accounts & Master', category: 'Commercial' },
    { id: 'projects', label: 'Project & Task Board', category: 'Commercial' },
    { id: 'crm_marketing', label: 'CRM & B2B Marketing', category: 'Commercial' },
    { id: 'finance', label: 'Finance & Accounting', category: 'Commercial' },
    { id: 'bom_mrp', label: 'Multi-Level BOM & MRP', category: 'Operations' },
    { id: 'maintenance', label: 'Maintenance (CMMS)', category: 'Operations' },
    { id: 'human_resources', label: 'Workforce & HR Safety', category: 'Operations' },
    { id: 'workflows', label: 'Low-Code Workflows', category: 'Automation' },
    { id: 'integrations', label: 'App Integrations', category: 'Automation' },
    { id: 'database_hub', label: 'Client Database Hub', category: 'Automation' },
    { id: 'user_access_control', label: 'Sub-Users & Access Control', category: 'Governance' },
  ];

  const filteredUsers = allUsers.filter((u) => {
    const matchesQuery =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.roleTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || u.department === selectedDepartment;
    return matchesQuery && matchesDept;
  });

  const departments = Array.from(new Set(allUsers.map((u) => u.department)));

  const cyclePermission = (current: AccessLevel): AccessLevel => {
    if (current === 'none') return 'read';
    if (current === 'read') return 'write';
    if (current === 'write') return 'admin';
    return 'none';
  };

  const handleToggleModulePermission = (user: AppUser, moduleKey: keyof ModulePermissionMap) => {
    if (user.role === 'super_admin' && currentUser.id !== user.id) {
      onShowNotification?.('Action Protected', 'Super Admin master permissions cannot be restricted.', 'warning');
      return;
    }

    const currentLevel = user.permissions[moduleKey] || 'none';
    const nextLevel = cyclePermission(currentLevel);

    const updatedUser: AppUser = {
      ...user,
      permissions: {
        ...user.permissions,
        [moduleKey]: nextLevel,
      },
    };

    onUpdateUser(updatedUser);
    onShowNotification?.(
      'Permission Updated',
      `Set ${user.fullName}'s access for "${moduleKey.replace('_', ' ')}" to [${nextLevel.toUpperCase()}].`
    );
  };

  const handleToggleDataAccess = (user: AppUser, ruleKey: keyof DataAccessRules) => {
    if (user.role === 'super_admin') {
      onShowNotification?.('Action Protected', 'Super Admin maintains unrestricted data clearance.', 'warning');
      return;
    }

    const currentVal = user.dataAccess[ruleKey];
    const updatedUser: AppUser = {
      ...user,
      dataAccess: {
        ...user.dataAccess,
        [ruleKey]: !currentVal,
      },
    };

    onUpdateUser(updatedUser);
    onShowNotification?.(
      'Information Governance Updated',
      `Toggled rule "${ruleKey}" to ${!currentVal ? 'ENABLED' : 'DISABLED'} for ${user.fullName}.`
    );
  };

  const handleCreateSubUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    let initialPerms: ModulePermissionMap = {
      dashboard: 'read',
      custom_dashboards: 'read',
      production: 'none',
      digital_traveler: 'none',
      digital_twin: 'none',
      fleet_management: 'none',
      supply_chain: 'none',
      inventory: 'read',
      pos_terminal: 'none',
      property_management: 'none',
      channel_management: 'none',
      bom_mrp: 'none',
      maintenance: 'none',
      human_resources: 'none',
      projects: 'read',
      crm_marketing: 'none',
      finance: 'none',
      workflows: 'none',
      integrations: 'none',
      sub_accounts: 'none',
      database_hub: 'none',
      user_access_control: 'none',
    };

    let initialData: DataAccessRules = {
      canViewFinancialMetrics: false,
      canViewCustomerPii: false,
      canExportReports: false,
      canOverrideDiscounts: false,
      canManageSubUsers: false,
      canExecuteRefunds: false,
      canModifyChannelRates: false,
      canSignOffTravelers: false,
      canApprovePurchaseOrders: false,
    };

    if (presetTemplate === 'admin') {
      initialPerms = {
        ...initialPerms,
        dashboard: 'admin',
        custom_dashboards: 'admin',
        production: 'admin',
        digital_traveler: 'admin',
        digital_twin: 'admin',
        fleet_management: 'admin',
        supply_chain: 'admin',
        inventory: 'admin',
        pos_terminal: 'admin',
        property_management: 'admin',
        channel_management: 'admin',
        bom_mrp: 'admin',
        maintenance: 'admin',
        human_resources: 'admin',
        projects: 'admin',
        crm_marketing: 'admin',
        finance: 'admin',
        workflows: 'admin',
        integrations: 'admin',
        sub_accounts: 'admin',
        database_hub: 'admin',
        user_access_control: 'write',
      };
      initialData = {
        canViewFinancialMetrics: true,
        canViewCustomerPii: true,
        canExportReports: true,
        canOverrideDiscounts: true,
        canManageSubUsers: true,
        canExecuteRefunds: true,
        canModifyChannelRates: true,
        canSignOffTravelers: true,
        canApprovePurchaseOrders: true,
      };
    } else if (presetTemplate === 'cashier') {
      initialPerms.pos_terminal = 'admin';
      initialPerms.inventory = 'read';
      initialPerms.crm_marketing = 'write';
      initialData.canOverrideDiscounts = true;
      initialData.canExecuteRefunds = true;
    } else if (presetTemplate === 'host') {
      initialPerms.property_management = 'admin';
      initialPerms.channel_management = 'admin';
      initialPerms.pos_terminal = 'write';
      initialPerms.maintenance = 'write';
      initialData.canViewCustomerPii = true;
      initialData.canModifyChannelRates = true;
      initialData.canExecuteRefunds = true;
    }

    const newUser: AppUser = {
      id: `usr-sub-${Date.now().toString().slice(-4)}`,
      email: newEmail.trim().toLowerCase(),
      fullName: newName.trim(),
      role: newRole,
      roleTitle: newRoleTitle.trim() || `${newRole.replace('_', ' ').toUpperCase()} Specialist`,
      department: newDepartment,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newName)}`,
      status: 'active',
      facilityId: 'plant-1',
      facilityName: newFacility,
      isSubUser: true,
      parentUserId: currentUser.id,
      pinCode: newPinCode || '1234',
      lastLoginAt: 'Never (Invited)',
      createdAt: new Date().toISOString(),
      permissions: initialPerms,
      dataAccess: initialData,
    };

    if (onCreateSubUser) {
      onCreateSubUser(newUser);
    } else if (onAddUser) {
      onAddUser(newUser);
    }
    setIsCreateModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewRoleTitle('');
    onShowNotification?.(
      'Sub-User Created',
      `Provisioned sub-user "${newUser.fullName}" with assigned ${presetTemplate.toUpperCase()} access matrix.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-serif text-[#2D2D24]">
                Sub-User Provisioning & Granular Access Control
              </h1>
              <p className="text-xs text-[#8B7E66]">
                Manage team identities, configure module permissions (Admin, Write, Read, None), and govern who has access to confidential information.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#F5F5F0] border border-[#E5E5DE] rounded-2xl px-3.5 py-2 text-xs flex items-center gap-2">
            <span className="text-[#8B7E66]">Active Persona:</span>
            <span className="font-semibold text-[#2D2D24]">{currentUser.fullName}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5A5A40] text-white font-mono uppercase">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-semibold px-4 py-2.5 rounded-2xl transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Sub-User</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E5DE] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#8B7E66] text-xs">
            <span>Total Managed Users</span>
            <Users className="w-4 h-4 text-[#5A5A40]" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#2D2D24] mt-2">{allUsers.length}</div>
          <div className="text-[11px] text-[#5A5A40] font-medium mt-1">
            {allUsers.filter((u) => u.isSubUser).length} Sub-Users | 1 Root Tenant
          </div>
        </div>

        <div className="bg-white border border-[#E5E5DE] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#8B7E66] text-xs">
            <span>Protected Modules</span>
            <Layers className="w-4 h-4 text-[#5A5A40]" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#2D2D24] mt-2">{modulesList.length}</div>
          <div className="text-[11px] text-[#8B7E66] mt-1">Operations, POS, PMS, ERP, Finance</div>
        </div>

        <div className="bg-white border border-[#E5E5DE] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#8B7E66] text-xs">
            <span>Security Policy</span>
            <Shield className="w-4 h-4 text-[#5A5A40]" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#2D2D24] mt-2">Zero-Trust</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Active RBAC & Audit Trail</div>
        </div>

        <div className="bg-white border border-[#E5E5DE] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#8B7E66] text-xs">
            <span>Recent Access Events</span>
            <Clock className="w-4 h-4 text-[#5A5A40]" />
          </div>
          <div className="text-2xl font-bold font-serif text-[#2D2D24] mt-2">{auditLogs.length}</div>
          <div className="text-[11px] text-[#8B7E66] mt-1">100% telemetry verified</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5E5DE] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'matrix'
              ? 'bg-[#5A5A40] text-white'
              : 'bg-white text-[#5A5A40] hover:bg-[#F5F5F0] border border-[#E5E5DE]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Granular Module Permissions Matrix</span>
        </button>

        <button
          onClick={() => setActiveSubTab('data_access')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'data_access'
              ? 'bg-[#5A5A40] text-white'
              : 'bg-white text-[#5A5A40] hover:bg-[#F5F5F0] border border-[#E5E5DE]'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Information & Data Access Governance</span>
        </button>

        <button
          onClick={() => setActiveSubTab('directory')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'directory'
              ? 'bg-[#5A5A40] text-white'
              : 'bg-white text-[#5A5A40] hover:bg-[#F5F5F0] border border-[#E5E5DE]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Sub-Users Directory ({allUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit_log')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'audit_log'
              ? 'bg-[#5A5A40] text-white'
              : 'bg-white text-[#5A5A40] hover:bg-[#F5F5F0] border border-[#E5E5DE]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Security Audit Trail</span>
        </button>
      </div>

      {/* FILTER BAR FOR USERS */}
      {(activeSubTab === 'matrix' || activeSubTab === 'data_access' || activeSubTab === 'directory') && (
        <div className="bg-white border border-[#E5E5DE] rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#8B7E66] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user name, email, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl focus:outline-none focus:border-[#5A5A40]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-[#8B7E66]">Department:</span>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="text-xs bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#5A5A40]"
            >
              <option value="all">All Departments ({departments.length})</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* TAB 1: GRANULAR PERMISSIONS MATRIX */}
      {activeSubTab === 'matrix' && (
        <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-xs overflow-hidden">
          <div className="p-4 bg-[#FAF9F5] border-b border-[#E5E5DE] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#2D2D24] flex items-center gap-2">
                <span>Multi-User Access Matrix</span>
                <span className="text-[11px] font-normal text-[#8B7E66]">
                  (Click any badge to cycle: ADMIN &rarr; WRITE &rarr; READ &rarr; NONE)
                </span>
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> ADMIN (Full Control)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> WRITE (Editor)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> READ (Viewer)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> NONE (Blocked)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F5F5F0] sticky top-0 z-20 text-[#5A5A40] font-semibold border-b border-[#E5E5DE]">
                <tr>
                  <th className="p-3.5 min-w-[220px] bg-[#F5F5F0] sticky left-0 z-30 shadow-xs">
                    Dashboard Module
                  </th>
                  {filteredUsers.map((u) => (
                    <th key={u.id} className="p-3.5 min-w-[170px] text-center border-l border-[#E5E5DE]">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#2D2D24] truncate max-w-[130px]">{u.fullName}</span>
                          {currentUser.id === u.id && (
                            <span className="text-[9px] bg-[#5A5A40] text-white px-1.5 py-0.2 rounded font-mono">YOU</span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#8B7E66] truncate max-w-[140px]">{u.roleTitle}</span>
                        {currentUser.id !== u.id && onSwitchUser && (
                          <button
                            onClick={() => onSwitchUser(u)}
                            className="mt-1 text-[10px] text-[#5A5A40] hover:underline flex items-center gap-1 cursor-pointer"
                            title="Simulate dashboard from this user's view"
                          >
                            <ArrowRightLeft className="w-2.5 h-2.5" /> Test as this User
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DE]">
                {modulesList.map((m) => (
                  <tr key={m.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                    <td className="p-3.5 bg-white sticky left-0 z-10 border-r border-[#E5E5DE]">
                      <div className="font-semibold text-[#2D2D24]">{m.label}</div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F5F5F0] text-[#8B7E66] border border-[#E5E5DE]">
                        {m.category}
                      </span>
                    </td>

                    {filteredUsers.map((u) => {
                      const level = u.permissions[m.id] || 'none';
                      const isSuper = u.role === 'super_admin';

                      let badgeClass = 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
                      let label = 'NONE (Blocked)';

                      if (level === 'admin') {
                        badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100';
                        label = 'ADMIN';
                      } else if (level === 'write') {
                        badgeClass = 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100';
                        label = 'WRITE';
                      } else if (level === 'read') {
                        badgeClass = 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100';
                        label = 'READ ONLY';
                      }

                      return (
                        <td key={u.id} className="p-3 text-center border-l border-[#E5E5DE]">
                          <button
                            disabled={isSuper}
                            onClick={() => handleToggleModulePermission(u, m.id)}
                            className={`w-full max-w-[130px] mx-auto py-1 px-2.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer shadow-2xs ${badgeClass} ${
                              isSuper ? 'cursor-not-allowed opacity-90' : ''
                            }`}
                            title={isSuper ? 'Super Admin permissions locked' : 'Click to cycle permission level'}
                          >
                            {label}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DATA & INFORMATION GOVERNANCE ("Who has access to what information") */}
      {activeSubTab === 'data_access' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#FFFDF5] border border-[#EBE3C5] rounded-2xl flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-[#8C6B1C] shrink-0 mt-0.5" />
            <div className="text-xs text-[#5D4E26]">
              <div className="font-bold mb-0.5">Information & Confidentiality Governance</div>
              This matrix controls <strong>who has access to what specific data</strong>, regardless of general module navigation.
              Even if a user can open a module, disabling a sensitive data clearance will mask financial totals, redact customer contact info, or restrict authorization actions like discounts and traveler sign-offs.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-white border border-[#E5E5DE] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E5E5DE] pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-xl bg-[#F5F5F0] object-cover border border-[#E5E5DE]"
                    />
                    <div>
                      <div className="font-bold text-[#2D2D24] text-sm flex items-center gap-2">
                        <span>{user.fullName}</span>
                        {user.isSubUser && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE]">
                            Sub-User
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#8B7E66]">{user.email} &bull; {user.roleTitle}</div>
                    </div>
                  </div>

                  {currentUser.id !== user.id && (
                    <button
                      onClick={() => onSwitchUser(user)}
                      className="text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#5A5A40] px-3 py-1.5 rounded-xl border border-[#E5E5DE] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" /> Test User View
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF9F5] border border-[#E5E5DE]">
                    <div>
                      <div className="font-semibold text-[#2D2D24]">Financial Figures & Unit Margins</div>
                      <div className="text-[11px] text-[#8B7E66]">Can view profit margins, revenue reports, and ledger entries</div>
                    </div>
                    <button
                      disabled={user.role === 'super_admin'}
                      onClick={() => handleToggleDataAccess(user, 'canViewFinancialMetrics')}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] border cursor-pointer transition-colors ${
                        user.dataAccess.canViewFinancialMetrics
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {user.dataAccess.canViewFinancialMetrics ? 'AUTHORIZED' : 'RESTRICTED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF9F5] border border-[#E5E5DE]">
                    <div>
                      <div className="font-semibold text-[#2D2D24]">Customer PII & Guest Phone/Email</div>
                      <div className="text-[11px] text-[#8B7E66]">Can view full phone numbers, email addresses, and guest billing info</div>
                    </div>
                    <button
                      disabled={user.role === 'super_admin'}
                      onClick={() => handleToggleDataAccess(user, 'canViewCustomerPii')}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] border cursor-pointer transition-colors ${
                        user.dataAccess.canViewCustomerPii
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {user.dataAccess.canViewCustomerPii ? 'AUTHORIZED' : 'RESTRICTED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF9F5] border border-[#E5E5DE]">
                    <div>
                      <div className="font-semibold text-[#2D2D24]">POS Discounts & Price Overrides</div>
                      <div className="text-[11px] text-[#8B7E66]">Can apply manual % or dollar discounts at the POS register</div>
                    </div>
                    <button
                      disabled={user.role === 'super_admin'}
                      onClick={() => handleToggleDataAccess(user, 'canOverrideDiscounts')}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] border cursor-pointer transition-colors ${
                        user.dataAccess.canOverrideDiscounts
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {user.dataAccess.canOverrideDiscounts ? 'AUTHORIZED' : 'RESTRICTED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF9F5] border border-[#E5E5DE]">
                    <div>
                      <div className="font-semibold text-[#2D2D24]">Execute Refunds & Room Charges</div>
                      <div className="text-[11px] text-[#8B7E66]">Can reverse completed transactions and charge property folios</div>
                    </div>
                    <button
                      disabled={user.role === 'super_admin'}
                      onClick={() => handleToggleDataAccess(user, 'canExecuteRefunds')}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] border cursor-pointer transition-colors ${
                        user.dataAccess.canExecuteRefunds
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {user.dataAccess.canExecuteRefunds ? 'AUTHORIZED' : 'RESTRICTED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF9F5] border border-[#E5E5DE]">
                    <div>
                      <div className="font-semibold text-[#2D2D24]">OTA Channel Rates & Multipliers</div>
                      <div className="text-[11px] text-[#8B7E66]">Can change rates pushed to Airbnb, Booking.com, and VRBO</div>
                    </div>
                    <button
                      disabled={user.role === 'super_admin'}
                      onClick={() => handleToggleDataAccess(user, 'canModifyChannelRates')}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] border cursor-pointer transition-colors ${
                        user.dataAccess.canModifyChannelRates
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {user.dataAccess.canModifyChannelRates ? 'AUTHORIZED' : 'RESTRICTED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF9F5] border border-[#E5E5DE]">
                    <div>
                      <div className="font-semibold text-[#2D2D24]">Digital Traveler QA Sign-Off</div>
                      <div className="text-[11px] text-[#8B7E66]">Authorized to stamp and sign off shop floor quality inspections</div>
                    </div>
                    <button
                      disabled={user.role === 'super_admin'}
                      onClick={() => handleToggleDataAccess(user, 'canSignOffTravelers')}
                      className={`px-3 py-1 rounded-lg font-bold text-[11px] border cursor-pointer transition-colors ${
                        user.dataAccess.canSignOffTravelers
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {user.dataAccess.canSignOffTravelers ? 'AUTHORIZED' : 'RESTRICTED'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SUB-USERS DIRECTORY */}
      {activeSubTab === 'directory' && (
        <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E5E5DE] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#2D2D24]">Active Operators & Sub-Users Directory</h2>
            <span className="text-xs text-[#8B7E66]">Showing {filteredUsers.length} of {allUsers.length} team members</span>
          </div>

          <div className="divide-y divide-[#E5E5DE]">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF9F5] transition-colors">
                <div className="flex items-center gap-3.5">
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
                    alt={user.fullName}
                    className="w-11 h-11 rounded-2xl object-cover border border-[#E5E5DE] bg-white"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#2D2D24] text-sm">{user.fullName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E9E9E0] text-[#5A5A40] font-mono">
                        PIN: {user.pinCode || '****'}
                      </span>
                      {user.isSubUser ? (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          Sub-User
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Tenant Admin
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#8B7E66] mt-0.5">
                      {user.email} &bull; <span className="font-medium text-[#5A5A40]">{user.roleTitle}</span> ({user.department})
                    </div>
                    <div className="text-[11px] text-[#A09E8E] mt-0.5 flex items-center gap-2">
                      <span>Facility: {user.facilityName}</span>
                      <span>&bull;</span>
                      <span>Last Active: {user.lastLoginAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {currentUser.id !== user.id && onSwitchUser && (
                    <button
                      onClick={() => onSwitchUser(user)}
                      className="px-3.5 py-1.5 bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Log In As This User</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveSubTab('matrix')}
                    className="px-3 py-1.5 bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] text-xs font-medium rounded-xl border border-[#E5E5DE] transition-colors cursor-pointer"
                  >
                    Edit Permissions
                  </button>
                  {user.isSubUser && currentUser.id !== user.id && onDeleteUser && (
                    <button
                      onClick={() => onDeleteUser(user.id)}
                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-xl border border-red-200 transition-colors cursor-pointer"
                      title="Revoke access"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY AUDIT LOG */}
      {activeSubTab === 'audit_log' && (
        <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E5E5DE] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#2D2D24]">Access Telemetry & Audit Trail</h2>
              <p className="text-[11px] text-[#8B7E66]">Real-time immutable log of user access checks, permission overrides, and actions.</p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-medium">
              Live Monitoring Active
            </span>
          </div>

          <div className="divide-y divide-[#E5E5DE]">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-start justify-between gap-3 text-xs hover:bg-[#FAF9F5]">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                      log.status === 'allowed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : log.status === 'restricted'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {log.status === 'allowed' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <ShieldAlert className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#2D2D24]">{log.userName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F5F5F0] text-[#8B7E66] font-mono">
                        {log.action}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E9E9E0] text-[#5A5A40]">
                        module: {log.module}
                      </span>
                    </div>
                    <div className="text-xs text-[#5A5A40] mt-1">{log.resourceDetails}</div>
                    <div className="text-[11px] text-[#A09E8E] mt-0.5">Terminal: {log.ipAddress}</div>
                  </div>
                </div>

                <span className="text-[11px] text-[#8B7E66] shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE SUB-USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold font-serif text-base text-[#2D2D24]">Provision New Sub-User</h3>
                  <p className="text-[11px] text-[#8B7E66]">Configure credentials and initial module access policy.</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-xl text-[#8B7E66] hover:text-[#2D2D24] hover:bg-[#E9E9E0] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubUserSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#2D2D24] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Hayes"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2D24] mb-1">Corporate Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jordan.hayes@vortix.io"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2D2D24] mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl focus:outline-none focus:border-[#5A5A40]"
                  >
                    <option value="Manufacturing & Operations">Manufacturing & Ops</option>
                    <option value="Commercial Sales & Retail Depot">Retail / POS Sales</option>
                    <option value="Campus Real Estate & Hospitality">Real Estate & Hospitality</option>
                    <option value="Quality & Governance">Quality & QA</option>
                    <option value="Executive Leadership">Executive Leadership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D2D24] mb-1">Station PIN (4 Digits)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={newPinCode}
                    onChange={(e) => setNewPinCode(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl font-mono text-center focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2D24] mb-1">Official Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Shift Lead / Inventory Clerk"
                  value={newRoleTitle}
                  onChange={(e) => setNewRoleTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2D24] mb-1.5">
                  Initial Permission Template
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPresetTemplate('operator')}
                    className={`p-2 rounded-xl text-left border cursor-pointer ${
                      presetTemplate === 'operator'
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                        : 'bg-[#F5F5F0] text-[#2D2D24] border-[#E5E5DE]'
                    }`}
                  >
                    <div className="font-bold text-[11px]">Shop Operator</div>
                    <div className="text-[10px] opacity-80">Production + SOPs</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPresetTemplate('cashier')}
                    className={`p-2 rounded-xl text-left border cursor-pointer ${
                      presetTemplate === 'cashier'
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                        : 'bg-[#F5F5F0] text-[#2D2D24] border-[#E5E5DE]'
                    }`}
                  >
                    <div className="font-bold text-[11px]">POS Cashier</div>
                    <div className="text-[10px] opacity-80">Register + Cart</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPresetTemplate('host')}
                    className={`p-2 rounded-xl text-left border cursor-pointer ${
                      presetTemplate === 'host'
                        ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                        : 'bg-[#F5F5F0] text-[#2D2D24] border-[#E5E5DE]'
                    }`}
                  >
                    <div className="font-bold text-[11px]">Property Host</div>
                    <div className="text-[10px] opacity-80">PMS + OTA Channels</div>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E5DE] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E5DE] text-[#2D2D24] hover:bg-[#F5F5F0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold cursor-pointer shadow-xs"
                >
                  Create & Issue Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
