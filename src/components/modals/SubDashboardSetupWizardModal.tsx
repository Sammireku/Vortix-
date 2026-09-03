import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Users,
  LayoutDashboard,
  Shield,
  Layers,
  Sparkles,
  Factory,
  Wrench,
  Truck,
  Check,
  Building2,
  Lock,
} from 'lucide-react';
import { CustomDashboard, DashboardWidget } from '../../types';

interface SubDashboardSetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newDashboard: CustomDashboard) => void;
}

const TEMPLATE_ARCHETYPES = [
  {
    id: 'floor_operator',
    title: 'Shop-Floor Machine Operator Cockpit',
    department: 'Production & Assembly',
    icon: Factory,
    description: 'Focused on digital traveler SOPs, live line status, part counts, and barcode scanning.',
    recommendedWidgets: ['active_traveler', 'line_oee_tracker', 'kpi_metric_tile', 'quick_action_bar'],
  },
  {
    id: 'maintenance_fleet',
    title: 'Maintenance Tech & Fleet Dispatch',
    department: 'Maintenance & Logistics',
    icon: Wrench,
    description: 'Designed for AGV robotics monitoring, CMMS work orders, and asset health telemetry.',
    recommendedWidgets: ['digital_twin_map', 'chart_gauge_capacity', 'interactive_data_pivot_table', 'kpi_comparison_card'],
  },
  {
    id: 'hr_safety',
    title: 'Workforce HR & Safety Lead',
    department: 'Human Resources',
    icon: Users,
    description: 'Tracks shift attendance, operator skill certifications, and OSHA safety records.',
    recommendedWidgets: ['chart_heatmap_activity', 'kpi_metric_tile', 'interactive_data_pivot_table', 'rich_markdown_note'],
  },
  {
    id: 'executive_ops',
    title: 'Executive Plant Manager View',
    department: 'Executive Operations',
    icon: LayoutDashboard,
    description: 'Comprehensive high-level view of OEE across all facilities, revenue, and scrap rates.',
    recommendedWidgets: ['chart_line_sparkline', 'chart_bar_breakdown', 'chart_pie_distribution', 'kpi_comparison_card'],
  },
];

const AVAILABLE_TOOLS = [
  { id: 'line_oee_tracker', name: 'Line OEE Tracker', category: 'Production' },
  { id: 'active_traveler', name: 'Digital Traveler & SOP', category: 'Quality' },
  { id: 'chart_line_sparkline', name: 'Line Sparkline Trend', category: 'Analytics' },
  { id: 'chart_bar_breakdown', name: 'Bar Production Breakdown', category: 'Analytics' },
  { id: 'chart_pie_distribution', name: 'Work Order Distribution Donut', category: 'Analytics' },
  { id: 'chart_heatmap_activity', name: 'Shift Heatmap Matrix', category: 'Analytics' },
  { id: 'chart_gauge_capacity', name: 'Radial Capacity Gauge', category: 'Telemetry' },
  { id: 'kpi_metric_tile', name: 'Single-Value KPI Tile', category: 'KPIs' },
  { id: 'kpi_comparison_card', name: 'Target Comparison Card', category: 'KPIs' },
  { id: 'interactive_data_pivot_table', name: 'Interactive Pivot Table', category: 'Data' },
  { id: 'digital_twin_map', name: '2D Floor & AGV Radar', category: 'Operations' },
  { id: 'quick_action_bar', name: 'Quick Action Shortcuts', category: 'Controls' },
  { id: 'rich_markdown_note', name: 'Shift Handover Protocol Note', category: 'Collaboration' },
];

