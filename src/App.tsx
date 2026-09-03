import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { ProductionErpView } from './components/views/ProductionErpView';
import { SupplyChainView } from './components/views/SupplyChainView';
import { InventoryView } from './components/views/InventoryView';
import { ProjectsTasksView } from './components/views/ProjectsTasksView';
import { CrmMarketingView } from './components/views/CrmMarketingView';
import { FinanceView } from './components/views/FinanceView';
import { WorkflowBuilderView } from './components/views/WorkflowBuilderView';
import { IntegrationsView } from './components/views/IntegrationsView';
import { DigitalTravelerView } from './components/views/DigitalTravelerView';
import { BomMrpView } from './components/views/BomMrpView';
import { DigitalTwinView } from './components/views/DigitalTwinView';
import { MaintenanceCmmsView } from './components/views/MaintenanceCmmsView';
import { CustomDashboardBuilderView } from './components/views/CustomDashboardBuilderView';
import { SubAccountsView } from './components/views/SubAccountsView';
import { DatabaseHubView } from './components/views/DatabaseHubView';
import { HumanResourcesView } from './components/views/HumanResourcesView';
import { FleetManagementView } from './components/views/FleetManagementView';
import { Footer } from './components/Footer';
import { AiReportModal } from './components/modals/AiReportModal';
import { CreateWorkOrderModal } from './components/modals/CreateWorkOrderModal';
import { AddInventoryModal } from './components/modals/AddInventoryModal';
import { BarcodeScannerModal } from './components/modals/BarcodeScannerModal';
import { PrintLabelModal } from './components/modals/PrintLabelModal';
import { BrandingSettingsModal } from './components/modals/BrandingSettingsModal';
import { ProductTourModal } from './components/modals/ProductTourModal';
import { SubDashboardSetupWizardModal } from './components/modals/SubDashboardSetupWizardModal';
import { AuthOnboardingModal } from './components/modals/AuthOnboardingModal';

import {
  initialRoles,
  initialFacilities,
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
  initialBom,
  initialTravelers,
  initialMultiLevelBom,
  initialFloorCells,
  initialAgvFleet,
  initialMaintenanceAssets,
  initialMaintenanceOrders,
} from './data/initialData';
import { initialChartOfAccounts, initialJournalEntries } from './data/accountingData';
import { initialAppConnectors } from './data/connectorsData';
import { initialSubAccounts } from './data/subAccountsData';
import { initialDatabases } from './data/databaseData';
import {
  initialEmployees,
  initialAttendanceRecords,
  initialFleetVehicles,
  initialFleetMissions,
} from './data/hrAndFleetData';

import {
  RoleDefinition,
  Facility,
  ProductionLine,
  WorkOrder,
  InventoryItem,
  Shipment,
  SupplierScorecard,
  ProjectTask,
  TaskStatus,
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
  MrpRequirement,
  ViewTab,
  AppConnectorConfig,
  AppConnectorKey,
  SubAccount,
  DatabaseConnection,
  CompanyBranding,
  UserProfile,
  Employee,
  HrAttendanceRecord,
  FleetVehicle,
  FleetMission,
  CustomDashboard,
} from './types';
import { CheckCircle2, AlertTriangle, Zap, X } from 'lucide-react';

