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
} from 'lucide-react';
import { ViewTab, RoleDefinition } from '../types';
import { VortixLogo } from './VortixLogo';

interface SidebarProps {
  currentTab?: ViewTab;
  activeView?: string;
  onSelectTab?: (tab: ViewTab) => void;
  onSelectView?: (view: string) => void;
  currentRole: RoleDefinition;
  openWorkOrdersCount?: number;
  lowStockItemsCount?: number;
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
  openWorkOrdersCount,
  lowStockItemsCount,
}) => {
  const currentActiveId = activeView || currentTab || 'dashboard';

  const handleSelect = (id: ViewTab) => {
    if (onSelectView) {
      onSelectView(id);
    } else if (onSelectTab) {
      onSelectTab(id);
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
    { id: 'bom_mrp', label: 'Multi-Level BOM & MRP', icon: Layers, badge: 'Tree', category: 'Operations' },
    { id: 'production', label: 'Production & Line ERP', icon: Factory, permissionKey: 'production', badge: openWorkOrdersCount ? `${openWorkOrdersCount} Active` : undefined, category: 'Operations' },
    { id: 'maintenance', label: 'Maintenance (CMMS)', icon: Wrench, category: 'Operations' },
    { id: 'supply_chain', label: 'Supply Chain Tracking', icon: Truck, permissionKey: 'supply_chain', badge: 'Live GPS', category: 'Operations' },
    { id: 'inventory', label: 'Inventory & Lot Control', icon: Boxes, permissionKey: 'inventory', badge: lowStockItemsCount ? `${lowStockItemsCount} Low` : undefined, category: 'Operations' },

    // Commercial & Planning
    { id: 'sub_accounts', label: 'Sub-Accounts & Master', icon: Building2, badge: 'Multi-Tenant', category: 'Commercial & Planning' },
    { id: 'projects', label: 'Project & Task Board', icon: KanbanSquare, permissionKey: 'projects', category: 'Commercial & Planning' },
    { id: 'crm_marketing', label: 'CRM & B2B Marketing', icon: Users, permissionKey: 'crm_marketing', category: 'Commercial & Planning' },
    { id: 'finance', label: 'Finance & Accounting', icon: DollarSign, permissionKey: 'finance', category: 'Commercial & Planning' },

    // Automation & System
    { id: 'database_hub', label: 'Client Database Hub', icon: Database, badge: 'Cloud DB', category: 'Automation & System' },
    { id: 'integrations', label: 'Apps & Systems (HubSpot/SF)', icon: Link2, permissionKey: 'integrations', badge: '10 Apps', category: 'Automation & System' },
    { id: 'workflows', label: 'Low-Code Workflows', icon: Workflow, permissionKey: 'workflows', badge: 'Builder', category: 'Automation & System' },
    { id: 'rbac', label: 'RBAC Security Matrix', icon: ShieldAlert, category: 'Automation & System' },
  ];

  const categories: Array<'Operations' | 'Commercial & Planning' | 'Automation & System'> = [
    'Operations',
    'Commercial & Planning',
    'Automation & System',
  ];

  return (
    <aside className="w-64 bg-[#2D2D24] text-[#E9E9E0] flex flex-col justify-between shrink-0 select-none border-r border-[#3D3D32] h-full overflow-hidden">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#3D3D32]">
        <VortixLogo size="md" theme="dark" showTagline={true} />
      </div>

      {/* Navigation Links */}
      <div className="flex-1 p-3 space-y-5 overflow-y-auto">
        {categories.map((cat) => {
          const items = navItems.filter((i) => i.category === cat);
          return (
            <div key={cat} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8B7E66]">
                {cat}
              </div>
              {items.map((item) => {
                const Icon = item.icon;
                const permission = item.permissionKey ? currentRole.permissions[item.permissionKey] : 'admin';
                const isRestricted = permission === 'none';
                const isActive = currentActiveId === item.id;

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
                      {!isRestricted && permission === 'read' && (
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
    </aside>
  );
};
