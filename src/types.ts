export type UserRole =
  | 'plant_manager'
  | 'production_supervisor'
  | 'supply_chain_specialist'
  | 'qa_engineer'
  | 'financial_controller'
  | 'sales_rep';

export interface RoleDefinition {
  id: UserRole;
  title: string;
  department: string;
  badgeColor: string;
  description: string;
  permissions: {
    production: 'admin' | 'write' | 'read' | 'none';
    supply_chain: 'admin' | 'write' | 'read' | 'none';
    inventory: 'admin' | 'write' | 'read' | 'none';
    projects: 'admin' | 'write' | 'read' | 'none';
    crm_marketing: 'admin' | 'write' | 'read' | 'none';
    finance: 'admin' | 'write' | 'read' | 'none';
    workflows: 'admin' | 'write' | 'read' | 'none';
    integrations: 'admin' | 'write' | 'read' | 'none';
    reports: 'admin' | 'write' | 'read' | 'none';
    pos_terminal?: 'admin' | 'write' | 'read' | 'none';
    property_management?: 'admin' | 'write' | 'read' | 'none';
    channel_management?: 'admin' | 'write' | 'read' | 'none';
    user_access_control?: 'admin' | 'write' | 'read' | 'none';
  };
}

export type ViewTab =
  | 'dashboard'
  | 'custom_dashboards'
  | 'sub_accounts'
  | 'database_hub'
  | 'production'
  | 'digital_traveler'
  | 'digital_twin'
  | 'fleet_management'
  | 'supply_chain'
  | 'inventory'
  | 'pos_terminal'
  | 'property_management'
  | 'channel_management'
  | 'user_access_control'
  | 'bom_mrp'
  | 'maintenance'
  | 'human_resources'
  | 'projects'
  | 'crm_marketing'
  | 'finance'
  | 'workflows'
  | 'integrations'
  | 'reports'
  | 'rbac';

// Production & ERP Types
export interface ProductionLine {
  id: string;
  name: string;
  code: string;
  status: 'running' | 'idle' | 'maintenance' | 'bottleneck';
  currentProduct: string;
  targetUnits: number;
  completedUnits: number;
  oeeScore: number; // percentage 0-100
  availability: number; // percentage
  performance: number; // percentage
  qualityRate: number; // percentage
  activeShift: string;
  supervisor: string;
  lastDowntimeReason?: string;
  temperatureC?: number;
  vibrationMmS?: number;
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  productName: string;
  sku: string;
  batchNumber: string;
  customer: string;
  quantityOrdered: number;
  quantityProduced: number;
  scrappedUnits: number;
  status: 'scheduled' | 'in_progress' | 'quality_check' | 'completed' | 'on_hold';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedLineId: string;
  startDate: string;
  dueDate: string;
  unitCostTarget: number;
  actualUnitCost: number;
  billOfMaterialsId?: string;
}

export interface BillOfMaterialItem {
  id: string;
  componentName: string;
  componentSku: string;
  quantityPerAssembly: number;
  unit: string;
  currentStock: number;
  unitCost: number;
  supplier: string;
}

// Supply Chain Types
export interface Shipment {
  id: string;
  trackingNumber: string;
  carrier: string;
  origin: string;
  destination: string;
  supplier: string;
  materialType: string;
  quantityUnits: string;
  status: 'ordered' | 'in_transit' | 'customs_hold' | 'out_for_delivery' | 'delivered';
  currentLocation: string;
  eta: string;
  departureDate: string;
  riskFactor: 'low' | 'medium' | 'high';
  riskReason?: string;
  coordinates?: { lat: number; lng: number };
  temperatureControlled?: boolean;
}

export interface SupplierScorecard {
  id: string;
  name: string;
  category: string;
  reliabilityScore: number; // 0 - 100
  qualityRating: number; // 0 - 100
  leadTimeDays: number;
  contractStatus: 'active' | 'under_review' | 'preferred';
  onTimeDeliveryRate: number; // percentage
}

