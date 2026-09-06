import React, { useState } from 'react';
import {
  Shield,
  Bell,
  Building2,
  ChevronDown,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  QrCode,
  Printer,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  MoreHorizontal,
  Palette,
  Compass,
  UserCircle,
} from 'lucide-react';
import { RoleDefinition, UserRole, Facility, CompanyBranding, AppUser } from '../types';
import { VortixLogo } from './VortixLogo';

interface HeaderProps {
  currentRole: RoleDefinition;
  roles: RoleDefinition[];
  onSelectRole: (role: any) => void;
  currentUser?: AppUser;
  onOpenLoginPortal?: () => void;
  facilities?: Facility[];
  activeFacility: Facility | string;
  onSelectFacility?: (facility: any) => void;
  onChangeFacility?: (facility: any) => void;
  alertCount?: number;
  onOpenAlertsModal?: () => void;
  onQuickGenerateReport?: () => void;
  onOpenAiReport?: () => void;
  onOpenBarcodeScanner?: () => void;
  onOpenPrintLabel?: () => void;
  branding?: CompanyBranding;
  onOpenBrandingModal?: () => void;
  onOpenAuthModal?: () => void;
  onOpenProductTour?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  roles,
  onSelectRole,
  currentUser,
  onOpenLoginPortal,
  facilities: propsFacilities,
  activeFacility,
  onSelectFacility,
  onChangeFacility,
  alertCount = 3,
  onOpenAlertsModal,
  onQuickGenerateReport,
  onOpenAiReport,
  onOpenBarcodeScanner,
  onOpenPrintLabel,
  branding,
  onOpenBrandingModal,
  onOpenAuthModal,
  onOpenProductTour,
  isSidebarCollapsed = false,
  onToggleSidebar,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showFacilityMenu, setShowFacilityMenu] = useState(false);
  const [showMobileTools, setShowMobileTools] = useState(false);

  const fallbackFacilities = [
    { id: 'plant-1', name: 'Plant 1 - Midwest Precision Machining (Active)', status: 'Optimal (OEE 84%)' },
    { id: 'plant-2', name: 'Plant 2 - Eastern Sheet & Stamping Facility', status: 'Optimal (OEE 81%)' },
    { id: 'plant-3', name: 'Plant 3 - Cleanroom SMT Electronics Center', status: 'Warning (Feeder Hold)' },
  ];

  const availableFacilities = propsFacilities || fallbackFacilities;
  const activeFacilityName = typeof activeFacility === 'string' ? activeFacility : activeFacility.name;

  return (
    <header className="h-16 bg-white border-b border-[#E5E5DE] text-[#2D2D24] flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30 select-none shadow-xs">
      {/* Left: Hub Navigation, Sidebar Toggle & Plant Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
        {/* Toggle Sidebar Button (Hamburger on Mobile, Collapse/Expand on Desktop) */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl hover:bg-[#F5F5F0] text-[#2D2D24] border border-[#E5E5DE] transition-colors cursor-pointer shrink-0"
            title={isSidebarCollapsed ? 'Expand Navigation (Ctrl+B)' : 'Collapse Navigation (Ctrl+B)'}
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-4 h-4 md:hidden text-[#5A5A40]" />
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 hidden md:block text-[#5A5A40]" />
            ) : (
              <PanelLeftClose className="w-4 h-4 hidden md:block text-[#5A5A40]" />
            )}
          </button>
        )}

        {/* Breadcrumb with Vortix Identity or Custom White-Label */}
        <div className="flex items-center gap-2 text-sm min-w-0">
          {branding && branding.logoType === 'custom_url' && branding.customLogoUrl ? (
            <img src={branding.customLogoUrl} alt="Logo" className="w-6 h-6 object-contain shrink-0" />
          ) : branding && branding.logoType === 'custom_text' ? (
            <div
              className="w-7 h-7 rounded-lg text-white font-mono font-bold text-xs flex items-center justify-center shadow-xs shrink-0"
              style={{ backgroundColor: branding.primaryColor || '#5A5A40' }}
            >
              {branding.logoText || 'VX'}
            </div>
          ) : (
            <div className="shrink-0">
              <VortixLogo size="sm" variant="badge" theme="light" />
            </div>
          )}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[#8B7E66] font-medium hidden md:inline truncate">
              {branding?.companyName || 'Vortix'}
            </span>
            <span className="text-[#C1C1B8] hidden md:inline">&rsaquo;</span>
            <span className="font-semibold text-[#2D2D24] text-xs sm:text-sm truncate max-w-[85px] xs:max-w-[130px] sm:max-w-[200px] md:max-w-none">
              {branding?.dashboardTitle || 'Global Operations'}
            </span>
          </div>
        </div>

        {/* Facility Dropdown */}
        <div className="relative hidden xl:block">
          <button
            onClick={() => {
              setShowFacilityMenu(!showFacilityMenu);
              setShowRoleMenu(false);
              setShowMobileTools(false);
            }}
            className="flex items-center gap-2 text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] border border-[#E5E5DE] px-3 py-1.5 rounded-xl text-[#2D2D24] font-medium transition-colors cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span className="truncate max-w-[180px]">{activeFacilityName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#8B7E66]" />
          </button>

          {showFacilityMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-80 bg-white border border-[#E5E5DE] rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-1.5 text-[10px] font-bold text-[#8B7E66] uppercase tracking-wider border-b border-[#E5E5DE]">
                Select Manufacturing Plant
              </div>
              <div className="py-1">
                {availableFacilities.map((fac) => (
                  <button
                    key={fac.id}
                    onClick={() => {
                      if (onSelectFacility) {
                        onSelectFacility(fac);
                      } else if (onChangeFacility) {
                        onChangeFacility(fac.name);
                      }
                      setShowFacilityMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs hover:bg-[#F5F5F0] flex items-center justify-between transition-colors cursor-pointer ${
                      activeFacilityName.includes(fac.id === 'plant-1' ? 'Plant 1' : fac.id === 'plant-2' ? 'Plant 2' : 'Plant 3')
                        ? 'bg-[#5A5A40]/10 text-[#5A5A40] font-semibold'
                        : 'text-[#2D2D24]'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{fac.name.split(' - ')[0]}</div>
                      <div className="text-[11px] text-[#8B7E66]">{fac.name.split(' - ')[1] || fac.location}</div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#E9E9E0] text-[#5A5A40] border border-[#E5E5DE]">
                      OEE 85% Target
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions, AI Shift Report, Alerts, Tools Menu, RBAC Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Status Pill matching Design HTML */}
        <div className="hidden 2xl:flex items-center gap-1.5 bg-[#F5F5F0] px-3 py-1 rounded-full text-xs font-semibold text-[#5A5A40] border border-[#E5E5DE]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5A5A40] animate-pulse"></span>
          <span>Supply Chain: STABLE</span>
        </div>

        {/* Large screen dedicated utility buttons */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Barcode & QR Scanner Button */}
          {onOpenBarcodeScanner && (
            <button
              onClick={onOpenBarcodeScanner}
              className="flex items-center gap-1.5 text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE] font-medium px-2.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
              title="Scan Shop-Floor Barcode or QR Code"
            >
              <QrCode className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="hidden xl:inline">Scan</span>
            </button>
          )}

          {/* Thermal Label Generator Button */}
          {onOpenPrintLabel && (
            <button
              onClick={onOpenPrintLabel}
              className="flex items-center gap-1.5 text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE] font-medium px-2.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
              title="Print Industrial Thermal Barcode Label"
            >
              <Printer className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="hidden xl:inline">Label</span>
            </button>
          )}

          {/* Branding & White-labeling Shortcut Button */}
          {onOpenBrandingModal && (
            <button
              onClick={onOpenBrandingModal}
              className="flex items-center gap-1.5 text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE] font-medium px-2.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
              title="Customize Company Name, Dashboard Title, Logo & Colors"
            >
              <Palette className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="hidden xl:inline">Brand</span>
            </button>
          )}

          {/* Interactive Product Tour Button */}
          {onOpenProductTour && (
            <button
              onClick={onOpenProductTour}
              className="flex items-center gap-1.5 text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE] font-medium px-2.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
              title="Interactive Product Guide & Orientation Walkthrough"
            >
              <Compass className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="hidden xl:inline">Tour</span>
            </button>
          )}
        </div>

        {/* Small Screen Responsive Tools Overflow Menu */}
        <div className="relative lg:hidden">
          <button
            onClick={() => {
              setShowMobileTools(!showMobileTools);
              setShowRoleMenu(false);
              setShowFacilityMenu(false);
            }}
            className="p-2 rounded-xl hover:bg-[#F5F5F0] text-[#2D2D24] border border-[#E5E5DE] transition-colors cursor-pointer"
            title="Operational Tools & Quick Actions"
            aria-label="Quick tools menu"
          >
            <MoreHorizontal className="w-4 h-4 text-[#5A5A40]" />
          </button>

          {showMobileTools && (
            <div className="absolute top-full right-0 mt-1.5 w-64 bg-white border border-[#E5E5DE] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-1 text-[10px] font-bold text-[#8B7E66] uppercase tracking-wider border-b border-[#E5E5DE] mb-1">
                Quick Tools & Settings
              </div>
              {onOpenBarcodeScanner && (
                <button
                  onClick={() => {
                    onOpenBarcodeScanner();
                    setShowMobileTools(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs hover:bg-[#F5F5F0] flex items-center gap-2.5 text-[#2D2D24] cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-[#5A5A40]" />
                  <span>Scan Shop Barcode / QR</span>
                </button>
              )}
              {onOpenPrintLabel && (
                <button
                  onClick={() => {
                    onOpenPrintLabel();
                    setShowMobileTools(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs hover:bg-[#F5F5F0] flex items-center gap-2.5 text-[#2D2D24] cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#5A5A40]" />
                  <span>Print Thermal Label</span>
                </button>
              )}
              {onOpenBrandingModal && (
                <button
                  onClick={() => {
                    onOpenBrandingModal();
                    setShowMobileTools(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs hover:bg-[#F5F5F0] flex items-center gap-2.5 text-[#2D2D24] cursor-pointer"
                >
                  <Palette className="w-4 h-4 text-[#5A5A40]" />
                  <span>Customize Branding & Colors</span>
                </button>
              )}
              {onOpenProductTour && (
                <button
                  onClick={() => {
                    onOpenProductTour();
                    setShowMobileTools(false);
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs hover:bg-[#F5F5F0] flex items-center gap-2.5 text-[#2D2D24] cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-[#5A5A40]" />
                  <span>Start Product Tour</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* User Account / Onboarding Profile */}
        {/* Active Logged-in User Profile & Sub-User Switcher */}
        {currentUser ? (
          <button
            onClick={onOpenLoginPortal || onOpenAuthModal}
            className="flex items-center gap-2 text-xs bg-[#FAF9F5] hover:bg-[#F5F5F0] text-[#2D2D24] border border-[#E5E5DE] font-medium p-1 sm:px-2.5 sm:py-1 rounded-xl transition-all shadow-xs cursor-pointer"
            title={`Logged in as ${currentUser.fullName} (${currentUser.roleTitle}). Click to switch user or sign in.`}
          >
            <img
              src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.fullName}`}
              alt={currentUser.fullName}
              className="w-6 h-6 rounded-lg object-cover border border-[#E5E5DE] bg-white shrink-0"
            />
            <div className="text-left hidden lg:block">
              <div className="font-semibold text-[#2D2D24] leading-tight truncate max-w-[110px]">
                {currentUser.fullName}
              </div>
              <div className="text-[10px] text-[#8B7E66] font-mono leading-tight">
                {currentUser.isSubUser ? 'Sub-User' : 'Master Admin'}
              </div>
            </div>
          </button>
        ) : onOpenAuthModal ? (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE] font-medium p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
            title="User Account & Onboarding Profile"
          >
            <UserCircle className="w-4 h-4 text-[#5A5A40]" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        ) : null}

        {/* AI Briefing Button */}
        <button
          onClick={onOpenAiReport || onQuickGenerateReport}
          className="flex items-center gap-1.5 text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-medium px-2.5 sm:px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
          title="Run Automated AI Operations Briefing"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E9E9E0]" />
          <span className="hidden sm:inline">AI Shift Report</span>
        </button>

        {/* Operational Alerts Bell */}
        <button
          onClick={onOpenAlertsModal}
          className="relative p-2 rounded-xl hover:bg-[#F5F5F0] text-[#2D2D24] transition-colors border border-[#E5E5DE] cursor-pointer shrink-0"
          title="Active Operational & Supply Chain Alerts"
        >
          <Bell className="w-4 h-4 text-[#5A5A40]" />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#8B7E66] text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white">
              {alertCount}
            </span>
          )}
        </button>

        {/* RBAC Active Role Selector */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowFacilityMenu(false);
              setShowMobileTools(false);
            }}
            className="flex items-center gap-1.5 sm:gap-2 text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] border border-[#E5E5DE] p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-[#2D2D24] transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-[#8B7E66] shrink-0" />
            <div className="text-left hidden md:block">
              <div className="font-semibold text-[#2D2D24] flex items-center gap-1.5">
                <span className="truncate max-w-[120px]">{currentRole.title}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E9E9E0] text-[#5A5A40] border border-[#E5E5DE] font-mono">
                  {currentRole.id.replace('_', ' ')}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#8B7E66] shrink-0 hidden sm:block" />
          </button>

          {showRoleMenu && (
            <div className="absolute top-full right-0 mt-1.5 w-80 max-w-[90vw] bg-white border border-[#E5E5DE] rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-2 border-b border-[#E5E5DE]">
                <div className="text-[10px] font-bold text-[#8B7E66] uppercase tracking-wider flex items-center justify-between">
                  <span>Role-Based Access Control</span>
                  <span className="text-[#5A5A40] font-semibold lowercase">enforced</span>
                </div>
                <p className="text-[11px] text-[#A09E8E] mt-0.5">
                  Switch persona to simulate granular permissions across modules.
                </p>
              </div>

              <div className="max-h-80 overflow-y-auto py-1">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onSelectRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-[#F5F5F0] flex items-start gap-2.5 transition-colors cursor-pointer ${
                      r.id === currentRole.id ? 'bg-[#5A5A40]/10 text-[#5A5A40] font-medium' : 'text-[#2D2D24]'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {r.id === currentRole.id ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#5A5A40]" />
                      ) : (
                        <Shield className="w-3.5 h-3.5 text-[#8B7E66]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold truncate">{r.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E9E9E0] text-[#5A5A40] font-mono shrink-0 ml-1">
                          {r.id.split('_')[0]}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A09E8E] line-clamp-1 mt-0.5">{r.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

