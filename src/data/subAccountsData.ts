import { SubAccount } from '../types';

export const initialSubAccounts: SubAccount[] = [
  {
    id: 'sub-dallas',
    code: 'SUB-DAL',
    name: 'Dallas Aerospace Machining Center',
    entityType: 'Subsidiary Plant',
    region: 'North America (US South)',
    location: 'Fort Worth, Texas, USA',
    managerName: 'Col. Marcus Vance',
    managerEmail: 'm.vance@mfgcorp.com',
    status: 'active',
    enabledFeatures: {
      production: true,
      crm_marketing: true,
      inventory: true,
      finance: true,
      supply_chain: true,
      maintenance: true,
      projects: true,
    },
    metricsFeed: {
      monthlyRevenue: 1850000,
      activeWorkOrders: 18,
      averageOee: 84.6,
      inventoryValue: 2420000,
      openDealsCount: 14,
      dealPipelineValue: 4200000,
      activeIncidents: 1,
      employeeCount: 145,
      onTimeFulfillmentRate: 96.2,
    },
    lastDataSync: '1 min ago',
    activeUsersCount: 38,
    createdAt: '2024-03-15',
  },
  {
    id: 'sub-munich',
    code: 'SUB-MUC',
    name: 'Munich Precision Automotive Hub',
    entityType: 'Regional Division',
    region: 'Europe (DACH)',
    location: 'Munich, Bavaria, Germany',
    managerName: 'Ingrid Schneider',
    managerEmail: 'i.schneider@mfgcorp.de',
    status: 'active',
    enabledFeatures: {
      production: true,
      crm_marketing: false, // CRM handled by Master Headquarters
      inventory: true,
      finance: true,
      supply_chain: true,
      maintenance: true,
      projects: true,
    },
    metricsFeed: {
      monthlyRevenue: 2450000,
      activeWorkOrders: 26,
      averageOee: 88.2,
      inventoryValue: 3150000,
      openDealsCount: 9,
      dealPipelineValue: 3800000,
      activeIncidents: 0,
      employeeCount: 210,
      onTimeFulfillmentRate: 97.8,
    },
    lastDataSync: '3 mins ago',
    activeUsersCount: 52,
    createdAt: '2024-01-20',
  },
  {
    id: 'sub-tokyo',
    code: 'SUB-TYO',
    name: 'Tokyo Cleanroom SMT Electronics Branch',
    entityType: 'Subsidiary Plant',
    region: 'Asia Pacific (Japan)',
    location: 'Yokohama Tech Valley, Japan',
    managerName: 'Kenji Takahashi',
    managerEmail: 'k.takahashi@mfgcorp.jp',
    status: 'active',
    enabledFeatures: {
      production: true,
      crm_marketing: true,
      inventory: true,
      finance: false, // Local bookkeeping rolled up to Master Treasury
      supply_chain: true,
      maintenance: true,
      projects: true,
    },
    metricsFeed: {
      monthlyRevenue: 1320000,
      activeWorkOrders: 15,
      averageOee: 81.4,
      inventoryValue: 1890000,
      openDealsCount: 11,
      dealPipelineValue: 2750000,
      activeIncidents: 2,
      employeeCount: 95,
      onTimeFulfillmentRate: 93.5,
    },
    lastDataSync: 'Just now',
    activeUsersCount: 29,
    createdAt: '2024-06-10',
  },
  {
    id: 'sub-london',
    code: 'SUB-LON',
    name: 'London Logistics & Distribution Partner',
    entityType: 'OEM Partner',
    region: 'UK & Western Europe',
    location: 'Heathrow Cargo Hub, London, UK',
    managerName: 'Arthur Pendelton',
    managerEmail: 'a.pendelton@mfgcorp.co.uk',
    status: 'active',
    enabledFeatures: {
      production: false, // Logistics and warehousing only
      crm_marketing: false,
      inventory: true,
      finance: true,
      supply_chain: true,
      maintenance: false,
      projects: true,
    },
    metricsFeed: {
      monthlyRevenue: 620000,
      activeWorkOrders: 4,
      averageOee: 92.0,
      inventoryValue: 1420000,
      openDealsCount: 3,
      dealPipelineValue: 850000,
      activeIncidents: 0,
      employeeCount: 42,
      onTimeFulfillmentRate: 98.4,
    },
    lastDataSync: '5 mins ago',
    activeUsersCount: 16,
    createdAt: '2024-08-01',
  },
];

export interface MasterRollupStats {
  totalRevenue: number;
  totalWorkOrders: number;
  weightedOee: number;
  totalInventoryValue: number;
  totalPipelineValue: number;
  totalEmployees: number;
  activeSubAccountsCount: number;
  aggregateIncidents: number;
  avgFulfillmentRate: number;
}

export function calculateMasterRollup(subs: SubAccount[]): MasterRollupStats {
  const activeSubs = subs.filter((s) => s.status === 'active');
  const totalRevenue = activeSubs.reduce((acc, s) => acc + s.metricsFeed.monthlyRevenue, 0);
  const totalWorkOrders = activeSubs.reduce((acc, s) => acc + s.metricsFeed.activeWorkOrders, 0);
  const totalEmployees = activeSubs.reduce((acc, s) => acc + s.metricsFeed.employeeCount, 0);
  const totalInventoryValue = activeSubs.reduce((acc, s) => acc + s.metricsFeed.inventoryValue, 0);
  const totalPipelineValue = activeSubs.reduce((acc, s) => acc + s.metricsFeed.dealPipelineValue, 0);
  const aggregateIncidents = activeSubs.reduce((acc, s) => acc + s.metricsFeed.activeIncidents, 0);
  
  const weightedOee = activeSubs.length > 0
    ? Math.round(activeSubs.reduce((acc, s) => acc + s.metricsFeed.averageOee, 0) / activeSubs.length * 10) / 10
    : 0;

  const avgFulfillmentRate = activeSubs.length > 0
    ? Math.round(activeSubs.reduce((acc, s) => acc + s.metricsFeed.onTimeFulfillmentRate, 0) / activeSubs.length * 10) / 10
    : 0;

  return {
    totalRevenue,
    totalWorkOrders,
    weightedOee,
    totalInventoryValue,
    totalPipelineValue,
    totalEmployees,
    activeSubAccountsCount: activeSubs.length,
    aggregateIncidents,
    avgFulfillmentRate,
  };
}