export const SubDashboardSetupWizardModal: React.FC<SubDashboardSetupWizardModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [step, setStep] = useState(1);
  const [teamMemberName, setTeamMemberName] = useState('');
  const [teamMemberEmail, setTeamMemberEmail] = useState('');
  const [department, setDepartment] = useState('Production & Assembly');
  const [selectedTemplate, setSelectedTemplate] = useState('floor_operator');
  const [selectedWidgetTypes, setSelectedWidgetTypes] = useState<string[]>([
    'active_traveler',
    'line_oee_tracker',
    'kpi_metric_tile',
    'quick_action_bar',
  ]);
  const [targetFacility, setTargetFacility] = useState('Plant 1 - Midwest Precision Machining');
  const [permissionLevel, setPermissionLevel] = useState<'view_only' | 'operator_interactive' | 'team_admin'>('operator_interactive');

  if (!isOpen) return null;

  const handleSelectTemplate = (tplId: string) => {
    setSelectedTemplate(tplId);
    const found = TEMPLATE_ARCHETYPES.find((t) => t.id === tplId);
    if (found) {
      setSelectedWidgetTypes(found.recommendedWidgets);
      setDepartment(found.department);
    }
  };

  const handleToggleWidget = (typeId: string) => {
    if (selectedWidgetTypes.includes(typeId)) {
      if (selectedWidgetTypes.length > 1) {
        setSelectedWidgetTypes(selectedWidgetTypes.filter((t) => t !== typeId));
      }
    } else {
      setSelectedWidgetTypes([...selectedWidgetTypes, typeId]);
    }
  };

  const handleComplete = () => {
    const dashboardId = `dash-team-${Date.now()}`;
    const generatedWidgets: DashboardWidget[] = selectedWidgetTypes.map((type, index) => {
      const tool = AVAILABLE_TOOLS.find((t) => t.id === type);
      return {
        id: `w-${dashboardId}-${index + 1}`,
        type: type as any,
        title: tool?.name || 'Operational Tool',
        category: (tool?.category as any) || 'operations',
        colSpan: 2 as const,
        settings: {
          refreshInterval: 10,
          showControls: true,
        },
      };
    });

    const newDash: CustomDashboard = {
      id: dashboardId,
      name: `${teamMemberName ? teamMemberName + "'s" : department} Sub-Dashboard`,
      description: `Tailored workspace for ${teamMemberName || 'team member'} (${department}) at ${targetFacility}. Permission: ${permissionLevel.replace('_', ' ')}.`,
      targetTeam: department,
      category: 'custom',
      icon: 'Users',
      isLocked: permissionLevel === 'view_only',
      isDefault: false,
      layoutMode: 'grid',
      gridDensity: 'standard',
      refreshIntervalSeconds: 15,
      streamingEnabled: true,
      widgets: generatedWidgets,
      createdByRole: 'Operations Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save into localStorage for CustomDashboardBuilderView
    try {
      const STORAGE_KEY = 'mfg_custom_dashboards_v1';
      const existingRaw = localStorage.getItem(STORAGE_KEY);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const updatedList = [newDash, ...(Array.isArray(existing) ? existing : [])];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error('Error persisting subdashboard:', e);
    }

    onCreated(newDash);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-[#5A5A40]/15 text-[#5A5A40] border border-[#5A5A40]/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-[#2D2D24]">Team Sub-Dashboard Setup Wizard</h3>
                <span className="text-[10px] bg-[#5A5A40]/10 text-[#5A5A40] font-semibold px-2 py-0.5 rounded-full border border-[#5A5A40]/20">
                  Step {step} of 4
                </span>
              </div>
              <p className="text-[11px] text-[#8B7E66]">
                Guide team members in spinning up dedicated, role-tailored sub-dashboards.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8B7E66] hover:text-[#2D2D24] hover:bg-[#E9E9E0] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-4 gap-1 px-6 py-2 bg-[#F5F5F0] border-b border-[#E5E5DE]">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step ? 'bg-[#5A5A40]' : s < step ? 'bg-[#5A5A40]/60' : 'bg-[#E5E5DE]'
              }`}
            />
          ))}
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-serif font-bold text-base text-[#2D2D24]">Step 1: Team Member Profile & Role</h4>
                <p className="text-xs text-[#8B7E66] mt-0.5">
                  Who is this sub-dashboard being built for? We will configure default filters and permissions accordingly.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#2D2D24] mb-1">Team Member Name / Assignee</label>
                <input
                  type="text"
                  value={teamMemberName}
                  onChange={(e) => setTeamMemberName(e.target.value)}
                  placeholder="e.g. Elena Rostova, David Okafor, Shift A Lead"
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3.5 py-2 text-xs text-[#2D2D24] focus:outline-hidden focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D2D24] mb-1">Corporate Email (Optional)</label>
                <input
                  type="email"
                  value={teamMemberEmail}
                  onChange={(e) => setTeamMemberEmail(e.target.value)}
                  placeholder="e.g. e.rostova@vortix.internal"
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3.5 py-2 text-xs text-[#2D2D24] focus:outline-hidden focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D2D24] mb-1">Operational Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3.5 py-2 text-xs text-[#2D2D24] focus:outline-hidden focus:border-[#5A5A40]"
                >
                  <option value="Production & Assembly">Production & Machine Assembly</option>
                  <option value="Maintenance & Logistics">Maintenance, CMMS & Fleet Robotics</option>
                  <option value="Quality & Metrology">Quality Assurance & Cleanroom SMT</option>
                  <option value="Human Resources">Human Resources & Safety Training</option>
                  <option value="Supply Chain Lead">Inbound Supply Chain & Logistics</option>
                  <option value="Executive Operations">Plant Leadership & Executive Operations</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-serif font-bold text-base text-[#2D2D24]">Step 2: Choose Starter Archetype</h4>
                <p className="text-xs text-[#8B7E66] mt-0.5">
                  Select a pre-engineered layout optimized for the team member's daily workflow.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEMPLATE_ARCHETYPES.map((tpl) => {
                  const Icon = tpl.icon;
                  const isSelected = selectedTemplate === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#5A5A40] bg-[#5A5A40]/10 ring-2 ring-[#5A5A40]/30'
                          : 'border-[#E5E5DE] bg-[#FAF9F5] hover:border-[#C4C4B8]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#5A5A40] text-white' : 'bg-white text-[#5A5A40] border border-[#E5E5DE]'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#5A5A40]" />}
                        </div>
                        <h5 className="font-bold text-xs text-[#2D2D24]">{tpl.title}</h5>
                        <p className="text-[11px] text-[#8B7E66] mt-1 leading-relaxed">{tpl.description}</p>
                      </div>
                      <div className="mt-3 text-[10px] font-mono text-[#5A5A40] bg-white border border-[#E5E5DE] px-2 py-0.5 rounded-md inline-block">
                        {tpl.recommendedWidgets.length} Pre-configured Tools
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-serif font-bold text-base text-[#2D2D24]">Step 3: Select Tool Widgets</h4>
                <p className="text-xs text-[#8B7E66] mt-0.5">
                  Customize the exact components to place on {teamMemberName ? `${teamMemberName}'s` : 'this'} dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {AVAILABLE_TOOLS.map((tool) => {
                  const isChecked = selectedWidgetTypes.includes(tool.id);
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => handleToggleWidget(tool.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'border-[#5A5A40] bg-[#5A5A40]/10 text-[#2D2D24]'
                          : 'border-[#E5E5DE] bg-white text-[#8B7E66] hover:text-[#2D2D24]'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-xs text-[#2D2D24]">{tool.name}</div>
                        <div className="text-[10px] text-[#8B7E66]">{tool.category}</div>
                      </div>
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        isChecked ? 'bg-[#5A5A40] border-[#5A5A40] text-white' : 'border-[#C4C4B8] bg-white'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-serif font-bold text-base text-[#2D2D24]">Step 4: Facility Scope & Permissions</h4>
                <p className="text-xs text-[#8B7E66] mt-0.5">
                  Set data scoping and governance for this sub-dashboard.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#2D2D24] mb-1">Target Facility / Manufacturing Plant</label>
                <select
                  value={targetFacility}
                  onChange={(e) => setTargetFacility(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3.5 py-2 text-xs text-[#2D2D24] focus:outline-hidden focus:border-[#5A5A40]"
                >
                  <option value="Plant 1 - Midwest Precision Machining">Plant 1 - Midwest Precision Machining (Chicago, IL)</option>
                  <option value="Plant 2 - Southern Assembly & Coating">Plant 2 - Southern Assembly & Coating (Nashville, TN)</option>
                  <option value="Plant 3 - West Coast Electronics & SMT">Plant 3 - West Coast Electronics & SMT (San Jose, CA)</option>
                  <option value="All Global Plants (Enterprise Master)">All Global Plants (Enterprise Master)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#2D2D24] mb-1">Permission Level</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'view_only', title: 'View Only', desc: 'Shop-floor monitor kiosk or view-only observer.' },
                    { id: 'operator_interactive', title: 'Operator Interactive', desc: 'Can sign off travelers, trigger actions, and log checks.' },
                    { id: 'team_admin', title: 'Full Team Admin', desc: 'Can add widgets, modify thresholds, and manage members.' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setPermissionLevel(lvl.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        permissionLevel === lvl.id
                          ? 'border-[#5A5A40] bg-[#5A5A40]/10 text-[#2D2D24] font-semibold ring-1 ring-[#5A5A40]'
                          : 'border-[#E5E5DE] bg-[#FAF9F5] text-[#8B7E66]'
                      }`}
                    >
                      <div className="font-bold text-xs text-[#2D2D24]">{lvl.title}</div>
                      <p className="text-[10px] text-[#787668] mt-1">{lvl.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Box */}
              <div className="bg-[#FAF9F5] border border-[#E5E5DE] rounded-2xl p-4 space-y-1.5">
                <div className="font-bold text-xs text-[#2D2D24] flex items-center justify-between">
                  <span>Dashboard Preview: {teamMemberName ? `${teamMemberName}'s Sub-Dashboard` : `${department} Sub-Dashboard`}</span>
                  <span className="text-[10px] bg-[#2E6930]/10 text-[#2E6930] px-2 py-0.5 rounded-full font-semibold">
                    Ready to Deploy
                  </span>
                </div>
                <p className="text-[11px] text-[#8B7E66]">
                  {selectedWidgetTypes.length} tools included &bull; {targetFacility} &bull; {permissionLevel.replace('_', ' ')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-[#E5E5DE] bg-[#FAF9F5] flex items-center justify-between">
          <button
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            disabled={step === 1}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#2D2D24] hover:bg-[#E9E9E0] transition-colors cursor-pointer border border-[#E5E5DE] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep((prev) => Math.min(4, prev + 1))}
              className="flex items-center gap-1 px-5 py-2 rounded-xl text-xs font-semibold bg-[#5A5A40] hover:bg-[#474732] text-white transition-all shadow-xs cursor-pointer"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-[#2E6930] hover:bg-[#255427] text-white transition-all shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Deploy Sub-Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
