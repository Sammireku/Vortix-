import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  Mail,
  User,
  Shield,
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowRight,
  Sparkles,
  LogOut,
  Building2,
  Layers,
  Fingerprint,
} from 'lucide-react';
import { AppUser } from '../../types';
import { VortixLogo } from '../VortixLogo';

interface LoginPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  allUsers: AppUser[];
  onSelectUser: (user: AppUser) => void;
  onShowNotification?: (title: string, message: string, type?: 'success' | 'warning' | 'info') => void;
}

export const LoginPortalModal: React.FC<LoginPortalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onSelectUser,
  onShowNotification,
}) => {
  const [activeLoginTab, setActiveLoginTab] = useState<'quick_switch' | 'pin_unlock' | 'email_login'>('quick_switch');
  const [pinInput, setPinInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handlePersonaClick = (user: AppUser) => {
    onSelectUser(user);
    onShowNotification?.(
      'Session Established',
      `Authenticated as ${user.fullName} (${user.roleTitle}). Dashboard permissions updated.`
    );
    onClose();
  };

  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + digit;
      setPinInput(nextPin);
      setErrorMessage('');

      if (nextPin.length === 4) {
        // Find user by PIN
        const matched = allUsers.find((u) => u.pinCode === nextPin);
        if (matched) {
          setTimeout(() => {
            onSelectUser(matched);
            onShowNotification?.(
              'PIN Verified',
              `Welcome, ${matched.fullName}! Station unlocked for ${matched.department}.`
            );
            onClose();
            setPinInput('');
          }, 300);
        } else {
          setErrorMessage('Invalid 4-digit PIN. Try 1001 (Admin) or 7788 (POS).');
        }
      }
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const matched = allUsers.find(
      (u) => u.email.toLowerCase() === emailInput.trim().toLowerCase()
    );

    if (matched) {
      onSelectUser(matched);
      onShowNotification?.(
        'Login Successful',
        `Authenticated as ${matched.fullName}.`
      );
      onClose();
    } else {
      setErrorMessage('Account not found with that email address.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5]">
          <div className="flex items-center gap-3">
            <VortixLogo size="sm" variant="badge" theme="light" />
            <div>
              <h3 className="font-serif font-bold text-base text-[#2D2D24]">
                Vortix Authentication & User Access
              </h3>
              <p className="text-[11px] text-[#8B7E66]">
                Switch operator profiles or log in to experience granular role permissions.
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

        {/* Current Active Session Pill */}
        <div className="px-5 py-3 bg-[#F5F5F0] border-b border-[#E5E5DE] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[#8B7E66]">Current Active Session:</span>
            <span className="font-bold text-[#2D2D24]">{currentUser.fullName}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5A5A40] text-white uppercase font-mono">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="px-5 pt-3 border-b border-[#E5E5DE] flex items-center gap-2">
          <button
            onClick={() => setActiveLoginTab('quick_switch')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeLoginTab === 'quick_switch'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#8B7E66] hover:text-[#2D2D24]'
            }`}
          >
            Quick Switch Personas
          </button>
          <button
            onClick={() => setActiveLoginTab('pin_unlock')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeLoginTab === 'pin_unlock'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#8B7E66] hover:text-[#2D2D24]'
            }`}
          >
            Station PIN Pad
          </button>
          <button
            onClick={() => setActiveLoginTab('email_login')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeLoginTab === 'email_login'
                ? 'border-[#5A5A40] text-[#5A5A40]'
                : 'border-transparent text-[#8B7E66] hover:text-[#2D2D24]'
            }`}
          >
            Email & Password
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
              {errorMessage}
            </div>
          )}

          {/* TAB 1: QUICK SWITCH PERSONAS */}
          {activeLoginTab === 'quick_switch' && (
            <div className="space-y-2.5">
              <p className="text-[#8B7E66] text-[11px] mb-2">
                Click any user profile below to simulate the dashboard with their custom permission matrix:
              </p>

              {allUsers.map((user) => {
                const isSelected = user.id === currentUser.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => handlePersonaClick(user)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#5A5A40] bg-[#FAF9F5] ring-2 ring-[#5A5A40]/15'
                        : 'border-[#E5E5DE] hover:bg-[#FAF9F5] hover:border-[#5A5A40]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-xl object-cover border border-[#E5E5DE] bg-white shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#2D2D24] text-xs truncate">
                            {user.fullName}
                          </span>
                          {user.isSubUser ? (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              Sub-User
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Owner
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#8B7E66] truncate">{user.roleTitle}</div>
                        <div className="text-[10px] text-[#A09E8E]">PIN: {user.pinCode || '1234'} &bull; {user.department}</div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Active
                        </span>
                      ) : (
                        <button className="px-3 py-1.5 rounded-xl bg-[#F5F5F0] hover:bg-[#5A5A40] hover:text-white text-[#5A5A40] font-semibold text-[11px] transition-colors cursor-pointer">
                          Select
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: STATION PIN UNLOCK */}
          {activeLoginTab === 'pin_unlock' && (
            <div className="space-y-4 text-center max-w-xs mx-auto">
              <div>
                <h4 className="font-bold text-sm text-[#2D2D24]">Operator Station PIN</h4>
                <p className="text-[11px] text-[#8B7E66]">
                  Enter your 4-digit terminal PIN for rapid shop floor or POS sign-in.
                </p>
              </div>

              {/* PIN Bubbles */}
              <div className="flex justify-center gap-3 my-4">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      pinInput.length > idx
                        ? 'bg-[#5A5A40] border-[#5A5A40] scale-110'
                        : 'border-[#B0B0A0] bg-transparent'
                    }`}
                  />
                ))}
              </div>

              {/* Number Keypad */}
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handlePinDigit(digit)}
                    className="py-3.5 rounded-2xl bg-[#F5F5F0] hover:bg-[#E9E9E0] text-base font-bold text-[#2D2D24] transition-colors cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  onClick={() => setPinInput('')}
                  className="py-3.5 rounded-2xl bg-red-50 hover:bg-red-100 text-xs font-bold text-red-700 transition-colors cursor-pointer"
                >
                  Clear
                </button>
                <button
                  onClick={() => handlePinDigit('0')}
                  className="py-3.5 rounded-2xl bg-[#F5F5F0] hover:bg-[#E9E9E0] text-base font-bold text-[#2D2D24] transition-colors cursor-pointer"
                >
                  0
                </button>
                <button
                  onClick={() => setPinInput((prev) => prev.slice(0, -1))}
                  className="py-3.5 rounded-2xl bg-[#F5F5F0] hover:bg-[#E9E9E0] text-xs font-bold text-[#5A5A40] transition-colors cursor-pointer"
                >
                  &larr;
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E5DE] text-[11px] text-[#8B7E66]">
                Demo PINs: <span className="font-mono font-bold text-[#5A5A40]">1001</span> (Sarah Super Admin) &bull; <span className="font-mono font-bold text-[#5A5A40]">7788</span> (Elena POS) &bull; <span className="font-mono font-bold text-[#5A5A40]">3344</span> (David PMS)
              </div>
            </div>
          )}

          {/* TAB 3: EMAIL & PASSWORD */}
          {activeLoginTab === 'email_login' && (
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#2D2D24] mb-1">Corporate Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8B7E66] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. sarah.jenkins@vortix.io"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D2D24] mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8B7E66] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#474732] text-white font-bold cursor-pointer shadow-xs"
                >
                  Sign In to Workplace
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
