import React, { useState } from 'react';
import {
  X,
  Palette,
  Check,
  Building2,
  Sparkles,
  RefreshCw,
  Eye,
  Shield,
  Layers,
  Cpu,
  Factory,
  Zap,
  Orbit,
  Image as ImageIcon,
} from 'lucide-react';
import { CompanyBranding } from '../../types';
import { VortixLogo } from '../VortixLogo';

interface BrandingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  branding: CompanyBranding;
  onSaveBranding: (updated: CompanyBranding) => void;
}

const COLOR_PRESETS = [
  { name: 'Industrial Sage (Default)', primary: '#5A5A40', accent: '#2D2D24', headerBg: '#FFFFFF', preset: 'industrial_earth' as const },
  { name: 'Precision Navy', primary: '#1E3A8A', accent: '#0F172A', headerBg: '#FFFFFF', preset: 'precision_navy' as const },
  { name: 'Emerald Cleanroom', primary: '#0F766E', accent: '#134E4A', headerBg: '#FFFFFF', preset: 'emerald_clean' as const },
  { name: 'Sunset Bronze', primary: '#B45309', accent: '#451A03', headerBg: '#FFFFFF', preset: 'sunset_bronze' as const },
  { name: 'Midnight Slate', primary: '#475569', accent: '#0F172A', headerBg: '#FFFFFF', preset: 'midnight_slate' as const },
  { name: 'Crimson Steel', primary: '#991B1B', accent: '#450A0A', headerBg: '#FFFFFF', preset: 'custom' as const },
];

