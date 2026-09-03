import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RefreshCw,
  Printer,
  X,
  TrendingUp,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { AiAutomatedReport } from '../../types';

interface AiReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  productionData: any;
  onApplyRecommendation?: (rec: string) => void;
}

export const AiReportModal: React.FC<AiReportModalProps> = ({
  isOpen,
  onClose,
  productionData,
  onApplyRecommendation,
}) => {
  const [reportType, setReportType] = useState('Production & OEE Shift Briefing');
  const [focusArea, setFocusArea] = useState('Scrap Rate & Bottleneck Mitigation');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<AiAutomatedReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productionMetrics: productionData,
          reportType,
          focusArea,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate report: ${response.statusText}`);
      }

      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with AI engine');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2D24]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E5E5DE] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-[#2D2D24]">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#E5E5DE] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif italic font-semibold text-[#2D2D24] flex items-center gap-2">
                Automated Manufacturing Intelligence Report
                <span className="text-[10px] font-sans not-italic font-semibold bg-[#5A5A40]/15 text-[#5A5A40] border border-[#5A5A40]/30 px-2.5 py-0.5 rounded-full">
                  Gemini Flash Powered
                </span>
              </h2>
              <p className="text-xs text-[#8B7E66] mt-0.5">
                Analyzes live sensor telemetry, scrap rates, machine OEE, and supply chain delays to generate actionable plant recommendations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#787668] hover:text-[#2D2D24] p-1.5 rounded-xl hover:bg-[#F5F5F0] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-[#F5F5F0]/50">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-5 rounded-2xl border border-[#E5E5DE] text-xs shadow-xs">
            <div>
              <label className="block text-[#2D2D24] font-semibold mb-1">Report Scope</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
              >
                <option value="Production & OEE Shift Briefing">Production &amp; OEE Shift Briefing</option>
                <option value="Supply Chain Delay & Buffer Stock Analysis">Supply Chain Delay &amp; Buffer Stock Analysis</option>
                <option value="COGS & Scrap Cost Reduction Audit">COGS &amp; Scrap Cost Reduction Audit</option>
                <option value="Preventive Maintenance & Downtime Forecast">Preventive Maintenance &amp; Downtime Forecast</option>
              </select>
            </div>

            <div>
              <label className="block text-[#2D2D24] font-semibold mb-1">Focus Optimization Target</label>
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl p-2.5 text-[#2D2D24] focus:outline-none focus:border-[#5A5A40]"
              >
                <option value="Scrap Rate & Bottleneck Mitigation">Scrap Rate &amp; Bottleneck Mitigation</option>
                <option value="Line Reallocation & Cycle-Time Compression">Line Reallocation &amp; Cycle-Time Compression</option>
                <option value="Customs Clearances & Inbound Freights">Customs Clearances &amp; Inbound Freights</option>
                <option value="Machine Spindle Thermal Optimization">Machine Spindle Thermal Optimization</option>
              </select>
            </div>
          </div>

          <div className="text-center">
            <button
              disabled={isLoading}
              onClick={handleGenerateReport}
              className="bg-[#5A5A40] hover:bg-[#474732] disabled:opacity-50 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Real-Time Telemetry via Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Automated Intelligence Report</span>
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#B85D36]/10 border border-[#B85D36]/30 rounded-2xl text-xs text-[#B85D36] flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-[#B85D36]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Render Generated Report */}
          {report && (
            <div className="space-y-5 pt-3 border-t border-[#E5E5DE] text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#8B7E66] uppercase tracking-wider font-semibold">
                    Shift Report • {report.timestamp}
                  </span>
                  <h3 className="text-lg font-serif italic font-semibold text-[#2D2D24] mt-0.5">{report.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#5A5A40]/15 text-[#5A5A40] border border-[#5A5A40]/30">
                    OEE Score: {report.oeeScore}%
                  </span>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-5 bg-white rounded-2xl border border-[#E5E5DE] space-y-1.5 shadow-xs">
                <span className="font-serif italic font-semibold text-[#2D2D24] text-xs tracking-wider block">
                  Executive Briefing
                </span>
                <p className="text-[#787668] leading-relaxed text-xs">{report.summary}</p>
              </div>

              {/* Key Findings */}
              <div className="space-y-2">
                <span className="font-serif italic font-semibold text-[#2D2D24] text-xs tracking-wider block">
                  Key Operational Observations
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {report.keyFindings.map((finding, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-[#E5E5DE] text-[11px] text-[#787668] shadow-xs"
                    >
                      <div className="font-semibold text-[#2D2D24] mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#5A5A40]" />
                        Observation #{idx + 1}
                      </div>
                      {finding}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="space-y-2">
                <span className="font-serif italic font-semibold text-[#2D2D24] text-xs tracking-wider block">
                  Recommended Workflow Actions
                </span>
                <div className="space-y-2.5">
                  {report.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-[#E5E5DE] flex items-start justify-between gap-3 shadow-xs"
                    >
                      <div className="text-[#787668] text-xs leading-relaxed">
                        <span className="font-semibold text-[#2D2D24] mr-1.5">Action {idx + 1}:</span>
                        {rec}
                      </div>
                      {onApplyRecommendation && (
                        <button
                          onClick={() => onApplyRecommendation(rec)}
                          className="shrink-0 text-[11px] text-[#5A5A40] hover:text-[#474732] bg-[#F5F5F0] hover:bg-[#E9E9E0] px-3 py-1 rounded-xl transition-colors flex items-center gap-1 font-semibold border border-[#E5E5DE] cursor-pointer"
                        >
                          <span>Apply</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Projected Efficiency Gains */}
              <div className="p-4 rounded-2xl bg-[#5A5A40]/10 border border-[#5A5A40]/30 text-[#5A5A40] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#5A5A40]" />
                  <span className="font-semibold text-xs">Estimated Production Gain:</span>
                  <span className="text-xs text-[#2D2D24] font-medium">{report.projectedEfficiencyGain}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E5E5DE] bg-white flex items-center justify-between">
          <button
            onClick={handlePrint}
            className="text-xs text-[#2D2D24] hover:text-[#5A5A40] flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#E5E5DE] bg-[#F5F5F0] cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>

          <button
            onClick={onClose}
            className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white px-5 py-2 rounded-xl font-semibold cursor-pointer shadow-xs"
          >
            Close Briefing
          </button>
        </div>
      </div>
    </div>
  );
};
