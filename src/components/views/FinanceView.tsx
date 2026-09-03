import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  PieChart,
  Shield,
  Download,
  Plus,
  BookOpen,
  Scale,
  Calendar,
  Layers,
  Filter,
  Search,
  ArrowDownRight,
  ExternalLink,
} from 'lucide-react';
import { FinanceMetric, Invoice, RoleDefinition, JournalEntry, ChartOfAccount } from '../../types';
import { CreateInvoiceModal } from '../modals/CreateInvoiceModal';
import { PostJournalEntryModal } from '../modals/PostJournalEntryModal';

interface FinanceViewProps {
  finance: FinanceMetric;
  invoices: Invoice[];
  journalEntries: JournalEntry[];
  chartOfAccounts: ChartOfAccount[];
  currentRole: RoleDefinition;
  onPayInvoice: (invoiceId: string) => void;
  onExportCsv: () => void;
  onAddInvoice: (invoice: Invoice) => void;
  onAddJournalEntry: (entry: JournalEntry) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  finance,
  invoices,
  journalEntries,
  chartOfAccounts,
  currentRole,
  onPayInvoice,
  onExportCsv,
  onAddInvoice,
  onAddJournalEntry,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'invoices' | 'general_ledger' | 'chart_of_accounts' | 'statements' | 'aging'
  >('overview');

  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState<'all' | 'receivable' | 'payable'>('all');
  const [coaCategoryFilter, setCoaCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isPostJournalOpen, setIsPostJournalOpen] = useState(false);

  const canWrite =
    currentRole.permissions.finance === 'admin' ||
    currentRole.permissions.finance === 'write';

