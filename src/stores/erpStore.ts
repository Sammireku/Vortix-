import { create } from 'zustand';
import {
  ProductionLine,
  WorkOrder,
  InventoryItem,
  Shipment,
  SupplierScorecard,
  ProjectTask,
  CrmDeal,
  MarketingCampaign,
  FinanceMetric,
  Invoice,
  JournalEntry,
  ChartOfAccount,
  CustomWorkflow,
  ApiConnector,
  OperationalAlert,
  DigitalTraveler,
  BomNode,
  FloorCell,
  AgvVehicle,
  MaintenanceAsset,
  MaintenanceWorkOrder,
  TaskStatus,
} from '../types';
import {
  initialLines,
  initialWorkOrders,
  initialInventory,
  initialShipments,
  initialSuppliers,
  initialTasks,
  initialDeals,
  initialCampaigns,
  initialFinance,
  initialInvoices,
  initialWorkflows,
  initialConnectors,
  initialAlerts,
  initialTravelers,
  initialMultiLevelBom,
  initialFloorCells,
  initialAgvFleet,
  initialMaintenanceAssets,
  initialMaintenanceOrders,
} from '../data/initialData';
import { initialChartOfAccounts, initialJournalEntries } from '../data/accountingData';

interface ErpState {
  // Manufacturing Lines & Orders
  lines: ProductionLine[];
  setLines: (lines: ProductionLine[] | ((prev: ProductionLine[]) => ProductionLine[])) => void;

  workOrders: WorkOrder[];
  setWorkOrders: (orders: WorkOrder[] | ((prev: WorkOrder[]) => WorkOrder[])) => void;
  handleAddWorkOrder: (order: WorkOrder) => void;
  handleUpdateWorkOrderStatus: (id: string, status: WorkOrder['status']) => void;

  // Inventory & Supply Chain
  inventory: InventoryItem[];
  setInventory: (items: InventoryItem[] | ((prev: InventoryItem[]) => InventoryItem[])) => void;
  handleAddInventory: (item: InventoryItem) => void;
  handleUploadInventoryBatch: (items: InventoryItem[], mode: 'append' | 'update') => void;

  shipments: Shipment[];
  setShipments: (shipments: Shipment[] | ((prev: Shipment[]) => Shipment[])) => void;
  suppliers: SupplierScorecard[];
  setSuppliers: (suppliers: SupplierScorecard[] | ((prev: SupplierScorecard[]) => SupplierScorecard[])) => void;

  // Projects, CRM, Finance
  tasks: ProjectTask[];
  setTasks: (tasks: ProjectTask[] | ((prev: ProjectTask[]) => ProjectTask[])) => void;
  handleAddTask: (task: ProjectTask) => void;
  handleUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;

  deals: CrmDeal[];
  setDeals: (deals: CrmDeal[] | ((prev: CrmDeal[]) => CrmDeal[])) => void;
  campaigns: MarketingCampaign[];
  setCampaigns: (campaigns: MarketingCampaign[] | ((prev: MarketingCampaign[]) => MarketingCampaign[])) => void;

  finance: FinanceMetric;
  setFinance: (finance: FinanceMetric | ((prev: FinanceMetric) => FinanceMetric)) => void;
  invoices: Invoice[];
  setInvoices: (invoices: Invoice[] | ((prev: Invoice[]) => Invoice[])) => void;
  handlePayInvoice: (invoiceId: string) => void;

  journalEntries: JournalEntry[];
  setJournalEntries: (entries: JournalEntry[] | ((prev: JournalEntry[]) => JournalEntry[])) => void;
  chartOfAccounts: ChartOfAccount[];
  setChartOfAccounts: (accounts: ChartOfAccount[] | ((prev: ChartOfAccount[]) => ChartOfAccount[])) => void;

  // Workflows & Connectors
  workflows: CustomWorkflow[];
  setWorkflows: (workflows: CustomWorkflow[] | ((prev: CustomWorkflow[]) => CustomWorkflow[])) => void;
  connectors: ApiConnector[];
  setConnectors: (connectors: ApiConnector[] | ((prev: ApiConnector[]) => ApiConnector[])) => void;