// Inventory Types
export type InventoryCategory = 'raw_material' | 'wip' | 'finished_goods' | 'tooling_supplies';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  quantityOnHand: number;
  minSafetyStock: number;
  maxCapacity?: number;
  unit: string;
  unitCost: number;
  warehouseLocation: string;
  lotNumber: string;
  lastRestocked: string;
  supplier: string;
  status: 'optimal' | 'low_stock' | 'critical' | 'surplus';
}

// CRM & Marketing Types
export interface CrmDeal {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  dealValue: number;
  stage: 'lead' | 'rfq_review' | 'sample_prototyping' | 'negotiation' | 'won_contract';
  productCategory: string;
  estimatedUnits: number;
  probability: number;
  lastActivity: string;
  assignedRep: string;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  channel: 'Trade Expo' | 'OEM Direct Outreach' | 'Industry Publications' | 'Digital B2B' | 'Supplier Network';
  budget: number;
  spent: number;
  leadsGenerated: number;
  qualifiedDeals: number;
  roiMultiplier: number;
  status: 'active' | 'completed' | 'planned';
}

// Project & Task Management Types
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'backlog' | 'spec_design' | 'pilot_run' | 'line_validation' | 'completed';

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  relatedLineOrProduct: string;
  dueDate: string;
  estimatedHours: number;
  completedHours: number;
  tags: string[];
}

// Finance & Accounting Types
export interface FinanceMetric {
  monthlyRevenue: number;
  cogsTotal: number;
  grossMargin: number;
  directMaterialsCost: number;
  directLaborCost: number;
  overheadMachineryCost: number;
  operatingIncome: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: 'receivable' | 'payable';
  counterparty: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  referenceOrder: string;
  paymentTerms?: 'Net 15' | 'Net 30' | 'Net 60' | 'Due on Receipt';
  taxAmount?: number;
  lineItems?: { description: string; quantity: number; unitPrice: number; total: number }[];
}

export interface JournalEntryLine {
  id: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  referenceDoc?: string;
  postedBy: string;
  lines: JournalEntryLine[];
  status: 'posted' | 'draft';
}

export interface ChartOfAccount {
  code: string;
  name: string;
  category: 'asset' | 'liability' | 'equity' | 'revenue' | 'cogs' | 'expense';
  normalBalance: 'debit' | 'credit';
  balance: number;
  description?: string;
}

// Low-Code Workflow Types
export type WorkflowTriggerType =
  | 'inventory_low_stock'
  | 'work_order_created'
  | 'qc_defect_rate_spike'
  | 'shipment_delayed'
  | 'iot_machine_vibration_alert'
  | 'crm_contract_won';

export type WorkflowActionType =
  | 'create_purchase_order'
  | 'quarantine_lot'
  | 'send_slack_alert'
  | 'trigger_webhook'
  | 'reallocate_line'
  | 'generate_ai_briefing';

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'integration';
  title: string;
  subType: string;
  config: Record<string, any>;
  x: number;
  y: number;
}

export interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  conditionLabel?: string;
}

export interface CustomWorkflow {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  triggerType: WorkflowTriggerType;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  executionCount: number;
  lastRun?: string;
  status: 'active' | 'paused' | 'draft';
}

// API Integrations Types
export interface ThirdPartyConnector {
  id: string;
  name: string;
  category: 'ERP Bridge' | 'IoT Sensors' | 'Logistics & GPS' | 'Accounting' | 'E-Commerce / EDI' | 'Notifications';
  type?: string;
  icon: string;
  status: 'connected' | 'configured' | 'disconnected' | 'degraded';
  endpointUrl: string;
  apiKeyMasked: string;
  lastSync: string;
  syncFrequency?: string;
  latencyMs?: number;
  eventsProcessedToday: number;
  health: 'healthy' | 'warning' | 'error';
  description: string;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  connectorName: string;
  event: string;
  payloadSummary: string;
  statusCode: number;
  durationMs: number;
}

export interface Facility {
  id: string;
  name: string;
  location: string;
  linesCount: number;
  activeShifts: number;
  facilityManager: string;
  targetOee: number;
}

