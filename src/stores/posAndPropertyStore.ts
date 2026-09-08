import { create } from 'zustand';
import {
  PosProduct,
  PosOrder,
  PropertyUnit,
  PropertyReservation,
  DistributionChannel,
  ChannelSyncEvent,
  SubAccount,
  DatabaseConnection,
  AppConnectorConfig,
  AppConnectorKey,
} from '../types';
import {
  initialPosProducts,
  initialPropertyUnits,
  initialReservations,
  initialChannels,
  initialChannelSyncLogs,
} from '../data/authAndEnterpriseData';
import { initialSubAccounts } from '../data/subAccountsData';
import { initialDatabases } from '../data/databaseData';
import { initialAppConnectors } from '../data/connectorsData';

interface PosAndPropertyState {
  // Point of Sale (POS)
  posProducts: PosProduct[];
  setPosProducts: (products: PosProduct[] | ((prev: PosProduct[]) => PosProduct[])) => void;
  posCompletedOrders: PosOrder[];
  setPosCompletedOrders: (orders: PosOrder[] | ((prev: PosOrder[]) => PosOrder[])) => void;
  handleCompletePosOrder: (order: PosOrder) => void;
  handleRefundPosOrder: (orderId: string) => void;

  // Property Management (PMS)
  propertyUnits: PropertyUnit[];
  setPropertyUnits: (units: PropertyUnit[] | ((prev: PropertyUnit[]) => PropertyUnit[])) => void;
  handleUpdateUnitStatus: (
    unitId: string,
    occupancyStatus: PropertyUnit['occupancyStatus'],
    cleaningStatus?: PropertyUnit['cleaningStatus']
  ) => void;

  propertyReservations: PropertyReservation[];
  setPropertyReservations: (
    reservations: PropertyReservation[] | ((prev: PropertyReservation[]) => PropertyReservation[])
  ) => void;
  handleCheckInReservation: (reservationId: string) => void;
  handleCheckOutReservation: (reservationId: string) => void;

  // OTA Channel Manager (CMS)
  distributionChannels: DistributionChannel[];
  setDistributionChannels: (
    channels: DistributionChannel[] | ((prev: DistributionChannel[]) => DistributionChannel[])
  ) => void;
  handleToggleChannelStatus: (channelId: string) => void;

  channelSyncLogs: ChannelSyncEvent[];
  setChannelSyncLogs: (logs: ChannelSyncEvent[] | ((prev: ChannelSyncEvent[]) => ChannelSyncEvent[])) => void;
  handleTriggerChannelSync: (channelId: string) => void;

  // Enterprise Connectors, Sub-Accounts & Databases
  subAccounts: SubAccount[];
  setSubAccounts: (subs: SubAccount[] | ((prev: SubAccount[]) => SubAccount[])) => void;
  activeViewingSubAccountId: string | null;
  setActiveViewingSubAccountId: (id: string | null) => void;

  customDatabases: DatabaseConnection[];
  setCustomDatabases: (dbs: DatabaseConnection[] | ((prev: DatabaseConnection[]) => DatabaseConnection[])) => void;

  appConnectors: AppConnectorConfig[];
  setAppConnectors: (connectors: AppConnectorConfig[] | ((prev: AppConnectorConfig[]) => AppConnectorConfig[])) => void;
  handleToggleConnector: (connectorId: AppConnectorKey) => void;
}

