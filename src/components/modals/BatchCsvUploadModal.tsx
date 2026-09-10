import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Boxes,
  Users,
  RefreshCw,
  Info,
  ArrowRight
} from 'lucide-react';
import { InventoryItem, Employee } from '../../types';
import {
  parseInventoryCsv,
  parseEmployeeCsv,
  getSampleInventoryCsv,
  getSampleEmployeeCsv,
  CsvParseResult
} from '../../utils/csvParser';

interface BatchCsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDataType?: 'inventory' | 'employee';
  onUploadInventory?: (items: InventoryItem[], mode: 'append' | 'update') => void;
  onUploadEmployees?: (employees: Employee[], mode: 'append' | 'update') => void;
  onShowNotification?: (title: string, message: string, type?: 'success' | 'alert') => void;
}

export const BatchCsvUploadModal: React.FC<BatchCsvUploadModalProps> = ({
  isOpen,
  onClose,
  initialDataType = 'inventory',
  onUploadInventory,
  onUploadEmployees,
  onShowNotification
}) => {
  const [dataType, setDataType] = useState<'inventory' | 'employee'>(initialDataType);
  const [inputTab, setInputTab] = useState<'file' | 'paste'>('file');
  const [importMode, setImportMode] = useState<'append' | 'update'>('update');
  const [rawText, setRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parsing results
  const [inventoryResult, setInventoryResult] = useState<CsvParseResult<InventoryItem> | null>(null);
  const [employeeResult, setEmployeeResult] = useState<CsvParseResult<Employee> | null>(null);

  if (!isOpen) return null;

  const handleProcessCsv = (content: string, type: 'inventory' | 'employee') => {
    if (type === 'inventory') {
      const res = parseInventoryCsv(content);
      setInventoryResult(res);
      setEmployeeResult(null);
    } else {
      const res = parseEmployeeCsv(content);
      setEmployeeResult(res);
      setInventoryResult(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      setRawText(text);
      handleProcessCsv(text, dataType);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      setRawText(text);
      handleProcessCsv(text, dataType);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (text: string) => {
    setRawText(text);
    if (text.trim()) {
      handleProcessCsv(text, dataType);
    } else {
      setInventoryResult(null);
      setEmployeeResult(null);
    }
  };

  const handleDownloadTemplate = () => {
    const content = dataType === 'inventory' ? getSampleInventoryCsv() : getSampleEmployeeCsv();
    const filename = dataType === 'inventory' ? 'vortix_inventory_template.csv' : 'vortix_workforce_roster_template.csv';
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCommitUpload = () => {
    if (dataType === 'inventory' && inventoryResult && inventoryResult.validRecords.length > 0) {
      if (onUploadInventory) {
        onUploadInventory(inventoryResult.validRecords, importMode);
      }
      if (onShowNotification) {
        onShowNotification(
          'Inventory Batch Upload Complete',
          `Successfully processed and committed ${inventoryResult.validRecords.length} inventory items in ${importMode} mode.`,
          'success'
        );
      }
      onClose();
    } else if (dataType === 'employee' && employeeResult && employeeResult.validRecords.length > 0) {
      if (onUploadEmployees) {
        onUploadEmployees(employeeResult.validRecords, importMode);
      }
      if (onShowNotification) {
        onShowNotification(
          'Workforce Roster Upload Complete',
          `Successfully processed and committed ${employeeResult.validRecords.length} employee records in ${importMode} mode.`,
          'success'
        );
      }
      onClose();
    }
  };

  const currentResult = dataType === 'inventory' ? inventoryResult : employeeResult;
  const validCount = currentResult ? currentResult.validCount : 0;
  const errorCount = currentResult ? currentResult.errorCount : 0;

  return (
    <div
      id="batch-csv-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="batch-csv-modal-container"
        className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] text-[#2D2D24]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E5DE] bg-[#F5F5F0]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-[#2D2D24] tracking-tight">Batch CSV Data Uploader</h2>
              <p className="text-xs text-[#5A5A40]/80">
                Robust RFC-compliant parser with field mapping, delimiter sensing, and real-time schema validation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#5A5A40] hover:text-[#2D2D24] hover:bg-[#E5E5DE]/40 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Controls Bar: Target Dataset & Import Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Dataset */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#5A5A40] block mb-2">
                Target Dataset
              </label>
              <div className="grid grid-cols-2 gap-2 bg-[#F5F5F0] p-1.5 rounded-2xl border border-[#E5E5DE]">
                <button
                  type="button"
                  onClick={() => {
                    setDataType('inventory');
                    if (rawText) handleProcessCsv(rawText, 'inventory');
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                    dataType === 'inventory'
                      ? 'bg-white shadow-sm text-[#2D2D24] font-semibold'
                      : 'text-[#5A5A40] hover:text-[#2D2D24]'
                  }`}
                >
                  <Boxes className="w-4 h-4" />
                  Inventory Items
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDataType('employee');
                    if (rawText) handleProcessCsv(rawText, 'employee');
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                    dataType === 'employee'
                      ? 'bg-white shadow-sm text-[#2D2D24] font-semibold'
                      : 'text-[#5A5A40] hover:text-[#2D2D24]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Workforce / Employees
                </button>
              </div>
            </div>

            {/* Merge Strategy */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#5A5A40] block mb-2">
                Merge Strategy
              </label>
              <div className="grid grid-cols-2 gap-2 bg-[#F5F5F0] p-1.5 rounded-2xl border border-[#E5E5DE]">
                <button
                  type="button"
                  onClick={() => setImportMode('update')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                    importMode === 'update'
                      ? 'bg-white shadow-sm text-[#2D2D24] font-semibold'
                      : 'text-[#5A5A40] hover:text-[#2D2D24]'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Upsert by Key (SKU/Email)
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('append')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                    importMode === 'append'
                      ? 'bg-white shadow-sm text-[#2D2D24] font-semibold'
                      : 'text-[#5A5A40] hover:text-[#2D2D24]'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Append as New Records
                </button>
              </div>
            </div>
          </div>

          {/* Template Download & Help Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#F5F5F0]/70 border border-[#E5E5DE] rounded-2xl">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-[#5A5A40] shrink-0" />
              <div className="text-xs text-[#5A5A40]">
                <span className="font-semibold text-[#2D2D24]">Expected Columns: </span>
                {dataType === 'inventory' ? (
                  <span>sku, name, category, quantityOnHand, minSafetyStock, unitCost, warehouseLocation, lotNumber, supplier</span>
                ) : (
                  <span>name, email, phone, department, roleTitle, shift, employeeCode, hourlyRate, assignedLineOrCell, skills</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E5E5DE] hover:bg-[#F5F5F0] text-[#2D2D24] text-xs font-medium rounded-xl shrink-0 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#5A5A40]" />
              Download CSV Template
            </button>
          </div>

          {/* Upload Method Switcher */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <button
                type="button"
                onClick={() => setInputTab('file')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                  inputTab === 'file'
                    ? 'bg-[#2D2D24] text-white'
                    : 'text-[#5A5A40] hover:bg-[#F5F5F0]'
                }`}
              >
                File Upload & Drag-and-Drop
              </button>
              <button
                type="button"
                onClick={() => setInputTab('paste')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                  inputTab === 'paste'
                    ? 'bg-[#2D2D24] text-white'
                    : 'text-[#5A5A40] hover:bg-[#F5F5F0]'
                }`}
              >
                Paste Raw CSV Text
              </button>
            </div>

            {inputTab === 'file' ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#5A5A40] bg-[#5A5A40]/10 scale-[0.99]'
                    : 'border-[#E5E5DE] hover:border-[#5A5A40] bg-[#F5F5F0]/30 hover:bg-[#F5F5F0]/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E5DE] shadow-xs flex items-center justify-center mx-auto mb-3 text-[#5A5A40]">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-[#2D2D24]">
                  {fileName ? fileName : 'Click to select CSV file or drag and drop here'}
                </h3>
                <p className="text-xs text-[#5A5A40] mt-1">
                  Supports comma (,), semicolon (;), and tab separated files up to 10MB
                </p>
                {fileName && (
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> File Loaded & Parsed
                  </div>
                )}
              </div>
            ) : (
              <div>
                <textarea
                  value={rawText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder={
                    dataType === 'inventory'
                      ? 'Paste inventory CSV text here...\nExample:\nsku,name,category,quantityOnHand,unitCost\nRAW-STL-01,Cold-Rolled Sheet,raw_material,500,12.50'
                      : 'Paste employee CSV text here...\nExample:\nname,email,department,roleTitle,hourlyRate\nJane Doe,jane.doe@vortixmfg.com,Assembly,Lead Tech,32.00'
                  }
                  rows={6}
                  className="w-full bg-[#F5F5F0]/40 border border-[#E5E5DE] rounded-2xl p-3.5 font-mono text-xs text-[#2D2D24] focus:outline-hidden focus:ring-2 focus:ring-[#5A5A40]"
                />
              </div>
            )}
          </div>

          {/* Validation & Preview Section */}
          {currentResult && (
            <div className="space-y-4 pt-2 border-t border-[#E5E5DE]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#5A5A40]">
                    Parsed Validation Summary:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {validCount} Valid Records
                    </span>
                    {errorCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200">
                        <AlertTriangle className="w-3.5 h-3.5" /> {errorCount} Parsing Errors
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Error messages if any */}
              {errorCount > 0 && (
                <div className="p-3 bg-red-50/70 border border-red-200 rounded-2xl space-y-1.5 max-h-36 overflow-y-auto">
                  <div className="text-xs font-semibold text-red-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Review the following row issues:
                  </div>
                  {currentResult.errors.map((err) => (
                    <div key={`csv-err-${err.rowNumber}-${err.reason.substring(0, 20)}`} className="text-[11px] text-red-700 font-mono flex items-start gap-1">
                      <span className="font-semibold text-red-900">Line {err.rowNumber}:</span> {err.reason}
                    </div>
                  ))}
                </div>
              )}

              {/* Data Preview Table */}
              {validCount > 0 && (
                <div className="border border-[#E5E5DE] rounded-2xl overflow-hidden shadow-2xs">
                  <div className="bg-[#F5F5F0] px-4 py-2.5 border-b border-[#E5E5DE] flex items-center justify-between">
                    <span className="text-xs font-medium text-[#2D2D24]">
                      Preview (First {Math.min(5, validCount)} of {validCount} parsed records)
                    </span>
                  </div>
                  <div className="overflow-x-auto max-h-48">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#F5F5F0]/60 text-[#5A5A40] border-b border-[#E5E5DE]">
                        {dataType === 'inventory' ? (
                          <tr>
                            <th className="py-2 px-3 font-semibold">SKU</th>
                            <th className="py-2 px-3 font-semibold">Name</th>
                            <th className="py-2 px-3 font-semibold">Category</th>
                            <th className="py-2 px-3 font-semibold text-right">Quantity</th>
                            <th className="py-2 px-3 font-semibold text-right">Unit Cost</th>
                            <th className="py-2 px-3 font-semibold">Location</th>
                            <th className="py-2 px-3 font-semibold">Status</th>
                          </tr>
                        ) : (
                          <tr>
                            <th className="py-2 px-3 font-semibold">Code</th>
                            <th className="py-2 px-3 font-semibold">Employee Name</th>
                            <th className="py-2 px-3 font-semibold">Email</th>
                            <th className="py-2 px-3 font-semibold">Department</th>
                            <th className="py-2 px-3 font-semibold">Role</th>
                            <th className="py-2 px-3 font-semibold">Shift</th>
                            <th className="py-2 px-3 font-semibold text-right">Rate ($/h)</th>
                          </tr>
                        )}
                      </thead>
                      <tbody className="divide-y divide-[#E5E5DE]">
                        {dataType === 'inventory'
                          ? (inventoryResult?.validRecords || []).slice(0, 5).map((item) => (
                              <tr key={item.id} className="hover:bg-[#F5F5F0]/30">
                                <td className="py-2 px-3 font-mono font-medium text-[#2D2D24]">{item.sku}</td>
                                <td className="py-2 px-3 text-[#2D2D24]">{item.name}</td>
                                <td className="py-2 px-3">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-700">
                                    {item.category}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right font-medium">{item.quantityOnHand.toLocaleString()}</td>
                                <td className="py-2 px-3 text-right">${item.unitCost.toFixed(2)}</td>
                                <td className="py-2 px-3 text-[#5A5A40]">{item.warehouseLocation}</td>
                                <td className="py-2 px-3">
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-medium">
                                    Valid
                                  </span>
                                </td>
                              </tr>
                            ))
                          : (employeeResult?.validRecords || []).slice(0, 5).map((emp) => (
                              <tr key={emp.id} className="hover:bg-[#F5F5F0]/30">
                                <td className="py-2 px-3 font-mono font-medium text-[#2D2D24]">{emp.employeeCode}</td>
                                <td className="py-2 px-3 font-medium text-[#2D2D24]">{emp.name}</td>
                                <td className="py-2 px-3 text-[#5A5A40]">{emp.email}</td>
                                <td className="py-2 px-3">{emp.department}</td>
                                <td className="py-2 px-3">{emp.roleTitle}</td>
                                <td className="py-2 px-3 text-[#5A5A40]">{emp.shift.split(' ')[0]}</td>
                                <td className="py-2 px-3 text-right font-mono">${emp.hourlyRate.toFixed(2)}</td>
                              </tr>
                            ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E5DE] bg-[#F5F5F0]/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#5A5A40] hover:text-[#2D2D24] transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={validCount === 0}
              onClick={handleCommitUpload}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2D2D24] text-white hover:bg-black rounded-xl text-xs font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              Commit {validCount} {dataType === 'inventory' ? 'Inventory Items' : 'Employees'} ({importMode})
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
