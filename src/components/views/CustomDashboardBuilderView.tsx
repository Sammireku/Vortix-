import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Plus,
  Edit3,
  Check,
  Share2,
  Download,
  Upload,
  Maximize2,
  Minimize2,
  Trash2,
  Copy,
  FolderPlus,
  Sparkles,
  Layers,
  X,
  Search,
  Users,
  Lock,
  Unlock,
  Eye,
  GripVertical,
  CheckCircle2,
  HelpCircle,
  Factory,
  ClipboardCheck,
  Activity,
  Cpu,
  Wrench,
  Truck,
  Boxes,
  ShieldAlert,
  TrendingUp,
  Zap,
  AlertTriangle,
  FileText,
  RotateCcw,
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  SlidersHorizontal,
  ShieldCheck,
  History,
  Radio,
  Grid3X3,
  Move,
  Database,
  Link2,
  Crosshair,
  CheckSquare,
  Square,
  BookmarkPlus,
  Printer,
  Send,
} from 'lucide-react';
import {
  CustomDashboard,
  DashboardWidget,
  ProductionLine,
  WorkOrder,
  DigitalTraveler,
  FloorCell,
  AgvVehicle,
  BomNode,
  MaintenanceAsset,
  MaintenanceWorkOrder,
  Shipment,
  InventoryItem,
  OperationalAlert,
  MrpRequirement,
  RoleDefinition,
  ViewTab,
  DashboardVersionSnapshot,
  WidgetType,
  WidgetCategory,
  Invoice,
  FinanceMetric,
  CrmDeal,
  MarketingCampaign,
  LayoutMode,
  GridDensity,
  BreakpointView,
  GlobalFilterState,
} from '../../types';
import { WidgetRenderer } from '../dashboard/WidgetRenderer';
import { widgetCatalog, WidgetCatalogItem, initialCustomDashboards } from '../../data/dashboardPresets';

interface CustomDashboardBuilderViewProps {
  lines: ProductionLine[];
  workOrders: WorkOrder[];
  travelers: DigitalTraveler[];
  floorCells: FloorCell[];
  agvFleet: AgvVehicle[];
  multiLevelBom: BomNode[];
  maintenanceAssets: MaintenanceAsset[];
  maintenanceOrders: MaintenanceWorkOrder[];
  shipments: Shipment[];
  inventory: InventoryItem[];
  alerts: OperationalAlert[];
  currentRole: RoleDefinition;

  // Actions
  onNavigateTab: (tab: ViewTab) => void;
  onUpdateStep?: (travelerId: string, stepId: string, val: string | number, status: 'passed' | 'failed') => void;
  onSignOffTraveler?: (travelerId: string, badgeId: string, comments: string) => void;
  onDraftPurchaseOrder?: (mrpItem: MrpRequirement) => void;
  onToggleMaintenanceTask?: (woId: string, taskId: string) => void;
  onEmergencyStopBay?: (bayName: string) => void;
  onOpenBarcodeScanner?: () => void;
  onOpenPrintLabel?: () => void;
  onUpdateLineStatus?: (lineId: string, status: ProductionLine['status']) => void;
  onAcknowledgeAlert?: (alertId: string) => void;
  onShowNotification?: (title: string, message: string, type?: 'success' | 'alert') => void;
  invoices?: Invoice[];
  finance?: FinanceMetric;
  deals?: CrmDeal[];
  campaigns?: MarketingCampaign[];
  onPayInvoice?: (invoiceId: string) => void;
  onAdvanceDealStage?: (dealId: string) => void;
}

const STORAGE_KEY = 'mfg_custom_dashboards_v1';