export interface OperationalAlert {
  id: string;
  type: 'critical_downtime' | 'quality_scrap_spike' | 'supply_chain_delay' | 'sensor_threshold';
  title: string;
  description: string;
  timestamp: string;
  lineOrPart: string;
  severity: 'critical' | 'warning' | 'info';
  actionTaken?: string;
}

export interface AiAutomatedReport {
  timestamp: string;
  title: string;
  oeeScore: number;
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  projectedEfficiencyGain: string;
}

export interface ApiConnector {
  id: string;
  name: string;
  type?: string;
  category?: string;
  icon?: string;
  status: 'connected' | 'degraded' | 'disconnected' | 'configured';
  endpointUrl: string;
  syncFrequency?: string;
  lastSync?: string;
  latencyMs?: number;
  eventsProcessedToday?: number;
  apiKeyMasked?: string;
  health?: 'healthy' | 'warning' | 'error';
  description: string;
}

// 1. Digital Traveler & SOP Types
export interface SopStep {
  id: string;
  stepNumber: number;
  title: string;
  workcenter: string;
  instructions: string;
  specification: string;
  tolerance?: string;
  inputType: 'pass_fail' | 'numeric' | 'torque' | 'text';
  nominalValue?: number;
  minTolerance?: number;
  maxTolerance?: number;
  unit?: string;
  operatorValue?: string | number;
  isCompleted: boolean;
  status: 'pending' | 'passed' | 'failed';
  signOffBy?: string;
  signOffTimestamp?: string;
  notes?: string;
}

export interface DigitalTraveler {
  id: string;
  workOrderId: string;
  orderNumber: string;
  productName: string;
  sku: string;
  batchNumber: string;
  assignedLineId: string;
  targetUnits: number;
  completedUnits: number;
  steps: SopStep[];
  currentStepIndex: number;
  status: 'in_assembly' | 'quality_quarantine' | 'approved' | 'completed';
  activeOperator: string;
  startedAt: string;
  completedAt?: string;
  inspectionSignOff?: {
    signedBy: string;
    badgeId: string;
    timestamp: string;
    comments: string;
  };
}

// 2. Multi-Level BOM & MRP Types
export interface BomNode {
  id: string;
  name: string;
  sku: string;
  level: number; // 0 = Finished Good, 1 = Sub-Assembly, 2 = Component / Raw Material
  quantityRequired: number;
  unit: string;
  unitCost: number;
  leadTimeDays: number;
  scrapRatePct: number;
  currentInventory: number;
  onOrder: number;
  reorderPoint: number;
  supplier: string;
  category: 'raw_metal' | 'fastener' | 'electronic' | 'fluid' | 'subassembly' | 'finished_good';
  children?: BomNode[];
}

export interface MrpRequirement {
  id: string;
  sku: string;
  name: string;
  totalRequired: number;
  stockOnHand: number;
  onOrder: number;
  netShortage: number;
  leadTimeDays: number;
  supplier: string;
  estimatedCost: number;
  unit: string;
  status: 'sufficient' | 'shortage' | 'po_drafted';
  suggestedOrderDate: string;
}

// 3. Interactive 2D Plant Floor Digital Twin Types
export interface FloorCell {
  id: string;
  bay: string;
  name: string;
  code: string;
  type: 'cnc' | 'smt' | 'stamping' | 'coating' | 'assembly' | 'qa' | 'warehouse';
  status: 'running' | 'idle' | 'maintenance' | 'bottleneck';
  x: number; // grid column (1-12)
  y: number; // grid row (1-8)
  w: number; // col span
  h: number; // row span
  oee: number;
  currentWorkOrder?: string;
  telemetry: {
    spindleRpm: number;
    temperatureC: number;
    vibrationMmS: number;
    powerKw: number;
    toolWearPct: number;
  };
  operator: string;
}

export interface AgvVehicle {
  id: string;
  name: string;
  code: string;
  status: 'in_transit' | 'loading' | 'charging';
  batteryPct: number;
  currentBay: string;
  destinationBay: string;
  payload: string;
  progressPct: number;
}

