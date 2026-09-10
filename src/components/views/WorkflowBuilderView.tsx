import React, { useState } from 'react';
import {
  Workflow,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Cpu,
  Boxes,
  Truck,
  ArrowRight,
  Settings2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Shield,
  Layers,
  Radio,
  FileCode,
  Sparkles,
} from 'lucide-react';
import {
  CustomWorkflow,
  WorkflowNode,
  WorkflowTriggerType,
  RoleDefinition,
} from '../../types';

interface WorkflowBuilderViewProps {
  workflows: CustomWorkflow[];
  currentRole: RoleDefinition;
  onToggleWorkflow: (workflowId: string) => void;
  onRunWorkflowSimulation: (workflow: CustomWorkflow) => void;
  onAddWorkflow: (workflow: CustomWorkflow) => void;
}

export const WorkflowBuilderView: React.FC<WorkflowBuilderViewProps> = ({
  workflows,
  currentRole,
  onToggleWorkflow,
  onRunWorkflowSimulation,
  onAddWorkflow,
}) => {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(workflows[0]?.id || '');
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showNewWorkflowModal, setShowNewWorkflowModal] = useState(false);

  // New workflow modal state
  const [newWfName, setNewWfName] = useState('');
  const [newWfDesc, setNewWfDesc] = useState('');
  const [newWfTrigger, setNewWfTrigger] = useState<WorkflowTriggerType>('inventory_low_stock');

  const canWrite =
    currentRole.permissions.workflows === 'admin' ||
    currentRole.permissions.workflows === 'write';

  const activeWorkflow = workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];

  const handleSimulate = async () => {
    if (!activeWorkflow) return;
    setIsSimulating(true);
    setSimulationLogs([
      `[00.00s] Initializing Low-Code Event Engine...`,
      `[00.15s] Listening for trigger: ${activeWorkflow.triggerType}`,
    ]);

    await new Promise((r) => setTimeout(r, 400));
    setSimulationLogs((prev) => [
      ...prev,
      `[00.45s] MATCHED: Trigger event fired with payload: { facilityId: "plant-1", telemetryStatus: "active" }`,
    ]);

    await new Promise((r) => setTimeout(r, 450));
    setSimulationLogs((prev) => [
      ...prev,
      `[00.90s] Evaluating condition nodes: ${activeWorkflow.nodes.filter((n) => n.type === 'condition').map((n) => n.title).join(', ')} -> PASSED`,
    ]);

    await new Promise((r) => setTimeout(r, 400));
    setSimulationLogs((prev) => [
      ...prev,
      `[01.30s] Executing actions: ${activeWorkflow.nodes.filter((n) => n.type === 'action').map((n) => n.title).join(', ')}`,
      `[01.65s] Dispatching third-party API webhook integration payload -> Status 200 OK`,
      `[01.90s] Workflow execution completed successfully. State persisted.`,
    ]);
    setIsSimulating(false);
    onRunWorkflowSimulation(activeWorkflow);
  };

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfName.trim()) return;

    const newWf: CustomWorkflow = {
      id: `wf-${Date.now().toString().slice(-4)}`,
      name: newWfName,
      description: newWfDesc || 'Custom low-code manufacturing event orchestration workflow.',
      enabled: true,
      triggerType: newWfTrigger,
      executionCount: 0,
      lastRun: 'Never',
      status: 'active',
      nodes: [
        {
          id: `node-${Date.now()}-1`,
          type: 'trigger',
          title: newWfName.split(' ')[0] + ' Trigger',
          subType: newWfTrigger,
          config: { frequency: 'real_time' },
          x: 60,
          y: 120,
        },
        {
          id: `node-${Date.now()}-2`,
          type: 'condition',
          title: 'Validate Threshold & Role Policy',
          subType: 'rule_evaluation',
          config: { autoApprove: true },
          x: 320,
          y: 120,
        },
        {
          id: `node-${Date.now()}-3`,
          type: 'action',
          title: 'Automated ERP Task Dispatch',
          subType: 'create_purchase_order',
          config: { notifySupervisor: true },
          x: 600,
          y: 120,
        },
      ],
      edges: [
        { id: `e-${Date.now()}-1`, from: `node-${Date.now()}-1`, to: `node-${Date.now()}-2` },
        { id: `e-${Date.now()}-2`, from: `node-${Date.now()}-2`, to: `node-${Date.now()}-3`, conditionLabel: 'Approved' },
      ],
    };

    onAddWorkflow(newWf);
    setSelectedWorkflowId(newWf.id);
    setShowNewWorkflowModal(false);
    setNewWfName('');
    setNewWfDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E5DE] p-6 rounded-3xl shadow-sm text-[#2D2D24]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-serif italic font-medium tracking-tight text-[#2D2D24] flex items-center gap-2.5">
              <Workflow className="w-5 h-5 text-[#5A5A40]" />
              Low-Code Custom Workflow Engine
            </h1>
            <span className="text-xs bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] px-3 py-0.5 rounded-full font-semibold">
              Event-Driven Automation Canvas
            </span>
          </div>
          <p className="text-xs text-[#8B7E66] mt-1">
            Visual drag-and-drop triggers, threshold rule evaluation, automated purchase orders, lot quarantines, and third-party webhook dispatchers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canWrite && (
            <button
              onClick={() => setShowNewWorkflowModal(true)}
              className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-medium px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Low-Code Workflow</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Workflow Selector & Palette (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl p-5 space-y-4 shadow-sm text-[#2D2D24]">
            <span className="text-xs font-bold text-[#8B7E66] uppercase tracking-wider block">
              Configured Workflows ({workflows.length})
            </span>

            <div className="space-y-2.5">
              {workflows.map((wf) => {
                const isSelected = wf.id === selectedWorkflowId;

                return (
                  <div
                    key={wf.id}
                    onClick={() => setSelectedWorkflowId(wf.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'bg-[#F5F5F0] border-[#5A5A40] shadow-sm'
                        : 'bg-white border-[#E5E5DE] hover:border-[#8B7E66]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-[#2D2D24] truncate max-w-[200px]">{wf.name}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (canWrite) onToggleWorkflow(wf.id);
                        }}
                        className="text-[#787668] hover:text-[#2D2D24] cursor-pointer"
                        title={wf.enabled ? 'Enabled' : 'Paused'}
                      >
                        {wf.enabled ? (
                          <ToggleRight className="w-5 h-5 text-[#5A5A40]" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-[#B5B3A4]" />
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-[#787668] line-clamp-2">{wf.description}</p>

                    <div className="pt-2 border-t border-[#E5E5DE] flex items-center justify-between text-[10px] text-[#8B7E66]">
                      <span className="font-mono">Executions: {wf.executionCount}</span>
                      <span className="text-[#5A5A40] font-mono font-medium">Last run: {wf.lastRun || 'Recent'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Node Palette Guide */}
          <div className="bg-white border border-[#E5E5DE] rounded-3xl p-5 space-y-4 shadow-sm text-[#2D2D24]">
            <span className="text-xs font-bold text-[#8B7E66] uppercase tracking-wider block">
              Node Block Palette
            </span>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] flex items-center gap-2.5 text-[#2D2D24]">
                <Zap className="w-4 h-4 text-[#5A5A40]" />
                <div>
                  <div className="font-semibold text-[#2D2D24]">Triggers</div>
                  <div className="text-[10px] text-[#787668]">Low stock, Defect spike, Sensor alerts, Delay</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] flex items-center gap-2.5 text-[#2D2D24]">
                <Settings2 className="w-4 h-4 text-[#8B7E66]" />
                <div>
                  <div className="font-semibold text-[#2D2D24]">Logic &amp; Conditions</div>
                  <div className="text-[10px] text-[#787668]">Threshold evaluation, Lead-time validation</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] flex items-center gap-2.5 text-[#2D2D24]">
                <Boxes className="w-4 h-4 text-[#5A5A40]" />
                <div>
                  <div className="font-semibold text-[#2D2D24]">ERP Actions</div>
                  <div className="text-[10px] text-[#787668]">Auto PO generation, Lot quarantine, Reschedule</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] flex items-center gap-2.5 text-[#2D2D24]">
                <Radio className="w-4 h-4 text-[#8B7E66]" />
                <div>
                  <div className="font-semibold text-[#2D2D24]">Integrations</div>
                  <div className="text-[10px] text-[#787668]">Outbound Webhooks, Slack, SAP S/4HANA OData</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Workflow Canvas & Live Execution Simulator (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeWorkflow && (
            <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 space-y-5 shadow-sm text-[#2D2D24]">
              {/* Canvas Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5DE]">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-serif italic font-semibold text-[#2D2D24]">{activeWorkflow.name}</h2>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                        activeWorkflow.enabled
                          ? 'bg-[#5A5A40]/15 text-[#5A5A40]'
                          : 'bg-[#F5F5F0] text-[#787668]'
                      }`}
                    >
                      {activeWorkflow.enabled ? 'Active Engine' : 'Engine Paused'}
                    </span>
                  </div>
                  <p className="text-xs text-[#8B7E66] mt-0.5">{activeWorkflow.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={isSimulating}
                    onClick={handleSimulate}
                    className="text-xs bg-[#5A5A40] hover:bg-[#474732] disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
                  </button>
                </div>
              </div>

              {/* Visual Node Diagram (Canvas Stage) */}
              <div className="bg-[#F5F5F0] p-6 rounded-2xl border border-[#E5E5DE] overflow-x-auto min-h-[320px] flex items-center justify-center relative">
                {/* Background dot grid pattern */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #5A5A40 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                ></div>

                <div className="flex items-center gap-6 relative z-10 py-6">
                  {activeWorkflow.nodes.map((node, index) => {
                    const isTrigger = node.type === 'trigger';
                    const isCondition = node.type === 'condition';
                    const isAction = node.type === 'action';
                    const isIntegration = node.type === 'integration';

                    return (
                      <React.Fragment key={node.id}>
                        {/* Node Card */}
                        <div
                          className={`w-52 p-4 rounded-2xl border shadow-sm transition-all bg-white ${
                            isTrigger
                              ? 'border-[#5A5A40] text-[#2D2D24]'
                              : isCondition
                              ? 'border-[#8B7E66] text-[#2D2D24]'
                              : isAction
                              ? 'border-[#5A5A40] text-[#2D2D24]'
                              : 'border-[#A09E8E] text-[#2D2D24]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold mb-2">
                            <span
                              className={`px-2 py-0.5 rounded-md ${
                                isTrigger
                                  ? 'bg-[#5A5A40]/15 text-[#5A5A40]'
                                  : isCondition
                                  ? 'bg-[#8B7E66]/20 text-[#8B7E66]'
                                  : isAction
                                  ? 'bg-[#5A5A40]/15 text-[#5A5A40]'
                                  : 'bg-[#F5F5F0] text-[#787668]'
                              }`}
                            >
                              {node.type}
                            </span>
                            <span className="text-[#8B7E66] font-mono">Step 0{index + 1}</span>
                          </div>

                          <h4 className="font-semibold text-[#2D2D24] text-xs leading-snug">{node.title}</h4>

                          <div className="mt-2.5 pt-2 border-t border-[#E5E5DE] text-[10px] font-mono text-[#787668] space-y-0.5">
                            <div>subType: {node.subType}</div>
                            {node.config && (
                              <div className="text-[#8B7E66] truncate">
                                {JSON.stringify(node.config)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Edge arrow between nodes */}
                        {index < activeWorkflow.nodes.length - 1 && (
                          <div className="flex flex-col items-center">
                            <ArrowRight className="w-5 h-5 text-[#5A5A40]" />
                            <span className="text-[9px] font-mono text-[#8B7E66] mt-0.5">
                              {activeWorkflow.edges[index]?.conditionLabel || 'emit'}
                            </span>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Live Simulation Output Console */}
              <div className="bg-[#2D2D24] border border-[#5A5A40]/30 rounded-2xl p-4 font-mono text-xs text-[#E9E9E0] space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#A09E8E] border-b border-[#5A5A40]/40 pb-2">
                  <span className="flex items-center gap-1.5 text-[#A09E8E] font-semibold">
                    <FileCode className="w-3.5 h-3.5 text-[#E9E9E0]" />
                    Low-Code Event Bus Simulator Log
                  </span>
                  <span className="text-[#8B7E66]">
                    {isSimulating ? 'Simulating...' : 'Ready for test run'}
                  </span>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 text-[11px]">
                  {simulationLogs.length === 0 ? (
                    <div className="text-[#8B7E66] italic py-2">
                      Click "Run Simulation" to execute a live test run through all trigger, condition, action, and API payload stages.
                    </div>
                  ) : (
                    simulationLogs.map((log, i) => (
                      <div
                        key={`sim-log-${log.substring(0, 24)}-${i}`}
                        className={
                          log.includes('MATCHED') || log.includes('Status 200')
                            ? 'text-[#C5BAA8]'
                            : log.includes('Evaluating')
                            ? 'text-[#D3C7B2]'
                            : 'text-[#E9E9E0]'
                        }
                      >
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Workflow Modal */}
      {showNewWorkflowModal && (
        <div className="fixed inset-0 z-50 bg-[#2D2D24]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl max-w-md w-full p-6 text-[#2D2D24] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E5DE] pb-3">
              <h3 className="font-serif italic font-semibold text-[#2D2D24] text-base">Create Low-Code Workflow</h3>
              <button
                onClick={() => setShowNewWorkflowModal(false)}
                className="text-[#787668] hover:text-[#2D2D24] text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#2D2D24] font-semibold mb-1">Workflow Name</label>
                <input
                  type="text"
                  required
                  value={newWfName}
                  onChange={(e) => setNewWfName(e.target.value)}
                  placeholder="e.g. CNC Machine Over-Temp Emergency Pause"
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block text-[#2D2D24] font-semibold mb-1">Description / Goal</label>
                <textarea
                  rows={2}
                  value={newWfDesc}
                  onChange={(e) => setNewWfDesc(e.target.value)}
                  placeholder="Explain event triggers and target manufacturing operations actions..."
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
                ></textarea>
              </div>

              <div>
                <label className="block text-[#2D2D24] font-semibold mb-1">Trigger Event Source</label>
                <select
                  value={newWfTrigger}
                  onChange={(e) => setNewWfTrigger(e.target.value as WorkflowTriggerType)}
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
                >
                  <option value="inventory_low_stock">Inventory Safety Stock Breach</option>
                  <option value="qc_defect_rate_spike">QC Scrap Rate &gt; 2.5% Spike</option>
                  <option value="shipment_delayed">Carrier Shipment Delay &gt; 12 Hours</option>
                  <option value="iot_machine_vibration_alert">IoT Machine Spindle / Thermal Alert</option>
                  <option value="crm_contract_won">OEM Deal Won &amp; Contract Signed</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E5DE]">
                <button
                  type="button"
                  onClick={() => setShowNewWorkflowModal(false)}
                  className="bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] px-4 py-2 rounded-xl font-medium cursor-pointer border border-[#E5E5DE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold px-4 py-2 rounded-xl cursor-pointer shadow-xs"
                >
                  Create &amp; Open Canvas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