export const CustomDashboardBuilderView: React.FC<CustomDashboardBuilderViewProps> = ({
  lines,
  workOrders,
  travelers,
  floorCells,
  agvFleet,
  multiLevelBom,
  maintenanceAssets,
  maintenanceOrders,
  shipments,
  inventory,
  alerts,
  currentRole,
  onNavigateTab,
  onUpdateStep,
  onSignOffTraveler,
  onDraftPurchaseOrder,
  onToggleMaintenanceTask,
  onEmergencyStopBay,
  onOpenBarcodeScanner,
  onOpenPrintLabel,
  onUpdateLineStatus,
  onAcknowledgeAlert,
  onShowNotification,
  invoices,
  finance,
  deals,
  campaigns,
  onPayInvoice,
  onAdvanceDealStage,
}) => {
  // 1. Dashboards State (with LocalStorage persistence)
  const [dashboards, setDashboards] = useState<CustomDashboard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading custom dashboards from storage:', e);
    }
    return initialCustomDashboards;
  });

  const [activeDashboardId, setActiveDashboardId] = useState<string>(() => {
    return dashboards[0]?.id || 'dash-shop-floor';
  });

  // Save to LocalStorage whenever dashboards change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
    } catch (e) {
      console.error('Error saving custom dashboards to storage:', e);
    }
  }, [dashboards]);

  // Find active dashboard
  const activeDashboard =
    dashboards.find((d) => d.id === activeDashboardId) || dashboards[0];

  // 2. UI State
  const [isEditMode, setIsEditMode] = useState<boolean>(!activeDashboard.isLocked);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isKioskMode, setIsKioskMode] = useState<boolean>(false);

  // Widget Catalog Search & Filter
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogCategory, setCatalogCategory] = useState<string>('all');

  // Drag-and-Drop state
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<string | null>(null);

  // New Dashboard Form State
  const [newDashName, setNewDashName] = useState<string>('');
  const [newDashDescription, setNewDashDescription] = useState<string>('');
  const [newDashTeam, setNewDashTeam] = useState<string>('');
  const [newDashTemplate, setNewDashTemplate] = useState<string>('blank');

  // Layout & Builder Mechanics State
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(activeDashboard.layoutMode || 'grid');
  const [gridDensity, setGridDensity] = useState<GridDensity>(activeDashboard.gridDensity || 'standard');
  const [breakpointView, setBreakpointView] = useState<BreakpointView>('desktop');

  // History Stack for Undo / Redo
  const [history, setHistory] = useState<DashboardWidget[][]>([activeDashboard.widgets]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Real-Time Streaming & Refresh
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(15);

  // Global Filter State
  const [globalFilter, setGlobalFilter] = useState<GlobalFilterState>({
    dateRange: 'today',
    region: 'All Regions',
    facilityId: 'All Plants',
    department: 'All Operations',
    searchKeyword: '',
  });

  // Enterprise Governance & Versions
  const [isVersionModalOpen, setIsVersionModalOpen] = useState<boolean>(false);
  const [isGovernanceModalOpen, setIsGovernanceModalOpen] = useState<boolean>(false);
  const [newVersionNote, setNewVersionNote] = useState<string>('');

  // Component Manipulation: Multi-Select, Alignment Guides, Draft State
  const [selectedWidgetIds, setSelectedWidgetIds] = useState<string[]>([]);
  const [showAlignmentGuides, setShowAlignmentGuides] = useState<boolean>(false);
  const [isDraftMode, setIsDraftMode] = useState<boolean>(false);

  // Template Library & Custom Layouts
  const [libraryTab, setLibraryTab] = useState<'catalog' | 'templates'>('catalog');
  const [saveTmplName, setSaveTmplName] = useState<string>('');
  const [saveTmplDesc, setSaveTmplDesc] = useState<string>('');
  const [customTemplates, setCustomTemplates] = useState<Array<{ id: string; name: string; description: string; widgets: DashboardWidget[] }>>(() => {
    try {
      const saved = localStorage.getItem('vortix_custom_templates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Update edit mode and reset history when switching dashboards
  useEffect(() => {
    if (activeDashboard) {
      setIsEditMode(!activeDashboard.isLocked);
      setLayoutMode(activeDashboard.layoutMode || 'grid');
      setGridDensity(activeDashboard.gridDensity || 'standard');
      setHistory([activeDashboard.widgets]);
      setHistoryIndex(0);
      setSelectedWidgetIds([]);
    }
  }, [activeDashboardId]);

  const recordHistory = (newWidgets: DashboardWidget[]) => {
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), newWidgets]);
    setHistoryIndex((prev) => prev + 1);
    setIsDraftMode(true);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetWidgets = history[historyIndex - 1];
      setHistoryIndex((prev) => prev - 1);
      setDashboards((prev) =>
        prev.map((d) => (d.id === activeDashboard.id ? { ...d, widgets: targetWidgets } : d))
      );
      onShowNotification?.('Undo Action', 'Reverted previous dashboard change.');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetWidgets = history[historyIndex + 1];
      setHistoryIndex((prev) => prev + 1);
      setDashboards((prev) =>
        prev.map((d) => (d.id === activeDashboard.id ? { ...d, widgets: targetWidgets } : d))
      );
      onShowNotification?.('Redo Action', 'Restored dashboard change.');
    }
  };

  // Keyboard Shortcuts: Ctrl+Z (Undo) and Ctrl+Y / Cmd+Shift+Z (Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, activeDashboard]);

  // Toggle edit mode and persist lock status
  const handleToggleEditMode = () => {
    const nextMode = !isEditMode;
    setIsEditMode(nextMode);
    setDashboards((prev) =>
      prev.map((d) => (d.id === activeDashboard.id ? { ...d, isLocked: !nextMode } : d))
    );
    if (!nextMode) {
      setIsLibraryOpen(false);
      setSelectedWidgetIds([]);
      onShowNotification?.(
        'Team Mode Activated',
        `Dashboard "${activeDashboard.name}" locked for operational team use.`
      );
    }
  };

  // Resize a widget
  const handleResizeWidget = (widgetId: string, newColSpan: 1 | 2 | 3 | 4) => {
    const newWidgets = activeDashboard.widgets.map((w) =>
      w.id === widgetId ? { ...w, colSpan: newColSpan } : w
    );
    recordHistory(newWidgets);
    setDashboards((prev) =>
      prev.map((d) => {
        if (d.id !== activeDashboard.id) return d;
        return {
          ...d,
          widgets: newWidgets,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  // Remove a widget
  const handleRemoveWidget = (widgetId: string) => {
    const newWidgets = activeDashboard.widgets.filter((w) => w.id !== widgetId);
    recordHistory(newWidgets);
    setDashboards((prev) =>
      prev.map((d) => {
        if (d.id !== activeDashboard.id) return d;
        return {
          ...d,
          widgets: newWidgets,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
    setSelectedWidgetIds((prev) => prev.filter((id) => id !== widgetId));
  };

  // Move widget left/right in array
  const handleMoveWidget = (widgetId: string, direction: 'left' | 'right') => {
    const index = activeDashboard.widgets.findIndex((w) => w.id === widgetId);
    if (index === -1) return;
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeDashboard.widgets.length) return;

    const newWidgets = [...activeDashboard.widgets];
    const [moved] = newWidgets.splice(index, 1);
    newWidgets.splice(targetIndex, 0, moved);

    recordHistory(newWidgets);
    setDashboards((prev) =>
      prev.map((d) => {
        if (d.id !== activeDashboard.id) return d;
        return {
          ...d,
          widgets: newWidgets,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  // Add a widget from catalog
  const handleAddWidgetFromCatalog = (item: WidgetCatalogItem) => {
    const newWidget: DashboardWidget = {
      id: `w-${item.type}-${Date.now()}`,
      type: item.type,
      title: item.title,
      category: item.category,
      colSpan: item.defaultColSpan,
      heightMode: 'normal',
    };

    const newWidgets = [...activeDashboard.widgets, newWidget];
    recordHistory(newWidgets);
    setDashboards((prev) =>
      prev.map((d) => {
        if (d.id !== activeDashboard.id) return d;
        return {
          ...d,
          widgets: newWidgets,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );

    onShowNotification?.(
      'Widget Added to Dashboard',
      `"${item.title}" successfully placed on "${activeDashboard.name}".`
    );
  };

  // Multi-Select Grouping Handlers
  const toggleWidgetSelection = (widgetId: string) => {
    setSelectedWidgetIds((prev) =>
      prev.includes(widgetId) ? prev.filter((id) => id !== widgetId) : [...prev, widgetId]
    );
  };

  const handleBulkResize = (colSpan: 1 | 2 | 3 | 4) => {
    if (selectedWidgetIds.length === 0) return;
    const newWidgets = activeDashboard.widgets.map((w) =>
      selectedWidgetIds.includes(w.id) ? { ...w, colSpan } : w
    );
    recordHistory(newWidgets);
    setDashboards((prev) =>
      prev.map((d) => (d.id === activeDashboard.id ? { ...d, widgets: newWidgets } : d))
    );
    onShowNotification?.('Bulk Resized', `Set ${selectedWidgetIds.length} widgets to ${colSpan} column width.`);
  };

  const handleBulkDelete = () => {
    if (selectedWidgetIds.length === 0) return;
    const newWidgets = activeDashboard.widgets.filter((w) => !selectedWidgetIds.includes(w.id));
    recordHistory(newWidgets);
    setDashboards((prev) =>
      prev.map((d) => (d.id === activeDashboard.id ? { ...d, widgets: newWidgets } : d))
    );
    setSelectedWidgetIds([]);
    onShowNotification?.('Widgets Deleted', `Removed ${selectedWidgetIds.length} widgets.`);
  };

  const handleBulkDuplicate = () => {
    if (selectedWidgetIds.length === 0) return;
    const duplicates = activeDashboard.widgets
      .filter((w) => selectedWidgetIds.includes(w.id))
      .map((w) => ({
        ...w,
        id: `w-${w.type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `${w.title} (Copy)`,
      }));
    const newWidgets = [...activeDashboard.widgets, ...duplicates];
    recordHistory(newWidgets);
    setDashboards((prev) =>
      prev.map((d) => (d.id === activeDashboard.id ? { ...d, widgets: newWidgets } : d))
    );
    setSelectedWidgetIds(duplicates.map((d) => d.id));
    onShowNotification?.('Widgets Duplicated', `Duplicated ${duplicates.length} widgets.`);
  };

  // Publish to Live Workflow
  const handlePublishToLive = () => {
    const curVer = String(activeDashboard.version || 'v1.0');
    const num = parseFloat(curVer.replace('v', '')) || 1.0;
    const nextVer = `v${(num + 0.1).toFixed(1)}`;

    const newSnapshot = {
      id: `v-${Date.now()}`,
      versionNumber: nextVer,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: currentRole.name,
      widgets: [...activeDashboard.widgets],
      changeSummary: newVersionNote || `Published live production release: ${nextVer}`,
    };

    setDashboards((prev) =>
      prev.map((d) =>
        d.id === activeDashboard.id
          ? {
              ...d,
              version: nextVer,
              versions: [...(d.versions || []), newSnapshot],
              isLocked: true,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : d
      )
    );
    setIsEditMode(false);
    setIsDraftMode(false);
    setNewVersionNote('');
    onShowNotification?.('Published to Live', `Dashboard version ${nextVer} is now active.`);
  };

  // Rollback to specific version snapshot
  const handleRollbackVersion = (ver: DashboardVersionSnapshot) => {
    setDashboards((prev) =>
      prev.map((d) =>
        d.id === activeDashboard.id
          ? {
              ...d,
              widgets: [...ver.widgets],
              version: ver.versionNumber,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : d
      )
    );
    recordHistory(ver.widgets);
    setIsVersionModalOpen(false);
    onShowNotification?.('Version Restored', `Rollback to ${ver.versionNumber} completed.`);
  };

  // Save Current Layout as Custom Template
  const handleSaveAsTemplate = () => {
    if (!saveTmplName.trim()) return;
    const newTmpl = {
      id: `tmpl-custom-${Date.now()}`,
      name: saveTmplName.trim(),
      description: saveTmplDesc.trim() || 'Custom plant layout template',
      widgets: activeDashboard.widgets.map((w) => ({ ...w })),
    };
    const updated = [...customTemplates, newTmpl];
    setCustomTemplates(updated);
    try {
      localStorage.setItem('vortix_custom_templates', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setSaveTmplName('');
    setSaveTmplDesc('');
    onShowNotification?.('Template Saved', `"${newTmpl.name}" added to Dashboard Template Library.`);
  };

  // Load a template into the active dashboard
  const handleLoadTemplate = (widgets: DashboardWidget[], tmplName: string) => {
    const instantiated = widgets.map((w) => ({
      ...w,
      id: `w-${w.type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    }));
    recordHistory(instantiated);
    setDashboards((prev) =>
      prev.map((d) => (d.id === activeDashboard.id ? { ...d, widgets: instantiated } : d))
    );
    setIsLibraryOpen(false);
    onShowNotification?.('Template Loaded', `Loaded preset "${tmplName}".`);
  };

  // Drag and Drop within grid
  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedWidgetId(widgetId);
    e.dataTransfer.setData('text/plain', widgetId);
  };

  const handleDragOver = (e: React.DragEvent, widgetId: string) => {
    e.preventDefault();
    if (draggedWidgetId && draggedWidgetId !== widgetId) {
      setDragOverWidgetId(widgetId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault();
    setDragOverWidgetId(null);

    // Check if dragging from catalog
    const catalogItemType = e.dataTransfer.getData('application/catalog-item');
    if (catalogItemType) {
      const catalogItem = widgetCatalog.find((c) => c.type === catalogItemType);
      if (catalogItem) {
        handleAddWidgetFromCatalog(catalogItem);
      }
      return;
    }

    // Dragging to reorder
    if (!draggedWidgetId || draggedWidgetId === targetWidgetId) return;

    setDashboards((prev) =>
      prev.map((d) => {
        if (d.id !== activeDashboard.id) return d;
        const sourceIndex = d.widgets.findIndex((w) => w.id === draggedWidgetId);
        const targetIndex = d.widgets.findIndex((w) => w.id === targetWidgetId);
        if (sourceIndex === -1 || targetIndex === -1) return d;

        const newWidgets = [...d.widgets];
        const [moved] = newWidgets.splice(sourceIndex, 1);
        newWidgets.splice(targetIndex, 0, moved);

        return {
          ...d,
          widgets: newWidgets,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
    setDraggedWidgetId(null);
  };

  // Create new Dashboard
  const handleCreateDashboard = () => {
    if (!newDashName.trim()) return;

    let templateWidgets: DashboardWidget[] = [];
    if (newDashTemplate !== 'blank') {
      const template = dashboards.find((d) => d.id === newDashTemplate);
      if (template) {
        templateWidgets = template.widgets.map((w) => ({
          ...w,
          id: `w-${w.type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        }));
      }
    }

    const created: CustomDashboard = {
      id: `dash-custom-${Date.now()}`,
      name: newDashName.trim(),
      description: newDashDescription.trim() || 'Customized team operations dashboard.',
      targetTeam: newDashTeam.trim() || 'Cross-Functional Plant Team',
      category: 'custom',
      icon: 'LayoutDashboard',
      isLocked: false,
      widgets: templateWidgets,
      createdByRole: currentRole.title,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setDashboards((prev) => [...prev, created]);
    setActiveDashboardId(created.id);
    setIsEditMode(true);
    setIsCreateModalOpen(false);
    setNewDashName('');
    setNewDashDescription('');
    setNewDashTeam('');

    onShowNotification?.(
      'New Custom Dashboard Created',
      `"${created.name}" is now active in Builder Mode. Drag and drop tools to configure!`
    );
  };

  // Duplicate current dashboard
  const handleDuplicateDashboard = () => {
    const duplicated: CustomDashboard = {
      ...activeDashboard,
      id: `dash-copy-${Date.now()}`,
      name: `${activeDashboard.name} (Copy)`,
      isDefault: false,
      isLocked: false,
      widgets: activeDashboard.widgets.map((w) => ({
        ...w,
        id: `w-${w.type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      })),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setDashboards((prev) => [...prev, duplicated]);
    setActiveDashboardId(duplicated.id);
    setIsEditMode(true);
    onShowNotification?.(
      'Dashboard Duplicated',
      `Created "${duplicated.name}". Ready for customization.`
    );
  };

  // Delete current dashboard
  const handleDeleteDashboard = () => {
    if (dashboards.length <= 1) {
      alert('Cannot delete the only remaining dashboard.');
      return;
    }
    const remaining = dashboards.filter((d) => d.id !== activeDashboard.id);
    setDashboards(remaining);
    setActiveDashboardId(remaining[0].id);
    onShowNotification?.(
      'Dashboard Removed',
      `"${activeDashboard.name}" was deleted.`
    );
  };

  // Reset to factory defaults
  const handleResetToDefaults = () => {
    if (window.confirm('Reset all custom dashboards back to factory preset templates?')) {
      setDashboards(initialCustomDashboards);
      setActiveDashboardId(initialCustomDashboards[0].id);
      localStorage.removeItem(STORAGE_KEY);
      onShowNotification?.(
        'Reset Complete',
        'All default team dashboards restored.'
      );
    }
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dashboards, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `manufacturing_dashboards_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter widget catalog
  const filteredCatalog = widgetCatalog.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCat = catalogCategory === 'all' || item.category === catalogCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className={`space-y-5 ${isKioskMode ? 'fixed inset-0 z-50 bg-[#F5F5F0] p-6 overflow-y-auto' : ''}`}>
      {/* Top Controls & Dashboard Switcher Bar */}
      <div className="bg-white border border-[#E5E5DE] p-5 rounded-3xl shadow-sm text-[#2D2D24] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Dashboard Title & Switcher */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <select
                  value={activeDashboardId}
                  onChange={(e) => setActiveDashboardId(e.target.value)}
                  className="font-serif font-bold text-lg sm:text-xl text-[#2D2D24] bg-[#F5F5F0] hover:bg-[#E9E9E0] border border-[#E5E5DE] rounded-2xl px-4 py-1.5 pr-8 transition-colors outline-hidden cursor-pointer shadow-2xs"
                >
                  {dashboards.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.isDefault ? '★' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-xs bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Team: {activeDashboard.targetTeam}</span>
              </span>

              {isEditMode ? (
                <span className="text-xs bg-[#FFF9EB] text-[#8C6B1C] border border-[#F5E2B3] px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Builder Mode (Drag & Drop)</span>
                </span>
              ) : (
                <span className="text-xs bg-[#EBF3ED] text-[#2E6930] border border-[#CDE5D2] px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2E6930] animate-pulse" />
                  <span>Team View (Live Active)</span>
                </span>
              )}
            </div>

            <p className="text-xs text-[#8B7E66]">
              {activeDashboard.description} &bull; {activeDashboard.widgets.length} Integrated Tools Placed
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Builder / Team Mode */}
            <button
              onClick={handleToggleEditMode}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${
                isEditMode
                  ? 'bg-[#2E6930] hover:bg-[#255427] text-white'
                  : 'bg-[#5A5A40] hover:bg-[#474732] text-white'
              }`}
            >
              {isEditMode ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock & Use for Team</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Customize Dashboard</span>
                </>
              )}
            </button>

            {/* Add Widget Button (in Edit Mode) */}
            {isEditMode && (
              <button
                onClick={() => setIsLibraryOpen(!isLibraryOpen)}
                className="text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE] font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Tool Catalog</span>
              </button>
            )}

            {/* New Dashboard */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE] font-medium px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="Create new custom dashboard"
            >
              <FolderPlus className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="hidden sm:inline">New Dashboard</span>
            </button>

            {/* Duplicate */}
            <button
              onClick={handleDuplicateDashboard}
              className="text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE] p-2 rounded-xl transition-colors cursor-pointer"
              title="Duplicate current dashboard"
            >
              <Copy className="w-3.5 h-3.5 text-[#787668]" />
            </button>

            {/* Share / Export */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE] p-2 rounded-xl transition-colors cursor-pointer"
              title="Share or export dashboard configuration"
            >
              <Share2 className="w-3.5 h-3.5 text-[#787668]" />
            </button>

            {/* Kiosk Mode Toggle */}
            <button
              onClick={() => setIsKioskMode(!isKioskMode)}
              className="text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE] p-2 rounded-xl transition-colors cursor-pointer"
              title={isKioskMode ? 'Exit Kiosk Fullscreen' : 'Enter Kiosk Fullscreen'}
            >
              {isKioskMode ? (
                <Minimize2 className="w-3.5 h-3.5 text-[#787668]" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 text-[#787668]" />
              )}
            </button>

            {/* Delete Dashboard (if not the only one) */}
            {dashboards.length > 1 && (
              <button
                onClick={handleDeleteDashboard}
                className="text-xs bg-[#FFF5F5] hover:bg-[#FFEAEB] text-[#B33A3A] border border-[#FCDAD7] p-2 rounded-xl transition-colors cursor-pointer"
                title="Delete current dashboard"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Builder Mechanics & Density Sub-Toolbar */}
        <div className="pt-3 border-t border-[#E5E5DE] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Undo/Redo, Layout Mode, Grid Density, Breakpoints */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Undo / Redo */}
            {isEditMode && (
              <div className="flex items-center bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-0.5 shadow-2xs">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="p-1.5 rounded-lg text-[#2D2D24] disabled:text-[#B5B5AC] hover:enabled:bg-white transition-colors cursor-pointer disabled:cursor-not-allowed"
                  title="Undo last change (Ctrl+Z)"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <div className="h-3 w-px bg-[#E5E5DE]" />
                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-1.5 rounded-lg text-[#2D2D24] disabled:text-[#B5B5AC] hover:enabled:bg-white transition-colors cursor-pointer disabled:cursor-not-allowed"
                  title="Redo change (Ctrl+Y)"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Layout Mode: Grid vs Freeform */}
            {isEditMode && (
              <div className="flex items-center bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-0.5 shadow-2xs">
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    layoutMode === 'grid'
                      ? 'bg-white text-[#2D2D24] shadow-2xs'
                      : 'text-[#787668] hover:text-[#2D2D24]'
                  }`}
                  title="Snap-to-Grid Layout"
                >
                  <Grid3X3 className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>Snap Grid</span>
                </button>
                <button
                  onClick={() => setLayoutMode('freeform')}
                  className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    layoutMode === 'freeform'
                      ? 'bg-white text-[#2D2D24] shadow-2xs'
                      : 'text-[#787668] hover:text-[#2D2D24]'
                  }`}
                  title="Freeform Layout (Pixel coordinates & overlapping)"
                >
                  <Move className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>Freeform</span>
                </button>
              </div>
            )}

            {/* Grid Density Selector (when in grid mode) */}
            {isEditMode && layoutMode === 'grid' && (
              <div className="flex items-center gap-1 bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-2 py-1 text-[11px]">
                <span className="text-[#8B7E66] font-medium">Density:</span>
                {(['compact', 'standard', 'spacious'] as GridDensity[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setGridDensity(d)}
                    className={`px-2 py-0.5 rounded-md font-semibold capitalize transition-all cursor-pointer ${
                      gridDensity === d
                        ? 'bg-white text-[#2D2D24] shadow-2xs'
                        : 'text-[#787668] hover:text-[#2D2D24]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}

            {/* Responsive Breakpoint View Simulation */}
            <div className="flex items-center bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-0.5 shadow-2xs">
              <button
                onClick={() => setBreakpointView('desktop')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  breakpointView === 'desktop'
                    ? 'bg-white text-[#2D2D24] shadow-2xs'
                    : 'text-[#787668] hover:text-[#2D2D24]'
                }`}
                title="Desktop Canvas View (100%)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setBreakpointView('tablet')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  breakpointView === 'tablet'
                    ? 'bg-white text-[#2D2D24] shadow-2xs'
                    : 'text-[#787668] hover:text-[#2D2D24]'
                }`}
                title="Shop-Floor Tablet Preview (768px bounded frame)"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setBreakpointView('mobile')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  breakpointView === 'mobile'
                    ? 'bg-white text-[#2D2D24] shadow-2xs'
                    : 'text-[#787668] hover:text-[#2D2D24]'
                }`}
                title="Operator Mobile Preview (375px phone frame)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Alignment Guides Toggle */}
            {isEditMode && (
              <button
                onClick={() => setShowAlignmentGuides(!showAlignmentGuides)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border shadow-2xs ${
                  showAlignmentGuides
                    ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                    : 'bg-[#F5F5F0] text-[#2D2D24] border-[#E5E5DE] hover:bg-[#E9E9E0]'
                }`}
                title="Toggle visual alignment guides & snapping crosshairs"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Alignment Guides</span>
              </button>
            )}

            {/* Draft vs Live Status Pill & Quick Publish */}
            {isEditMode && (
              <div className="flex items-center gap-1.5">
                {isDraftMode ? (
                  <div className="flex items-center gap-1 bg-[#FFF9EB] border border-[#F5E2B3] px-2.5 py-1 rounded-xl text-[11px] font-semibold text-[#8C6B1C]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E59934] animate-ping" />
                    <span>Draft Staged</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-[#EBF3ED] border border-[#CDE5D2] px-2.5 py-1 rounded-xl text-[11px] font-semibold text-[#2E6930]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E6930]" />
                    <span>Live {activeDashboard.version || 'v1.0'}</span>
                  </div>
                )}
                {isDraftMode && (
                  <button
                    onClick={handlePublishToLive}
                    className="px-2.5 py-1 rounded-xl bg-[#2E6930] hover:bg-[#255427] text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                    title="Publish staged layout as new live version"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Publish Live</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Real-time stream, Governance, Version Snapshot & External DB */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Real-time streaming pulse */}
            <div className="flex items-center gap-1.5 bg-[#F5F5F0] border border-[#E5E5DE] px-2.5 py-1 rounded-xl">
              <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-[#2E6930] animate-ping' : 'bg-[#8B7E66]'}`} />
              <button
                onClick={() => setIsStreaming(!isStreaming)}
                className="text-[11px] font-semibold text-[#2D2D24] cursor-pointer hover:underline"
              >
                {isStreaming ? 'Live Stream: Active' : 'Stream Paused'}
              </button>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="text-[11px] bg-transparent border-none text-[#5A5A40] outline-hidden cursor-pointer pl-1 font-mono"
              >
                <option value={5}>5s</option>
                <option value={15}>15s</option>
                <option value={30}>30s</option>
                <option value={60}>60s</option>
              </select>
            </div>

            {/* Version Snapshots Button */}
            <button
              onClick={() => setIsVersionModalOpen(true)}
              className="px-2.5 py-1 bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE] rounded-xl font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Dashboard Version Control & Snapshots"
            >
              <History className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="hidden sm:inline">Versions ({activeDashboard.versions?.length || 1})</span>
            </button>

            {/* Governance & RBAC */}
            <button
              onClick={() => setIsGovernanceModalOpen(true)}
              className="px-2.5 py-1 bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE] rounded-xl font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Governance, RBAC & Row-Level Security Rules"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#2E6930]" />
              <span className="hidden sm:inline">Governance & RLS</span>
            </button>

            {/* Connected DB Link */}
            <button
              onClick={() => onNavigateTab('database_hub')}
              className="px-2.5 py-1 bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE] rounded-xl font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Connect External Database & Visual Queries"
            >
              <Database className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span className="hidden md:inline">Database Hub</span>
            </button>
          </div>
        </div>

        {/* Global Filtering Ribbon (Timeframe, Plant/Region, Search) */}
        <div className="bg-[#FAF9F5] border border-[#E5E5DE] p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[#5A5A40] flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Global Filters:</span>
            </span>

            {/* Date Range Selector */}
            <div className="flex items-center gap-1 bg-white border border-[#E5E5DE] rounded-xl p-0.5">
              {[
                { id: 'today', label: 'Today' },
                { id: '7d', label: 'Last 7D' },
                { id: 'mtd', label: 'MTD' },
                { id: 'qtd', label: 'QTD' },
                { id: 'ytd', label: 'YTD' },
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => setGlobalFilter((prev) => ({ ...prev, dateRange: range.id as any }))}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    globalFilter.dateRange === range.id
                      ? 'bg-[#5A5A40] text-white'
                      : 'text-[#787668] hover:bg-[#F5F5F0]'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Facility / Region Scope */}
            <select
              value={globalFilter.facilityId}
              onChange={(e) => setGlobalFilter((prev) => ({ ...prev, facilityId: e.target.value }))}
              className="bg-white border border-[#E5E5DE] rounded-xl px-2.5 py-1 text-[11px] font-medium text-[#2D2D24] outline-hidden cursor-pointer"
            >
              <option value="All Plants">All Global Facilities</option>
              <option value="Dallas Plant">Dallas Stamping Hub</option>
              <option value="Munich Plant">Munich Precision Optics</option>
              <option value="Tokyo Plant">Tokyo Micro-Assembly</option>
              <option value="London Plant">London Fasteners</option>
            </select>
          </div>

          {/* Live Search & Reset */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3 h-3 text-[#8B7E66] absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Filter widgets & metrics..."
                value={globalFilter.searchKeyword}
                onChange={(e) => setGlobalFilter((prev) => ({ ...prev, searchKeyword: e.target.value }))}
                className="pl-7 pr-2.5 py-1 text-[11px] rounded-xl bg-white border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40] w-44"
              />
            </div>

            {(globalFilter.dateRange !== 'today' || globalFilter.facilityId !== 'All Plants' || globalFilter.searchKeyword) && (
              <button
                onClick={() =>
                  setGlobalFilter({
                    dateRange: 'today',
                    region: 'All Regions',
                    facilityId: 'All Plants',
                    department: 'All Operations',
                    searchKeyword: '',
                  })
                }
                className="text-[11px] text-[#B33A3A] hover:underline font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Builder Mode Guidance Banner */}
        {isEditMode && (
          <div className="p-3 bg-[#F5F5F0] border border-[#E5E5DE] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-[#5A5A40]" />
              <span className="text-[#2D2D24]">
                <strong>Drag and drop</strong> widget cards to reorder. Use column resize selector (1 Col to Full Width) or switch to Freeform for absolute canvas alignment.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsLibraryOpen(true)}
                className="text-xs text-[#5A5A40] font-semibold underline cursor-pointer"
              >
                + Browse 17 Tools
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Widget Library Drawer (Flyout / Collapsible) */}
      {isLibraryOpen && isEditMode && (
        <div className="bg-white border-2 border-[#5A5A40] p-5 rounded-3xl shadow-xl space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DE]">
            <div className="flex items-center gap-3">
              <div className="flex bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-0.5">
                <button
                  onClick={() => setLibraryTab('catalog')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    libraryTab === 'catalog'
                      ? 'bg-white text-[#2D2D24] shadow-2xs'
                      : 'text-[#787668] hover:text-[#2D2D24]'
                  }`}
                >
                  Tool Catalog (17)
                </button>
                <button
                  onClick={() => setLibraryTab('templates')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    libraryTab === 'templates'
                      ? 'bg-white text-[#2D2D24] shadow-2xs'
                      : 'text-[#787668] hover:text-[#2D2D24]'
                  }`}
                >
                  Template Library ({initialCustomDashboards.length + customTemplates.length})
                </button>
              </div>
            </div>
            <button
              onClick={() => setIsLibraryOpen(false)}
              className="p-1.5 rounded-full hover:bg-[#F5F5F0] text-[#787668] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {libraryTab === 'catalog' ? (
            <>
              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-[#8B7E66] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search tools & widgets..."
                    className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] placeholder-[#8B7E66] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 text-xs">
                  {['all', 'operations', 'quality', 'maintenance', 'supply_chain', 'financial', 'collaboration'].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setCatalogCategory(cat)}
                        className={`px-3 py-1 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer capitalize ${
                          catalogCategory === cat
                            ? 'bg-[#5A5A40] text-white'
                            : 'bg-[#F5F5F0] text-[#787668] hover:bg-[#E9E9E0]'
                        }`}
                      >
                        {cat.replace('_', ' ')}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Catalog Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                {filteredCatalog.map((item) => (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('application/catalog-item', item.type);
                    }}
                    className="p-3.5 rounded-2xl bg-[#F5F5F0] border border-[#E5E5DE] hover:border-[#5A5A40] transition-all space-y-2 flex flex-col justify-between cursor-grab active:cursor-grabbing"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2D2D24]">{item.title}</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-white border border-[#E5E5DE] text-[#5A5A40]">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8B7E66] line-clamp-2">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E5E5DE] text-[11px]">
                      <span className="text-[#8B7E66]">Span: {item.defaultColSpan * 25}%</span>
                      <button
                        onClick={() => handleAddWidgetFromCatalog(item)}
                        className="bg-white hover:bg-[#5A5A40] hover:text-white text-[#2D2D24] border border-[#E5E5DE] px-3 py-1 rounded-xl font-semibold transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Template Presets & Save Custom Layout Tab */
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                    Standard Role Presets ({initialCustomDashboards.length})
                  </h4>
                  <span className="text-[11px] text-[#8B7E66]">Click to apply layout to canvas</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {initialCustomDashboards.map((preset) => (
                    <div
                      key={preset.id}
                      className="p-3.5 bg-[#F5F5F0] border border-[#E5E5DE] rounded-2xl hover:border-[#5A5A40] transition-colors space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#2D2D24]">{preset.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-[#E5E5DE] text-[#5A5A40]">
                            {preset.widgets.length} Tools
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8B7E66]">{preset.description}</p>
                        <div className="text-[10px] text-[#5A5A40] font-medium">Team: {preset.targetTeam}</div>
                      </div>
                      <div className="pt-2 border-t border-[#E5E5DE] flex justify-end">
                        <button
                          onClick={() => handleLoadTemplate(preset.widgets, preset.name)}
                          className="bg-white hover:bg-[#5A5A40] hover:text-white text-[#2D2D24] border border-[#E5E5DE] px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                        >
                          Load Layout
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Saved Templates */}
              {customTemplates.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#E5E5DE]">
                  <h4 className="text-xs font-bold text-[#5A5A40] uppercase tracking-wider">
                    Custom Saved Templates ({customTemplates.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customTemplates.map((custom) => (
                      <div
                        key={custom.id}
                        className="p-3.5 bg-white border border-[#E5E5DE] rounded-2xl hover:border-[#5A5A40] transition-colors space-y-2 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#2D2D24]">{custom.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F5F5F0] text-[#5A5A40]">
                              {custom.widgets.length} Tools
                            </span>
                          </div>
                          <p className="text-[11px] text-[#8B7E66]">{custom.description}</p>
                        </div>
                        <div className="pt-2 border-t border-[#E5E5DE] flex items-center justify-between">
                          <button
                            onClick={() => {
                              const updated = customTemplates.filter((t) => t.id !== custom.id);
                              setCustomTemplates(updated);
                              localStorage.setItem('vortix_custom_templates', JSON.stringify(updated));
                            }}
                            className="text-[11px] text-[#B33A3A] hover:underline cursor-pointer"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleLoadTemplate(custom.widgets, custom.name)}
                            className="bg-[#5A5A40] hover:bg-[#474732] text-white px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                          >
                            Apply Layout
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Current Layout as Template Form */}
              <div className="p-4 bg-[#FAF9F5] border border-[#E5E5DE] rounded-2xl space-y-3 pt-3">
                <div className="flex items-center gap-2">
                  <BookmarkPlus className="w-4 h-4 text-[#5A5A40]" />
                  <span className="text-xs font-bold text-[#2D2D24]">Save Current Dashboard Layout as a Preset</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Template Name (e.g. Clean Room Shift Inspection)"
                    value={saveTmplName}
                    onChange={(e) => setSaveTmplName(e.target.value)}
                    className="p-2 text-xs rounded-xl bg-white border border-[#E5E5DE] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
                  />
                  <input
                    type="text"
                    placeholder="Short Description..."
                    value={saveTmplDesc}
                    onChange={(e) => setSaveTmplDesc(e.target.value)}
                    className="p-2 text-xs rounded-xl bg-white border border-[#E5E5DE] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveAsTemplate}
                    disabled={!saveTmplName.trim()}
                    className="px-4 py-1.5 bg-[#5A5A40] hover:bg-[#474732] disabled:bg-[#B5B5AC] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                  >
                    Save as Template Preset
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Drag-and-Drop Dashboard Grid Canvas with Breakpoint Simulation */}
      <div
        className={`transition-all duration-300 relative ${
          breakpointView === 'tablet'
            ? 'max-w-3xl mx-auto p-5 border-2 border-dashed border-[#8B7E66] rounded-3xl bg-[#EBEBE3] shadow-lg'
            : breakpointView === 'mobile'
            ? 'max-w-sm mx-auto p-4 border-4 border-[#2D2D24] rounded-4xl bg-[#EBEBE3] shadow-2xl'
            : 'w-full'
        }`}
      >
        {/* Alignment Guides Global Canvas Overlay */}
        {showAlignmentGuides && isEditMode && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-3xl">
            {/* Center crosshair */}
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[#5A5A40]/30" />
            <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-[#5A5A40]/30" />
            {/* Thirds guidelines */}
            <div className="absolute inset-y-0 left-1/4 border-l border-dotted border-[#5A5A40]/20" />
            <div className="absolute inset-y-0 left-3/4 border-l border-dotted border-[#5A5A40]/20" />
            <div className="absolute inset-x-0 top-1/4 border-t border-dotted border-[#5A5A40]/20" />
            <div className="absolute inset-x-0 top-3/4 border-t border-dotted border-[#5A5A40]/20" />
          </div>
        )}

        {breakpointView !== 'desktop' && (
          <div className="mb-3 flex items-center justify-between text-[11px] font-mono text-[#5A5A40] px-1">
            <span className="font-semibold uppercase tracking-wider">
              {breakpointView === 'tablet' ? 'Shop-Floor Tablet Preview (768px)' : 'Operator Mobile Preview (375px)'}
            </span>
            <span className="bg-white/80 px-2 py-0.5 rounded-full border border-[#E5E5DE]">
              {breakpointView === 'tablet' ? '768 x 1024' : '375 x 812'}
            </span>
          </div>
        )}

        {activeDashboard.widgets.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-[#E5E5DE] rounded-3xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F5F5F0] text-[#5A5A40] flex items-center justify-center mx-auto">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-serif font-bold text-lg text-[#2D2D24]">
                Your Dashboard Canvas is Empty
              </h3>
              <p className="text-xs text-[#8B7E66]">
                Start building your custom team dashboard by opening the Tool Catalog or clicking the recommendations below.
              </p>
            </div>
            <button
              onClick={() => setIsLibraryOpen(true)}
              className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Open Tool Catalog</span>
            </button>
          </div>
        ) : (
          <div
            className={`transition-all ${
              layoutMode === 'freeform'
                ? 'p-5 rounded-3xl bg-white border border-[#E5E5DE] bg-[radial-gradient(#C5C5BC_1px,transparent_1px)] [background-size:20px_20px] shadow-xs'
                : ''
            }`}
          >
            {layoutMode === 'freeform' && isEditMode && (
              <div className="mb-4 p-2.5 bg-[#FFF9EB] border border-[#F5E2B3] rounded-xl flex items-center justify-between text-xs text-[#8C6B1C]">
                <div className="flex items-center gap-2">
                  <Move className="w-4 h-4" />
                  <span>
                    <strong>Freeform Canvas Active:</strong> Elements can be positioned with pixel precision. Drag and drop cards to swap alignment.
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-[#F5E2B3]">
                  Density: 20px Grid Snap
                </span>
              </div>
            )}

            <div
              className={`grid ${
                breakpointView === 'mobile'
                  ? 'grid-cols-1 gap-3'
                  : breakpointView === 'tablet'
                  ? 'grid-cols-1 sm:grid-cols-2 gap-4'
                  : layoutMode === 'freeform'
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5'
                  : gridDensity === 'compact'
                  ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5 p-1'
                  : gridDensity === 'spacious'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8'
                  : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5'
              }`}
            >
              {activeDashboard.widgets
                .filter((w) => {
                  if (!globalFilter.searchKeyword) return true;
                  const kw = globalFilter.searchKeyword.toLowerCase();
                  return w.title.toLowerCase().includes(kw) || w.category.toLowerCase().includes(kw);
                })
                .map((widget, index) => (
                  <div
                    key={widget.id}
                    className={`relative group transition-all duration-200 ${
                      selectedWidgetIds.includes(widget.id)
                        ? 'ring-2 ring-[#5A5A40] rounded-3xl shadow-md'
                        : ''
                    }`}
                    style={{
                      gridColumn:
                        breakpointView === 'mobile'
                          ? 'span 1 / span 1'
                          : breakpointView === 'tablet'
                          ? `span ${Math.min(widget.colSpan || 1, 2)} / span ${Math.min(widget.colSpan || 1, 2)}`
                          : `span ${Math.min(widget.colSpan || 1, 4)} / span ${Math.min(widget.colSpan || 1, 4)}`,
                    }}
                  >
                    {/* Freeform Coordinates Badge */}
                    {layoutMode === 'freeform' && isEditMode && (
                      <div className="absolute -top-2.5 -left-2 z-20 bg-[#2D2D24] text-white text-[9px] font-mono px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 pointer-events-none">
                        <Move className="w-2.5 h-2.5" />
                        <span>X:{index * 24} Y:{index * 16} (Layer {index + 1})</span>
                      </div>
                    )}

                    {/* Multi-Select Checkbox in Edit Mode */}
                    {isEditMode && (
                      <div className="absolute top-3 left-3 z-30 opacity-80 hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWidgetSelection(widget.id);
                          }}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer border shadow-xs ${
                            selectedWidgetIds.includes(widget.id)
                              ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                              : 'bg-white/95 text-[#787668] border-[#E5E5DE] hover:bg-white'
                          }`}
                          title={selectedWidgetIds.includes(widget.id) ? 'Deselect widget' : 'Select for multi-edit'}
                        >
                          {selectedWidgetIds.includes(widget.id) ? (
                            <CheckSquare className="w-3.5 h-3.5" />
                          ) : (
                            <Square className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Alignment Guide Outlines on Component when active */}
                    {showAlignmentGuides && isEditMode && (
                      <>
                        <div className="absolute inset-x-0 -top-1 border-t border-dashed border-[#5A5A40]/30 pointer-events-none z-10" />
                        <div className="absolute inset-x-0 -bottom-1 border-b border-dashed border-[#5A5A40]/30 pointer-events-none z-10" />
                      </>
                    )}

                    <WidgetRenderer
                      widget={widget}
                      isEditMode={isEditMode}
                      globalFilter={globalFilter}
                      onResize={handleResizeWidget}
                      onRemove={handleRemoveWidget}
                      onMove={handleMoveWidget}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      isDragOver={dragOverWidgetId === widget.id}
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
                      onNavigateTab={onNavigateTab}
                      onUpdateStep={onUpdateStep}
                      onSignOffTraveler={onSignOffTraveler}
                      onDraftPurchaseOrder={onDraftPurchaseOrder}
                      onToggleMaintenanceTask={onToggleMaintenanceTask}
                      onEmergencyStopBay={onEmergencyStopBay}
                      onOpenBarcodeScanner={onOpenBarcodeScanner}
                      onOpenPrintLabel={onOpenPrintLabel}
                      onUpdateLineStatus={onUpdateLineStatus}
                      onAcknowledgeAlert={onAcknowledgeAlert}
                      invoices={invoices}
                      finance={finance}
                      deals={deals}
                      campaigns={campaigns}
                      onPayInvoice={onPayInvoice}
                      onAdvanceDealStage={onAdvanceDealStage}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Multi-Select Action Bar */}
      {selectedWidgetIds.length > 0 && isEditMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#2D2D24] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#5A5A40] flex flex-wrap items-center gap-4 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2 pr-2 border-r border-white/20 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#E59934] animate-pulse" />
            <span className="font-semibold">{selectedWidgetIds.length} Selected</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#E5E5DE] text-[11px] font-mono mr-1">Bulk Resize:</span>
            {([1, 2, 3, 4] as const).map((cols) => (
              <button
                key={cols}
                onClick={() => handleBulkResize(cols)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer"
                title={`Set width to ${cols} column${cols > 1 ? 's' : ''}`}
              >
                {cols} Col
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-white/20" />

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handleBulkDuplicate}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              title="Duplicate selected widgets"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicate</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-[#B33A3A] hover:bg-[#8F2E2E] text-white rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              title="Delete selected widgets"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <button
              onClick={() => setSelectedWidgetIds([])}
              className="px-2 py-1 text-[#E5E5DE] hover:text-white text-xs underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Modal: Version History & Snapshot Rollback */}
      {isVersionModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2D2D24]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-[#E5E5DE] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DE]">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#5A5A40]" />
                <h3 className="font-serif font-bold text-lg text-[#2D2D24]">
                  Version Control & Audit History
                </h3>
              </div>
              <button
                onClick={() => setIsVersionModalOpen(false)}
                className="p-1 rounded-full hover:bg-[#F5F5F0] text-[#787668] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#F5F5F0] border border-[#E5E5DE] rounded-2xl space-y-2">
                <span className="text-xs font-semibold text-[#2D2D24]">Create Named Snapshot</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Q3 Plant Manager Approved Layout..."
                    value={newVersionNote}
                    onChange={(e) => setNewVersionNote(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#E5E5DE] rounded-xl outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
                  />
                  <button
                    onClick={() => {
                      if (!newVersionNote.trim()) return;
                      const newVersion = {
                        id: `v-${Date.now()}`,
                        versionNumber: `v1.${(activeDashboard.versions?.length || 0) + 1}`,
                        createdAt: new Date().toISOString().split('T')[0],
                        createdBy: currentRole.name,
                        widgets: [...activeDashboard.widgets],
                        changeSummary: newVersionNote,
                      };
                      setDashboards((prev) =>
                        prev.map((d) =>
                          d.id === activeDashboard.id
                            ? {
                                ...d,
                                versions: [...(d.versions || []), newVersion],
                                version: newVersion.versionNumber,
                              }
                            : d
                        )
                      );
                      setNewVersionNote('');
                      onShowNotification?.('Version Created', `Saved snapshot ${newVersion.versionNumber}`);
                    }}
                    className="px-3 py-1.5 bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Version List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                <span className="text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">
                  Past Revisions ({activeDashboard.versions?.length || 1})
                </span>
                <div className="space-y-2">
                  {(activeDashboard.versions && activeDashboard.versions.length > 0
                    ? activeDashboard.versions
                    : [
                        {
                          id: 'v-init',
                          versionNumber: 'v1.0',
                          createdAt: activeDashboard.updatedAt,
                          createdBy: 'System Default',
                          widgets: activeDashboard.widgets,
                          changeSummary: 'Initial production baseline layout',
                        },
                      ]
                  ).map((ver) => (
                    <div
                      key={ver.id}
                      className="p-3 bg-white border border-[#E5E5DE] rounded-2xl flex items-center justify-between text-xs hover:border-[#5A5A40] transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#2D2D24]">{ver.versionNumber}</span>
                          <span className="text-[10px] text-[#8B7E66]">{ver.createdAt}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F5F5F0] text-[#5A5A40]">
                            {ver.createdBy}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5A5A40]">{ver.changeSummary}</p>
                      </div>

                      <button
                        onClick={() => {
                          recordHistory(ver.widgets);
                          setDashboards((prev) =>
                            prev.map((d) =>
                              d.id === activeDashboard.id
                                ? { ...d, widgets: ver.widgets, version: ver.versionNumber }
                                : d
                            )
                          );
                          setIsVersionModalOpen(false);
                          onShowNotification?.('Version Restored', `Restored to ${ver.versionNumber}`);
                        }}
                        className="px-2.5 py-1 text-[11px] bg-[#F5F5F0] hover:bg-[#5A5A40] hover:text-white border border-[#E5E5DE] rounded-xl font-semibold transition-colors cursor-pointer"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E5E5DE]">
              <button
                onClick={() => setIsVersionModalOpen(false)}
                className="text-xs bg-[#5A5A40] text-white font-semibold px-4 py-2 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Governance, RBAC & Row-Level Security */}
      {isGovernanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2D2D24]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-[#E5E5DE] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DE]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2E6930]" />
                <h3 className="font-serif font-bold text-lg text-[#2D2D24]">
                  Dashboard Governance & Access Control
                </h3>
              </div>
              <button
                onClick={() => setIsGovernanceModalOpen(false)}
                className="p-1 rounded-full hover:bg-[#F5F5F0] text-[#787668] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Role Based Access Matrix */}
              <div className="space-y-2">
                <span className="font-semibold text-[#2D2D24] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>Authorized Roles for this Dashboard</span>
                </span>
                <div className="grid grid-cols-2 gap-2 p-3 bg-[#F5F5F0] border border-[#E5E5DE] rounded-2xl">
                  {[
                    { role: 'plant_manager', label: 'Plant & Operations Manager', checked: true },
                    { role: 'production_supervisor', label: 'Line Supervisors', checked: true },
                    { role: 'quality_engineer', label: 'Quality & Compliance QA', checked: true },
                    { role: 'maintenance_lead', label: 'Maintenance Technicians', checked: true },
                    { role: 'logistics_specialist', label: 'Logistics & Warehouse', checked: false },
                    { role: 'finance_controller', label: 'Finance & Cost Controllers', checked: false },
                  ].map((r) => (
                    <label key={r.role} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-white/60">
                      <input type="checkbox" defaultChecked={r.checked} className="rounded-sm text-[#2E6930]" />
                      <span className="text-[#2D2D24] font-medium">{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Row-Level Security (RLS) Filter */}
              <div className="space-y-2">
                <span className="font-semibold text-[#2D2D24] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#8C6B1C]" />
                  <span>Row-Level Security (RLS) Predicate</span>
                </span>
                <div className="p-3 bg-[#FFF9EB] border border-[#F5E2B3] rounded-2xl space-y-1.5">
                  <p className="text-[11px] text-[#8C6B1C]">
                    Controls what slice of operational data users see based on their assigned facility & department claims.
                  </p>
                  <code className="block p-2 bg-white/80 border border-[#F5E2B3] rounded-xl font-mono text-[11px] text-[#2D2D24]">
                    WHERE facility_id = CURRENT_USER.facility_id AND (role = 'plant_manager' OR department_id = CURRENT_USER.department_id)
                  </code>
                </div>
              </div>

              {/* Security Audit Trail Summary */}
              <div className="p-3 bg-[#F5F5F0] border border-[#E5E5DE] rounded-2xl space-y-1 text-[11px] text-[#5A5A40]">
                <div className="flex justify-between">
                  <span>Last Security Review:</span>
                  <span className="font-mono text-[#2D2D24]">2026-09-02 (Passed SOC2 Type II)</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Auditor:</span>
                  <span className="font-mono text-[#2D2D24]">{currentRole.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data Export Permissions:</span>
                  <span className="font-mono text-[#2E6930]">Masked PII (Enabled)</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E5E5DE]">
              <button
                onClick={() => {
                  setIsGovernanceModalOpen(false);
                  onShowNotification?.('Governance Saved', 'Updated dashboard RBAC and row-level security policy.');
                }}
                className="text-xs bg-[#2E6930] hover:bg-[#255427] text-white font-semibold px-4 py-2 rounded-xl cursor-pointer transition-colors"
              >
                Apply Governance Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create New Dashboard */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2D2D24]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E5DE] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DE]">
              <h3 className="font-serif font-bold text-lg text-[#2D2D24]">
                Create New Custom Dashboard
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full hover:bg-[#F5F5F0] text-[#787668] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#2D2D24] block mb-1">
                  Dashboard Title *
                </label>
                <input
                  type="text"
                  value={newDashName}
                  onChange={(e) => setNewDashName(e.target.value)}
                  placeholder="e.g., Night Shift Stamping Cell Hub"
                  className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#2D2D24] block mb-1">
                  Target Team / Role *
                </label>
                <input
                  type="text"
                  value={newDashTeam}
                  onChange={(e) => setNewDashTeam(e.target.value)}
                  placeholder="e.g., Shift B CNC Operators, Quality Audit Team"
                  className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#2D2D24] block mb-1">
                  Description
                </label>
                <textarea
                  value={newDashDescription}
                  onChange={(e) => setNewDashDescription(e.target.value)}
                  placeholder="Purpose of this dashboard for the team..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40] resize-none"
                />
              </div>

              <div>
                <label className="font-semibold text-[#2D2D24] block mb-1">
                  Starting Template
                </label>
                <select
                  value={newDashTemplate}
                  onChange={(e) => setNewDashTemplate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
                >
                  <option value="blank">Blank Canvas (Start from scratch)</option>
                  {dashboards.map((d) => (
                    <option key={d.id} value={d.id}>
                      Duplicate from: {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E5DE]">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-xs px-4 py-2 rounded-xl text-[#787668] hover:bg-[#F5F5F0] font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDashboard}
                disabled={!newDashName.trim()}
                className="text-xs bg-[#5A5A40] hover:bg-[#474732] disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create & Configure</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Share & Export */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2D2D24]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E5DE] shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E5DE]">
              <h3 className="font-serif font-bold text-lg text-[#2D2D24]">
                Team Collaboration & Export
              </h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1 rounded-full hover:bg-[#F5F5F0] text-[#787668] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#F5F5F0] border border-[#E5E5DE] rounded-2xl space-y-1">
                <div className="font-semibold text-[#2D2D24]">Team Kiosk Link</div>
                <p className="text-[11px] text-[#8B7E66]">
                  Share this dashboard with floor tablets, TV wall monitors, or operator terminals.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/#dashboard=${activeDashboard.id}`}
                    className="w-full text-[11px] font-mono p-2 rounded-xl bg-white border border-[#E5E5DE] text-[#2D2D24]"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/#dashboard=${activeDashboard.id}`
                      );
                      onShowNotification?.(
                        'Link Copied',
                        'Team share link copied to clipboard.'
                      );
                    }}
                    className="bg-[#5A5A40] text-white px-3 py-2 rounded-xl font-medium cursor-pointer shrink-0 hover:bg-[#474732]"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleExportJson}
                  className="p-3 bg-[#F5F5F0] hover:bg-[#E9E9E0] border border-[#E5E5DE] rounded-2xl text-left transition-colors cursor-pointer flex flex-col justify-between gap-2"
                >
                  <Download className="w-4 h-4 text-[#5A5A40]" />
                  <div>
                    <div className="font-semibold text-[#2D2D24]">Export JSON</div>
                    <div className="text-[10px] text-[#8B7E66]">Download layout backup</div>
                  </div>
                </button>

                <button
                  onClick={handleResetToDefaults}
                  className="p-3 bg-[#FFF5F5] hover:bg-[#FFEAEB] border border-[#FCDAD7] rounded-2xl text-left transition-colors cursor-pointer flex flex-col justify-between gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-[#B33A3A]" />
                  <div>
                    <div className="font-semibold text-[#B33A3A]">Reset Presets</div>
                    <div className="text-[10px] text-[#D9534F]">Restore default dashboards</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E5E5DE]">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-xs bg-[#5A5A40] text-white font-semibold px-4 py-2 rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