export const BrandingSettingsModal: React.FC<BrandingSettingsModalProps> = ({
  isOpen,
  onClose,
  branding,
  onSaveBranding,
}) => {
  const [formData, setFormData] = useState<CompanyBranding>({ ...branding });
  const [activeTab, setActiveTab] = useState<'general' | 'colors' | 'logo'>('general');

  if (!isOpen) return null;

  const handleApplyPreset = (p: typeof COLOR_PRESETS[0]) => {
    setFormData((prev) => ({
      ...prev,
      primaryColor: p.primary,
      accentColor: p.accent,
      headerBgColor: p.headerBg,
      themePreset: p.preset,
    }));
  };

  const handleResetToDefault = () => {
    setFormData({
      companyName: 'Vortix Manufacturing Corp',
      dashboardTitle: 'Global Industrial Operations & Telemetry Cockpit',
      tagline: 'Build. Scale. Orchestrate.',
      logoType: 'vortix',
      logoText: 'VORTIX',
      primaryColor: '#5A5A40',
      accentColor: '#2D2D24',
      headerBgColor: '#FFFFFF',
      themePreset: 'industrial_earth',
      showPoweredByVortix: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBranding(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-[#5A5A40]/15 text-[#5A5A40] border border-[#5A5A40]/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2D2D24]">Brand & Theme Customization</h3>
              <p className="text-xs text-[#8B7E66] mt-0.5">
                Brand the platform with your company name, custom dashboard titles, logo, and brand colors.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8B7E66] hover:text-[#2D2D24] hover:bg-[#E9E9E0] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E5E5DE] px-6 bg-[#FAF9F5]">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#8B7E66] hover:text-[#2D2D24]'
            }`}
          >
            Company & Dashboard Names
          </button>
          <button
            onClick={() => setActiveTab('colors')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'colors'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#8B7E66] hover:text-[#2D2D24]'
            }`}
          >
            Brand Colors & Presets
          </button>
          <button
            onClick={() => setActiveTab('logo')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'logo'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#8B7E66] hover:text-[#2D2D24]'
            }`}
          >
            Logo & Identity
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-[#2D2D24] mb-1.5">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Apex Industrial Robotics, Tesla Giga Berlin"
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2D24] focus:outline-hidden focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] transition-colors"
                  required
                />
                <p className="text-[11px] text-[#8B7E66] mt-1">
                  Appears in the header breadcrumbs, reports, exports, and executive rollups.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#2D2D24] mb-1.5">
                  Primary Dashboard Name / Cockpit Title
                </label>
                <input
                  type="text"
                  value={formData.dashboardTitle}
                  onChange={(e) => setFormData({ ...formData, dashboardTitle: e.target.value })}
                  placeholder="e.g. Operations Intelligence Cockpit, Global Factory Command Center"
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2D24] focus:outline-hidden focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] transition-colors"
                  required
                />
                <p className="text-[11px] text-[#8B7E66] mt-1">
                  Displayed as the primary top banner and default name in the Custom Dashboard Builder.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#2D2D24] mb-1.5">
                  Corporate Tagline / Mission
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Precision Autonomous Manufacturing, Zero Defects at Scale"
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2D24] focus:outline-hidden focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] transition-colors"
                />
              </div>

              <div className="pt-2 border-t border-[#E5E5DE]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.showPoweredByVortix}
                    onChange={(e) => setFormData({ ...formData, showPoweredByVortix: e.target.checked })}
                    className="w-4 h-4 rounded-sm border-[#E5E5DE] text-[#5A5A40] focus:ring-[#5A5A40]"
                  />
                  <span className="font-medium text-[#2D2D24]">Show "Powered by; Vortix" footer badge</span>
                </label>
                <p className="text-[11px] text-[#8B7E66] ml-6 mt-0.5">
                  Displays the official operational telemetry SLA and "Build. Scale. Orchestrate." badge at the footer.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="space-y-5">
              {/* Presets */}
              <div>
                <label className="block font-semibold text-[#2D2D24] mb-2">
                  Recommended Industrial Palettes
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {COLOR_PRESETS.map((p) => {
                    const isSelected = formData.primaryColor.toLowerCase() === p.primary.toLowerCase();
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleApplyPreset(p)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#5A5A40] ring-2 ring-[#5A5A40]/30 bg-[#FAF9F5]'
                            : 'border-[#E5E5DE] hover:border-[#C4C4B8] bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: p.primary }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: p.accent }}
                          />
                        </div>
                        <div className="font-semibold text-[#2D2D24] text-[11px] truncate">{p.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="pt-4 border-t border-[#E5E5DE] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1.5">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value, themePreset: 'custom' })}
                      className="w-9 h-9 rounded-xl border border-[#E5E5DE] cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value, themePreset: 'custom' })}
                      className="flex-1 bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-xs font-mono uppercase text-[#2D2D24]"
                    />
                  </div>
                  <p className="text-[11px] text-[#8B7E66] mt-1">Used for primary action buttons, active navigation states, and key badges.</p>
                </div>

                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1.5">
                    Dark Accent / Container Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value, themePreset: 'custom' })}
                      className="w-9 h-9 rounded-xl border border-[#E5E5DE] cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value, themePreset: 'custom' })}
                      className="flex-1 bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-xs font-mono uppercase text-[#2D2D24]"
                    />
                  </div>
                  <p className="text-[11px] text-[#8B7E66] mt-1">Used for sidebar background, high-contrast badges, and dark card frames.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logo' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-[#2D2D24] mb-2">
                  Logo Presentation Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'vortix', label: 'Vortix Mark', icon: Sparkles },
                    { id: 'preset_icon', label: 'Preset Icon', icon: Factory },
                    { id: 'custom_text', label: 'Text Initials', icon: Building2 },
                    { id: 'custom_url', label: 'Image URL', icon: ImageIcon },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, logoType: style.id as any })}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        formData.logoType === style.id
                          ? 'border-[#5A5A40] bg-[#5A5A40]/10 text-[#5A5A40] font-semibold'
                          : 'border-[#E5E5DE] bg-white text-[#8B7E66] hover:text-[#2D2D24]'
                      }`}
                    >
                      <style.icon className="w-4 h-4" />
                      <span className="text-[11px]">{style.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {formData.logoType === 'preset_icon' && (
                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1.5">Select Industry Icon</label>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { id: 'factory', icon: Factory },
                      { id: 'cpu', icon: Cpu },
                      { id: 'shield', icon: Shield },
                      { id: 'zap', icon: Zap },
                      { id: 'orbit', icon: Orbit },
                      { id: 'layers', icon: Layers },
                    ].map((iconItem) => (
                      <button
                        key={iconItem.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, presetIcon: iconItem.id as any })}
                        className={`p-3 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                          formData.presetIcon === iconItem.id
                            ? 'border-[#5A5A40] bg-[#5A5A40] text-white'
                            : 'border-[#E5E5DE] hover:bg-[#F5F5F0] text-[#2D2D24]'
                        }`}
                      >
                        <iconItem.icon className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formData.logoType === 'custom_text' && (
                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1.5">Monogram / Brand Letters</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.logoText || ''}
                    onChange={(e) => setFormData({ ...formData, logoText: e.target.value.toUpperCase() })}
                    placeholder="e.g. APEX, TSLA, BOSCH"
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold tracking-widest text-[#2D2D24] uppercase focus:outline-hidden focus:border-[#5A5A40]"
                  />
                </div>
              )}

              {formData.logoType === 'custom_url' && (
                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1.5">Custom Logo Image URL</label>
                  <input
                    type="url"
                    value={formData.customLogoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, customLogoUrl: e.target.value })}
                    placeholder="https://example.com/corporate-logo.png"
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3.5 py-2.5 text-xs text-[#2D2D24] focus:outline-hidden focus:border-[#5A5A40]"
                  />
                  <p className="text-[11px] text-[#8B7E66] mt-1">Recommended: Transparent SVG or PNG, height 40px.</p>
                </div>
              )}
            </div>
          )}

          {/* Live Preview Card */}
          <div className="bg-[#FAF9F5] border border-[#E5E5DE] p-4 rounded-2xl space-y-2">
            <div className="text-[10px] font-bold text-[#8B7E66] uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3 h-3 text-[#5A5A40]" />
              <span>Live Header & Branding Preview</span>
            </div>
            <div className="bg-white border border-[#E5E5DE] rounded-xl p-3 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-2xs"
                  style={{ backgroundColor: formData.primaryColor }}
                >
                  {formData.logoType === 'vortix' ? (
                    <VortixLogo size="sm" variant="mark" theme="dark" />
                  ) : formData.logoType === 'preset_icon' ? (
                    <Factory className="w-4 h-4 text-white" />
                  ) : formData.logoType === 'custom_url' && formData.customLogoUrl ? (
                    <img src={formData.customLogoUrl} alt="Logo" className="w-6 h-6 object-contain" />
                  ) : (
                    <span className="font-mono text-xs font-bold">{formData.logoText || 'VX'}</span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-[#2D2D24] text-xs flex items-center gap-1.5">
                    <span>{formData.companyName || 'Company Name'}</span>
                    <span className="text-[#8B7E66]">&bull;</span>
                    <span className="font-medium text-[#787668] truncate max-w-[200px]">
                      {formData.dashboardTitle || 'Dashboard Title'}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8B7E66]">{formData.tagline || 'Tagline'}</div>
                </div>
              </div>

              <div
                className="px-3 py-1 rounded-full text-[10px] font-semibold text-white shadow-2xs"
                style={{ backgroundColor: formData.primaryColor }}
              >
                Branded Button
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#E5E5DE] flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-xs text-[#8B7E66] hover:text-[#2D2D24] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Vortix Default</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#2D2D24] hover:bg-[#F5F5F0] transition-colors cursor-pointer border border-[#E5E5DE]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                style={{ backgroundColor: formData.primaryColor }}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save & Apply Brand</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