  // Operational & Predictive Maintenance Alerts
  alerts: OperationalAlert[];
  setAlerts: (alerts: OperationalAlert[] | ((prev: OperationalAlert[]) => OperationalAlert[])) => void;
  handleAcknowledgeAlert: (alertId: string) => void;
  handleTriggerSimulatedAlert: () => void;
  handleTriggerPredictiveMaintenanceAlert: (assetName?: string) => void;

  // Digital Traveler & SOP
  travelers: DigitalTraveler[];
  setTravelers: (travelers: DigitalTraveler[] | ((prev: DigitalTraveler[]) => DigitalTraveler[])) => void;
  handleUpdateStep: (
    travelerId: string,
    stepId: string,
    operatorValue: string | number,
    status: 'passed' | 'failed',
    roleTitle?: string
  ) => void;
  handleSignOffTraveler: (travelerId: string, badgeId: string, comments: string, roleTitle?: string) => void;

  // Advanced Shopfloor & Digital Twin
  multiLevelBom: BomNode[];
  setMultiLevelBom: (bom: BomNode[] | ((prev: BomNode[]) => BomNode[])) => void;
  floorCells: FloorCell[];
  setFloorCells: (cells: FloorCell[] | ((prev: FloorCell[]) => FloorCell[])) => void;
  agvFleet: AgvVehicle[];
  setAgvFleet: (fleet: AgvVehicle[] | ((prev: AgvVehicle[]) => AgvVehicle[])) => void;

  // CMMS & Maintenance
  maintenanceAssets: MaintenanceAsset[];
  setMaintenanceAssets: (assets: MaintenanceAsset[] | ((prev: MaintenanceAsset[]) => MaintenanceAsset[])) => void;
  maintenanceOrders: MaintenanceWorkOrder[];
  setMaintenanceOrders: (orders: MaintenanceWorkOrder[] | ((prev: MaintenanceWorkOrder[]) => MaintenanceWorkOrder[])) => void;
  handleCreateMaintenanceOrder: (order: Partial<MaintenanceWorkOrder>) => void;
}