// 4. Barcode / QR Label Scanner Types
export interface ScannedEntity {
  type: 'work_order' | 'inventory_item' | 'machine' | 'lot';
  id: string;
  title: string;
  code: string;
  subtitle: string;
  metadata: Record<string, string | number>;
}

export interface PrintableLabelData {
  title: string;
  sku: string;
  lotNumber: string;
  quantity: number;
  unit: string;
  barcode: string;
  date: string;
  facility: string;
  binLocation?: string;
  customer?: string;
  workOrderNumber?: string;
}

// 5. Preventative Maintenance (CMMS) Types
export interface MaintenanceAsset {
  id: string;
  name: string;
  code: string;
  model: string;
  lineId: string;
  location: string;
  status: 'operational' | 'service_due' | 'under_repair' | 'critical';
  operatingHours: number;
  nextServiceHours: number;
  mtbfHours: number; // Mean Time Between Failures
  mttrHours: number; // Mean Time To Repair
  lastServiceDate: string;
  nextServiceDate: string;
  technicianAssigned: string;
  healthScore: number; // 0 - 100
}

export interface MaintenanceWorkOrder {
  id: string;
  assetId: string;
  assetName: string;
  title: string;
  type: 'preventative' | 'corrective' | 'calibration' | 'inspection';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  scheduledDate: string;
  assignedTechnician: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  estimatedHours: number;
  actualHours?: number;
  description?: string;
  tasks: { id: string; description: string; completed: boolean }[];
  spareParts: { partName: string; quantity: number; cost: number }[];
  totalCost: number;
}

// 6. Custom Drag-and-Drop Dashboard & Team Workspace Types
export type WidgetType =
  | 'line_oee_tracker'
  | 'active_traveler'
  | 'digital_twin_map'
  | 'agv_fleet_radar'
  | 'mrp_shortage_alert'
  | 'equipment_health_gauge'
  | 'maintenance_orders_board'
  | 'shipment_radar'
  | 'inventory_stock_levels'
  | 'quality_spc_chart'
  | 'financial_margins'
  | 'accounting_gl_widget'
  | 'crm_pipeline_widget'
  | 'marketing_roi_widget'
  | 'quick_action_bar'
  | 'alerts_live_ticker'
  | 'team_handover_notes'
  | 'chart_line_metric'
  | 'chart_bar_breakdown'
  | 'chart_pie_distribution'
  | 'chart_heatmap_activity'
  | 'chart_gauge_capacity'
  | 'chart_funnel_pipeline'
  | 'geospatial_map_fleet'
  | 'kpi_metric_tile'
  | 'kpi_comparison_card'
  | 'interactive_data_pivot_table'
  | 'rich_media_iframe'
  | 'rich_markdown_note'
  | 'rich_banner_cta'
  | 'action_button_workflow';

export type WidgetCategory =
  | 'operations'
  | 'quality'
  | 'maintenance'
  | 'supply_chain'
  | 'financial'
  | 'commercial'
  | 'collaboration'
  | 'analytics'
  | 'media';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  category: WidgetCategory;
  colSpan: 1 | 2 | 3 | 4; // 1 = 25% (or 33% on md), 2 = 50%, 3 = 75%, 4 = 100% full width
  heightMode?: 'compact' | 'normal' | 'tall';
  position?: { x: number; y: number; w?: number; h?: number }; // For freeform layout
  settings?: {
    lineId?: string;
    travelerId?: string;
    refreshInterval?: number;
    showControls?: boolean;
    noteText?: string;
    kpiValue?: string | number;
    kpiSubtext?: string;
    kpiTrend?: number;
    chartMetric?: string;
    tableDataSource?: string;
    iframeUrl?: string;
    markdownContent?: string;
    buttonLabel?: string;
    buttonAction?: string;
    dataSourceId?: string;
    queryId?: string;
  };
}

export type LayoutMode = 'grid' | 'freeform';
export type GridDensity = 'compact' | 'standard' | 'spacious';
export type BreakpointView = 'desktop' | 'tablet' | 'mobile';

