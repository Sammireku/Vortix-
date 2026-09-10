import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  LayoutDashboard,
  Users,
  Grid3X3,
  Move,
  Smartphone,
  Tablet,
  Monitor,
  Link2,
  Database,
  Truck,
  Building2,
  Lock,
  Layers,
  Palette,
  ExternalLink,
} from 'lucide-react';
import { VortixLogo } from '../VortixLogo';

interface ProductTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView?: (view: string) => void;
  onOpenSubDashboardWizard?: () => void;
  onOpenBrandingModal?: () => void;
}

interface TourStep {
  stepNumber: number;
  title: string;
  badge: string;
  subtitle: string;
  description: string;
  keyFunctions: {
    name: string;
    buttonLabel: string;
    description: string;
  }[];
  proTip: string;
  actionText?: string;
  actionHandler?: () => void;
}

export const ProductTourModal: React.FC<ProductTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateToView,
  onOpenSubDashboardWizard,
  onOpenBrandingModal,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const tourSteps: TourStep[] = [
    {
      stepNumber: 1,
      title: 'Vortix Orchestration Hub & Brand Customization',
      badge: 'Architecture & Branding',
      subtitle: 'Unify real-time plant telemetry with your corporate brand and identity.',
      description:
        'Vortix is built to serve as your operational cockpit. Every element—from header titles and logos to primary theme accents—can be fully customized to reflect your enterprise brand.',
      keyFunctions: [
        {
          name: 'Plant & Node Selector (Header Top-Left)',
          buttonLabel: 'Plant 1 - Midwest',
          description: 'Switch between global manufacturing plants and subsidiary facilities instantly.',
        },
        {
          name: 'Company Rebranding & Colors (Palette Icon)',
          buttonLabel: 'Branding & Colors',
          description: 'Set your company name, custom dashboard title, corporate tagline, and brand colors.',
        },
        {
          name: 'Role-Based Access Control (Header Top-Right)',
          buttonLabel: 'Plant Manager / Operator',
          description: 'Switch personas to simulate granular permission levels across all operations.',
        },
        {
          name: 'AI Operations Shift Report (Header Sparkle)',
          buttonLabel: 'AI Shift Report',
          description: 'Generates automated intelligence summaries on OEE, scrap rates, and bottlenecks.',
        },
      ],
      proTip: 'Click the "Branding & Colors" button in the footer or header anytime to rebrand Vortix to match your corporate styling.',
      actionText: 'Customize Branding Now',
      actionHandler: () => {
        onClose();
        if (onOpenBrandingModal) onOpenBrandingModal();
      },
    },
    {
      stepNumber: 2,
      title: 'Custom Dashboard Canvas & Layout Mechanics',
      badge: 'Canvas Mechanics',
      subtitle: 'Precision snap-to-grid density, freeform pixel mode, and responsive device frames.',
      description:
        'Build custom operational layouts tailored specifically for your teams. Choose between structured auto-aligning grids or freeform pixel positioning with real-time coordinate guides.',
      keyFunctions: [
        {
          name: 'Grid Density Toggle (Toolbar)',
          buttonLabel: 'Compact | Standard | Spacious',
          description: 'Adjusts gap spacing and card margins to optimize for dense control rooms or spacious visual displays.',
        },
        {
          name: 'Freeform Canvas Mode (Toolbar)',
          buttonLabel: 'Freeform Mode',
          description: 'Allows unrestricted pixel coordinates, overlapping widgets, and 20px precision snapping.',
        },
        {
          name: 'History State Engine (Undo/Redo)',
          buttonLabel: 'Undo (Ctrl+Z) / Redo (Ctrl+Y)',
          description: 'Safely experiment with layout changes with instant rollbacks and redo capabilities.',
        },
        {
          name: 'Responsive Breakpoint Previews',
          buttonLabel: 'Desktop (100%) | Tablet (768px) | Mobile (375px)',
          description: 'Simulate how your dashboard renders on shop-floor rugged tablets or operator smartphones.',
        },
      ],
      proTip: 'Press "Kiosk Mode" to eliminate all chrome and project the live dashboard onto shop-floor overhead monitors.',
      actionText: 'Open Dashboard Builder',
      actionHandler: () => {
        onClose();
        if (onNavigateToView) onNavigateToView('custom_dashboards');
      },
    },
    {
      stepNumber: 3,
      title: 'Tool Catalog & Multi-Select Manipulation',
      badge: 'Widget Engine',
      subtitle: '17+ industrial telemetry widgets with bulk column resizing and manipulation.',
      description:
        'Access a rich suite of operational components: time-series line sparklines, radial capacity gauges, hourly shift heatmap matrices, digital traveler SOPs, and interactive pivot tables.',
      keyFunctions: [
        {
          name: 'Tool Catalog Drawer (Toolbar)',
          buttonLabel: '+ Tool Catalog',
          description: 'Browse, search, and insert specialized telemetry widgets into your active canvas.',
        },
        {
          name: 'Multi-Select Checkbox (Widget Top-Left)',
          buttonLabel: 'Checkboxes on Cards',
          description: 'Select multiple widgets simultaneously to trigger the floating bulk action bar.',
        },
        {
          name: 'Floating Bulk Action Bar',
          buttonLabel: '1-Col | 2-Col | 3-Col | 4-Col | Duplicate | Delete',
          description: 'Resize, duplicate, or delete multiple components at once with a single click.',
        },
        {
          name: 'Alignment Guides Overlay',
          buttonLabel: 'Align Guides',
          description: 'Visual crosshairs and rule-of-thirds dashed guidelines for pixel-perfect placement.',
        },
      ],
      proTip: 'Select multiple widgets with the top-left checkboxes and click "2-Col" to organize related widgets into balanced dual-column cards.',
    },
    {
      stepNumber: 4,
      title: 'Creating Sub-Dashboards for Team Members',
      badge: 'Team Workspaces',
      subtitle: 'Deploy tailored dashboards for operators, technicians, HR leads, and executives.',
      description:
        'Empower team members with role-specific views. Instead of exposing overwhelming enterprise data, create dedicated sub-dashboards with curated widgets, isolated plant filters, and restricted permissions.',
      keyFunctions: [
        {
          name: 'Team Sub-Dashboard Wizard',
          buttonLabel: 'New Team Sub-Dashboard',
          description: 'A 5-step guided wizard that configures team member roles, permissions, and tool suites.',
        },
        {
          name: 'Preset Role Templates',
          buttonLabel: 'Executive | Floor Ops | HR & Safety | Fleet Logistics',
          description: 'One-click starter templates tailored to specific organizational personas.',
        },
        {
          name: 'Permission Scoping',
          buttonLabel: 'View Only | Interactive Operator | Full Admin',
          description: 'Restrict sensitive financial or configuration settings while allowing operational controls.',
        },
        {
          name: 'Sub-Account Rollup',
          buttonLabel: 'Sub-Accounts & Master',
          description: 'Consolidate multiple subsidiary dashboards into an enterprise-wide executive rollup.',
        },
      ],
      proTip: 'Launch the Sub-Dashboard Setup Wizard right now to create your first customized team workspace!',
      actionText: 'Launch Sub-Dashboard Wizard',
      actionHandler: () => {
        onClose();
        if (onOpenSubDashboardWizard) onOpenSubDashboardWizard();
      },
    },
    {
      stepNumber: 5,
      title: 'Workforce Human Resources & Fleet Management',
      badge: 'Operations & Logistics',
      subtitle: 'Manage operators, shifts, skill certifications, AGV robotics, and fleet dispatches.',
      description:
        'Vortix integrates shop-floor human talent and automated mobile robotics into a single operational system.',
      keyFunctions: [
        {
          name: 'Human Resources Hub',
          buttonLabel: 'Workforce & HR View',
          description: 'Roster directory, shift attendance, OSHA safety incident tracking, and certification renewals.',
        },
        {
          name: 'Skill Matrix & Certification Radar',
          buttonLabel: 'Certifications Tab',
          description: 'Tracks OSHA 30, Six Sigma, IPC-A-610, and forklift licenses with 30-day expiration warnings.',
        },
        {
          name: 'Autonomous AGV & Forklift Radar',
          buttonLabel: 'Fleet Management View',
          description: 'Real-time 2D tracking map with battery telemetry, speed, waypoint navigation, and payloads.',
        },
        {
          name: 'Mission Dispatch & Pre-Trip Safety Checklists',
          buttonLabel: 'Dispatch Mission',
          description: 'Assign pick-up/drop-off missions and enforce OSHA daily mechanical inspections.',
        },
      ],
      proTip: 'Check the Fleet 2D Radar to observe autonomous AGVs delivering machined parts between CNC Bay A and Assembly.',
      actionText: 'Explore Fleet Management',
      actionHandler: () => {
        onClose();
        if (onNavigateToView) onNavigateToView('fleet_management');
      },
    },
    {
      stepNumber: 6,
      title: 'Enterprise Connectors & BYO Database Hub',
      badge: 'Data Integrations',
      subtitle: 'Connect your corporate software stack and external databases seamlessly.',
      description:
        'Bridge data silos by streaming real-time information between Vortix and your existing CRM, ERP, project management, and cloud database instances.',
      keyFunctions: [
        {
          name: 'Corporate App Connectors (10 Apps)',
          buttonLabel: 'Apps & Systems View',
          description: 'One-click toggles for HubSpot, Salesforce, Zoho, Monday, Asana, Jira, QuickBooks, Xero, Slack, Twilio.',
        },
        {
          name: 'BYO Database Hub',
          buttonLabel: 'Database Hub View',
          description: 'Connect directly to PostgreSQL, MySQL, SQL Server, MongoDB, Snowflake, and ClickHouse.',
        },
        {
          name: 'Visual Query Builder & SQL Console',
          buttonLabel: 'Visual Builder / SQL',
          description: 'Visually select tables, columns, and filters or execute raw queries with live telemetry binding.',
        },
        {
          name: 'Low-Code Event Workflows',
          buttonLabel: 'Workflow Builder View',
          description: 'Automate reactions to machine threshold breaches, inventory shortages, or safety alerts.',
        },
      ],
      proTip: 'Bind any SQL or visual query result directly into a dashboard KPI card or table widget for instant live reporting.',
      actionText: 'View External Database Hub',
      actionHandler: () => {
        onClose();
        if (onNavigateToView) onNavigateToView('database_hub');
      },
    },
  ];

  const currentStep = tourSteps[currentStepIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-tour-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5]">
          <div className="flex items-center gap-3">
            <VortixLogo size="sm" variant="badge" theme="light" />
            <div>
              <div className="flex items-center gap-2">
                <h3 id="product-tour-title" className="font-serif font-bold text-base text-[#2D2D24]">Vortix Product Guide & System Walkthrough</h3>
                <span className="text-[10px] bg-[#5A5A40]/10 text-[#5A5A40] font-semibold px-2 py-0.5 rounded-full border border-[#5A5A40]/20">
                  Step {currentStep.stepNumber} of {tourSteps.length}
                </span>
              </div>
              <p className="text-[11px] text-[#8B7E66]">
                Comprehensive orientation explaining each function, button, and workflow.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close product guide modal"
            className="p-1.5 rounded-xl text-[#8B7E66] hover:text-[#2D2D24] hover:bg-[#E9E9E0] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-6 gap-1 px-6 py-2 bg-[#F5F5F0] border-b border-[#E5E5DE]">
          {tourSteps.map((s, idx) => (
            <button
              key={s.stepNumber}
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentStepIndex
                  ? 'bg-[#5A5A40]'
                  : idx < currentStepIndex
                  ? 'bg-[#5A5A40]/50'
                  : 'bg-[#E5E5DE]'
              }`}
              title={`Jump to Step ${s.stepNumber}: ${s.title}`}
            />
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Step Title & Subtitle */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A5A40] bg-[#5A5A40]/10 px-2.5 py-0.5 rounded-full">
                {currentStep.badge}
              </span>
              <h2 className="font-serif font-bold text-lg text-[#2D2D24]">{currentStep.title}</h2>
            </div>
            <p className="text-xs font-medium text-[#787668]">{currentStep.subtitle}</p>
            <p className="text-xs text-[#2D2D24] mt-2 leading-relaxed">{currentStep.description}</p>
          </div>

          {/* Key Functions & Button Breakdown */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-[11px] text-[#8B7E66] uppercase tracking-wider">
              Functions & Buttons Explained:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentStep.keyFunctions.map((fn) => (
                <div
                  key={`fn-${fn.name}-${fn.buttonLabel}`}
                  className="bg-[#FAF9F5] border border-[#E5E5DE] rounded-2xl p-3.5 space-y-1.5 hover:border-[#C4C4B8] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#2D2D24] text-xs">{fn.name}</span>
                    <span className="text-[10px] font-mono bg-white border border-[#E5E5DE] px-2 py-0.5 rounded-md text-[#5A5A40] shrink-0 font-medium">
                      {fn.buttonLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#787668] leading-normal">{fn.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tip Box */}
          <div className="bg-[#5A5A40]/10 border border-[#5A5A40]/20 rounded-2xl p-3.5 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#5A5A40] shrink-0 mt-0.5" />
            <div className="text-[11px]">
              <span className="font-bold text-[#2D2D24]">Pro Tip: </span>
              <span className="text-[#5A5A40]">{currentStep.proTip}</span>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-[#E5E5DE] bg-[#FAF9F5] flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#2D2D24] hover:bg-[#E9E9E0] transition-colors cursor-pointer border border-[#E5E5DE] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {currentStep.actionText && currentStep.actionHandler && (
              <button
                onClick={currentStep.actionHandler}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-[#F5F5F0] text-[#2D2D24] transition-colors cursor-pointer border border-[#E5E5DE] shadow-2xs"
              >
                <span>{currentStep.actionText}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#5A5A40]" />
              </button>
            )}

            {currentStepIndex < tourSteps.length - 1 ? (
              <button
                onClick={() => setCurrentStepIndex((prev) => Math.min(tourSteps.length - 1, prev + 1))}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-[#5A5A40] hover:bg-[#474732] text-white transition-all shadow-xs cursor-pointer"
              >
                <span>Next Feature</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-[#2E6930] hover:bg-[#255427] text-white transition-all shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finish & Start Building</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
