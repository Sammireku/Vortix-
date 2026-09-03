import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  DollarSign,
  Plus,
  ShieldAlert,
  Gauge,
  User,
  CheckSquare,
  Square,
  FileText,
} from 'lucide-react';
import {
  MaintenanceAsset,
  MaintenanceWorkOrder,
  RoleDefinition,
} from '../../types';

interface MaintenanceCmmsViewProps {
  assets: MaintenanceAsset[];
  workOrders: MaintenanceWorkOrder[];
  currentRole: RoleDefinition;
  onToggleTask: (workOrderId: string, taskId: string) => void;
  onCompleteWorkOrder: (workOrderId: string) => void;
  onCreateWorkOrder: (order: Partial<MaintenanceWorkOrder>) => void;
}

export const MaintenanceCmmsView: React.FC<MaintenanceCmmsViewProps> = ({
  assets,
  workOrders,
  currentRole,
  onToggleTask,
  onCompleteWorkOrder,
  onCreateWorkOrder,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    workOrders[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'work_orders' | 'assets'>('work_orders');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // New Work Order Form State
  const [newAssetId, setNewAssetId] = useState(assets[0]?.id || '');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<MaintenanceWorkOrder['type']>('preventative');
  const [newPriority, setNewPriority] = useState<MaintenanceWorkOrder['priority']>('medium');
  const [newTech, setNewTech] = useState('Dave Miller');
  const [newHours, setNewHours] = useState('2.5');
  const [newDescription, setNewDescription] = useState('');

  const selectedOrder = workOrders.find((w) => w.id === selectedOrderId) || workOrders[0];

  const operationalAssetsCount = assets.filter((a) => a.status === 'operational').length;
  const serviceDueCount = assets.filter((a) => a.status === 'service_due').length;
  const avgHealthScore = Math.round(
    assets.reduce((acc, a) => acc + a.healthScore, 0) / (assets.length || 1)
  );

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const targetAsset = assets.find((a) => a.id === newAssetId);
    onCreateWorkOrder({
      id: `pm-${Date.now().toString().slice(-4)}`,
      assetId: newAssetId,
      assetName: targetAsset?.name || 'Industrial Asset',
      title: newTitle,
      type: newType,
      priority: newPriority,
      scheduledDate: new Date().toISOString().split('T')[0],
      assignedTechnician: newTech,
      status: 'scheduled',
      estimatedHours: parseFloat(newHours) || 2.0,
      description: newDescription,
      tasks: [
        { id: 't1', description: 'Lockout/Tagout (LOTO) verification', completed: true },
        { id: 't2', description: 'Inspect and clean operational surfaces', completed: false },
        { id: 't3', description: 'Calibrate pressure & mechanical stops', completed: false },
      ],
      spareParts: [],
      totalCost: 150.0,
    });

    setIsNewOrderModalOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E5DE] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-md bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] font-semibold">
              Reliability Engineering
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] font-medium font-mono">
              CMMS v3.8
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2D2D24] tracking-tight">
            Preventative Maintenance & Equipment Asset Management
          </h2>
          <p className="text-xs text-[#787668]">
            Machine health monitoring, operating hour thresholds, LOTO compliance, and preventative work order task execution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Tab Switcher */}
          <div className="flex items-center bg-[#F5F5F0] p-1 rounded-xl border border-[#E5E5DE] text-xs font-medium">
            <button
              onClick={() => setActiveTab('work_orders')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'work_orders' ? 'bg-white text-[#5A5A40] shadow-xs font-semibold' : 'text-[#787668]'
              }`}
            >
              PM Work Orders ({workOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('assets')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'assets' ? 'bg-white text-[#5A5A40] shadow-xs font-semibold' : 'text-[#787668]'
              }`}
            >
              Asset Registry ({assets.length})
            </button>
          </div>

          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="flex items-center gap-1.5 text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule PM</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E5E5DE] shadow-xs">
          <div className="text-[11px] text-[#8B7E66] font-medium">Fleet Asset Health Index</div>
          <div className="text-2xl font-serif font-bold text-[#2D2D24] mt-1">
            {avgHealthScore}%
          </div>
          <div className="text-[11px] text-[#5A5A40] font-medium mt-1">
            4 of 4 critical machines mapped
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E5DE] shadow-xs">
          <div className="text-[11px] text-[#8B7E66] font-medium">Mean Time Between Failures</div>
          <div className="text-2xl font-serif font-bold text-[#2D2D24] mt-1">
            450 <span className="text-sm font-sans font-normal text-[#787668]">Hours MTBF</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            +18% over prior quarter
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E5DE] shadow-xs">
          <div className="text-[11px] text-[#8B7E66] font-medium">Service Due Warning</div>
          <div className="text-2xl font-serif font-bold text-amber-600 mt-1">
            {serviceDueCount} Machine
          </div>
          <div className="text-[11px] text-amber-600/80 font-medium mt-1">
            300T Press nearing 6,900h interval
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E5DE] shadow-xs">
          <div className="text-[11px] text-[#8B7E66] font-medium">Mean Time To Repair</div>
          <div className="text-2xl font-serif font-bold text-[#2D2D24] mt-1">
            3.2 <span className="text-sm font-sans font-normal text-[#787668]">Hours MTTR</span>
          </div>
          <div className="text-[11px] text-[#787668] mt-1">
            Rapid response dispatch active
          </div>
        </div>
      </div>

      {activeTab === 'work_orders' ? (
        /* Work Orders Split Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Work Orders List */}
          <div className="bg-white rounded-2xl border border-[#E5E5DE] shadow-xs p-5 space-y-3">
            <h3 className="font-serif font-bold text-base text-[#2D2D24] pb-2 border-b border-[#E5E5DE]">
              Active & Scheduled Maintenance
            </h3>

            <div className="space-y-2.5">
              {workOrders.map((wo) => {
                const isSelected = wo.id === selectedOrderId;
                const completedTasks = wo.tasks.filter((t) => t.completed).length;

                return (
                  <div
                    key={wo.id}
                    onClick={() => setSelectedOrderId(wo.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#5A5A40]/10 border-[#5A5A40] shadow-xs'
                        : 'bg-white border-[#E5E5DE] hover:border-[#8B7E66]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-[#5A5A40]">
                        {wo.id.toUpperCase()}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          wo.priority === 'critical'
                            ? 'bg-red-100 text-red-700'
                            : wo.priority === 'high'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {wo.priority}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-[#2D2D24] line-clamp-1">{wo.title}</h4>
                    <div className="text-[10px] text-[#8B7E66] mt-0.5">{wo.assetName}</div>

                    <div className="flex items-center justify-between text-[10px] text-[#787668] mt-2 pt-2 border-t border-[#E5E5DE]">
                      <span>Due: {wo.scheduledDate}</span>
                      <span>
                        Tasks: {completedTasks}/{wo.tasks.length}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Work Order Execution Card */}
          {selectedOrder && (
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E5DE] shadow-xs p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5DE]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-md bg-[#F5F5F0] text-[#5A5A40] font-semibold">
                      {selectedOrder.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-[#8B7E66]">Target: {selectedOrder.assetName}</span>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[#2D2D24]">
                    {selectedOrder.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {selectedOrder.status !== 'completed' ? (
                    <button
                      onClick={() => onCompleteWorkOrder(selectedOrder.id)}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete Work Order</span>
                    </button>
                  ) : (
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-xl border border-emerald-300">
                      Work Order Completed
                    </span>
                  )}
                </div>
              </div>

              {/* Order Scope Description */}
              <div className="bg-[#F5F5F0] p-4 rounded-xl border border-[#E5E5DE] text-xs text-[#525244] leading-relaxed">
                <span className="font-bold text-[#2D2D24] block mb-1">Service Protocol & Scope:</span>
                {selectedOrder.description}
              </div>

              {/* Tasks Checklist */}
              <div>
                <h4 className="font-serif font-bold text-sm text-[#2D2D24] mb-3">
                  Safety & Maintenance Checkpoints
                </h4>
                <div className="space-y-2">
                  {selectedOrder.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onToggleTask(selectedOrder.id, task.id)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E5DE] hover:bg-[#F5F5F0]/60 transition-colors cursor-pointer text-xs"
                    >
                      {task.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-[#8B7E66] shrink-0" />
                      )}
                      <span className={task.completed ? 'line-through text-[#8B7E66]' : 'text-[#2D2D24]'}>
                        {task.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Replaced Spare Parts & Cost Log */}
              {selectedOrder.spareParts.length > 0 && (
                <div className="pt-4 border-t border-[#E5E5DE]">
                  <h4 className="font-serif font-bold text-sm text-[#2D2D24] mb-2">
                    Spare Parts & Consumables Consumed
                  </h4>
                  <div className="bg-[#F5F5F0] rounded-xl p-3 border border-[#E5E5DE] space-y-1.5 text-xs">
                    {selectedOrder.spareParts.map((part, idx) => (
                      <div key={idx} className="flex justify-between text-[#525244]">
                        <span>{part.partName} &times; {part.quantity}</span>
                        <span className="font-mono font-semibold text-[#2D2D24]">${part.cost.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t border-[#E5E5DE] font-bold text-[#2D2D24]">
                      <span>Total Maintenance Cost:</span>
                      <span className="font-mono">${selectedOrder.totalCost?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Asset Registry Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assets.map((asset) => {
            const hoursPercent = Math.min(
              100,
              Math.round((asset.operatingHours / asset.nextServiceHours) * 100)
            );
            const isDue = asset.operatingHours >= asset.nextServiceHours - 50;

            return (
              <div
                key={asset.id}
                className="bg-white rounded-2xl border border-[#E5E5DE] shadow-xs p-5 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-[#5A5A40] font-bold">
                      {asset.code}
                    </span>
                    <h3 className="font-serif font-bold text-base text-[#2D2D24]">
                      {asset.name}
                    </h3>
                    <div className="text-xs text-[#8B7E66]">{asset.location}</div>
                  </div>
                  <span
                    className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                      isDue
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {isDue ? 'Service Due' : 'Operational'}
                  </span>
                </div>

                {/* Operating Hours Progress */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[#8B7E66]">
                    <span>Operating Hours:</span>
                    <span className="font-mono font-bold text-[#2D2D24]">
                      {asset.operatingHours} / {asset.nextServiceHours} hrs
                    </span>
                  </div>
                  <div className="w-full bg-[#F5F5F0] rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${isDue ? 'bg-amber-500' : 'bg-[#5A5A40]'}`}
                      style={{ width: `${hoursPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-2 border-t border-[#E5E5DE]">
                  <div className="bg-[#F5F5F0] p-2 rounded-xl">
                    <span className="text-[#8B7E66] block text-[10px] font-sans">Health Score</span>
                    <span className="font-bold text-[#2D2D24]">{asset.healthScore}%</span>
                  </div>
                  <div className="bg-[#F5F5F0] p-2 rounded-xl">
                    <span className="text-[#8B7E66] block text-[10px] font-sans">MTBF</span>
                    <span className="font-bold text-[#2D2D24]">{asset.mtbfHours}h</span>
                  </div>
                  <div className="bg-[#F5F5F0] p-2 rounded-xl">
                    <span className="text-[#8B7E66] block text-[10px] font-sans">MTTR</span>
                    <span className="font-bold text-[#2D2D24]">{asset.mttrHours}h</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New PM Work Order Modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2D2D24]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateOrderSubmit}
            className="bg-white rounded-3xl p-6 max-w-lg w-full border border-[#E5E5DE] shadow-2xl animate-in zoom-in-95 duration-150 space-y-4"
          >
            <div className="flex items-center gap-2 text-[#5A5A40]">
              <Wrench className="w-5 h-5" />
              <h3 className="font-serif font-bold text-lg text-[#2D2D24]">
                Schedule Equipment Preventative Maintenance
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#8B7E66] font-medium block mb-1">Target Asset</label>
                <select
                  value={newAssetId}
                  onChange={(e) => setNewAssetId(e.target.value)}
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-[#2D2D24] font-medium focus:ring-1 focus:ring-[#5A5A40] outline-hidden cursor-pointer"
                >
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[#8B7E66] font-medium block mb-1">Order Title / Objective</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 500-Hour Hydraulic Seal & Oil Flush"
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-[#2D2D24] focus:ring-1 focus:ring-[#5A5A40] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#8B7E66] font-medium block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-[#2D2D24] font-medium focus:ring-1 focus:ring-[#5A5A40] outline-hidden cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#8B7E66] font-medium block mb-1">Assigned Technician</label>
                  <input
                    type="text"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-[#2D2D24] focus:ring-1 focus:ring-[#5A5A40] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#8B7E66] font-medium block mb-1">Protocol Instructions</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe tasks, torques, fluid specifications, and safety precautions..."
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:ring-1 focus:ring-[#5A5A40] outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsNewOrderModalOpen(false)}
                className="text-xs px-4 py-2 rounded-xl text-[#787668] hover:bg-[#F5F5F0] font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Create Work Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