export interface DashboardVersionSnapshot {
  id: string;
  versionNumber: number;
  timestamp: string;
  note: string;
  widgets: DashboardWidget[];
  layoutMode?: LayoutMode;
}

export interface GlobalFilterState {
  dateRange: 'today' | '7d' | 'mtd' | 'qtd' | 'ytd' | 'custom';
  region: string;
  facilityId: string;
  department: string;
  searchKeyword: string;
}

export interface CustomDashboard {
  id: string;
  name: string;
  description: string;
  targetTeam: string;
  category: 'operations' | 'executive' | 'maintenance' | 'quality' | 'supply_chain' | 'custom' | 'sales_ops' | 'hr_analytics';
  icon: string;
  isLocked: boolean; // false = Builder / Edit Mode; true = Team / Live View Mode
  isDefault?: boolean;
  layoutMode?: LayoutMode;
  gridDensity?: GridDensity;
  refreshIntervalSeconds?: number;
  streamingEnabled?: boolean;
  widgets: DashboardWidget[];
  versionSnapshots?: DashboardVersionSnapshot[];
  rbacRolesAllowed?: UserRole[];
  rowLevelSecurityFilter?: string;
  createdByRole: string;
  createdAt: string;
  updatedAt: string;
}

// 7. Third-Party App & System Connectors (with Toggle Switches)
export type AppConnectorKey =
  | 'hubspot'
  | 'salesforce'
  | 'zoho_one'
  | 'monday'
  | 'asana'
  | 'jira'
  | 'quickbooks'
  | 'xero'
  | 'slack'
  | 'twilio';

export interface AppConnectorConfig {
  id: AppConnectorKey;
  name: string;
  tagline: string;
  category: 'CRM & Sales' | 'Project & Issue Tracking' | 'Accounting & Invoicing' | 'Messaging & Notifications';
  iconColor: string;
  enabled: boolean;
  authStatus: 'connected' | 'not_configured' | 'syncing' | 'error';
  lastSyncTimestamp?: string;
  syncFrequency: 'Real-time Push' | 'Every 5 min' | 'Hourly' | 'Daily Batch';
  endpointOrWebhookUrl: string;
  accountIdentifier?: string;
  apiKeyMasked?: string;
  syncedRecordsCount: number;
  recordsSummary: string;
  featuresSupported: string[];
  recentSyncedItems?: {
    id: string;
    title: string;
    type: string;
    timestamp: string;
    status: string;
  }[];
}

// 8. Multi-Tenant Sub-Accounts feeding Master / Manager Account
export interface SubAccountFeaturePermissions {
  production: boolean;
  crm_marketing: boolean;
  inventory: boolean;
  finance: boolean;
  supply_chain: boolean;
  maintenance: boolean;
  projects: boolean;
}

export interface SubAccountMetricsFeed {
  monthlyRevenue: number;
  activeWorkOrders: number;
  averageOee: number;
  inventoryValue: number;
  openDealsCount: number;
  dealPipelineValue: number;
  activeIncidents: number;
  employeeCount: number;
  onTimeFulfillmentRate: number;
}

export interface SubAccount {
  id: string;
  code: string;
  name: string;
  entityType: 'Subsidiary Plant' | 'Regional Division' | 'OEM Partner' | 'Franchise Branch';
  region: string;
  location: string;
  managerName: string;
  managerEmail: string;
  status: 'active' | 'suspended' | 'provisioning';
  enabledFeatures: SubAccountFeaturePermissions;
  metricsFeed: SubAccountMetricsFeed;
  lastDataSync: string;
  activeUsersCount: number;
  createdAt: string;
}

// 9. Client Custom Databases & Cloud DB Connectors
export type DatabaseEngineType =
  | 'postgresql'
  | 'mysql'
  | 'mongodb'
  | 'snowflake'
  | 'amazon_aurora'
  | 'supabase'
  | 'google_cloudsql'
  | 'bigquery';

export interface DatabaseColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey?: boolean;
}

export interface DatabaseTableSchema {
  name: string;
  rowCount: number;
  sizeMb: number;
  columns: DatabaseColumnSchema[];
}

