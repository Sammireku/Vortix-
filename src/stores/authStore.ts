import { create } from 'zustand';
import {
  RoleDefinition,
  Facility,
  AppUser,
  SecurityAuditEntry,
  UserProfile,
  UserRole,
} from '../types';
import { initialRoles, initialFacilities } from '../data/initialData';
import { initialAppUsers, initialSecurityAuditLogs } from '../data/authAndEnterpriseData';

interface AuthState {
  currentRole: RoleDefinition;
  setCurrentRole: (role: RoleDefinition) => void;

  activeFacility: Facility;
  setActiveFacility: (facility: Facility) => void;

  currentUser: AppUser;
  setCurrentUser: (user: AppUser) => void;

  allUsers: AppUser[];
  setAllUsers: (users: AppUser[] | ((prev: AppUser[]) => AppUser[])) => void;
  handleAddUser: (newUser: Omit<AppUser, 'id' | 'createdAt'>) => void;
  handleUpdateUserRole: (userId: string, newRole: AppUser['role']) => void;
  handleToggleUserStatus: (userId: string) => void;

  userAuditLogs: SecurityAuditEntry[];
  setUserAuditLogs: (logs: SecurityAuditEntry[] | ((prev: SecurityAuditEntry[]) => SecurityAuditEntry[])) => void;
  logAuditEvent: (action: string, details: string, status?: 'allowed' | 'restricted' | 'warning') => void;

  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile | ((prev: UserProfile) => UserProfile)) => void;
  handleSaveProfile: (profile: UserProfile) => void;

  isLoginPortalOpen: boolean;
  setIsLoginPortalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentRole: initialRoles[0],
  setCurrentRole: (role) => {
    set({ currentRole: role });
    get().logAuditEvent(
      'Role Switched',
      `Switched active RBAC role to ${role.title} (${role.name}).`
    );
  },

  activeFacility: initialFacilities[0],
  setActiveFacility: (facility) => set({ activeFacility: facility }),

  currentUser: initialAppUsers[0],
  setCurrentUser: (user) => {
    set({ currentUser: user });
    // Also match role if found
    const matchingRole = initialRoles.find((r) => r.name === user.role);
    if (matchingRole) {
      set({ currentRole: matchingRole });
    }
    get().logAuditEvent(
      'User Switched',
      `Impersonating/switched to user ${user.fullName} (${user.email}).`
    );
  },

  allUsers: initialAppUsers,
  setAllUsers: (users) =>
    set((state) => ({
      allUsers: typeof users === 'function' ? users(state.allUsers) : users,
    })),

  handleAddUser: (newUser) => {
    const created: AppUser = {
      ...newUser,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      allUsers: [created, ...state.allUsers],
    }));
    get().logAuditEvent('User Created', `Added new user ${created.fullName} (${created.email}) with role ${created.role}.`);
  },

  handleUpdateUserRole: (userId, newRole) => {
    set((state) => ({
      allUsers: state.allUsers.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
    }));
    get().logAuditEvent('Role Modified', `Updated user ID ${userId} role to ${newRole}.`);
  },

  handleToggleUserStatus: (userId) => {
    set((state) => ({
      allUsers: state.allUsers.map((u) => {
        if (u.id !== userId) return u;
        const nextStatus = u.status === 'active' ? 'suspended' : 'active';
        return { ...u, status: nextStatus };
      }),
    }));
  },

  userAuditLogs: initialSecurityAuditLogs,
  setUserAuditLogs: (logs) =>
    set((state) => ({
      userAuditLogs: typeof logs === 'function' ? logs(state.userAuditLogs) : logs,
    })),
  logAuditEvent: (action, details, status = 'allowed') => {
    const currentU = get().currentUser;
    const currentR = get().currentRole;
    const entry: SecurityAuditEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      action,
      resourceDetails: details,
      module: 'Security & Access',
      userId: currentU?.id || 'usr-default-1',
      userName: currentU?.fullName || currentR?.title || 'System',
      userRole: currentU?.roleTitle || currentR?.name || 'Operator',
      status,
      ipAddress: '10.0.4.82',
    };
    set((state) => ({
      userAuditLogs: [entry, ...state.userAuditLogs.slice(0, 99)],
    }));
  },

  userProfile: (() => {
    try {
      const saved = localStorage.getItem('vortix_user_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: 'usr-default-1',
      fullName: 'Marcus Vance',
      email: 'mmzzdevs@gmail.com',
      companyName: 'Vortix Manufacturing Corp',
      role: 'VP of Manufacturing & Operations',
      industry: 'Precision Engineering & Robotics',
      isAuthenticated: true,
      onboardingCompleted: true,
      lastLoginAt: 'Today at 08:30 AM',
      createdAt: new Date().toISOString(),
    };
  })(),

  setUserProfile: (profile) =>
    set((state) => ({
      userProfile: typeof profile === 'function' ? profile(state.userProfile) : profile,
    })),

  handleSaveProfile: (profile) => {
    try {
      localStorage.setItem('vortix_user_profile', JSON.stringify(profile));
    } catch {}
    set({ userProfile: profile });
  },

  isLoginPortalOpen: false,
  setIsLoginPortalOpen: (open) => set({ isLoginPortalOpen: open }),
  isAuthModalOpen: false,
  setIsAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
}));
