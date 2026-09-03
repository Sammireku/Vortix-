import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Clock,
  User,
  ShieldCheck,
  Wrench,
  Gauge,
  HelpCircle,
  RotateCcw,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { DigitalTraveler, SopStep, RoleDefinition } from '../../types';

interface DigitalTravelerViewProps {
  travelers: DigitalTraveler[];
  currentRole: RoleDefinition;
  onUpdateStep: (travelerId: string, stepId: string, operatorValue: string | number, status: 'passed' | 'failed') => void;
  onSignOffTraveler: (travelerId: string, badgeId: string, comments: string) => void;
  onEscalateIssue: (travelerId: string, reason: string) => void;
  onOpenBarcodeScanner?: () => void;
}

export const DigitalTravelerView: React.FC<DigitalTravelerViewProps> = ({
  travelers,
  currentRole,
  onUpdateStep,
  onSignOffTraveler,
  onEscalateIssue,
  onOpenBarcodeScanner,
}) => {
  const [selectedTravelerId, setSelectedTravelerId] = useState<string>(
    travelers[0]?.id || ''
  );
  const [stepInputs, setStepInputs] = useState<Record<string, string>>({});
  const [isSignOffModalOpen, setIsSignOffModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [signOffBadge, setSignOffBadge] = useState('TECH-8841');
  const [signOffComments, setSignOffComments] = useState('All mechanical tolerances and pressure decay tests verified.');
  const [escalateReason, setEscalateReason] = useState('Hydraulic leak detected during pressure test');

  const traveler = travelers.find((t) => t.id === selectedTravelerId) || travelers[0];

  if (!traveler) {
    return (
      <div className="p-8 text-center text-[#787668]">
        No active digital traveler loaded for current shift.
      </div>
    );
  }

  const completedStepsCount = traveler.steps.filter((s) => s.isCompleted && s.status === 'passed').length;
  const progressPercent = Math.round((completedStepsCount / traveler.steps.length) * 100);
  const allStepsPassed = completedStepsCount === traveler.steps.length;

  const handleValueChange = (stepId: string, val: string) => {
    setStepInputs((prev) => ({ ...prev, [stepId]: val }));
  };

  const handleVerifyStep = (step: SopStep) => {
    const rawVal = stepInputs[step.id] ?? (step.operatorValue?.toString() || '');
    let passed = true;

    if (step.inputType === 'numeric' || step.inputType === 'torque') {
      const num = parseFloat(rawVal);
      if (isNaN(num)) {
        alert('Please enter a valid numeric value');
        return;
      }
      if (step.minTolerance !== undefined && num < step.minTolerance) passed = false;
      if (step.maxTolerance !== undefined && num > step.maxTolerance) passed = false;
      onUpdateStep(traveler.id, step.id, num, passed ? 'passed' : 'failed');
    } else {
      // pass_fail or text
      onUpdateStep(traveler.id, step.id, 'PASSED', 'passed');
    }
  };

  const handleMarkFailed = (step: SopStep) => {
    const rawVal = stepInputs[step.id] ?? 'FAIL';
    onUpdateStep(traveler.id, step.id, rawVal, 'failed');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Traveler Banner */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E5DE] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-md bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] font-semibold">
              Shop-Floor Digital Traveler
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] font-medium font-mono">
              Batch: {traveler.batchNumber}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E9E9E0] text-[#787668]">
              {traveler.assignedLineId.toUpperCase()}
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2D2D24] tracking-tight">
            {traveler.orderNumber} - {traveler.productName}
          </h2>
          <div className="flex items-center gap-4 text-xs text-[#787668] mt-1">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#8B7E66]" />
              Active Operator: <strong className="text-[#2D2D24] font-medium">{traveler.activeOperator}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#8B7E66]" />
              Started: {traveler.startedAt}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Work Order Traveler Selector */}
          <select
            value={selectedTravelerId}
            onChange={(e) => setSelectedTravelerId(e.target.value)}
            className="text-xs bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-[#2D2D24] font-medium focus:ring-1 focus:ring-[#5A5A40] outline-hidden cursor-pointer"
          >
            {travelers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.orderNumber} ({t.sku})
              </option>
            ))}
          </select>

          {onOpenBarcodeScanner && (
            <button
              onClick={onOpenBarcodeScanner}
              className="flex items-center gap-1.5 text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE] font-medium px-3.5 py-2 rounded-xl transition-all cursor-pointer"
              title="Scan Work Order or Part Traveler QR Code"
            >
              <QrCode className="w-4 h-4 text-[#5A5A40]" />
              <span className="hidden sm:inline">Scan Code</span>
            </button>
          )}

          <button
            onClick={() => setIsEscalateModalOpen(true)}
            className="flex items-center gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Escalate Line Hold</span>
          </button>

          <button
            disabled={!allStepsPassed || traveler.status === 'approved'}
            onClick={() => setIsSignOffModalOpen(true)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer ${
              traveler.status === 'approved'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : allStepsPassed
                ? 'bg-[#5A5A40] hover:bg-[#474732] text-white'
                : 'bg-[#E5E5DE] text-[#A09E8E] cursor-not-allowed'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>{traveler.status === 'approved' ? 'QA Sign-Off Recorded' : 'Digital QA Sign-Off'}</span>
          </button>
        </div>
      </div>

      {/* Progress & Tolerance Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E5E5DE] shadow-xs">
          <div className="text-[11px] text-[#8B7E66] font-medium">SOP Steps Completed</div>
          <div className="text-2xl font-serif font-bold text-[#2D2D24] mt-1">
            {completedStepsCount} / {traveler.steps.length}
          </div>
          <div className="w-full bg-[#F5F5F0] rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-[#5A5A40] h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E5DE] shadow-xs">
          <div className="text-[11px] text-[#8B7E66] font-medium">Order Quantity Units</div>
          <div className="text-2xl font-serif font-bold text-[#2D2D24] mt-1">
            {traveler.completedUnits} <span className="text-sm font-sans font-normal text-[#787668]">/ {traveler.targetUnits} pcs</span>
          </div>
          <div className="text-[11px] text-[#5A5A40] font-medium mt-1">
            In-line yield: 99.4%
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E5DE] shadow-xs">
          <div className="text-[11px] text-[#8B7E66] font-medium">Inspection Standard</div>
          <div className="text-lg font-serif font-bold text-[#2D2D24] mt-1">
            ISO 9001 / AS9100D
          </div>
          <div className="text-[11px] text-[#787668] mt-1 font-mono">
            Class 1 Critical Fit
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#E5E5DE] shadow-xs">
          <div className="text-[11px] text-[#8B7E66] font-medium">Traveler QA Status</div>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                traveler.status === 'approved'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : traveler.status === 'quality_quarantine'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-[#5A5A40]/15 text-[#5A5A40] border border-[#5A5A40]/25'
              }`}
            >
              {traveler.status.replace('_', ' ')}
            </span>
          </div>
          {traveler.inspectionSignOff && (
            <div className="text-[10px] text-[#787668] mt-1">
              Signed by {traveler.inspectionSignOff.signedBy}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Step-by-Step SOP Workstation Checklist */}
      <div className="bg-white rounded-2xl border border-[#E5E5DE] shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E5DE] bg-[#F5F5F0]/50 flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#2D2D24]">
              Workstation Operating Sequence & Quality Checkpoints
            </h3>
            <p className="text-xs text-[#787668]">
              Verify each mandatory calibration, assembly, or test step before proceeding to next station.
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-[#5A5A40] bg-[#F5F5F0] px-3 py-1 rounded-lg border border-[#E5E5DE]">
            CPK Target &gt; 1.33
          </span>
        </div>

        <div className="divide-y divide-[#E5E5DE]">
          {traveler.steps.map((step) => {
            const currentVal = stepInputs[step.id] ?? (step.operatorValue !== undefined ? String(step.operatorValue) : '');
            const isPassed = step.isCompleted && step.status === 'passed';
            const isFailed = step.isCompleted && step.status === 'failed';

            return (
              <div
                key={step.id}
                className={`p-5 transition-colors ${
                  isPassed
                    ? 'bg-emerald-50/20'
                    : isFailed
                    ? 'bg-red-50/30'
                    : 'hover:bg-[#F5F5F0]/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Step Header & Instructions */}
                  <div className="flex items-start gap-3.5 flex-1">
                    <div
                      className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center shrink-0 text-xs shadow-xs ${
                        isPassed
                          ? 'bg-emerald-600 text-white'
                          : isFailed
                          ? 'bg-red-600 text-white'
                          : 'bg-[#5A5A40] text-white'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : step.stepNumber}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono text-[#8B7E66] uppercase">
                          {step.workcenter}
                        </span>
                        <h4 className="font-semibold text-sm text-[#2D2D24]">
                          {step.title}
                        </h4>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-[#F5F5F0] text-[#787668] border border-[#E5E5DE]">
                          {step.inputType}
                        </span>
                      </div>

                      <p className="text-xs text-[#525244] leading-relaxed">
                        {step.instructions}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs pt-1.5">
                        <div className="bg-[#F5F5F0] px-2.5 py-1 rounded-lg border border-[#E5E5DE] text-[#2D2D24]">
                          <span className="text-[#8B7E66] text-[10px] block uppercase font-medium">Specification:</span>
                          <span className="font-mono font-semibold">{step.specification}</span>
                        </div>
                        {step.tolerance && (
                          <div className="bg-[#F5F5F0] px-2.5 py-1 rounded-lg border border-[#E5E5DE] text-[#2D2D24]">
                            <span className="text-[#8B7E66] text-[10px] block uppercase font-medium">Allowed Tolerance:</span>
                            <span className="font-mono text-[#5A5A40] font-semibold">{step.tolerance}</span>
                          </div>
                        )}
                        {step.signOffBy && (
                          <div className="text-[11px] text-[#787668] flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Verified by <strong>{step.signOffBy}</strong> ({step.signOffTimestamp})
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Operator Verification Input Box */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0 bg-[#F5F5F0] p-3 rounded-xl border border-[#E5E5DE]">
                    {step.inputType === 'numeric' || step.inputType === 'torque' ? (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <input
                            type="number"
                            step="0.001"
                            value={currentVal}
                            onChange={(e) => handleValueChange(step.id, e.target.value)}
                            placeholder={step.nominalValue !== undefined ? String(step.nominalValue) : 'Value'}
                            className="w-28 text-xs bg-white border border-[#E5E5DE] rounded-lg px-2.5 py-1.5 font-mono text-[#2D2D24] focus:ring-1 focus:ring-[#5A5A40] outline-hidden text-right"
                          />
                          <span className="text-[10px] font-mono text-[#787668] ml-1">
                            {step.unit}
                          </span>
                        </div>
                        <button
                          onClick={() => handleVerifyStep(step)}
                          className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleMarkFailed(step)}
                          className="text-xs bg-white hover:bg-red-50 text-red-600 border border-red-200 font-medium px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                        >
                          Fail
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerifyStep(step)}
                          className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                            isPassed
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-[#5A5A40] hover:bg-[#474732] text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Pass Step</span>
                        </button>
                        <button
                          onClick={() => handleMarkFailed(step)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                            isFailed
                              ? 'bg-red-600 text-white'
                              : 'bg-white hover:bg-red-50 text-red-600 border border-red-200'
                          }`}
                        >
                          Fail
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Escalate Issue / Line Hold Modal */}
      {isEscalateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2D2D24]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E5DE] shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-serif font-bold text-lg text-[#2D2D24]">
                Escalate Line Hold & Quarantine
              </h3>
            </div>
            <p className="text-xs text-[#787668] mb-4">
              Triggering a line hold will immediately pause automated work order advancement, notify the Quality Lead, and flag the batch for quarantine inspection.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#8B7E66] font-medium block mb-1">
                  Reason for Stoppage / Out of Tolerance
                </label>
                <textarea
                  rows={3}
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  className="w-full text-xs bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:ring-1 focus:ring-[#5A5A40] outline-hidden"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                onClick={() => setIsEscalateModalOpen(false)}
                className="text-xs px-4 py-2 rounded-xl text-[#787668] hover:bg-[#F5F5F0] font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onEscalateIssue(traveler.id, escalateReason);
                  setIsEscalateModalOpen(false);
                }}
                className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Halt Line & Quarantine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital QA Sign-Off Modal */}
      {isSignOffModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2D2D24]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E5E5DE] shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-[#5A5A40] mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-serif font-bold text-lg text-[#2D2D24]">
                Digital QA Inspector Sign-Off
              </h3>
            </div>
            <p className="text-xs text-[#787668] mb-4">
              Certify that all physical dimensions, torque specifications, and pressure testing meet ISO 9001 quality criteria for {traveler.orderNumber}.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#8B7E66] font-medium block mb-1">
                  Inspector Electronic Badge / ID
                </label>
                <input
                  type="text"
                  value={signOffBadge}
                  onChange={(e) => setSignOffBadge(e.target.value)}
                  className="w-full text-xs bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-[#2D2D24] font-mono focus:ring-1 focus:ring-[#5A5A40] outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs text-[#8B7E66] font-medium block mb-1">
                  Inspector Release Notes & Certificate #
                </label>
                <textarea
                  rows={2}
                  value={signOffComments}
                  onChange={(e) => setSignOffComments(e.target.value)}
                  className="w-full text-xs bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:ring-1 focus:ring-[#5A5A40] outline-hidden"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                onClick={() => setIsSignOffModalOpen(false)}
                className="text-xs px-4 py-2 rounded-xl text-[#787668] hover:bg-[#F5F5F0] font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSignOffTraveler(traveler.id, signOffBadge, signOffComments);
                  setIsSignOffModalOpen(false);
                }}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Sign & Release Batch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