export const useErpStore = create<ErpState>((set, get) => ({
  lines: initialLines,
  setLines: (lines) =>
    set((state) => ({
      lines: typeof lines === 'function' ? lines(state.lines) : lines,
    })),

  workOrders: initialWorkOrders,
  setWorkOrders: (orders) =>
    set((state) => ({
      workOrders: typeof orders === 'function' ? orders(state.workOrders) : orders,
    })),
  handleAddWorkOrder: (order) =>
    set((state) => ({
      workOrders: [order, ...state.workOrders],
    })),
  handleUpdateWorkOrderStatus: (id, status) =>
    set((state) => ({
      workOrders: state.workOrders.map((w) => (w.id === id ? { ...w, status } : w)),
    })),

  inventory: initialInventory,
  setInventory: (items) =>
    set((state) => ({
      inventory: typeof items === 'function' ? items(state.inventory) : items,
    })),
  handleAddInventory: (item) =>
    set((state) => ({
      inventory: [item, ...state.inventory],
    })),
  handleUploadInventoryBatch: (items, mode) =>
    set((state) => {
      if (mode === 'append') {
        return { inventory: [...state.inventory, ...items] };
      }
      const map = new Map<string, InventoryItem>();
      state.inventory.forEach((item) => map.set(item.sku.toLowerCase(), item));
      items.forEach((item) => {
        const key = item.sku.toLowerCase();
        const existing = map.get(key);
        if (existing) {
          map.set(key, { ...existing, ...item, id: existing.id });
        } else {
          map.set(key, item);
        }
      });
      return { inventory: Array.from(map.values()) };
    }),

  shipments: initialShipments,
  setShipments: (shipments) =>
    set((state) => ({
      shipments: typeof shipments === 'function' ? shipments(state.shipments) : shipments,
    })),

  suppliers: initialSuppliers,
  setSuppliers: (suppliers) =>
    set((state) => ({
      suppliers: typeof suppliers === 'function' ? suppliers(state.suppliers) : suppliers,
    })),

  tasks: initialTasks,
  setTasks: (tasks) =>
    set((state) => ({
      tasks: typeof tasks === 'function' ? tasks(state.tasks) : tasks,
    })),
  handleAddTask: (task) =>
    set((state) => ({
      tasks: [task, ...state.tasks],
    })),
  handleUpdateTaskStatus: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
    })),

  deals: initialDeals,
  setDeals: (deals) =>
    set((state) => ({
      deals: typeof deals === 'function' ? deals(state.deals) : deals,
    })),

  campaigns: initialCampaigns,
  setCampaigns: (campaigns) =>
    set((state) => ({
      campaigns: typeof campaigns === 'function' ? campaigns(state.campaigns) : campaigns,
    })),

  finance: initialFinance,
  setFinance: (finance) =>
    set((state) => ({
      finance: typeof finance === 'function' ? finance(state.finance) : finance,
    })),

  invoices: initialInvoices,
  setInvoices: (invoices) =>
    set((state) => ({
      invoices: typeof invoices === 'function' ? invoices(state.invoices) : invoices,
    })),
  handlePayInvoice: (invoiceId) =>
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: 'paid' as const, paidDate: new Date().toISOString().split('T')[0] } : inv
      ),
    })),

  journalEntries: initialJournalEntries,
  setJournalEntries: (entries) =>
    set((state) => ({
      journalEntries: typeof entries === 'function' ? entries(state.journalEntries) : entries,
    })),

  chartOfAccounts: initialChartOfAccounts,
  setChartOfAccounts: (accounts) =>
    set((state) => ({
      chartOfAccounts: typeof accounts === 'function' ? accounts(state.chartOfAccounts) : accounts,
    })),

  workflows: initialWorkflows,
  setWorkflows: (workflows) =>
    set((state) => ({
      workflows: typeof workflows === 'function' ? workflows(state.workflows) : workflows,
    })),

  connectors: initialConnectors,
  setConnectors: (connectors) =>
    set((state) => ({
      connectors: typeof connectors === 'function' ? connectors(state.connectors) : connectors,
    })),

  alerts: initialAlerts,
  setAlerts: (alerts) =>
    set((state) => ({
      alerts: typeof alerts === 'function' ? alerts(state.alerts) : alerts,
    })),
  handleAcknowledgeAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, actionTaken: 'Acknowledged by operator - scheduled check' } : a
      ),
    })),
  handleTriggerSimulatedAlert: () => {
    const newAlert: OperationalAlert = {
      id: `alert-${Date.now()}`,
      type: 'sensor_threshold',
      title: 'CNC Spindle Thermal Anomaly Alert',
      description: 'Spindle bearing temp spiked to 84.6°C (Upper critical limit: 80.0°C). Vibration RMS at 4.2mm/s.',
      timestamp: 'Just now',
      lineOrPart: 'Line 1 - CNC Bay 04',
      severity: 'critical',
      source: 'IoT Edge Vibration Node VX-08',
      healthScore: 61,
      threshold: 80,
    };
    set((state) => ({
      alerts: [newAlert, ...state.alerts],
    }));
  },

  handleTriggerPredictiveMaintenanceAlert: (assetName = 'Main CNC Spindle 04') => {
    const alertId = `pm-alert-${Date.now()}`;
    const newAlert: OperationalAlert = {
      id: alertId,
      type: 'predictive_maintenance',
      title: `Predictive Anomaly: ${assetName}`,
      description: `High-frequency harmonic vibration detected (4.82 mm/s). Model projects bearing failure in 14.2 operating hours if unlubricated.`,
      timestamp: 'Just now',
      lineOrPart: assetName,
      severity: 'warning',
      source: 'Vortix AI Telematics & Predictive Edge Model',
      healthScore: 64,
      threshold: 75,
    };

    // Auto-create a preventative maintenance work order
    const pmOrder: MaintenanceWorkOrder = {
      id: `mwo-auto-${Date.now()}`,
      assetId: 'ast-01',
      assetName,
      type: 'preventative',
      priority: 'high',
      status: 'scheduled',
      title: `Urgent Bearing Inspection & Lubrication - ${assetName}`,
      description: `Automated order generated by Predictive Maintenance model: vibration harmonic 4.82 mm/s. Inspect bearings and replenish synthetic lubricant.`,
      assignedTechnician: 'Sarah Jenkins (Master Tech)',
      scheduledDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
      estimatedHours: 2.5,
      actualHours: 0,
      tasks: [
        { id: 't1', description: 'Inspect high-speed spindle bearings', completed: false },
        { id: 't2', description: 'Apply Klüberplex synthetic grease lubricant', completed: false },
      ],
      spareParts: [
        { partName: 'SKF 6205 High-Speed Bearing', quantity: 1, cost: 180 },
        { partName: 'Klüberplex Synthetic Grease', quantity: 1, cost: 45 },
      ],
      totalCost: 225,
    };

    set((state) => ({
      alerts: [newAlert, ...state.alerts],
      maintenanceOrders: [pmOrder, ...state.maintenanceOrders],
    }));
  },

  travelers: initialTravelers,
  setTravelers: (travelers) =>
    set((state) => ({
      travelers: typeof travelers === 'function' ? travelers(state.travelers) : travelers,
    })),
  handleUpdateStep: (travelerId, stepId, operatorValue, status, roleTitle = 'Quality Engineer') => {
    set((state) => ({
      travelers: state.travelers.map((t) => {
        if (t.id !== travelerId) return t;
        const updatedSteps = t.steps.map((s) => {
          if (s.id !== stepId) return s;
          return {
            ...s,
            operatorValue,
            status,
            isCompleted: true,
            signOffBy: roleTitle,
            signOffTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        });
        return {
          ...t,
          steps: updatedSteps,
          status: status === 'failed' ? ('quality_quarantine' as const) : t.status,
        };
      }),
    }));
  },

  handleSignOffTraveler: (travelerId, badgeId, comments, roleTitle = 'Quality Engineer') => {
    set((state) => ({
      travelers: state.travelers.map((t) =>
        t.id === travelerId
          ? {
              ...t,
              status: 'approved' as const,
              completedAt: new Date().toISOString(),
              inspectionSignOff: {
                signedBy: `${roleTitle} (${badgeId})`,
                badgeId,
                timestamp: new Date().toLocaleString(),
                signatureHash: `SIG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                comments,
              },
            }
          : t
      ),
    }));
  },

  multiLevelBom: initialMultiLevelBom,
  setMultiLevelBom: (bom) =>
    set((state) => ({
      multiLevelBom: typeof bom === 'function' ? bom(state.multiLevelBom) : bom,
    })),

  floorCells: initialFloorCells,
  setFloorCells: (cells) =>
    set((state) => ({
      floorCells: typeof cells === 'function' ? cells(state.floorCells) : cells,
    })),

  agvFleet: initialAgvFleet,
  setAgvFleet: (fleet) =>
    set((state) => ({
      agvFleet: typeof fleet === 'function' ? fleet(state.agvFleet) : fleet,
    })),

  maintenanceAssets: initialMaintenanceAssets,
  setMaintenanceAssets: (assets) =>
    set((state) => ({
      maintenanceAssets: typeof assets === 'function' ? assets(state.maintenanceAssets) : assets,
    })),

  maintenanceOrders: initialMaintenanceOrders,
  setMaintenanceOrders: (orders) =>
    set((state) => ({
      maintenanceOrders: typeof orders === 'function' ? orders(state.maintenanceOrders) : orders,
    })),
  handleCreateMaintenanceOrder: (order) => {
    const newOrder: MaintenanceWorkOrder = {
      id: order.id || `mwo-${Date.now()}`,
      assetId: order.assetId || 'ast-01',
      assetName: order.assetName || 'Industrial Asset',
      type: order.type || 'corrective',
      priority: order.priority || 'medium',
      status: 'scheduled',
      title: order.title || 'Scheduled Work Order',
      description: order.description || 'Maintenance action assigned.',
      assignedTechnician: order.assignedTechnician || 'Lead Technician',
      scheduledDate: order.scheduledDate || new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0],
      estimatedHours: order.estimatedHours || 2,
      actualHours: order.actualHours || 0,
      tasks: order.tasks || [{ id: 't1', description: 'Perform scheduled inspection', completed: false }],
      spareParts: order.spareParts || [],
      totalCost: order.totalCost || 0,
    };
    set((state) => ({
      maintenanceOrders: [newOrder, ...state.maintenanceOrders],
    }));
  },
}));
