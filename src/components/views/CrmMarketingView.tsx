import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  TrendingUp,
  Plus,
  DollarSign,
  ArrowRight,
  Sparkles,
  Award,
  Megaphone,
  CheckCircle2,
  Calendar,
  Filter,
  Search,
  ArrowUpRight,
  Target,
  BarChart3,
  Mail,
  Building,
  Layers,
} from 'lucide-react';
import { CrmDeal, MarketingCampaign, RoleDefinition } from '../../types';
import { CreateDealModal } from '../modals/CreateDealModal';
import { CreateCampaignModal } from '../modals/CreateCampaignModal';

interface CrmMarketingViewProps {
  deals: CrmDeal[];
  campaigns: MarketingCampaign[];
  currentRole: RoleDefinition;
  onAdvanceDealStage: (dealId: string) => void;
  onConvertDealToWorkOrder: (deal: CrmDeal) => void;
  onAddDeal: (deal: CrmDeal) => void;
  onAddCampaign: (campaign: MarketingCampaign) => void;
}

export const CrmMarketingView: React.FC<CrmMarketingViewProps> = ({
  deals,
  campaigns,
  currentRole,
  onAdvanceDealStage,
  onConvertDealToWorkOrder,
  onAddDeal,
  onAddCampaign,
}) => {
  const [activeTab, setActiveTab] = useState<'crm' | 'marketing' | 'attribution'>('crm');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDealOpen, setIsCreateDealOpen] = useState(false);
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);

  const canWrite =
    currentRole.permissions.crm_marketing === 'admin' ||
    currentRole.permissions.crm_marketing === 'write';

  const totalPipelineValue = deals.reduce((acc, d) => acc + d.dealValue, 0);
  const weightedPipeline = deals.reduce((acc, d) => acc + (d.dealValue * d.probability) / 100, 0);
  const totalCampaignBudget = campaigns.reduce((acc, c) => acc + c.budget, 0);
  const totalCampaignSpent = campaigns.reduce((acc, c) => acc + c.spent, 0);
  const totalCampaignLeads = campaigns.reduce((acc, c) => acc + c.leadsGenerated, 0);
  const totalQualifiedDeals = campaigns.reduce((acc, c) => acc + c.qualifiedDeals, 0);

  // Marketing metrics
  const costPerLead = totalCampaignLeads > 0 ? Math.round(totalCampaignSpent / totalCampaignLeads) : 0;
  const cacEstimate = totalQualifiedDeals > 0 ? Math.round(totalCampaignSpent / totalQualifiedDeals) : 0;

  const stages = [
    { id: 'lead', label: 'Inbound Lead' },
    { id: 'rfq_review', label: 'RFQ & Technical Review' },
    { id: 'sample_prototyping', label: 'Sample Prototyping' },
    { id: 'negotiation', label: 'Contract Negotiation' },
    { id: 'won_contract', label: 'Won & Production Ready' },
  ];

  const filteredDeals = deals.filter((deal) => {
    const matchesStage = stageFilter === 'all' || deal.stage === stageFilter;
    const matchesQuery =
      deal.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.productCategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E5DE] p-6 rounded-3xl shadow-sm text-[#2D2D24]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-serif italic font-medium tracking-tight text-[#2D2D24] flex items-center gap-2.5">
              <Users className="w-5 h-5 text-[#5A5A40]" />
              OEM CRM Pipeline &amp; B2B Marketing Engine
            </h1>
            <span className="text-xs bg-[#F5F5F0] text-[#5A5A40] border border-[#E5E5DE] px-3 py-0.5 rounded-full font-semibold">
              Commercial &amp; Demand Gen
            </span>
          </div>
          <p className="text-xs text-[#8B7E66] mt-1">
            Commercial contracts with automotive, aerospace, and energy OEMs, paired with industrial trade marketing attribution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canWrite && (
            <>
              <button
                onClick={() => setIsCreateCampaignOpen(true)}
                className="text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE] font-medium px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Megaphone className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Launch Campaign</span>
              </button>
              <button
                onClick={() => setIsCreateDealOpen(true)}
                className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#E9E9E0]" />
                <span>Register New RFQ / Deal</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E5DE] text-xs font-semibold gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('crm')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'crm'
              ? 'border-[#5A5A40] text-[#5A5A40]'
              : 'border-transparent text-[#787668] hover:text-[#2D2D24]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>OEM Deal Pipeline ({deals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('marketing')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'marketing'
              ? 'border-[#5A5A40] text-[#5A5A40]'
              : 'border-transparent text-[#787668] hover:text-[#2D2D24]'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>B2B Campaigns ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('attribution')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'attribution'
              ? 'border-[#5A5A40] text-[#5A5A40]'
              : 'border-transparent text-[#787668] hover:text-[#2D2D24]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Marketing Attribution &amp; ROI</span>
        </button>
      </div>

      {/* TAB 1: CRM PIPELINE */}
      {activeTab === 'crm' && (
        <div className="space-y-6">
          {/* Pipeline Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E5E5DE] p-5 rounded-3xl shadow-sm text-[#2D2D24]">
              <span className="text-xs font-bold text-[#8B7E66] uppercase tracking-wider block">
                Total Unweighted Pipeline
              </span>
              <div className="text-2xl font-mono font-bold text-[#2D2D24] mt-1">
                ${totalPipelineValue.toLocaleString()}
              </div>
              <div className="text-xs text-[#5A5A40] flex items-center font-medium mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> Across {deals.length} OEM Opportunities
              </div>
            </div>

            <div className="bg-white border border-[#E5E5DE] p-5 rounded-3xl shadow-sm text-[#2D2D24]">
              <span className="text-xs font-bold text-[#8B7E66] uppercase tracking-wider block">
                Probability Weighted Pipeline
              </span>
              <div className="text-2xl font-mono font-bold text-[#5A5A40] mt-1">
                ${Math.round(weightedPipeline).toLocaleString()}
              </div>
              <div className="text-[11px] text-[#787668] mt-1">
                Expected near-term manufacturing booking
              </div>
            </div>

            <div className="bg-white border border-[#E5E5DE] p-5 rounded-3xl shadow-sm text-[#2D2D24]">
              <span className="text-xs font-bold text-[#8B7E66] uppercase tracking-wider block">
                Won &amp; In Production
              </span>
              <div className="text-2xl font-mono font-bold text-[#2E6930] mt-1">
                {deals.filter((d) => d.stage === 'won_contract').length} Contracts
              </div>
              <div className="text-[11px] text-[#787668] mt-1">
                Allocated to Shop-Floor Work Orders
              </div>
            </div>

            <div className="bg-white border border-[#E5E5DE] p-5 rounded-3xl shadow-sm text-[#2D2D24]">
              <span className="text-xs font-bold text-[#8B7E66] uppercase tracking-wider block">
                Average Deal Size
              </span>
              <div className="text-2xl font-mono font-bold text-[#2D2D24] mt-1">
                ${deals.length > 0 ? Math.round(totalPipelineValue / deals.length).toLocaleString() : 0}
              </div>
              <div className="text-[11px] text-[#787668] mt-1">
                High-mix precision manufacturing
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-[#E5E5DE] p-4 rounded-3xl shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#A09E8E]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company, contact, or part SKU..."
                className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2D2D24] placeholder-[#A09E8E] focus:outline-none focus:border-[#5A5A40]"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              <span className="text-xs text-[#787668] flex items-center gap-1 font-medium mr-1">
                <Filter className="w-3.5 h-3.5" /> Stage:
              </span>
              {['all', 'lead', 'rfq_review', 'sample_prototyping', 'negotiation', 'won_contract'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStageFilter(st)}
                  className={`text-[11px] font-medium px-3 py-1.5 rounded-xl transition-colors capitalize cursor-pointer whitespace-nowrap ${
                    stageFilter === st
                      ? 'bg-[#5A5A40] text-white shadow-xs'
                      : 'bg-[#F5F5F0] text-[#787668] hover:bg-[#E9E9E0] hover:text-[#2D2D24]'
                  }`}
                >
                  {st === 'all' ? 'All Stages' : st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Deals Table */}
          <div className="bg-white border border-[#E5E5DE] rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#2D2D24]">
                <thead className="bg-[#F5F5F0] text-[#787668] uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E5DE]">
                  <tr>
                    <th className="py-3.5 px-4">OEM Account &amp; Contact</th>
                    <th className="py-3.5 px-4">Product Scope / Parts</th>
                    <th className="py-3.5 px-4 text-right">Contract Value</th>
                    <th className="py-3.5 px-4">Target Lot</th>
                    <th className="py-3.5 px-4">Win Prob.</th>
                    <th className="py-3.5 px-4">Sales Stage</th>
                    <th className="py-3.5 px-4 text-center">Pipeline Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5DE]">
                  {filteredDeals.map((deal) => {
                    const isWon = deal.stage === 'won_contract';

                    return (
                      <tr key={deal.id} className="hover:bg-[#F9F9F7] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#2D2D24] text-sm">{deal.companyName}</div>
                          <div className="text-[11px] text-[#787668] flex items-center gap-1.5 mt-0.5">
                            <span>{deal.contactPerson}</span>
                            <span>•</span>
                            <span className="font-mono text-[#8B7E66]">{deal.email}</span>
                          </div>
                          <div className="text-[10px] text-[#8B7E66] mt-0.5">Rep: {deal.assignedRep}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-medium text-[#2D2D24] block">{deal.productCategory}</span>
                          <span className="text-[10px] text-[#787668] italic">{deal.lastActivity}</span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-[#5A5A40]">
                          ${deal.dealValue.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[#2D2D24]">
                          {deal.estimatedUnits.toLocaleString()} units
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs">{deal.probability}%</span>
                            <div className="w-12 bg-[#F5F5F0] h-1.5 rounded-full overflow-hidden border border-[#E5E5DE]">
                              <div
                                className="bg-[#5A5A40] h-full rounded-full"
                                style={{ width: `${deal.probability}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${
                              isWon
                                ? 'bg-[#2E6930]/15 text-[#2E6930]'
                                : deal.stage === 'negotiation'
                                ? 'bg-[#5A5A40]/15 text-[#5A5A40]'
                                : 'bg-[#8B7E66]/20 text-[#8B7E66]'
                            }`}
                          >
                            {deal.stage.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {canWrite && !isWon && (
                              <button
                                onClick={() => onAdvanceDealStage(deal.id)}
                                className="text-[11px] text-[#5A5A40] hover:text-[#2D2D24] bg-[#F5F5F0] hover:bg-[#E9E9E0] px-3 py-1.5 rounded-xl border border-[#E5E5DE] font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <span>Advance</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}

                            {isWon && (
                              <button
                                onClick={() => onConvertDealToWorkOrder(deal)}
                                className="text-[11px] bg-[#5A5A40] hover:bg-[#474732] text-white px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Layers className="w-3.5 h-3.5" />
                                <span>Allocate to ERP</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MARKETING CAMPAIGNS */}
      {activeTab === 'marketing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {campaigns.map((camp) => {
              const spentPct = Math.round((camp.spent / camp.budget) * 100);

              return (
                <div
                  key={camp.id}
                  className="bg-white border border-[#E5E5DE] rounded-3xl p-6 space-y-4 shadow-sm text-[#2D2D24]"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B7E66] block">
                        {camp.channel}
                      </span>
                      <h3 className="font-bold text-sm text-[#2D2D24] mt-0.5">{camp.name}</h3>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                        camp.status === 'active'
                          ? 'bg-[#5A5A40]/15 text-[#5A5A40]'
                          : 'bg-[#8B7E66]/20 text-[#8B7E66]'
                      }`}
                    >
                      {camp.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#787668]">Budget Spent:</span>
                      <span className="font-mono font-bold text-[#2D2D24]">
                        ${camp.spent.toLocaleString()} / ${camp.budget.toLocaleString()} ({spentPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#F5F5F0] h-2 rounded-full overflow-hidden border border-[#E5E5DE]">
                      <div className="bg-[#5A5A40] h-full rounded-full" style={{ width: `${spentPct}%` }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E5E5DE] text-center">
                    <div className="bg-[#F5F5F0] p-2 rounded-xl">
                      <span className="text-[10px] text-[#787668] block">Leads</span>
                      <span className="font-mono font-bold text-[#2D2D24] text-sm">
                        {camp.leadsGenerated}
                      </span>
                    </div>
                    <div className="bg-[#F5F5F0] p-2 rounded-xl">
                      <span className="text-[10px] text-[#787668] block">Qualified</span>
                      <span className="font-mono font-bold text-[#5A5A40] text-sm">
                        {camp.qualifiedDeals}
                      </span>
                    </div>
                    <div className="bg-[#F5F5F0] p-2 rounded-xl">
                      <span className="text-[10px] text-[#787668] block">Target ROI</span>
                      <span className="font-mono font-bold text-[#2D2D24] text-sm">
                        {camp.roiMultiplier}x
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MARKETING ATTRIBUTION & ROI */}
      {activeTab === 'attribution' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E5E5DE] p-5 rounded-3xl shadow-sm text-[#2D2D24]">
              <span className="text-xs font-bold text-[#8B7E66] uppercase tracking-wider block">
                Total Marketing Investment
              </span>
              <div className="text-2xl font-mono font-bold text-[#2D2D24] mt-1">
                ${totalCampaignSpent.toLocaleString()}
              </div>
              <span className="text-[11px] text-[#787668] mt-1 block">
                Budget allocated: ${totalCampaignBudget.toLocaleString()}
              </span>
            </div>

            <div className="bg-white border border-[#E5E5DE] p-5 rounded-3xl shadow-sm text-[#2D2D24]">
              <span className="text-xs font-bold text-[#8B7E66] uppercase tracking-wider block">
                Average Cost Per Lead (CPL)
              </span>
              <div className="text-2xl font-mono font-bold text-[#5A5A40] mt-1">
                ${costPerLead}
              </div>
              <span className="text-[11px] text-[#2E6930] mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 22% below industrial benchmark
              </span>
            </div>

            <div className="bg-white border border-[#E5E5DE] p-5 rounded-3xl shadow-sm text-[#2D2D24]">
              <span className="text-xs font-bold text-[#8B7E66] uppercase tracking-wider block">
                Customer Acquisition Cost (CAC)
              </span>
              <div className="text-2xl font-mono font-bold text-[#2D2D24] mt-1">
                ${cacEstimate}
              </div>
              <span className="text-[11px] text-[#787668] mt-1 block">
                Per closed OEM manufacturing contract
              </span>
            </div>

            <div className="bg-white border border-[#E5E5DE] p-5 rounded-3xl shadow-sm text-[#2D2D24]">
              <span className="text-xs font-bold text-[#8B7E66] uppercase tracking-wider block">
                LTV / CAC Ratio
              </span>
              <div className="text-2xl font-mono font-bold text-[#5A5A40] mt-1">
                14.2x
              </div>
              <span className="text-[11px] text-[#5A5A40] mt-1 block font-medium">
                High repeat supplier engagement
              </span>
            </div>
          </div>

          <div className="bg-white border border-[#E5E5DE] rounded-3xl p-6 shadow-sm text-[#2D2D24] space-y-4">
            <h3 className="font-serif font-bold text-base text-[#2D2D24]">
              Channel Attribution &amp; Conversion Efficiency Matrix
            </h3>
            <p className="text-xs text-[#8B7E66]">
              Comparison of commercial return on investment across industrial marketing channels.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F5F0] text-[#787668] uppercase text-[10px] font-bold border-b border-[#E5E5DE]">
                  <tr>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4 text-right">Spend</th>
                    <th className="py-3 px-4 text-right">Leads</th>
                    <th className="py-3 px-4 text-right">Cost / Lead</th>
                    <th className="py-3 px-4 text-right">Qualified Deals</th>
                    <th className="py-3 px-4 text-right">Est. Pipeline Revenue</th>
                    <th className="py-3 px-4 text-right">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5DE] font-mono">
                  <tr className="hover:bg-[#F9F9F7]">
                    <td className="py-3 px-4 font-sans font-semibold text-[#2D2D24]">Trade Expo (IMTS / Automate)</td>
                    <td className="py-3 px-4 text-right">$32,000</td>
                    <td className="py-3 px-4 text-right">48</td>
                    <td className="py-3 px-4 text-right">$666</td>
                    <td className="py-3 px-4 text-right">18</td>
                    <td className="py-3 px-4 text-right text-[#5A5A40] font-bold">$1,250,000</td>
                    <td className="py-3 px-4 text-right font-bold text-[#2E6930]">39.1x</td>
                  </tr>
                  <tr className="hover:bg-[#F9F9F7]">
                    <td className="py-3 px-4 font-sans font-semibold text-[#2D2D24]">OEM Account Direct Outreach (ABM)</td>
                    <td className="py-3 px-4 text-right">$14,500</td>
                    <td className="py-3 px-4 text-right">24</td>
                    <td className="py-3 px-4 text-right">$604</td>
                    <td className="py-3 px-4 text-right">11</td>
                    <td className="py-3 px-4 text-right text-[#5A5A40] font-bold">$840,000</td>
                    <td className="py-3 px-4 text-right font-bold text-[#2E6930]">57.9x</td>
                  </tr>
                  <tr className="hover:bg-[#F9F9F7]">
                    <td className="py-3 px-4 font-sans font-semibold text-[#2D2D24]">Industry Publications &amp; Technical Papers</td>
                    <td className="py-3 px-4 text-right">$8,200</td>
                    <td className="py-3 px-4 text-right">31</td>
                    <td className="py-3 px-4 text-right">$264</td>
                    <td className="py-3 px-4 text-right">6</td>
                    <td className="py-3 px-4 text-right text-[#5A5A40] font-bold">$380,000</td>
                    <td className="py-3 px-4 text-right font-bold text-[#2E6930]">46.3x</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateDealModal
        isOpen={isCreateDealOpen}
        onClose={() => setIsCreateDealOpen(false)}
        onSave={onAddDeal}
      />

      <CreateCampaignModal
        isOpen={isCreateCampaignOpen}
        onClose={() => setIsCreateCampaignOpen(false)}
        onSave={onAddCampaign}
      />
    </div>
  );
};