export interface DatabaseConnection {
  id: string;
  name: string;
  engine: DatabaseEngineType;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  ssl: boolean;
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  latencyMs: number;
  lastTested: string;
  tablesCount: number;
  tables: DatabaseTableSchema[];
  description?: string;
}

// Visual Query Builder & SQL Types
export interface VisualQueryFilter {
  id: string;
  column: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN';
  value: string;
}

export interface VisualQueryDefinition {
  id: string;
  name: string;
  databaseId: string;
  tableName: string;
  selectedColumns: string[];
  filters: VisualQueryFilter[];
  orderByColumn?: string;
  orderDirection?: 'ASC' | 'DESC';
  limit: number;
  aggregation?: {
    function: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX';
    column: string;
  };
}

export interface SqlQueryExecutionResult {
  columns: string[];
  rows: Record<string, any>[];
  executionTimeMs: number;
  rowCount: number;
  executedAt: string;
}

// -------------------------------------------------------------
// Company Branding & Custom Theme Customization Types
// -------------------------------------------------------------
export interface CompanyBranding {
  companyName: string;
  dashboardTitle: string;
  tagline: string;
  logoType: 'vortix' | 'custom_text' | 'preset_icon' | 'custom_url';
  logoText?: string;
  customLogoUrl?: string;
  presetIcon?: 'cpu' | 'factory' | 'shield' | 'zap' | 'orbit' | 'layers';
  primaryColor: string; // e.g. #5A5A40 or custom hex
  accentColor: string; // e.g. #2D2D24 or custom hex
  headerBgColor: string; // #FFFFFF or dark
  themePreset: 'industrial_earth' | 'midnight_slate' | 'precision_navy' | 'emerald_clean' | 'sunset_bronze' | 'custom';
  showPoweredByVortix: boolean;
}

// -------------------------------------------------------------
// User Authentication & Onboarding System Types
// -------------------------------------------------------------
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  role: string;
  industry: string;
  avatarUrl?: string;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

// -------------------------------------------------------------
// Human Resources & Workforce Management Types
// -------------------------------------------------------------
export interface HrCertification {
  id: string;
  name: string;
  issuedBy: string;
  issueDate: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  department: 'Assembly' | 'CNC Machining' | 'Quality & SMT' | 'Maintenance' | 'Warehouse & Logistics' | 'Engineering' | 'Operations Management';
  roleTitle: string;
  shift: 'Shift A (06:00 - 14:30)' | 'Shift B (14:00 - 22:30)' | 'Shift C (22:00 - 06:30)';
  status: 'active_on_duty' | 'on_break' | 'on_leave' | 'in_training';
  assignedLineOrCell: string;
  hourlyRate: number;
  weeklyHoursLogged: number;
  overtimeHours: number;
  certifications: HrCertification[];
  skills: string[];
  safetyIncidentFreeDays: number;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  hireDate: string;
}

export interface HrAttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  status: 'present' | 'late' | 'excused' | 'unexcused';
  overtimeMinutes: number;
  station: string;
  supervisorNotes?: string;
}

// -------------------------------------------------------------
// Fleet Management & Industrial Logistics Types
// -------------------------------------------------------------
export interface FleetVehicle {
  id: string;
  vehicleCode: string; // e.g. AGV-01, FL-04, TUG-02, TRK-01
  name: string;
  type: 'agv' | 'forklift' | 'tugger' | 'transport_truck';
  model: string;
  manufacturer: string;
  year: number;
  status: 'en_route' | 'loading' | 'charging' | 'idle' | 'maintenance_hold';
  batteryOrFuelPct: number;
  speedKmh: number;
  currentBay: string;
  destinationBay?: string;
  currentPayload?: string;
  maxPayloadKg: number;
  assignedOperator?: string; // or 'Autonomous Navigation'
  lastInspectionDate: string;
  odometerKm: number;
  maintenanceDueKm: number;
  coordinates?: { x: number; y: number }; // For 2D fleet visual radar
  temperatureC?: number;
  telematicsAlert?: string;
  // Convenience aliases for display
  callsign?: string;
  batteryPercentage?: number;
  currentLocation?: string;
}