export default function App() {
  // Navigation & Role State
  const [currentRole, setCurrentRole] = useState<RoleDefinition>(initialRoles[0]);
  const [activeFacility, setActiveFacility] = useState<Facility>(initialFacilities[0]);
  const [activeView, setActiveView] = useState<string>('custom_dashboards');

  // Manufacturing ERP State
  const [lines, setLines] = useState<ProductionLine[]>(initialLines);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
  const [suppliers, setSuppliers] = useState<SupplierScorecard[]>(initialSuppliers);
  const [tasks, setTasks] = useState<ProjectTask[]>(initialTasks);
  const [deals, setDeals] = useState<CrmDeal[]>(initialDeals);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(initialCampaigns);
  const [finance, setFinance] = useState<FinanceMetric>(initialFinance);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(initialJournalEntries);
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>(initialChartOfAccounts);
  const [workflows, setWorkflows] = useState<CustomWorkflow[]>(initialWorkflows);
  const [connectors, setConnectors] = useState<ApiConnector[]>(initialConnectors);
  const [alerts, setAlerts] = useState<OperationalAlert[]>(initialAlerts);

  // New Platform Capabilities State
  const [travelers, setTravelers] = useState<DigitalTraveler[]>(initialTravelers);
  const [multiLevelBom, setMultiLevelBom] = useState<BomNode[]>(initialMultiLevelBom);
  const [floorCells, setFloorCells] = useState<FloorCell[]>(initialFloorCells);
  const [agvFleet, setAgvFleet] = useState<AgvVehicle[]>(initialAgvFleet);
  const [maintenanceAssets, setMaintenanceAssets] = useState<MaintenanceAsset[]>(initialMaintenanceAssets);
  const [maintenanceOrders, setMaintenanceOrders] = useState<MaintenanceWorkOrder[]>(initialMaintenanceOrders);

  // Enterprise Connectors, Sub-Accounts & External DB State
  const [appConnectors, setAppConnectors] = useState<AppConnectorConfig[]>(initialAppConnectors);
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>(initialSubAccounts);
  const [activeViewingSubAccountId, setActiveViewingSubAccountId] = useState<string | null>(null);
  const [customDatabases, setCustomDatabases] = useState<DatabaseConnection[]>(initialDatabases);

  // Workforce HR & Fleet Robotics State
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [attendanceRecords, setAttendanceRecords] = useState<HrAttendanceRecord[]>(initialAttendanceRecords);
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>(initialFleetVehicles);
  const [fleetMissions, setFleetMissions] = useState<FleetMission[]>(initialFleetMissions);

  // Company Branding & White-Labeling State
  const [branding, setBranding] = useState<CompanyBranding>(() => {
    try {
      const saved = localStorage.getItem('vortix_branding');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
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
  });

  // User Profile & Onboarding State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('vortix_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
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
  });

  // Modals
  const [isAiReportOpen, setIsAiReportOpen] = useState(false);
  const [isCreateWorkOrderOpen, setIsCreateWorkOrderOpen] = useState(false);
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isPrintLabelOpen, setIsPrintLabelOpen] = useState(false);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [isProductTourOpen, setIsProductTourOpen] = useState(false);
  const [isSubDashboardWizardOpen, setIsSubDashboardWizardOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Handlers for Branding, Profile, HR, Fleet
  const handleSaveBranding = (updated: CompanyBranding) => {
    setBranding(updated);
    try {
      localStorage.setItem('vortix_branding', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
    showNotification('Branding Updated', `Applied "${updated.companyName}" with custom theme colors.`);
  };

  const handleSaveProfile = (profile: UserProfile, brandingUpdates?: Partial<CompanyBranding>) => {
    setUserProfile(profile);
    try {
      localStorage.setItem('vortix_user_profile', JSON.stringify(profile));
    } catch (e) {
      // ignore
    }
    if (brandingUpdates) {
      setBranding((prev) => {
        const next = { ...prev, ...brandingUpdates };
        try {
          localStorage.setItem('vortix_branding', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
    }
    showNotification('Profile Saved', `Welcome back, ${profile.fullName}!`);
  };

  const handleAddEmployee = (emp: Employee) => {
    setEmployees((prev) => [emp, ...prev]);
  };

  const handleUpdateEmployeeStatus = (id: string, status: Employee['status']) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  };

  const handleDispatchFleetMission = (mission: FleetMission) => {
    setFleetMissions((prev) => [mission, ...prev]);
  };

  const handleUpdateVehicleStatus = (vehicleId: string, status: FleetVehicle['status']) => {
    setFleetVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, status } : v))
    );
  };

  const handleSubDashboardCreated = (newDash: CustomDashboard) => {
    // Notify user and navigate to custom dashboards view
    showNotification('Sub-Dashboard Deployed', `"${newDash.name}" created with ${newDash.widgets.length} operational tools.`);
    setActiveView('custom_dashboards');
  };

  // Notification Toast
  const [toast, setToast] = useState<{ id: string; title: string; message: string; type: 'success' | 'alert' } | null>(
    null
  );

  const showNotification = (title: string, message: string, type: 'success' | 'alert' = 'success') => {
    setToast({ id: Date.now().toString(), title, message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Digital Traveler & SOP Handlers
  const handleUpdateStep = (
    travelerId: string,
    stepId: string,
    operatorValue: string | number,
    status: 'passed' | 'failed'
  ) => {
    setTravelers((prev) =>
      prev.map((t) => {
        if (t.id !== travelerId) return t;
        const updatedSteps = t.steps.map((s) => {
          if (s.id !== stepId) return s;
          return {
            ...s,
            operatorValue,
            status,
            isCompleted: true,
            signOffBy: currentRole.title,
            signOffTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        });
        return {
          ...t,
          steps: updatedSteps,
          status: status === 'failed' ? 'quality_quarantine' : t.status,
        };
      })
    );

    showNotification(
      status === 'passed' ? 'Step Verified & Saved' : 'Step Failed Tolerance Check',
      `Value recorded: ${operatorValue}. Step status: ${status.toUpperCase()}`,
      status === 'passed' ? 'success' : 'alert'
    );
  };

  const handleSignOffTraveler = (travelerId: string, badgeId: string, comments: string) => {
    setTravelers((prev) =>
      prev.map((t) =>
        t.id === travelerId
          ? {
              ...t,
              status: 'approved',
              inspectionSignOff: {
                signedBy: `${currentRole.title} (${badgeId})`,
                timestamp: new Date().toLocaleString(),
                signatureHash: `SIG-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                comments,
              },
            }
          : t
      )
    );
    showNotification(
      'Digital QA Sign-Off Complete',
      `Traveler signed and batch released by ${currentRole.title} (${badgeId}).`
    );
  };

  const handleEscalateIssue = (travelerId: string, reason: string) => {
    setTravelers((prev) =>
      prev.map((t) => (t.id === travelerId ? { ...t, status: 'quality_quarantine' } : t))
    );
    showNotification(
      'Line Hold & Quarantine Escalated',
      `Stoppage triggered: "${reason}". Quality Lead dispatched.`,
      'alert'
    );
  };

  // MRP Auto-Procurement PO Handler
  const handleDraftPurchaseOrder = (mrpItem: MrpRequirement) => {
    // Add shortage quantity to on-order
    setInventory((prev) =>
      prev.map((item) =>
        item.sku === mrpItem.sku
          ? { ...item, onOrder: (item.onOrder || 0) + mrpItem.netShortage }
          : item
      )
    );
    showNotification(
      'Purchase Order Created',
      `Drafted PO for ${mrpItem.netShortage} ${mrpItem.unit} of ${mrpItem.name} with ${mrpItem.supplier}. Total: $${mrpItem.estimatedCost.toFixed(2)}`
    );
  };

  // Maintenance Handlers
  const handleToggleMaintenanceTask = (workOrderId: string, taskId: string) => {
    setMaintenanceOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== workOrderId) return wo;
        return {
          ...wo,
          tasks: wo.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
        };
      })
    );
  };

  const handleCompleteMaintenanceOrder = (workOrderId: string) => {
    setMaintenanceOrders((prev) =>
      prev.map((wo) => (wo.id === workOrderId ? { ...wo, status: 'completed' } : wo))
    );
    showNotification(
      'Maintenance Work Order Completed',
      `All checklist tasks executed and machine returned to operational status.`
    );
  };

  const handleCreateMaintenanceOrder = (order: Partial<MaintenanceWorkOrder>) => {
    const fullOrder: MaintenanceWorkOrder = {
      id: order.id || `pm-${Date.now()}`,
      assetId: order.assetId || 'asset-01',
      assetName: order.assetName || 'Equipment Asset',
      title: order.title || 'Scheduled PM',
      type: order.type || 'preventative',
      priority: order.priority || 'medium',
      scheduledDate: order.scheduledDate || new Date().toISOString().split('T')[0],
      assignedTechnician: order.assignedTechnician || 'Dave Miller',
      status: 'scheduled',
      estimatedHours: order.estimatedHours || 2.0,
      description: order.description || '',
      tasks: order.tasks || [],
      spareParts: order.spareParts || [],
      totalCost: order.totalCost || 0,
    };
    setMaintenanceOrders((prev) => [fullOrder, ...prev]);
    showNotification(
      'Preventative Work Order Scheduled',
      `${fullOrder.title} assigned to ${fullOrder.assignedTechnician}.`
    );
  };

  const handleEmergencyStopBay = (bayName: string) => {
    showNotification(
      'Bay Safety Throttle Applied',
      `Interlocks engaged for ${bayName}. Spindle feeds throttled to 10% crawl speed.`,
      'alert'
    );
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
    showNotification('Alert Acknowledged', 'Operational alert marked as reviewed.');
  };

  // 1. Line Status Update
  const handleUpdateLineStatus = (lineId: string, newStatus: ProductionLine['status']) => {
    setLines((prev) =>
      prev.map((l) => (l.id === lineId ? { ...l, status: newStatus } : l))
    );
    showNotification(
      'Machine Line State Changed',
      `Line status updated to ${(newStatus || '').toUpperCase()}`
    );
  };

  // 2. Work Order Status & Creation
  const handleUpdateWorkOrderStatus = (orderId: string, newStatus: WorkOrder['status']) => {
    setWorkOrders((prev) =>
      prev.map((wo) => (wo.id === orderId ? { ...wo, status: newStatus } : wo))
    );
    showNotification('Work Order Updated', `Order status changed to ${(newStatus || '').replace('_', ' ').toUpperCase()}`);
  };

  const handleCreateWorkOrder = (newOrder: WorkOrder) => {
    setWorkOrders((prev) => [newOrder, ...prev]);
    showNotification('Work Order Created', `Scheduled ${newOrder.orderNumber} for ${newOrder.productName}`);
  };

  // 3. Inventory Restock & Reorder Workflow
  const handleRestockItem = (itemId: string, quantityToAdd: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQty = item.quantityOnHand + quantityToAdd;
          return {
            ...item,
            quantityOnHand: newQty,
            status: newQty <= item.minSafetyStock ? 'low_stock' : 'optimal',
            lastRestocked: new Date().toISOString().split('T')[0],
          };
        }
        return item;
      })
    );
    showNotification('Stock Received', `Added ${quantityToAdd} units to inventory ledger.`);
  };

  const handleTriggerReorderWorkflow = (item: InventoryItem) => {
    // Increment workflow execution count for PO workflow
    setWorkflows((prev) =>
      prev.map((wf) =>
        wf.id === 'wf-01'
          ? { ...wf, executionCount: wf.executionCount + 1, lastRun: 'Just now' }
          : wf
      )
    );
    showNotification(
      'Low-Code Workflow Fired: wf-01',
      `Auto Purchase Order PO-${Math.floor(1000 + Math.random() * 9000)} generated for ${item.supplier} for item ${item.name}.`,
      'success'
    );
  };

  const handleAddInventoryItem = (newItem: InventoryItem) => {
    setInventory((prev) => [newItem, ...prev]);
    showNotification('Inventory Added', `Stock item ${newItem.sku} registered in ${newItem.warehouseLocation}`);
  };

  // 4. Supply Chain Tracking & Customs Simulation
  const handleRefreshTracking = () => {
    showNotification('Carrier Telemetry Refreshed', 'Polled Maersk Ocean & DHL GPS satellites.');
  };

  const handleSimulateCustomsClearance = (shipmentId: string) => {
    setShipments((prev) =>
      prev.map((s) =>
        s.id === shipmentId
          ? {
              ...s,
              status: 'in_transit',
              riskFactor: 'low',
              riskReason: undefined,
              currentLocation: 'Cleared Customs Port of Long Beach -> Highway I-710 North',
            }
          : s
      )
    );
    showNotification('Customs Cleared', 'Shipment released from customs inspection bay.');
  };

  // 5. Engineering Project Tasks (Kanban)
  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    showNotification('Task Moved', `Engineering task advanced to ${newStatus.replace('_', ' ')}`);
  };

  const handleAddTask = (newTaskData: Omit<ProjectTask, 'id'>) => {
    const newTask: ProjectTask = {
      ...newTaskData,
      id: `task-${Date.now().toString().slice(-4)}`,
    };
    setTasks((prev) => [newTask, ...prev]);
    showNotification('Task Created', `Added "${newTask.title}" to engineering backlog.`);
  };

  // 6. CRM & Marketing
  const handleAdvanceDealStage = (dealId: string) => {
    const stages: CrmDeal['stage'][] = [
      'lead',
      'rfq_review',
      'sample_prototyping',
      'negotiation',
      'won_contract',
    ];
    setDeals((prev) =>
      prev.map((deal) => {
        if (deal.id === dealId) {
          const currentIndex = stages.indexOf(deal.stage);
          const nextIndex = Math.min(stages.length - 1, currentIndex + 1);
          const nextStage = stages[nextIndex];
          const newProb = Math.min(100, deal.probability + 25);
          return { ...deal, stage: nextStage, probability: nextStage === 'won_contract' ? 100 : newProb };
        }
        return deal;
      })
    );
    showNotification('CRM Pipeline Advanced', 'Deal progressed to next sales stage.');
  };

  const handleConvertDealToWorkOrder = (deal: CrmDeal) => {
    const newWo: WorkOrder = {
      id: `wo-${Date.now().toString().slice(-4)}`,
      orderNumber: `WO-OEM-${Math.floor(1000 + Math.random() * 9000)}`,
      productName: `${deal.productCategory} Production Run`,
      sku: `OEM-${(deal?.companyName || 'OEM').slice(0, 3).toUpperCase()}-01`,
      batchNumber: `LOT-2026-N${Math.floor(10 + Math.random() * 90)}`,
      customer: deal.companyName,
      assignedLineId: 'line-1',
      quantityOrdered: deal.estimatedUnits,
      quantityProduced: 0,
      scrappedUnits: 0,
      status: 'scheduled',
      priority: 'high',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: '2026-10-15',
      unitCostTarget: deal.dealValue / deal.estimatedUnits,
      actualUnitCost: (deal.dealValue / deal.estimatedUnits) * 0.94,
      billOfMaterialsId: 'bom-01',
    };
    setWorkOrders((prev) => [newWo, ...prev]);
    showNotification('Deal Converted to ERP Work Order', `Generated ${newWo.orderNumber} for ${deal.companyName}`);
    setActiveView('production');
  };

  // 7. Finance & Accounting
  const handlePayInvoice = (invoiceId: string) => {
    const targetInv = invoices.find((inv) => inv.id === invoiceId);
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'paid' } : inv))
    );

    if (targetInv) {
      // Auto-post settlement entry to General Ledger
      const isReceivable = targetInv.type === 'receivable';
      const jeNumber = `JE-PAY-${Date.now().toString().slice(-4)}`;
      const settlementJE: JournalEntry = {
        id: `je-settle-${Date.now()}`,
        entryNumber: jeNumber,
        date: new Date().toISOString().split('T')[0],
        referenceDoc: targetInv.invoiceNumber,
        description: `Cash settlement for ${isReceivable ? 'Customer Receipt' : 'Supplier Payment'} - ${targetInv.counterparty}`,
        postedBy: currentRole.title,
        status: 'posted',
        lines: isReceivable
          ? [
              { id: 'l1', accountCode: '1010', accountName: 'Operating Cash & Bank', debit: targetInv.amount, credit: 0 },
              { id: 'l2', accountCode: '1110', accountName: 'Accounts Receivable', debit: 0, credit: targetInv.amount },
            ]
          : [
              { id: 'l1', accountCode: '2010', accountName: 'Accounts Payable', debit: targetInv.amount, credit: 0 },
              { id: 'l2', accountCode: '1010', accountName: 'Operating Cash & Bank', debit: 0, credit: targetInv.amount },
            ],
      };
      setJournalEntries((prev) => [settlementJE, ...prev]);
    }

    showNotification('Invoice Settled & GL Updated', 'Cash settlement journal entry balanced.');
  };

  const handleAddInvoice = (newInv: Invoice) => {
    setInvoices((prev) => [newInv, ...prev]);
    // Auto-generate balanced double-entry General Ledger posting
    const jeNum = `JE-INV-${Date.now().toString().slice(-4)}`;
    const isReceivable = newInv.type === 'receivable';
    const accrualJE: JournalEntry = {
      id: `je-inv-${Date.now()}`,
      entryNumber: jeNum,
      date: new Date().toISOString().split('T')[0],
      referenceDoc: newInv.invoiceNumber,
      description: `Accrual for ${isReceivable ? 'Customer Contract' : 'Vendor Sourcing'} - ${newInv.counterparty}`,
      postedBy: currentRole.title,
      status: 'posted',
      lines: isReceivable
        ? [
            { id: 'l1', accountCode: '1110', accountName: 'Accounts Receivable', debit: newInv.amount, credit: 0 },
            { id: 'l2', accountCode: '4010', accountName: 'Manufacturing Contract Revenue', debit: 0, credit: newInv.amount },
          ]
        : [
            { id: 'l1', accountCode: '1210', accountName: 'Raw Materials Inventory', debit: newInv.amount, credit: 0 },
            { id: 'l2', accountCode: '2010', accountName: 'Accounts Payable', debit: 0, credit: newInv.amount },
          ],
    };
    setJournalEntries((prev) => [accrualJE, ...prev]);
    showNotification('Invoice Issued', `${newInv.invoiceNumber} recorded and posted to General Ledger.`);
  };

  const handleAddJournalEntry = (entry: JournalEntry) => {
    setJournalEntries((prev) => [entry, ...prev]);
    showNotification('Journal Entry Posted', `${entry.entryNumber} balanced and posted.`);
  };

  const handleAddDeal = (deal: CrmDeal) => {
    setDeals((prev) => [deal, ...prev]);
    showNotification('New OEM RFQ Registered', `${deal.companyName} ($${deal.dealValue.toLocaleString()}) added.`);
  };

  const handleAddCampaign = (campaign: MarketingCampaign) => {
    setCampaigns((prev) => [campaign, ...prev]);
    showNotification('Campaign Launched', `${campaign.name} is now active.`);
  };

  const handleExportCsv = () => {
    const headers = 'InvoiceNumber,Type,Counterparty,Amount,DueDate,Status\n';
    const rows = invoices
      .map(
        (i) => `${i.invoiceNumber},${i.type},"${i.counterparty}",${i.amount},${i.dueDate},${i.status}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `factory_finance_ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showNotification('Export Successful', 'Financial CSV ledger downloaded.');
  };

  // 8. Low-Code Workflows
  const handleToggleWorkflow = (workflowId: string) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === workflowId ? { ...w, enabled: !w.enabled } : w))
    );
    showNotification('Workflow Configuration Updated', 'Workflow activation state changed.');
  };

  const handleRunWorkflowSimulation = (workflow: CustomWorkflow) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === workflow.id
          ? { ...w, executionCount: w.executionCount + 1, lastRun: 'Just now' }
          : w
      )
    );
    showNotification('Workflow Simulation Completed', `${workflow.name} ran with status 200 OK.`);
  };

  const handleAddWorkflow = (newWf: CustomWorkflow) => {
    setWorkflows((prev) => [...prev, newWf]);
    showNotification('Workflow Created', `Low-code workflow "${newWf.name}" ready on canvas.`);
  };

  // 9. API Integrations & Webhook Dispatch
  const handleTestWebhook = async (connector: ApiConnector) => {
    try {
      const res = await fetch('/api/integrations/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectorId: connector.id,
          name: connector.name,
          endpointUrl: connector.endpointUrl,
          payload: {
            timestamp: new Date().toISOString(),
            facility: activeFacility.name,
            status: 'heartbeat_check',
          },
        }),
      });
      const data = await res.json();
      showNotification('Webhook Dispatched', `${connector.name} responded with status 200.`);
      return { success: true, message: data.message || 'Webhook processed successfully' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Webhook connection error' };
    }
  };

  // Enterprise Connectors & Sub-Accounts Handlers
  const handleToggleAppConnector = (id: AppConnectorKey) => {
    setAppConnectors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
    const conn = appConnectors.find((c) => c.id === id);
    showNotification(
      conn?.enabled ? `${conn.name} Disconnected` : `${conn?.name} Connected`,
      conn?.enabled
        ? 'Data synchronization paused for this application.'
        : 'Bi-directional real-time data sync active.'
    );
  };

  const handleSyncAppConnector = (id: AppConnectorKey) => {
    setAppConnectors((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              lastSyncTimestamp: 'Just now',
              recordsSyncedCount: c.recordsSyncedCount + Math.floor(Math.random() * 60) + 12,
            }
          : c
      )
    );
    const conn = appConnectors.find((c) => c.id === id);
    showNotification('Sync Completed', `Synchronized latest records from ${conn?.name}.`);
  };

  const handleUpdateAppConnector = (updated: AppConnectorConfig) => {
    setAppConnectors((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    showNotification('Connector Saved', `Updated configuration for ${updated.name}.`);
  };

  const handleCreateSubAccount = (newAcc: SubAccount) => {
    setSubAccounts((prev) => [newAcc, ...prev]);
    showNotification(
      'Sub-Account Provisioned',
      `"${newAcc.name}" (${newAcc.code}) created and connected to Master Rollup.`
    );
  };

  const handleUpdateSubAccount = (updated: SubAccount) => {
    setSubAccounts((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    showNotification('Sub-Account Updated', `Settings saved for ${updated.name}.`);
  };

  return (
    <div className="flex h-screen bg-[#F5F5F0] text-[#2D2D24] font-sans antialiased overflow-hidden">
      {/* Sidebar Navigation with RBAC */}
      <Sidebar
        activeView={activeView}
        onSelectView={setActiveView}
        currentRole={currentRole}
        openWorkOrdersCount={workOrders.filter((w) => w.status === 'in_progress').length}
        lowStockItemsCount={inventory.filter((i) => i.status === 'low_stock' || i.status === 'critical').length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <Header
          roles={initialRoles}
          currentRole={currentRole}
          onSelectRole={setCurrentRole}
          facilities={initialFacilities}
          activeFacility={activeFacility}
          onSelectFacility={setActiveFacility}
          onOpenAiReport={() => setIsAiReportOpen(true)}
          onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
          onOpenPrintLabel={() => setIsPrintLabelOpen(true)}
          branding={branding}
          onOpenBrandingModal={() => setIsBrandingModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenProductTour={() => setIsProductTourOpen(true)}
        />

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#F5F5F0]">
          {activeView === 'custom_dashboards' && (
            <CustomDashboardBuilderView
              lines={lines}
              workOrders={workOrders}
              travelers={travelers}
              floorCells={floorCells}
              agvFleet={agvFleet}
              multiLevelBom={multiLevelBom}
              maintenanceAssets={maintenanceAssets}
              maintenanceOrders={maintenanceOrders}
              shipments={shipments}
              inventory={inventory}
              alerts={alerts}
              currentRole={currentRole}
              onNavigateTab={setActiveView}
              onUpdateStep={handleUpdateStep}
              onSignOffTraveler={handleSignOffTraveler}
              onDraftPurchaseOrder={handleDraftPurchaseOrder}
              onToggleMaintenanceTask={handleToggleMaintenanceTask}
              onEmergencyStopBay={handleEmergencyStopBay}
              onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
              onOpenPrintLabel={() => setIsPrintLabelOpen(true)}
              onUpdateLineStatus={handleUpdateLineStatus}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onShowNotification={(title, message, type) => showNotification(title, message, type || 'success')}
              invoices={invoices}
              finance={finance}
              deals={deals}
              campaigns={campaigns}
              onPayInvoice={handlePayInvoice}
              onAdvanceDealStage={handleAdvanceDealStage}
            />
          )}

          {activeView === 'dashboard' && (
            <DashboardView
              lines={lines}
              workOrders={workOrders}
              inventory={inventory}
              shipments={shipments}
              alerts={alerts}
              finance={finance}
              currentRole={currentRole}
              onNavigate={setActiveView}
              onOpenAiReport={() => setIsAiReportOpen(true)}
            />
          )}

          {activeView === 'digital_traveler' && (
            <DigitalTravelerView
              travelers={travelers}
              currentRole={currentRole}
              onUpdateStep={handleUpdateStep}
              onSignOffTraveler={handleSignOffTraveler}
              onEscalateIssue={handleEscalateIssue}
              onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
            />
          )}

          {activeView === 'digital_twin' && (
            <DigitalTwinView
              cells={floorCells}
              agvFleet={agvFleet}
              currentRole={currentRole}
              onEmergencyStopBay={handleEmergencyStopBay}
            />
          )}

          {activeView === 'bom_mrp' && (
            <BomMrpView
              bomData={multiLevelBom}
              currentRole={currentRole}
              onDraftPurchaseOrder={handleDraftPurchaseOrder}
              onExportBomCsv={() =>
                showNotification(
                  'BOM Export Complete',
                  'Multi-level bill of materials hierarchy exported to CSV.'
                )
              }
            />
          )}

          {activeView === 'maintenance' && (
            <MaintenanceCmmsView
              assets={maintenanceAssets}
              workOrders={maintenanceOrders}
              currentRole={currentRole}
              onToggleTask={handleToggleMaintenanceTask}
              onCompleteWorkOrder={handleCompleteMaintenanceOrder}
              onCreateWorkOrder={handleCreateMaintenanceOrder}
            />
          )}

          {activeView === 'production' && (
            <ProductionErpView
              lines={lines}
              workOrders={workOrders}
              bomItems={initialBom}
              currentRole={currentRole}
              onUpdateLineStatus={handleUpdateLineStatus}
              onOpenCreateWorkOrder={() => setIsCreateWorkOrderOpen(true)}
              onUpdateWorkOrderStatus={handleUpdateWorkOrderStatus}
            />
          )}

          {activeView === 'supply_chain' && (
            <SupplyChainView
              shipments={shipments}
              suppliers={suppliers}
              currentRole={currentRole}
              onRefreshTracking={handleRefreshTracking}
              onSimulateCustomsClearance={handleSimulateCustomsClearance}
            />
          )}

          {activeView === 'inventory' && (
            <InventoryView
              inventory={inventory}
              currentRole={currentRole}
              onRestockItem={handleRestockItem}
              onTriggerReorderWorkflow={handleTriggerReorderWorkflow}
              onOpenAddItemModal={() => setIsAddInventoryOpen(true)}
            />
          )}

          {activeView === 'projects' && (
            <ProjectsTasksView
              tasks={tasks}
              currentRole={currentRole}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onAddTask={handleAddTask}
            />
          )}

          {activeView === 'crm_marketing' && (
            <CrmMarketingView
              deals={deals}
              campaigns={campaigns}
              currentRole={currentRole}
              onAdvanceDealStage={handleAdvanceDealStage}
              onConvertDealToWorkOrder={handleConvertDealToWorkOrder}
              onAddDeal={handleAddDeal}
              onAddCampaign={handleAddCampaign}
            />
          )}

          {activeView === 'finance' && (
            <FinanceView
              finance={finance}
              invoices={invoices}
              journalEntries={journalEntries}
              chartOfAccounts={chartOfAccounts}
              currentRole={currentRole}
              onPayInvoice={handlePayInvoice}
              onExportCsv={handleExportCsv}
              onAddInvoice={handleAddInvoice}
              onAddJournalEntry={handleAddJournalEntry}
            />
          )}

          {activeView === 'sub_accounts' && (
            <SubAccountsView
              subAccounts={subAccounts}
              currentRole={currentRole}
              onCreateSubAccount={handleCreateSubAccount}
              onUpdateSubAccount={handleUpdateSubAccount}
              activeViewingSubAccountId={activeViewingSubAccountId}
              onSetActiveViewingSubAccountId={setActiveViewingSubAccountId}
              onNavigateTab={setActiveView}
            />
          )}

          {activeView === 'database_hub' && (
            <DatabaseHubView
              currentRole={currentRole}
              onNavigateTab={setActiveView}
              onBindQueryToDashboard={(name) => {
                showNotification('Dataset Bound', `"${name}" linked to custom dashboard widgets.`);
                setActiveView('custom_dashboards');
              }}
            />
          )}

          {activeView === 'workflows' && (
            <WorkflowBuilderView
              workflows={workflows}
              currentRole={currentRole}
              onToggleWorkflow={handleToggleWorkflow}
              onRunWorkflowSimulation={handleRunWorkflowSimulation}
              onAddWorkflow={handleAddWorkflow}
            />
          )}

          {activeView === 'integrations' && (
            <IntegrationsView
              appConnectors={appConnectors}
              currentRole={currentRole}
              onToggleAppConnector={handleToggleAppConnector}
              onSyncAppConnector={handleSyncAppConnector}
              onUpdateConnectorConfig={handleUpdateAppConnector}
              legacyConnectors={connectors}
              onToggleLegacyConnector={(id) =>
                setConnectors((prev) =>
                  prev.map((c) =>
                    c.id === id
                      ? { ...c, status: c.status === 'connected' ? 'disconnected' : 'connected' }
                      : c
                  )
                )
              }
              onTestWebhook={handleTestWebhook}
            />
          )}

          {activeView === 'human_resources' && (
            <HumanResourcesView
              employees={employees}
              attendanceRecords={attendanceRecords}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployeeStatus={handleUpdateEmployeeStatus}
              onShowNotification={(title, message, type) => showNotification(title, message, type || 'success')}
            />
          )}

          {activeView === 'fleet_management' && (
            <FleetManagementView
              vehicles={fleetVehicles}
              missions={fleetMissions}
              onDispatchMission={handleDispatchFleetMission}
              onUpdateVehicleStatus={handleUpdateVehicleStatus}
              onShowNotification={(title, message, type) => showNotification(title, message, type || 'success')}
            />
          )}

          {/* Platform Footer with Powered by; Vortix Badge */}
          {branding.showPoweredByVortix && (
            <Footer
              branding={branding}
              activeViewTitle={branding.dashboardTitle}
              onOpenBrandingModal={() => setIsBrandingModalOpen(true)}
              onOpenProductTour={() => setIsProductTourOpen(true)}
              onOpenSubDashboardWizard={() => setIsSubDashboardWizardOpen(true)}
            />
          )}
        </main>
      </div>

      {/* AI Automated Intelligence Reporting Modal */}
      <AiReportModal
        isOpen={isAiReportOpen}
        onClose={() => setIsAiReportOpen(false)}
        productionData={{
          facility: activeFacility.name,
          overallOee: 84.6,
          lines: lines.map((l) => ({ name: l.name, oee: l.oeeScore, status: l.status })),
          scrapRateTotal: '1.4%',
          inboundDelayedShipments: shipments.filter((s) => s.status === 'customs_hold').length,
          lowStockItems: inventory.filter((i) => i.status === 'low_stock').length,
        }}
        onApplyRecommendation={(rec) => {
          showNotification('Recommendation Applied to Workflow', rec);
          setIsAiReportOpen(false);
          setActiveView('workflows');
        }}
      />

      {/* Create Work Order Modal */}
      <CreateWorkOrderModal
        isOpen={isCreateWorkOrderOpen}
        onClose={() => setIsCreateWorkOrderOpen(false)}
        lines={lines}
        onCreate={handleCreateWorkOrder}
      />

      {/* Add Stock Item Modal */}
      <AddInventoryModal
        isOpen={isAddInventoryOpen}
        onClose={() => setIsAddInventoryOpen(false)}
        onAdd={handleAddInventoryItem}
      />

      {/* Barcode & QR Code Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        onNavigateTab={(tab) => {
          setActiveView(tab);
          setIsBarcodeScannerOpen(false);
        }}
      />

      {/* Industrial Thermal Label Generator Modal */}
      <PrintLabelModal
        isOpen={isPrintLabelOpen}
        onClose={() => setIsPrintLabelOpen(false)}
        defaultSku="PRD-VALVE-01"
        defaultName="Precision Hydraulic Control Valve"
        defaultLot="LOT-2026-088"
        defaultQty={24}
      />

      {/* Brand & Theme White-Labeling Modal */}
      <BrandingSettingsModal
        isOpen={isBrandingModalOpen}
        onClose={() => setIsBrandingModalOpen(false)}
        branding={branding}
        onSaveBranding={handleSaveBranding}
      />

      {/* Interactive Product Introduction & Guide Walkthrough */}
      <ProductTourModal
        isOpen={isProductTourOpen}
        onClose={() => setIsProductTourOpen(false)}
        onNavigateToView={(view) => setActiveView(view)}
        onOpenSubDashboardWizard={() => {
          setIsProductTourOpen(false);
          setIsSubDashboardWizardOpen(true);
        }}
        onOpenBrandingModal={() => {
          setIsProductTourOpen(false);
          setIsBrandingModalOpen(true);
        }}
      />

      {/* Team Sub-Dashboard Guided Setup Wizard */}
      <SubDashboardSetupWizardModal
        isOpen={isSubDashboardWizardOpen}
        onClose={() => setIsSubDashboardWizardOpen(false)}
        onCreated={handleSubDashboardCreated}
      />

      {/* User Sign Up, Profile & Onboarding System */}
      <AuthOnboardingModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
        onStartTour={() => setIsProductTourOpen(true)}
      />

      {/* Notification Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-start gap-3 bg-[#2D2D24] border border-[#3D3D32] text-[#E9E9E0] p-4 rounded-2xl shadow-2xl max-w-sm animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="p-1.5 rounded-xl bg-[#5A5A40]/30 text-white border border-[#5A5A40]/50 shrink-0">
            {toast.type === 'alert' ? (
              <AlertTriangle className="w-4 h-4 text-[#C48C3B]" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#E9E9E0]" />
            )}
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-white text-xs">{toast.title}</h4>
            <p className="text-[#A09E8E] mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-[#A09E8E] hover:text-white text-sm cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
