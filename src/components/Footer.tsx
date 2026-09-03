import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Activity,
  Layers,
  Palette,
  Compass,
  Users,
  ExternalLink,
} from 'lucide-react';
import { CompanyBranding } from '../types';
import { VortixLogo } from './VortixLogo';

interface FooterProps {
  branding: CompanyBranding;
  activeViewTitle?: string;
  onOpenBrandingModal: () => void;
  onOpenProductTour: () => void;
  onOpenSubDashboardWizard: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  branding,
  activeViewTitle = 'Dashboard Builder',
  onOpenBrandingModal,
  onOpenProductTour,
  onOpenSubDashboardWizard,
}) => {
  return (
    <footer className="mt-8 border-t border-[#E5E5DE] bg-white text-[#2D2D24] text-xs transition-colors select-none shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Powered by; Vortix Brand Badge & Slogan */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F5F5F0] border border-[#E5E5DE] px-3 py-1.5 rounded-2xl shadow-2xs">
            <VortixLogo size="sm" variant="mark" theme="light" />
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-[#8B7E66] text-[11px]">powered by;</span>
              <span className="font-serif font-bold text-[#2D2D24] tracking-tight text-xs">vortix</span>
            </div>
            <span className="h-3 w-px bg-[#E5E5DE]" />
            <span className="text-[10px] text-[#8B7E66] font-mono hidden sm:inline">Build. Scale. Orchestrate.</span>
          </div>

          {/* Company branding badge if customized */}
          {branding.companyName !== 'Vortix' && (
            <div className="hidden lg:flex items-center gap-1.5 text-[#5A5A40] text-[11px] font-medium bg-[#5A5A40]/10 border border-[#5A5A40]/20 px-2.5 py-1 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5A5A40]" />
              <span className="font-semibold text-[#2D2D24]">{branding.companyName}</span>
              <span className="text-[#8B7E66]">&bull; {branding.dashboardTitle}</span>
            </div>
          )}
        </div>

        {/* Center: Real-Time Operational SLA & Telemetry Heartbeat */}
        <div className="flex items-center gap-4 text-[11px] text-[#787668]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2E6930] animate-pulse" />
            <span className="font-medium text-[#2D2D24]">All Nodes Operational</span>
            <span className="text-[#8B7E66] hidden sm:inline">(99.98% SLA)</span>
          </div>
          <span className="text-[#D3D3CA] hidden sm:inline">&bull;</span>
          <div className="hidden sm:flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>Telemetry Ingestion: 24.2k eps</span>
          </div>
          <span className="text-[#D3D3CA] hidden md:inline">&bull;</span>
          <span className="font-mono text-[10px] text-[#8B7E66] hidden md:inline">v2.4.0-Enterprise</span>
        </div>

        {/* Right: Quick Action Shortcuts & Help */}
        <div className="flex items-center gap-2">
          {/* Brand Customization shortcut */}
          <button
            onClick={onOpenBrandingModal}
            className="flex items-center gap-1 text-[11px] bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE] px-2.5 py-1 rounded-xl transition-colors cursor-pointer font-medium shadow-2xs"
            title="Customize Company Name, Dashboard Title, Logo & Colors"
          >
            <Palette className="w-3 h-3 text-[#5A5A40]" />
            <span className="hidden sm:inline">Branding & Colors</span>
          </button>

          {/* Sub-Dashboard Wizard shortcut */}
          <button
            onClick={onOpenSubDashboardWizard}
            className="flex items-center gap-1 text-[11px] bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE] px-2.5 py-1 rounded-xl transition-colors cursor-pointer font-medium shadow-2xs"
            title="Guide users in creating sub-dashboards for team members"
          >
            <Users className="w-3 h-3 text-[#5A5A40]" />
            <span className="hidden sm:inline">Team Sub-Dashboards</span>
          </button>

          {/* Product Tour shortcut */}
          <button
            onClick={onOpenProductTour}
            className="flex items-center gap-1 text-[11px] bg-[#5A5A40] hover:bg-[#474732] text-white px-2.5 py-1 rounded-xl transition-colors cursor-pointer font-medium shadow-2xs"
            title="Open Interactive Product Introduction & Guide"
          >
            <Compass className="w-3 h-3 text-[#E9E9E0]" />
            <span>Product Tour</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