export interface FleetMission {
  id: string;
  missionNumber: string;
  vehicleId: string;
  vehicleCode: string;
  pickupLocation: string;
  dropoffLocation: string;
  payloadType: string;
  payloadWeightKg: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'scheduled' | 'in_transit' | 'completed' | 'canceled';
  startTime: string;
  estimatedArrival: string;
  completedTime?: string;
  // Convenience aliases for display
  missionCode?: string;
  vehicleCallsign?: string;
  cargoDescription?: string;
  dispatchedAt?: string;
  progressPct?: number;
  etaMinutes?: number;
}

export interface FleetInspection {
  id: string;
  vehicleId: string;
  vehicleCode: string;
  inspectorName: string;
  timestamp: string;
  type: 'pre_shift' | 'post_shift' | 'pm_scheduled';
  passed: boolean;
  checklist: {
    hydraulicPressure: boolean;
    brakesAndTires: boolean;
    emergencyStopSwitch: boolean;
    opticalLidarAndSensors: boolean;
    lightsAndBeepers: boolean;
    batteryHealth: boolean;
  };
  notes?: string;
}

// Aliases for dashboard builder configs
export type CustomDashboardConfig = CustomDashboard;
export type CustomWidgetInstance = DashboardWidget;

// =============================================================
// SUB-USERS, AUTHENTICATION & ACCESS CONTROL TYPES
// =============================================================

export type AccessLevel = 'admin' | 'write' | 'read' | 'none';

export interface ModulePermissionMap {
  dashboard: AccessLevel;
  custom_dashboards: AccessLevel;
  production: AccessLevel;
  digital_traveler: AccessLevel;
  digital_twin: AccessLevel;
  fleet_management: AccessLevel;
  supply_chain: AccessLevel;
  inventory: AccessLevel;
  pos_terminal: AccessLevel;
  property_management: AccessLevel;
  channel_management: AccessLevel;
  bom_mrp: AccessLevel;
  maintenance: AccessLevel;
  human_resources: AccessLevel;
  projects: AccessLevel;
  crm_marketing: AccessLevel;
  finance: AccessLevel;
  workflows: AccessLevel;
  integrations: AccessLevel;
  sub_accounts: AccessLevel;
  database_hub: AccessLevel;
  user_access_control: AccessLevel;
}

export interface DataAccessRules {
  canViewFinancialMetrics: boolean;
  canViewCustomerPii: boolean;
  canExportReports: boolean;
  canOverrideDiscounts: boolean;
  canManageSubUsers: boolean;
  canExecuteRefunds: boolean;
  canModifyChannelRates: boolean;
  canSignOffTravelers: boolean;
  canApprovePurchaseOrders: boolean;
}

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'plant_manager' | 'department_supervisor' | 'pos_cashier' | 'property_host' | 'operator' | 'auditor';
  roleTitle: string;
  department: string;
  avatarUrl?: string;
  status: 'active' | 'suspended' | 'pending';
  facilityId: string;
  facilityName: string;
  isSubUser: boolean;
  parentUserId?: string;
  pinCode?: string; // 4-digit PIN for rapid terminal switch
  lastLoginAt: string;
  createdAt: string;
  permissions: ModulePermissionMap;
  dataAccess: DataAccessRules;
}

export interface SecurityAuditEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  resourceDetails: string;
  ipAddress: string;
  timestamp: string;
  status: 'allowed' | 'restricted' | 'warning';
}

// =============================================================
// POINT OF SALE (POS) SYSTEM TYPES
// =============================================================

export interface PosProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: 'Industrial Components' | 'Fasteners & Hardware' | 'Safety & PPE' | 'Hospitality & Retail' | 'Services & Labor' | 'Replacement Spares';
  price: number;
  cost: number;
  stockQty: number;
  taxRate: number; // e.g. 0.0825 (8.25%)
  unit: string;
  imageUrl?: string;
  description?: string;
}

