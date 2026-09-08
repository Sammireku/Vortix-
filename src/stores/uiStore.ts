import { create } from 'zustand';
import { CompanyBranding, ViewTab } from '../types';

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'alert' | 'info' | 'warning';
}

interface UIState {
  activeView: ViewTab;
  setActiveView: (view: ViewTab) => void;

  // Sidebar state
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;

  // Branding
  branding: CompanyBranding;
  setBranding: (branding: CompanyBranding | ((prev: CompanyBranding) => CompanyBranding)) => void;
  handleSaveBranding: (updated: CompanyBranding) => void;

  // Modals
  isAiReportOpen: boolean;
  setIsAiReportOpen: (open: boolean) => void;
  isCreateWorkOrderOpen: boolean;
  setIsCreateWorkOrderOpen: (open: boolean) => void;
  isAddInventoryOpen: boolean;
  setIsAddInventoryOpen: (open: boolean) => void;
  isBarcodeScannerOpen: boolean;
  setIsBarcodeScannerOpen: (open: boolean) => void;
  isPrintLabelOpen: boolean;
  setIsPrintLabelOpen: (open: boolean) => void;
  isBrandingModalOpen: boolean;
  setIsBrandingModalOpen: (open: boolean) => void;
  isProductTourOpen: boolean;
  setIsProductTourOpen: (open: boolean) => void;
  isSubDashboardWizardOpen: boolean;
  setIsSubDashboardWizardOpen: (open: boolean) => void;
  isBatchCsvModalOpen: boolean;
  setIsBatchCsvModalOpen: (open: boolean) => void;
  batchCsvDataType: 'inventory' | 'employee';
  setBatchCsvDataType: (type: 'inventory' | 'employee') => void;

  // Notification Toast
  toast: ToastMessage | null;
  showNotification: (
    title: string,
    message: string,
    type?: 'success' | 'alert' | 'info' | 'warning'
  ) => void;
  clearToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeView: 'custom_dashboards',
  setActiveView: (view) => set({ activeView: view }),

  isSidebarCollapsed: (() => {
    try {
      return localStorage.getItem('vortix_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  })(),
  setIsSidebarCollapsed: (collapsed) =>
    set((state) => {
      const next = typeof collapsed === 'function' ? collapsed(state.isSidebarCollapsed) : collapsed;
      try {
        localStorage.setItem('vortix_sidebar_collapsed', String(next));
      } catch {}
      return { isSidebarCollapsed: next };
    }),

  isMobileSidebarOpen: false,
  setIsMobileSidebarOpen: (open) =>
    set((state) => ({
      isMobileSidebarOpen: typeof open === 'function' ? open(state.isMobileSidebarOpen) : open,
    })),

  toggleSidebar: () =>
    set((state) => {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        return { isMobileSidebarOpen: !state.isMobileSidebarOpen };
      }
      const next = !state.isSidebarCollapsed;
      try {
        localStorage.setItem('vortix_sidebar_collapsed', String(next));
      } catch {}
      return { isSidebarCollapsed: next };
    }),

  branding: (() => {
    try {
      const saved = localStorage.getItem('vortix_branding');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
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
    };
  })(),

  setBranding: (branding) =>
    set((state) => ({
      branding: typeof branding === 'function' ? branding(state.branding) : branding,
    })),

  handleSaveBranding: (updated) => {
    try {
      localStorage.setItem('vortix_branding', JSON.stringify(updated));
    } catch {}
    set({ branding: updated });
  },

  isAiReportOpen: false,
  setIsAiReportOpen: (open) => set({ isAiReportOpen: open }),

  isCreateWorkOrderOpen: false,
  setIsCreateWorkOrderOpen: (open) => set({ isCreateWorkOrderOpen: open }),

  isAddInventoryOpen: false,
  setIsAddInventoryOpen: (open) => set({ isAddInventoryOpen: open }),

  isBarcodeScannerOpen: false,
  setIsBarcodeScannerOpen: (open) => set({ isBarcodeScannerOpen: open }),

  isPrintLabelOpen: false,
  setIsPrintLabelOpen: (open) => set({ isPrintLabelOpen: open }),

  isBrandingModalOpen: false,
  setIsBrandingModalOpen: (open) => set({ isBrandingModalOpen: open }),

  isProductTourOpen: false,
  setIsProductTourOpen: (open) => set({ isProductTourOpen: open }),

  isSubDashboardWizardOpen: false,
  setIsSubDashboardWizardOpen: (open) => set({ isSubDashboardWizardOpen: open }),

  isBatchCsvModalOpen: false,
  setIsBatchCsvModalOpen: (open) => set({ isBatchCsvModalOpen: open }),

  batchCsvDataType: 'inventory',
  setBatchCsvDataType: (type) => set({ batchCsvDataType: type }),

  toast: null,
  showNotification: (title, message, type = 'success') => {
    set({ toast: { id: Date.now().toString(), title, message, type } });
    setTimeout(() => {
      set((state) => {
        // Only clear if matching the current toast timeout
        return state.toast?.title === title ? { toast: null } : {};
      });
    }, 4500);
  },
  clearToast: () => set({ toast: null }),
}));
