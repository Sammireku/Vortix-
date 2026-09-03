import React, { useState } from 'react';
import {
  X,
  User,
  Building2,
  Mail,
  Shield,
  Briefcase,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LogOut,
  Palette,
} from 'lucide-react';
import { UserProfile, CompanyBranding } from '../../types';
import { VortixLogo } from '../VortixLogo';

interface AuthOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile, brandingUpdates?: Partial<CompanyBranding>) => void;
  onStartTour: () => void;
}

export const AuthOnboardingModal: React.FC<AuthOnboardingModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  onStartTour,
}) => {
  const [fullName, setFullName] = useState(userProfile.fullName || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [companyName, setCompanyName] = useState(userProfile.companyName || '');
  const [role, setRole] = useState(userProfile.role || 'VP of Manufacturing & Operations');
  const [industry, setIndustry] = useState(userProfile.industry || 'Precision Engineering & Robotics');
  const [launchTourAfterSave, setLaunchTourAfterSave] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...userProfile,
      fullName,
      email,
      companyName,
      role,
      industry,
      isAuthenticated: true,
      onboardingCompleted: true,
      lastLoginAt: 'Just now',
    };
    onSaveProfile(updated, { companyName });
    onClose();
    if (launchTourAfterSave) {
      onStartTour();
    }
  };

  const handleSignOut = () => {
    const signedOut: UserProfile = {
      id: `usr-${Date.now()}`,
      fullName: 'Guest Operator',
      email: 'guest@vortix.internal',
      companyName: 'Vortix Manufacturing Corp',
      role: 'Guest Operator',
      industry: 'Manufacturing',
      isAuthenticated: false,
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
    };
    onSaveProfile(signedOut);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5]">
          <div className="flex items-center gap-3">
            <VortixLogo size="sm" variant="badge" theme="light" />
            <div>
              <h3 className="font-serif font-bold text-base text-[#2D2D24]">
                {userProfile.isAuthenticated ? 'User Profile & Organization' : 'Get Started with Vortix'}
              </h3>
              <p className="text-[11px] text-[#8B7E66]">
                {userProfile.isAuthenticated
                  ? 'Manage your operator identity and company workspace settings.'
                  : 'Set up your operational profile and brand your company cockpit.'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div>
            <label className="block font-semibold text-[#2D2D24] mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8B7E66] absolute left-3 top-2.5" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Marcus Vance, Elena Rostova"
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#2D2D24] focus:outline-hidden focus:border-[#5A5A40]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#2D2D24] mb-1">Corporate Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8B7E66] absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m.vance@company.com"
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#2D2D24] focus:outline-hidden focus:border-[#5A5A40]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#2D2D24] mb-1">Company / Enterprise Name</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-[#8B7E66] absolute left-3 top-2.5" />
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Industrial Systems, Aurora Aerospace"
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#2D2D24] focus:outline-hidden focus:border-[#5A5A40]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#2D2D24] mb-1">Primary Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-xs text-[#2D2D24] focus:outline-hidden focus:border-[#5A5A40]"
              >
                <option value="VP of Manufacturing & Operations">VP of Manufacturing</option>
                <option value="Plant Operations Manager">Plant Operations Manager</option>
                <option value="Production Shift Supervisor">Production Supervisor</option>
                <option value="Quality Assurance Lead">Quality Assurance Lead</option>
                <option value="Supply Chain Director">Supply Chain Director</option>
                <option value="Maintenance & CMMS Engineer">Maintenance Engineer</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#2D2D24] mb-1">Industry Sector</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-xs text-[#2D2D24] focus:outline-hidden focus:border-[#5A5A40]"
              >
                <option value="Precision Engineering & Robotics">Robotics & Machinery</option>
                <option value="Aerospace & Defense">Aerospace & Defense</option>
                <option value="Automotive & Electric Vehicles">Automotive & EV</option>
                <option value="Electronics & Cleanroom SMT">Electronics & SMT</option>
                <option value="Medical Devices & BioTech">Medical Devices</option>
              </select>
            </div>
          </div>

          {/* Product Tour Checkbox */}
          <div className="pt-2 border-t border-[#E5E5DE]">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={launchTourAfterSave}
                onChange={(e) => setLaunchTourAfterSave(e.target.checked)}
                className="w-4 h-4 rounded-sm border-[#E5E5DE] text-[#5A5A40] focus:ring-[#5A5A40]"
              />
              <span className="font-semibold text-[#2D2D24]">
                Launch Interactive Product Introduction & Guide after setup
              </span>
            </label>
            <p className="text-[11px] text-[#8B7E66] ml-6 mt-0.5">
              Walks through each button and function across custom dashboards, sub-dashboards, and connectors.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#E5E5DE] flex items-center justify-between">
            {userProfile.isAuthenticated ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs text-[#B33A3A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Switch / Sign Out</span>
              </button>
            ) : (
              <div />
            )}

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
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#5A5A40] hover:bg-[#474732] text-white transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Profile & Continue</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