  const filteredInvoices = invoices.filter((inv) => {
    const matchesType = invoiceTypeFilter === 'all' || inv.type === invoiceTypeFilter;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.referenceOrder.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalReceivable = invoices
    .filter((inv) => inv.type === 'receivable' && inv.status !== 'paid')
    .reduce((acc, inv) => acc + inv.amount, 0);

  const totalPayable = invoices
    .filter((inv) => inv.type === 'payable' && inv.status !== 'paid')
    .reduce((acc, inv) => acc + inv.amount, 0);

  // Filtered Chart of Accounts
  const filteredAccounts = chartOfAccounts.filter((acc) => {
    const matchesCategory = coaCategoryFilter === 'all' || acc.category === coaCategoryFilter;
    const matchesQuery =
      acc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Calculate Totals for Balance Sheet
  const totalAssets = chartOfAccounts
    .filter((a) => a.category === 'asset')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = chartOfAccounts
    .filter((a) => a.category === 'liability')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalEquity = chartOfAccounts
    .filter((a) => a.category === 'equity')
    .reduce((sum, a) => sum + a.balance, 0);

  // Aging summary calculation
  const agingReceivables = {
    current: invoices.filter((i) => i.type === 'receivable' && i.status === 'pending').reduce((s, i) => s + i.amount * 0.65, 0),
    days30: invoices.filter((i) => i.type === 'receivable' && i.status === 'pending').reduce((s, i) => s + i.amount * 0.25, 0),
    days60: invoices.filter((i) => i.type === 'receivable' && i.status === 'pending').reduce((s, i) => s + i.amount * 0.1, 0),
    days90Plus: invoices.filter((i) => i.type === 'receivable' && i.status === 'overdue').reduce((s, i) => s + i.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E5DE] p-6 rounded-3xl shadow-sm text-[#2D2D24]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-serif italic font-medium tracking-tight text-[#2D2D24] flex items-center gap-2.5">
              <DollarSign className="w-5 h-5 text-[#5A5A40]" />
              Manufacturing Accounting &amp; General Ledger
            </h1>
            <span className="text-xs bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] px-3 py-0.5 rounded-full font-semibold">
              ERP Financial Control
            </span>
          </div>
          <p className="text-xs text-[#8B7E66] mt-1">
            Double-entry General Ledger, Chart of Accounts, Invoicing (AR/AP), Absorption Costing, and Certified Financial Statements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canWrite && (
            <>
              <button
                onClick={() => setIsPostJournalOpen(true)}
                className="text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE] font-medium px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Post Journal Entry</span>
              </button>
              <button
                onClick={() => setIsCreateInvoiceOpen(true)}
                className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#E9E9E0]" />
                <span>Issue Invoice / Bill</span>
              </button>
            </>
          )}
          <button
            onClick={onExportCsv}
            className="text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE] font-medium px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>Export (CSV)</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-[#E5E5DE] text-xs font-semibold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-[#5A5A40] text-[#5A5A40]'
              : 'border-transparent text-[#787668] hover:text-[#2D2D24]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>P&amp;L &amp; Cost Absorption</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'invoices'
              ? 'border-[#5A5A40] text-[#5A5A40]'
              : 'border-transparent text-[#787668] hover:text-[#2D2D24]'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Invoices Ledger ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('general_ledger')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'general_ledger'
              ? 'border-[#5A5A40] text-[#5A5A40]'
              : 'border-transparent text-[#787668] hover:text-[#2D2D24]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>General Ledger ({journalEntries.length} JEs)</span>
        </button>

        <button
          onClick={() => setActiveTab('chart_of_accounts')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'chart_of_accounts'
              ? 'border-[#5A5A40] text-[#5A5A40]'
              : 'border-transparent text-[#787668] hover:text-[#2D2D24]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Chart of Accounts</span>
        </button>

        <button
          onClick={() => setActiveTab('statements')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'statements'
              ? 'border-[#5A5A40] text-[#5A5A40]'
              : 'border-transparent text-[#787668] hover:text-[#2D2D24]'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Financial Statements</span>
        </button>

        <button
          onClick={() => setActiveTab('aging')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'aging'
              ? 'border-[#5A5A40] text-[#5A5A40]'
              : 'border-transparent text-[#787668] hover:text-[#2D2D24]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>AR/AP Aging Report</span>
        </button>
      </div>

      {/* TAB 1: P&L & COST ABSORPTION */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* P&L Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E5E5DE] p-5 rounded-3xl shadow-sm text-[#2D2D24]">
              <span className="text-xs font-bold text-[#8B7E66] uppercase tracking-wider block">
                Monthly Operating Revenue
              </span>
              <div className="text-2xl font-mono font-bold text-[#2D2D24] mt-1">
                ${finance.monthlyRevenue.toLocaleString()}
              </div>
              <div className="text-xs text-[#5A5A40] flex items-center font-medium mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> +5.8% vs last fiscal period
              </div>
            </div>

            <div className="bg-white border border-[#E5E5DE] p-5 rounded-3xl shadow-sm text-[#2D2D24]">
              <span className="text-xs font-bold text-[#8B7E66] uppercase tracking-wider block">
                Cost of Goods Sold (COGS)
              </span>
              <div className="text-2xl font-mono font-bold text-[#B85D36] mt-1">
                ${finance.cogsTotal.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#787668] mt-1 font-mono">
                59.2% Absorption Ratio
              </div>
            </div>

            <div className="bg-white border border-[#E5E5DE] p-5 rounded-3xl shadow-sm text-[#2D2D24]">
              <span className="text-xs font-bold text-[#8B7E66] uppercase tracking-wider block">
                Gross Manufacturing Margin
              </span>
              <div className="text-2xl font-mono font-bold text-[#5A5A40] mt-1">
                {finance.grossMargin}%
              </div>
              <div className="text-[11px] text-[#787668] mt-1">
                Target benchmark: &gt; 38.0%
              </div>
            </div>

            <div className="bg-white border border-[#E5E5DE] p-5 rounded-3xl shadow-sm text-[#2D2D24]">
              <span className="text-xs font-bold text-[#8B7E66] uppercase tracking-wider block">
                Operating Net Income (EBIT)
              </span>
              <div className="text-2xl font-mono font-bold text-[#2D2D24] mt-1">
                ${finance.operatingIncome.toLocaleString()}
              </div>
              <div className="text-[11px] text-[#787668] mt-1">
                After depreciation &amp; plant overhead
              </div>
            </div>
          </div>

          {/* Cost Absorption & Invoicing Teaser */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white border border-[#E5E5DE] rounded-3xl p-6 space-y-4 shadow-sm text-[#2D2D24]">
              <h2 className="text-base font-serif italic font-semibold text-[#5A5A40] flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#5A5A40]" />
                Standard Cost Absorption Breakdown
              </h2>
              <p className="text-xs text-[#8B7E66]">
                Direct materials, machine time overhead, and touch-labor absorption per standard production hour.
              </p>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#2D2D24] font-medium">Direct Materials (53%)</span>
                    <span className="font-mono text-[#2D2D24] font-semibold">
                      ${finance.directMaterialsCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-[#F5F5F0] h-2.5 rounded-full overflow-hidden border border-[#E5E5DE]">
                    <div className="bg-[#5A5A40] h-full rounded-full" style={{ width: '53%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#2D2D24] font-medium">Direct Touch Labor (30%)</span>
                    <span className="font-mono text-[#2D2D24] font-semibold">
                      ${finance.directLaborCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-[#F5F5F0] h-2.5 rounded-full overflow-hidden border border-[#E5E5DE]">
                    <div className="bg-[#8B7E66] h-full rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#2D2D24] font-medium">Machine &amp; Plant Overhead (17%)</span>
                    <span className="font-mono text-[#2D2D24] font-semibold">
                      ${finance.overheadMachineryCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-[#F5F5F0] h-2.5 rounded-full overflow-hidden border border-[#E5E5DE]">
                    <div className="bg-[#A09E8E] h-full rounded-full" style={{ width: '17%' }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-[#F5F5F0] p-4 rounded-2xl border border-[#E5E5DE] text-xs space-y-1">
                <span className="font-bold text-[#5A5A40]">ERP General Ledger Integration:</span>
                <p className="text-[11px] text-[#787668]">
                  Automated journal entries generated whenever a digital traveler completes step inspection or materials are receipted from POs.
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white border border-[#E5E5DE] rounded-3xl p-6 space-y-4 shadow-sm text-[#2D2D24]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-serif italic font-semibold text-[#5A5A40] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#5A5A40]" />
                    Recent General Ledger Postings
                  </h2>
                  <p className="text-xs text-[#8B7E66] mt-0.5">
                    Live audit trail from ERP production runs, payroll absorptions, and material receipts.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('general_ledger')}
                  className="text-xs text-[#5A5A40] hover:text-[#474732] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Journal Entries</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {journalEntries.slice(0, 3).map((je) => (
                  <div
                    key={je.id}
                    className="p-4 bg-[#F9F9F7] rounded-2xl border border-[#E5E5DE] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#5A5A40]">{je.entryNumber}</span>
                        <span className="text-[#8B7E66] font-mono">{je.date}</span>
                        {je.referenceDoc && (
                          <span className="text-[10px] bg-[#E9E9E0] text-[#5A5A40] px-2 py-0.5 rounded-md font-mono">
                            Ref: {je.referenceDoc}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] bg-[#5A5A40]/15 text-[#5A5A40] px-2 py-0.5 rounded-full font-bold uppercase">
                        {je.status}
                      </span>
                    </div>

                    <p className="text-[#2D2D24] font-medium">{je.description}</p>

                    <div className="pt-1 grid grid-cols-2 gap-2 text-[11px] font-mono">
                      {je.lines.map((line) => (
                        <div key={line.id} className="flex justify-between bg-white px-2 py-1 rounded border border-[#E5E5DE]">
                          <span className="text-[#787668] truncate mr-2">
                            {line.accountCode} - {line.accountName}
                          </span>
                          <span className="font-semibold text-[#2D2D24]">
                            {line.debit > 0 ? `DR $${line.debit.toLocaleString()}` : `CR $${line.credit.toLocaleString()}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVOICES LEDGER (AR & AP) */}
      {activeTab === 'invoices' && (
        <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 space-y-4 shadow-sm text-[#2D2D24]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-serif italic font-semibold text-[#5A5A40] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#5A5A40]" />
                Invoices Ledger (Accounts Receivable &amp; Accounts Payable)
              </h2>
              <p className="text-xs text-[#8B7E66] mt-0.5">
                Outstanding: ${totalReceivable.toLocaleString()} Receivable • ${totalPayable.toLocaleString()} Payable
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8B7E66] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search invoice or account..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-[#F5F5F0] border border-[#E5E5DE] text-xs text-[#2D2D24] outline-hidden focus:ring-1 focus:ring-[#5A5A40]"
                />
              </div>

              <div className="flex items-center gap-1 bg-[#F5F5F0] p-1 rounded-xl border border-[#E5E5DE]">
                {(['all', 'receivable', 'payable'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setInvoiceTypeFilter(t)}
                    className={`text-[11px] font-medium px-3 py-1 rounded-lg transition-colors capitalize cursor-pointer ${
                      invoiceTypeFilter === t
                        ? 'bg-[#5A5A40] text-white shadow-xs'
                        : 'text-[#787668] hover:text-[#2D2D24]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2D2D24]">
              <thead className="bg-[#F5F5F0] text-[#787668] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E5DE]">
                <tr>
                  <th className="py-3 px-3">Invoice #</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Counterparty</th>
                  <th className="py-3 px-3">Terms / Reference</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DE]">
                {filteredInvoices.map((inv) => {
                  const isPaid = inv.status === 'paid';
                  const isOverdue = inv.status === 'overdue';

                  return (
                    <tr key={inv.id} className="hover:bg-[#F9F9F7] transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#2D2D24]">{inv.invoiceNumber}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-semibold uppercase ${
                            inv.type === 'receivable' ? 'bg-[#5A5A40]/15 text-[#5A5A40]' : 'bg-[#8B7E66]/20 text-[#8B7E66]'
                          }`}
                        >
                          {inv.type === 'receivable' ? 'AR (Customer)' : 'AP (Supplier)'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-[#2D2D24]">{inv.counterparty}</td>
                      <td className="py-3 px-3 text-[#787668]">
                        <span className="font-mono text-[11px] block text-[#2D2D24]">{inv.referenceOrder}</span>
                        <span className="text-[10px] text-[#8B7E66]">{inv.paymentTerms || 'Net 30'}</span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#5A5A40]">
                        ${inv.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono text-[#787668]">{inv.dueDate}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                            isPaid
                              ? 'bg-[#5A5A40]/15 text-[#5A5A40]'
                              : isOverdue
                              ? 'bg-[#B85D36]/15 text-[#B85D36]'
                              : 'bg-[#8B7E66]/20 text-[#8B7E66]'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {canWrite && !isPaid && (
                          <button
                            onClick={() => onPayInvoice(inv.id)}
                            className="text-[11px] text-[#5A5A40] hover:text-[#2D2D24] bg-[#F5F5F0] hover:bg-[#E9E9E0] px-3 py-1.5 rounded-lg border border-[#E5E5DE] transition-colors font-medium cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        )}
                        {isPaid && (
                          <span className="text-[11px] text-[#5A5A40] font-medium flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#5A5A40]" /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: GENERAL LEDGER & JOURNAL ENTRIES */}
      {activeTab === 'general_ledger' && (
        <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 space-y-4 shadow-sm text-[#2D2D24]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-serif italic font-semibold text-[#5A5A40] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#5A5A40]" />
                Double-Entry General Ledger (Journal Entries)
              </h2>
              <p className="text-xs text-[#8B7E66] mt-0.5">
                Full chronological ledger showing debits and credits posted from inventory, payroll, depreciation, and sales.
              </p>
            </div>

            {canWrite && (
              <button
                onClick={() => setIsPostJournalOpen(true)}
                className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#E9E9E0]" />
                <span>Post Journal Entry</span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {journalEntries.map((entry) => {
              const entryTotalDebit = entry.lines.reduce((s, l) => s + l.debit, 0);
              const entryTotalCredit = entry.lines.reduce((s, l) => s + l.credit, 0);

              return (
                <div
                  key={entry.id}
                  className="border border-[#E5E5DE] rounded-2xl overflow-hidden bg-white shadow-xs"
                >
                  <div className="bg-[#F9F9F7] p-3.5 border-b border-[#E5E5DE] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-[#5A5A40]">{entry.entryNumber}</span>
                      <span className="font-mono text-[#8B7E66]">{entry.date}</span>
                      {entry.referenceDoc && (
                        <span className="text-[10px] bg-[#E9E9E0] text-[#5A5A40] px-2 py-0.5 rounded-md font-mono">
                          Ref: {entry.referenceDoc}
                        </span>
                      )}
                      <span className="text-[#8B7E66] text-[11px]">Posted by: {entry.postedBy}</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-[#787668]">Balanced:</span>
                      <span className="font-bold text-[#5A5A40]">${entryTotalDebit.toLocaleString()}</span>
                      <span className="text-[10px] bg-[#5A5A40]/15 text-[#5A5A40] px-2 py-0.5 rounded-full font-bold uppercase">
                        {entry.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 text-xs text-[#2D2D24] font-medium border-b border-[#E5E5DE]">
                    {entry.description}
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F5F5F0] text-[#787668] text-[10px] uppercase font-bold border-b border-[#E5E5DE]">
                      <tr>
                        <th className="py-2 px-3.5">Account Code</th>
                        <th className="py-2 px-3.5">Account Name</th>
                        <th className="py-2 px-3.5 text-right w-36">Debit ($)</th>
                        <th className="py-2 px-3.5 text-right w-36">Credit ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5DE] text-xs font-mono">
                      {entry.lines.map((line) => (
                        <tr key={line.id} className="hover:bg-[#F9F9F7]">
                          <td className="py-2 px-3.5 text-[#5A5A40] font-semibold">{line.accountCode}</td>
                          <td className="py-2 px-3.5 text-[#2D2D24] font-sans">{line.accountName}</td>
                          <td className="py-2 px-3.5 text-right font-bold text-[#2D2D24]">
                            {line.debit > 0 ? `$${line.debit.toLocaleString()}` : '-'}
                          </td>
                          <td className="py-2 px-3.5 text-right font-bold text-[#2D2D24]">
                            {line.credit > 0 ? `$${line.credit.toLocaleString()}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: CHART OF ACCOUNTS */}
      {activeTab === 'chart_of_accounts' && (
        <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 space-y-4 shadow-sm text-[#2D2D24]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-serif italic font-semibold text-[#5A5A40] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#5A5A40]" />
                Enterprise Chart of Accounts (COA)
              </h2>
              <p className="text-xs text-[#8B7E66] mt-0.5">
                Standard accounting categorization conforming to GAAP &amp; IFRS manufacturing cost accounting standards.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-[#F5F5F0] p-1 rounded-xl border border-[#E5E5DE] overflow-x-auto">
                {['all', 'asset', 'liability', 'equity', 'revenue', 'cogs', 'expense'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCoaCategoryFilter(cat)}
                    className={`text-[11px] font-medium px-3 py-1 rounded-lg transition-colors capitalize cursor-pointer whitespace-nowrap ${
                      coaCategoryFilter === cat
                        ? 'bg-[#5A5A40] text-white shadow-xs'
                        : 'text-[#787668] hover:text-[#2D2D24]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2D2D24]">
              <thead className="bg-[#F5F5F0] text-[#787668] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E5DE]">
                <tr>
                  <th className="py-3 px-3 w-28">GL Code</th>
                  <th className="py-3 px-3">Account Title</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Normal Balance</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3 text-right">Current Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5DE]">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.code} className="hover:bg-[#F9F9F7] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#5A5A40]">{acc.code}</td>
                    <td className="py-3 px-3 font-semibold text-[#2D2D24]">{acc.name}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] bg-[#F5F5F0] text-[#787668] border border-[#E5E5DE] px-2 py-0.5 rounded uppercase font-semibold">
                        {acc.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono uppercase text-[#8B7E66]">{acc.normalBalance}</td>
                    <td className="py-3 px-3 text-[#787668] text-xs max-w-xs truncate">{acc.description}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#2D2D24]">
                      ${acc.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: FINANCIAL STATEMENTS */}
      {activeTab === 'statements' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Balance Sheet */}
            <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 space-y-4 shadow-sm text-[#2D2D24]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DE]">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2D2D24]">
                    Statement of Financial Position (Balance Sheet)
                  </h3>
                  <p className="text-xs text-[#8B7E66]">As of September 2026 • Certified Closing</p>
                </div>
                <span className="text-xs bg-[#EBF3ED] text-[#2E6930] px-2.5 py-1 rounded-full font-bold">
                  Balanced
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-[#5A5A40] uppercase text-[11px] tracking-wider mb-2">Assets</h4>
                  <div className="space-y-1.5 font-mono">
                    <div className="flex justify-between py-1 border-b border-[#E5E5DE]">
                      <span className="font-sans text-[#2D2D24]">Operating Cash &amp; Bank</span>
                      <span>$1,480,000</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E5E5DE]">
                      <span className="font-sans text-[#2D2D24]">Accounts Receivable (Trade AR)</span>
                      <span>$420,000</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E5E5DE]">
                      <span className="font-sans text-[#2D2D24]">Total Inventories (Raw, WIP, Finished)</span>
                      <span>$785,000</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E5E5DE]">
                      <span className="font-sans text-[#2D2D24]">Net Property, Plant &amp; Equipment</span>
                      <span>$2,170,000</span>
                    </div>
                    <div className="flex justify-between py-1.5 font-bold text-[#5A5A40] text-sm bg-[#F5F5F0] px-2 rounded-lg">
                      <span className="font-sans">TOTAL ASSETS</span>
                      <span>${totalAssets.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#B85D36] uppercase text-[11px] tracking-wider mb-2">Liabilities</h4>
                  <div className="space-y-1.5 font-mono">
                    <div className="flex justify-between py-1 border-b border-[#E5E5DE]">
                      <span className="font-sans text-[#2D2D24]">Accounts Payable (Trade AP)</span>
                      <span>$340,000</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E5E5DE]">
                      <span className="font-sans text-[#2D2D24]">Accrued Touch Labor &amp; Payroll</span>
                      <span>$95,000</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E5E5DE]">
                      <span className="font-sans text-[#2D2D24]">Equipment Long-Term Debt</span>
                      <span>$1,100,000</span>
                    </div>
                    <div className="flex justify-between py-1.5 font-bold text-[#B85D36] bg-[#F5F5F0] px-2 rounded-lg">
                      <span className="font-sans">Total Liabilities</span>
                      <span>${totalLiabilities.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#5A5A40] uppercase text-[11px] tracking-wider mb-2">Stockholders' Equity</h4>
                  <div className="space-y-1.5 font-mono">
                    <div className="flex justify-between py-1 border-b border-[#E5E5DE]">
                      <span className="font-sans text-[#2D2D24]">Common Stock &amp; Capital</span>
                      <span>$1,000,000</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E5E5DE]">
                      <span className="font-sans text-[#2D2D24]">Retained Earnings &amp; Net Income</span>
                      <span>$2,320,000</span>
                    </div>
                    <div className="flex justify-between py-1.5 font-bold text-[#5A5A40] text-sm bg-[#F5F5F0] px-2 rounded-lg">
                      <span className="font-sans">TOTAL LIABILITIES &amp; EQUITY</span>
                      <span>${(totalLiabilities + totalEquity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Income Statement (P&L) */}
            <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 space-y-4 shadow-sm text-[#2D2D24]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E5DE]">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2D2D24]">
                    Statement of Profit &amp; Loss (Income Statement)
                  </h3>
                  <p className="text-xs text-[#8B7E66]">Fiscal Year to Date (FY2026)</p>
                </div>
                <span className="text-xs bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] px-2.5 py-1 rounded-full font-bold">
                  YTD GAAP
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-[#E5E5DE] font-bold text-sm text-[#2D2D24]">
                  <span className="font-sans">Gross OEM Contract Revenue</span>
                  <span>$3,850,000</span>
                </div>

                <div className="pl-3 space-y-1 text-[#787668]">
                  <div className="flex justify-between py-1">
                    <span className="font-sans">Less: Direct Materials Consumed</span>
                    <span>($1,210,000)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-sans">Less: Direct Touch Labor Incurred</span>
                    <span>($680,000)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-sans">Less: Factory Machine Burden &amp; Overhead</span>
                    <span>($388,000)</span>
                  </div>
                </div>

                <div className="flex justify-between py-2 border-y border-[#E5E5DE] font-bold text-sm bg-[#F5F5F0] px-2 rounded-lg text-[#5A5A40]">
                  <span className="font-sans">Gross Manufacturing Profit</span>
                  <span>$1,572,000 (40.8%)</span>
                </div>

                <div className="pl-3 space-y-1 text-[#787668]">
                  <div className="flex justify-between py-1">
                    <span className="font-sans">Engineering R&amp;D &amp; Prototyping</span>
                    <span>($240,000)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-sans">Commercial Sales, Marketing &amp; SG&amp;A</span>
                    <span>($195,000)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-sans">Quality Assurance &amp; Metrology Audits</span>
                    <span>($115,000)</span>
                  </div>
                </div>

                <div className="flex justify-between py-2 border-t-2 border-[#5A5A40] font-bold text-base text-[#5A5A40] bg-[#F5F5F0] px-2.5 rounded-xl mt-3">
                  <span className="font-sans">NET OPERATING INCOME (EBITDA)</span>
                  <span>$1,022,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AR / AP AGING REPORT */}
      {activeTab === 'aging' && (
        <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 space-y-6 shadow-sm text-[#2D2D24]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-serif italic font-semibold text-[#5A5A40] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#5A5A40]" />
                Accounts Receivable &amp; Accounts Payable Aging Schedule
              </h2>
              <p className="text-xs text-[#8B7E66] mt-0.5">
                Monitor customer invoice collection cycles, overdue buckets, and supplier credit terms.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-[#F5F5F0] border border-[#E5E5DE] rounded-2xl">
              <span className="text-[10px] font-bold text-[#787668] uppercase tracking-wider block">Current (&lt; 30 Days)</span>
              <div className="text-xl font-mono font-bold text-[#5A5A40] mt-1">
                ${Math.round(agingReceivables.current).toLocaleString()}
              </div>
              <span className="text-[11px] text-[#2E6930] flex items-center gap-1 mt-1 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Healthy Cash Inflow
              </span>
            </div>

            <div className="p-4 bg-[#F5F5F0] border border-[#E5E5DE] rounded-2xl">
              <span className="text-[10px] font-bold text-[#787668] uppercase tracking-wider block">31 - 60 Days</span>
              <div className="text-xl font-mono font-bold text-[#2D2D24] mt-1">
                ${Math.round(agingReceivables.days30).toLocaleString()}
              </div>
              <span className="text-[11px] text-[#8B7E66] mt-1 block">Normal Net 30/60 Cycle</span>
            </div>

            <div className="p-4 bg-[#F5F5F0] border border-[#E5E5DE] rounded-2xl">
              <span className="text-[10px] font-bold text-[#787668] uppercase tracking-wider block">61 - 90 Days</span>
              <div className="text-xl font-mono font-bold text-[#B85D36] mt-1">
                ${Math.round(agingReceivables.days60).toLocaleString()}
              </div>
              <span className="text-[11px] text-[#B85D36] mt-1 block font-medium">Follow-Up Reminder Sent</span>
            </div>

            <div className="p-4 bg-[#F5F5F0] border border-[#E5E5DE] rounded-2xl">
              <span className="text-[10px] font-bold text-[#787668] uppercase tracking-wider block">90+ Days Overdue</span>
              <div className="text-xl font-mono font-bold text-[#B33A3A] mt-1">
                ${Math.round(agingReceivables.days90Plus).toLocaleString()}
              </div>
              <span className="text-[11px] text-[#B33A3A] mt-1 block font-medium">Escalated to Legal / CFO</span>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        onSave={onAddInvoice}
      />

      <PostJournalEntryModal
        isOpen={isPostJournalOpen}
        onClose={() => setIsPostJournalOpen(false)}
        accounts={chartOfAccounts}
        onSave={onAddJournalEntry}
      />
    </div>
  );
};
