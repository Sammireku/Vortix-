import React from 'react';
import {
  LayoutDashboard,
  Factory,
  Truck,
  Boxes,
  KanbanSquare,
  Users,
  DollarSign,
  Workflow,
  Cpu,
  FileText,
  ShieldAlert,
  Lock,
  ClipboardCheck,
  Layers,
  Activity,
  Wrench,
  Building2,
  Database,
  Link2,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  ShoppingCart,
  Bed,
  Globe,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { ViewTab, RoleDefinition, AppUser } from '../types';
import { VortixLogo } from './VortixLogo';

interface SidebarProps {
  currentTab?: ViewTab;
  activeView?: string;
  onSelectTab?: (tab: ViewTab) => void;
  onSelectView?: (view: string) => void;
  currentRole: RoleDefinition;
  currentUser?: AppUser;
  openWorkOrdersCount?: number;
  lowStockItemsCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItemConfig {
  id: ViewTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permissionKey?: keyof RoleDefinition['permissions'];
  badge?: string;
  category: 'Operations' | 'Commercial & Planning' | 'Automation & System';
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  activeView,
  onSelectTab,
  onSelectView,
  currentRole,
  currentUser,
  openWorkOrdersCount,
  lowStockItemsCount,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const currentActiveId = activeView || currentTab || 'dashboard';

  const handleSelect = (id: ViewTab) => {
    if (onSelectView) {
      onSelectView(id);
    } else if (onSelectTab) {
      onSelectTab(id);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navItems: NavItemConfig[] = [
    // Operations
    { id: 'custom_dashboards', label: 'Custom Team Dashboards', icon: LayoutDashboard, badge: 'Drag & Drop', category: 'Operations' },
    { id: 'dashboard', label: 'Plant Command Center', icon: Activity, category: 'Operations' },
    { id: 'fleet_management', label: 'Fleet & AGV Robotics', icon: Truck, badge: '2D Radar', category: 'Operations' },
    { id: 'human_resources', label: 'Workforce & HR Safety', icon: Users, badge: 'OSHA', category: 'Operations' },
    { id: 'digital_traveler', label: 'Digital Traveler & SOPs', icon: ClipboardCheck, badge: 'Shop Floor', category: 'Operations' },
    { id: 'digital_twin', label: '2D Plant Digital Twin', icon: Activity, badge: 'Live IoT', category: 'Operations' },
    { id: 'iot_edge_analytics', label: 'IoT Edge Analytics', icon: Radio, badge: 'Telemetry', category: 'Operations' },
    { id: 'bom_mrp', label: 'Multi-Level BOM & MRP', icon: Layers, badge: 'Tree', category: 'Operations' },
    { id: 'production', label: 'Production & Line ERP', icon: Factory, permissionKey: 'production', badge: openWorkOrdersCount ? `${openWorkOrdersCount} Active` : undefined, category: 'Operations' },
    { id: 'maintenance', label: 'Maintenance (CMMS)', icon: Wrench, category: 'Operations' },
    { id: 'supply_chain', label: 'Supply Chain Tracking', icon: Truck, permissionKey: 'supply_chain', badge: 'Live GPS', category: 'Operations' },
    { id: 'inventory', label: 'Inventory & Lot Control', icon: Boxes, permissionKey: 'inventory', badge: lowStockItemsCount ? `${lowStockItemsCount} Low` : undefined, category: 'Operations' },

    // Commercial & Planning
    { id: 'pos_terminal', label: 'Point of Sale (POS)', icon: ShoppingCart, badge: 'Live Cart', category: 'Commercial & Planning' },
    { id: 'property_management', label: 'Property & Campus (PMS)', icon: Bed, badge: 'Rooms & Folio', category: 'Commercial & Planning' },
    { id: 'channel_management', label: 'Channel Manager (OTA)', icon: Globe, badge: 'Airbnb/VRBO', category: 'Commercial & Planning' },
    { id: 'sub_accounts', label: 'Sub-Accounts & Master', icon: Building2, badge: 'Multi-Tenant', category: 'Commercial & Planning' },
    { id: 'projects', label: 'Project & Task Board', icon: KanbanSquare, permissionKey: 'projects', category: 'Commercial & Planning' },
    { id: 'crm_marketing', label: 'CRM & B2B Marketing', icon: Users, permissionKey: 'crm_marketing', category: 'Commercial & Planning' },
    { id: 'finance', label: 'Finance & Accounting', icon: DollarSign, permissionKey: 'finance', category: 'Commercial & Planning' },

    // Automation & System
    { id: 'user_access_control', label: 'Sub-Users & Access Matrix', icon: ShieldCheck, badge: 'RBAC', category: 'Automation & System' },
    { id: 'database_hub', label: 'Client Database Hub', icon: Database, badge: 'Cloud DB', category: 'Automation & System' },
    { id: 'integrations', label: 'Apps & Systems (HubSpot/SF)', icon: Link2, permissionKey: 'integrations', badge: '10 Apps', category: 'Automation & System' },
    { id: 'workflows', label: 'Low-Code Workflows', icon: Workflow, permissionKey: 'workflows', badge: 'Builder', category: 'Automation & System' },
    { id: 'rbac', label: 'Legacy RBAC Overview', icon: ShieldAlert, category: 'Automation & System' },
  ];

  const categories: Array<'Operations' | 'Commercial & Planning' | 'Automation & System'> = [
    'Operations',
    'Commercial & Planning',
    'Automation & System',
  ];

  return (
    <aside
      className={`bg-[#2D2D24] text-[#E9E9E0] flex flex-col justify-between shrink-0 select-none border-r border-[#3D3D32] h-full overflow-hidden transition-all duration-300 ease-in-out ${
        /* Mobile vs Desktop Positioning */
        isMobileOpen
          ? 'fixed inset-y-0 left-0 z-50 w-72 shadow-2xl translate-x-0'
          : 'fixed inset-y-0 left-0 z-50 w-72 -translate-x-full md:translate-x-0 md:relative'
      } ${
        /* Desktop collapsed width */
        isCollapsed ? 'md:w-[72px]' : 'md:w-64'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`border-b border-[#3D3D32] flex items-center transition-all ${
          isCollapsed
            ? 'p-3 flex-col gap-2 justify-center'
            : 'p-4 justify-between'
        }`}
      >
        {isCollapsed ? (
          <>
            <div title="Vortix Orchestration">
              <VortixLogo size="sm" variant="badge" theme="dark" />
            </div>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                title="Expand Navigation (Ctrl+B)"
                className="hidden md:flex p-1.5 rounded-xl hover:bg-[#3D3D32] text-[#8B7E66] hover:text-white transition-colors cursor-pointer"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <>
            <div className="flex-1 min-w-0 pr-2">
              <VortixLogo size="md" theme="dark" showTagline={true} />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {/* Desktop Collapse Toggle */}
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  title="Collapse Navigation (Ctrl+B)"
                  className="hidden md:flex p-1.5 rounded-xl hover:bg-[#3D3D32] text-[#8B7E66] hover:text-white transition-colors cursor-pointer"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              )}
              {/* Mobile Close Button */}
              {onCloseMobile && (
                <button
                  onClick={onCloseMobile}
                  title="Close Navigation Drawer"
                  className="md:hidden p-1.5 rounded-xl hover:bg-[#3D3D32] text-[#8B7E66] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 p-2 sm:p-3 space-y-4 overflow-y-auto overflow-x-hidden">
        {categories.map((cat, catIdx) => {
          const items = navItems.filter((i) => i.category === cat);
          return (
            <div key={cat} className="space-y-1">
              {/* Category Header */}
              {isCollapsed ? (
                catIdx > 0 && <div className="w-6 h-px bg-[#3D3D32] my-2.5 mx-auto" />
              ) : (
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8B7E66]">
                  {cat}
                </div>
              )}

              {/* Items in Category */}
              {items.map((item) => {
                const Icon = item.icon;
                const rolePermission = item.permissionKey ? currentRole.permissions[item.permissionKey] : 'admin';
                const userModulePerm = currentUser?.permissions?.[item.id as keyof typeof currentUser.permissions];
                const isRestricted = userModulePerm === 'none' || rolePermission === 'none';
                const isReadOnly = userModulePerm === 'read' || rolePermission === 'read';
                const isActive = currentActiveId === item.id;

                if (isCollapsed) {
                  return (
                    <div key={item.id} className="relative group flex justify-center my-0.5">
                      <button
                        onClick={() => handleSelect(item.id)}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                          isActive
                            ? 'bg-[#5A5A40] text-white shadow-sm'
                            : isRestricted
                            ? 'text-[#A09E8E]/50 hover:bg-[#3D3D32]/40'
                            : 'text-[#E9E9E0]/85 hover:bg-[#3D3D32] hover:text-white'
                        }`}
                        aria-label={item.label}
                      >
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive
                              ? 'text-white'
                              : isRestricted
                              ? 'text-[#4D4D40]'
                              : 'text-[#8B7E66] group-hover:text-[#E9E9E0]'
                          }`}
                        />

                        {/* Status notification dot if item has badge */}
                        {item.badge && !isRestricted && (
                          <span className="w-2 h-2 rounded-full bg-[#8B7E66] absolute top-2 right-2 ring-2 ring-[#2D2D24]" />
                        )}

                        {/* Lock dot if restricted */}
                        {isRestricted && (
                          <span className="w-2 h-2 rounded-full bg-[#5A5A40] absolute top-2 right-2" />
                        )}
                      </button>

                      {/* Tooltip on Hover */}
                      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1C1C16] text-[#E9E9E0] text-xs font-medium rounded-xl shadow-2xl border border-[#3D3D32] pointer-events-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.badge && !isRestricted && (
                          <span className="text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#3D3D32] text-[#8B7E66] border border-[#4D4D40]">
                            {item.badge}
                          </span>
                        )}
                        {isRestricted && (
                          <span className="text-[10px] text-[#A09E8E] flex items-center gap-1 font-mono">
                            <Lock className="w-2.5 h-2.5" /> Restricted
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-[#5A5A40] text-white shadow-sm'
                        : isRestricted
                        ? 'text-[#A09E8E]/60 hover:bg-[#3D3D32]/40'
                        : 'text-[#E9E9E0]/85 hover:bg-[#3D3D32] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-white'
                            : isRestricted
                            ? 'text-[#3D3D32]'
                            : 'text-[#8B7E66] group-hover:text-[#E9E9E0]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && !isRestricted && (
                        <span
                          className={`text-[9px] uppercase font-semibold px-2 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-black/20 text-[#E9E9E0]'
                              : 'bg-[#3D3D32] text-[#8B7E66] border border-[#3D3D32]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isRestricted && (
                        <span
                          className="flex items-center gap-0.5 text-[10px] text-[#A09E8E]"
                          title="Restricted by RBAC Policy"
                        >
                          <Lock className="w-3 h-3 text-[#8B7E66]" />
                        </span>
                      )}
                      {!isRestricted && isReadOnly && (
                        <span className="text-[9px] text-[#A09E8E] border border-[#3D3D32] px-1 rounded">
                          Read
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer Info Box: Active Node */}
      {isCollapsed ? (
        <div className="p-3 bg-[#25251E] border-t border-[#3D3D32] flex justify-center relative group">
          <div className="w-9 h-9 rounded-xl bg-[#3D3D32] border border-[#4D4D40] flex items-center justify-center text-xs font-bold text-[#E9E9E0] shadow-xs cursor-default">
            P1
          </div>
          <div className="absolute left-full ml-3 bottom-3 px-3 py-1.5 bg-[#1C1C16] text-[#E9E9E0] text-xs font-medium rounded-xl shadow-2xl border border-[#3D3D32] pointer-events-none whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
            <div className="font-semibold text-white">Plant 1 &bull; {currentRole.title}</div>
            <div className="text-[10px] text-[#A09E8E]">Workflow Engine Active</div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-[#25251E] border-t border-[#3D3D32]">
          <div className="text-[10px] uppercase tracking-widest text-[#8B7E66] mb-1 font-bold">
            Active Node
          </div>
          <div className="text-xs font-semibold text-[#E9E9E0] truncate">
            Plant 1 &bull; {currentRole.name}
          </div>
          <div className="text-[10px] text-[#A09E8E] mt-0.5">
            Low-Code Workflow Engine Active
          </div>
        </div>
      )}
    </aside>
  );
};