export interface PosCartItem {
  id: string;
  product: PosProduct;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  notes?: string;
}

export type PosPaymentMethod = 'credit_card' | 'cash' | 'corporate_po' | 'room_folio_charge' | 'split';

export interface PosOrder {
  id: string;
  orderNumber: string;
  receiptNumber: string;
  items: PosCartItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  paymentMethod: PosPaymentMethod;
  paymentStatus: 'completed' | 'pending' | 'refunded';
  cashierId: string;
  cashierName: string;
  customerName?: string;
  customerEmail?: string;
  roomChargeDetails?: {
    reservationId: string;
    unitNumber: string;
    guestName: string;
  };
  timestamp: string;
  amountTendered?: number;
  changeDue?: number;
}

export interface PosRegisterShift {
  id: string;
  registerNumber: string;
  cashierId: string;
  cashierName: string;
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  currentCash: number;
  expectedCash: number;
  totalCardSales: number;
  totalCashSales: number;
  totalRoomCharges: number;
  status: 'open' | 'closed';
}

// =============================================================
// PROPERTY MANAGEMENT SYSTEM (PMS) TYPES
// =============================================================

export interface PropertyUnit {
  id: string;
  propertyName: string;
  unitNumber: string;
  unitType: 'Executive Suite' | 'Loft Suite' | 'Industrial Pod' | 'Conference Villa' | 'Studio Residence';
  floor: number;
  maxGuests: number;
  baseRate: number;
  cleaningStatus: 'clean' | 'dirty' | 'inspecting' | 'maintenance';
  occupancyStatus: 'vacant' | 'occupied' | 'reserved' | 'blocked';
  amenities: string[];
  assignedHousekeeper?: string;
  currentGuestName?: string;
  currentReservationId?: string;
  nextCheckIn?: string;
  notes?: string;
}

export interface PropertyReservation {
  id: string;
  reservationCode: string;
  unitId: string;
  unitNumber: string;
  propertyName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCount: number;
  checkInDate: string;
  checkOutDate: string;
  totalNights: number;
  nightlyRate: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'deposit_paid' | 'pending' | 'folio_open';
  channelOrigin: 'direct' | 'airbnb' | 'booking_com' | 'vrbo' | 'corporate_po';
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  specialRequests?: string;
  folioCharges?: Array<{
    id: string;
    description: string;
    amount: number;
    date: string;
    category: 'room' | 'pos_charge' | 'service' | 'damage_deposit';
  }>;
}

// =============================================================
// CHANNEL MANAGEMENT SYSTEM (CMS) TYPES
// =============================================================

export interface DistributionChannel {
  id: string;
  name: string;
  code: 'airbnb' | 'booking_com' | 'vrbo' | 'expedia' | 'direct' | 'corporate';
  status: 'active' | 'syncing' | 'paused' | 'error';
  syncHealthPct: number;
  lastSyncedAt: string;
  activeListingsCount: number;
  commissionPct: number;
  rateMarkupPct: number; // e.g. +10% markup pushed to this channel
  autoSyncInventory: boolean;
  apiKeyMasked: string;
}

export interface ChannelSyncEvent {
  id: string;
  channelName: string;
  eventType: 'reservation_import' | 'rate_push' | 'availability_block' | 'cancellation_sync' | 'calendar_handshake';
  details: string;
  timestamp: string;
  status: 'success' | 'warning' | 'failed';
}

export interface UnitIcalConnection {
  unitId: string;
  unitNumber: string;
  propertyName: string;
  exportUrl: string;
  exportToken: string;
  inboundFeeds: Array<{
    id: string;
    channelCode: 'airbnb' | 'booking_com' | 'vrbo' | 'other';
    channelName: string;
    feedUrl: string;
    lastSyncedAt?: string;
    syncStatus: 'active' | 'syncing' | 'error' | 'idle';
    eventsImportedCount: number;
    errorDetails?: string;
  }>;
}

export interface IcalParsedEvent {
  uid: string;
  summary: string;
  startDate: string;
  endDate: string;
  channel: string;
  unitNumber: string;
  description?: string;
}