export const usePosAndPropertyStore = create<PosAndPropertyState>((set) => ({
  posProducts: initialPosProducts,
  setPosProducts: (products) =>
    set((state) => ({
      posProducts: typeof products === 'function' ? products(state.posProducts) : products,
    })),

  posCompletedOrders: [],
  setPosCompletedOrders: (orders) =>
    set((state) => ({
      posCompletedOrders: typeof orders === 'function' ? orders(state.posCompletedOrders) : orders,
    })),
  handleCompletePosOrder: (order) =>
    set((state) => {
      // Deduct inventory from products
      const updatedProducts = state.posProducts.map((p) => {
        const item = order.items.find((i) => i.product.id === p.id);
        if (item) {
          return { ...p, stockQty: Math.max(0, p.stockQty - item.quantity) };
        }
        return p;
      });
      return {
        posCompletedOrders: [order, ...state.posCompletedOrders],
        posProducts: updatedProducts,
      };
    }),
  handleRefundPosOrder: (orderId) =>
    set((state) => ({
      posCompletedOrders: state.posCompletedOrders.map((o) =>
        o.id === orderId ? { ...o, paymentStatus: 'refunded' as const } : o
      ),
    })),

  propertyUnits: initialPropertyUnits,
  setPropertyUnits: (units) =>
    set((state) => ({
      propertyUnits: typeof units === 'function' ? units(state.propertyUnits) : units,
    })),
  handleUpdateUnitStatus: (unitId, occupancyStatus, cleaningStatus) =>
    set((state) => ({
      propertyUnits: state.propertyUnits.map((u) =>
        u.id === unitId ? { ...u, occupancyStatus, ...(cleaningStatus ? { cleaningStatus } : {}) } : u
      ),
    })),

  propertyReservations: initialReservations,
  setPropertyReservations: (reservations) =>
    set((state) => ({
      propertyReservations: typeof reservations === 'function' ? reservations(state.propertyReservations) : reservations,
    })),
  handleCheckInReservation: (reservationId) =>
    set((state) => {
      const res = state.propertyReservations.find((r) => r.id === reservationId);
      const updatedRes = state.propertyReservations.map((r) =>
        r.id === reservationId ? { ...r, status: 'checked_in' as const } : r
      );
      const updatedUnits = state.propertyUnits.map((u) =>
        res && u.id === res.unitId ? { ...u, occupancyStatus: 'occupied' as const } : u
      );
      return { propertyReservations: updatedRes, propertyUnits: updatedUnits };
    }),
  handleCheckOutReservation: (reservationId) =>
    set((state) => {
      const res = state.propertyReservations.find((r) => r.id === reservationId);
      const updatedRes = state.propertyReservations.map((r) =>
        r.id === reservationId ? { ...r, status: 'checked_out' as const } : r
      );
      const updatedUnits = state.propertyUnits.map((u) =>
        res && u.id === res.unitId ? { ...u, occupancyStatus: 'vacant' as const, cleaningStatus: 'dirty' as const } : u
      );
      return { propertyReservations: updatedRes, propertyUnits: updatedUnits };
    }),

  distributionChannels: initialChannels,
  setDistributionChannels: (channels) =>
    set((state) => ({
      distributionChannels: typeof channels === 'function' ? channels(state.distributionChannels) : channels,
    })),
  handleToggleChannelStatus: (channelId) =>
    set((state) => ({
      distributionChannels: state.distributionChannels.map((c) =>
        c.id === channelId ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c
      ),
    })),

  channelSyncLogs: initialChannelSyncLogs,
  setChannelSyncLogs: (logs) =>
    set((state) => ({
      channelSyncLogs: typeof logs === 'function' ? logs(state.channelSyncLogs) : logs,
    })),
  handleTriggerChannelSync: (channelId) =>
    set((state) => {
      const ch = state.distributionChannels.find((c) => c.id === channelId);
      const newLog: ChannelSyncEvent = {
        id: `log-${Date.now()}`,
        channelName: ch?.name || 'Channel',
        eventType: 'rate_push',
        status: 'success',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        details: 'Rates & availability synchronized across 24 units.',
      };
      return {
        channelSyncLogs: [newLog, ...state.channelSyncLogs.slice(0, 49)],
        distributionChannels: state.distributionChannels.map((c) =>
          c.id === channelId ? { ...c, lastSyncedAt: 'Just now' } : c
        ),
      };
    }),

  subAccounts: initialSubAccounts,
  setSubAccounts: (subs) =>
    set((state) => ({
      subAccounts: typeof subs === 'function' ? subs(state.subAccounts) : subs,
    })),
  activeViewingSubAccountId: null,
  setActiveViewingSubAccountId: (id) => set({ activeViewingSubAccountId: id }),

  customDatabases: initialDatabases,
  setCustomDatabases: (dbs) =>
    set((state) => ({
      customDatabases: typeof dbs === 'function' ? dbs(state.customDatabases) : dbs,
    })),

  appConnectors: initialAppConnectors,
  setAppConnectors: (connectors) =>
    set((state) => ({
      appConnectors: typeof connectors === 'function' ? connectors(state.appConnectors) : connectors,
    })),
  handleToggleConnector: (connectorId) =>
    set((state) => ({
      appConnectors: state.appConnectors.map((c) =>
        c.id === connectorId ? { ...c, enabled: !c.enabled } : c
      ),
    })),
}));
