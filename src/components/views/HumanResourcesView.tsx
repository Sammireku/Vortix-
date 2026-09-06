import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Clock,
  Award,
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Download,
  Phone,
  Mail,
  Briefcase,
  X,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Upload,
} from 'lucide-react';
import { Employee, HrAttendanceRecord, HrCertification } from '../../types';

interface HumanResourcesViewProps {
  employees: Employee[];
  attendanceRecords: HrAttendanceRecord[];
  onAddEmployee: (employee: Employee) => void;
  onUpdateEmployeeStatus: (id: string, status: Employee['status']) => void;
  onShowNotification?: (title: string, message: string, type?: 'success' | 'alert') => void;
  onOpenBatchUploadModal?: () => void;
}

export const HumanResourcesView: React.FC<HumanResourcesViewProps> = ({
  employees,
  attendanceRecords,
  onAddEmployee,
  onUpdateEmployeeStatus,
  onShowNotification,
  onOpenBatchUploadModal,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'shifts' | 'certifications' | 'attendance'>('roster');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Employee Form State
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: '',
    email: '',
    phone: '',
    department: 'Assembly',
    roleTitle: '',
    shift: 'Shift A (06:00 - 14:30)',
    status: 'active_on_duty',
    assignedLineOrCell: 'Line 1 - CNC Bay A',
    hourlyRate: 32.0,
    skills: ['OSHA Compliant', 'Machine Operation'],
  });

  // KPI Calculations
  const totalHeadcount = employees.length;
  const activeOnShift = employees.filter((e) => e.status === 'active_on_duty').length;
  const attendanceRatePct = (
    (attendanceRecords.filter((a) => a.status === 'present').length / Math.max(1, attendanceRecords.length)) *
    100
  ).toFixed(1);
  const totalOvertimeHours = employees.reduce((acc, curr) => acc + curr.overtimeHours, 0);
  const maxSafetyDays = Math.max(...employees.map((e) => e.safetyIncidentFreeDays), 380);

  // All certifications across company
  const allCertifications = employees.flatMap((e) =>
    e.certifications.map((c) => ({ ...c, employeeName: e.name, employeeCode: e.employeeCode }))
  );
  const expiringSoonCount = allCertifications.filter((c) => c.status === 'expiring_soon').length;

  // Filtered Roster
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
    const matchesShift = shiftFilter === 'all' || emp.shift.includes(shiftFilter);
    return matchesSearch && matchesDept && matchesShift;
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.email) return;

    const created: Employee = {
      id: `emp-${Date.now()}`,
      employeeCode: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newEmployee.name,
      email: newEmployee.email,
      phone: newEmployee.phone || '+1 (312) 555-0100',
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?w=120&auto=format&fit=crop&q=80`,
      department: newEmployee.department as any,
      roleTitle: newEmployee.roleTitle || 'Production Operator',
      shift: newEmployee.shift as any,
      status: 'active_on_duty',
      assignedLineOrCell: newEmployee.assignedLineOrCell || 'Line 1 - CNC Bay A',
      hourlyRate: Number(newEmployee.hourlyRate) || 30.0,
      weeklyHoursLogged: 40.0,
      overtimeHours: 0.0,
      safetyIncidentFreeDays: 1,
      skills: newEmployee.skills || ['OSHA Compliant'],
      certifications: [
        {
          id: `cert-${Date.now()}`,
          name: 'OSHA 10 General Industry Onboarding',
          issuedBy: 'OSHA Safety Institute',
          issueDate: new Date().toISOString().split('T')[0],
          expiryDate: new Date(Date.now() + 3 * 365 * 86400000).toISOString().split('T')[0],
          status: 'valid',
        },
      ],
      emergencyContact: {
        name: 'Family Contact',
        relationship: 'Spouse/Kin',
        phone: '+1 (312) 555-0999',
      },
      hireDate: new Date().toISOString().split('T')[0],
    };

    onAddEmployee(created);
    setIsAddModalOpen(false);
    if (onShowNotification) {
      onShowNotification('Employee Enrolled', `${created.name} (${created.employeeCode}) added to ${created.department}.`);
    }
  };

  const handleExportCsv = () => {
    const csvContent = [
      ['Code', 'Name', 'Department', 'Role', 'Shift', 'Status', 'Hourly Rate', 'Overtime Hrs', 'Safety Days'].join(','),
      ...employees.map((e) =>
        [
          e.employeeCode,
          `"${e.name}"`,
          `"${e.department}"`,
          `"${e.roleTitle}"`,
          `"${e.shift.split(' ')[0]}"`,
          e.status,
          e.hourlyRate,
          e.overtimeHours,
          e.safetyIncidentFreeDays,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Vortix_HR_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowNotification) {
      onShowNotification('HR Export Complete', 'Employee roster and compliance data exported to CSV.');
    }
  };

  return (
    <div className="space-y-6 text-[#2D2D24]">
      {/* Top Banner & Title Bar */}
      <div className="bg-white border border-[#E5E5DE] p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#5A5A40]/10 text-[#5A5A40] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Workforce Operations & Safety
            </span>
            <span className="text-[10px] text-[#8B7E66]">&bull; Plant 1 - Midwest</span>
          </div>
          <h1 className="font-serif font-bold text-2xl text-[#2D2D24] mt-1">Human Resources & Workforce Management</h1>
          <p className="text-xs text-[#8B7E66] mt-0.5">
            Operator roster, shift scheduling, OSHA compliance records, skill certification radar, and overtime tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenBatchUploadModal && (
            <button
              onClick={onOpenBatchUploadModal}
              className="flex items-center gap-1.5 text-xs bg-[#FAF9F5] hover:bg-[#F5F5F0] text-[#5A5A40] border border-[#5A5A40]/30 font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
              title="Batch import and update employees via CSV"
            >
              <Upload className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Batch CSV Import</span>
            </button>
          )}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 text-xs bg-[#F5F5F0] hover:bg-[#E9E9E0] text-[#2D2D24] border border-[#E5E5DE] font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>Export Roster CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Enroll New Employee</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-[#E5E5DE] p-4 rounded-2xl shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B7E66]">Total Headcount</div>
          <div className="font-serif font-bold text-2xl text-[#2D2D24] mt-1">{totalHeadcount}</div>
          <div className="text-[11px] text-[#5A5A40] mt-0.5 flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>Across 7 Departments</span>
          </div>
        </div>

        <div className="bg-white border border-[#E5E5DE] p-4 rounded-2xl shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B7E66]">Active On-Floor</div>
          <div className="font-serif font-bold text-2xl text-[#2E6930] mt-1">{activeOnShift}</div>
          <div className="text-[11px] text-[#787668] mt-0.5 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#2E6930] animate-pulse" />
            <span>Shift A & B Staffed</span>
          </div>
        </div>

        <div className="bg-white border border-[#E5E5DE] p-4 rounded-2xl shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B7E66]">Attendance Rate</div>
          <div className="font-serif font-bold text-2xl text-[#2D2D24] mt-1">{attendanceRatePct}%</div>
          <div className="text-[11px] text-[#2E6930] mt-0.5 font-medium">+1.4% vs last shift</div>
        </div>

        <div className="bg-white border border-[#E5E5DE] p-4 rounded-2xl shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B7E66]">Safety Record</div>
          <div className="font-serif font-bold text-2xl text-[#2E6930] mt-1">{maxSafetyDays}d</div>
          <div className="text-[11px] text-[#787668] mt-0.5 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#2E6930]" />
            <span>Incident-Free Record</span>
          </div>
        </div>

        <div className="bg-white border border-[#E5E5DE] p-4 rounded-2xl shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B7E66]">Overtime Logged</div>
          <div className="font-serif font-bold text-2xl text-[#2D2D24] mt-1">{totalOvertimeHours}h</div>
          <div className="text-[11px] text-[#787668] mt-0.5">This week (Approved)</div>
        </div>

        <div className="bg-white border border-[#E5E5DE] p-4 rounded-2xl shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8B7E66]">Expiring Certs</div>
          <div className="font-serif font-bold text-2xl text-[#C48C3B] mt-1">{expiringSoonCount}</div>
          <div className="text-[11px] text-[#C48C3B] mt-0.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Due &lt;30 days</span>
          </div>
        </div>
      </div>

      {/* Main Tab Controls & Filters */}
      <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E5E5DE] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#FAF9F5]">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-[#F5F5F0] p-1 rounded-2xl border border-[#E5E5DE]">
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                activeTab === 'roster' ? 'bg-white text-[#2D2D24] shadow-2xs' : 'text-[#787668] hover:text-[#2D2D24]'
              }`}
            >
              Employee Directory ({employees.length})
            </button>
            <button
              onClick={() => setActiveTab('shifts')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                activeTab === 'shifts' ? 'bg-white text-[#2D2D24] shadow-2xs' : 'text-[#787668] hover:text-[#2D2D24]'
              }`}
            >
              Shift Allocations & Stations
            </button>
            <button
              onClick={() => setActiveTab('certifications')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                activeTab === 'certifications' ? 'bg-white text-[#2D2D24] shadow-2xs' : 'text-[#787668] hover:text-[#2D2D24]'
              }`}
            >
              Skill Matrix & OSHA Certs
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                activeTab === 'attendance' ? 'bg-white text-[#2D2D24] shadow-2xs' : 'text-[#787668] hover:text-[#2D2D24]'
              }`}
            >
              Time & Attendance Log
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8B7E66] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, code, skill..."
                className="bg-white border border-[#E5E5DE] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#2D2D24] focus:outline-hidden focus:border-[#5A5A40] w-48 sm:w-56"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-white border border-[#E5E5DE] rounded-xl px-2.5 py-1.5 text-xs text-[#2D2D24] focus:outline-hidden"
            >
              <option value="all">All Departments</option>
              <option value="CNC Machining">CNC Machining</option>
              <option value="Quality & SMT">Quality & SMT</option>
              <option value="Assembly">Assembly</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Warehouse & Logistics">Warehouse & Logistics</option>
              <option value="Engineering">Engineering</option>
              <option value="Operations Management">Operations</option>
            </select>

            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="bg-white border border-[#E5E5DE] rounded-xl px-2.5 py-1.5 text-xs text-[#2D2D24] focus:outline-hidden"
            >
              <option value="all">All Shifts</option>
              <option value="Shift A">Shift A (Morning)</option>
              <option value="Shift B">Shift B (Swing)</option>
              <option value="Shift C">Shift C (Graveyard)</option>
            </select>
          </div>
        </div>

        {/* Tab 1: Employee Directory */}
        {activeTab === 'roster' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="bg-[#FAF9F5] border border-[#E5E5DE] rounded-2xl p-4.5 space-y-3 hover:border-[#C4C4B8] transition-all shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-11 h-11 rounded-2xl object-cover border border-[#E5E5DE] shadow-2xs"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-[#2D2D24]">{emp.name}</h4>
                          <span className="text-[10px] font-mono text-[#8B7E66]">{emp.employeeCode}</span>
                        </div>
                        <p className="text-[11px] text-[#5A5A40] font-medium">{emp.roleTitle}</p>
                        <p className="text-[10px] text-[#8B7E66]">{emp.department}</p>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <button
                      onClick={() =>
                        onUpdateEmployeeStatus(
                          emp.id,
                          emp.status === 'active_on_duty' ? 'on_break' : 'active_on_duty'
                        )
                      }
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                        emp.status === 'active_on_duty'
                          ? 'bg-[#EBF3ED] text-[#2E6930] border border-[#CDE5D2]'
                          : emp.status === 'on_break'
                          ? 'bg-[#FFF9EB] text-[#8C6B1C] border border-[#F5E2B3]'
                          : emp.status === 'in_training'
                          ? 'bg-[#EAF0F6] text-[#2B547E] border border-[#C6D8EB]'
                          : 'bg-[#F5F5F0] text-[#787668] border border-[#E5E5DE]'
                      }`}
                      title="Click to toggle status"
                    >
                      {emp.status.replace('_', ' ').replace('_', ' ')}
                    </button>
                  </div>

                  {/* Operational Station & Shift */}
                  <div className="bg-white border border-[#E5E5DE] rounded-xl p-2.5 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8B7E66]">Assigned Station:</span>
                      <span className="font-semibold text-[#2D2D24]">{emp.assignedLineOrCell}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8B7E66]">Assigned Shift:</span>
                      <span className="text-[#2D2D24] font-medium">{emp.shift}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8B7E66]">Overtime / Rate:</span>
                      <span className="text-[#2D2D24]">
                        {emp.overtimeHours}h OT &bull; ${emp.hourlyRate}/hr
                      </span>
                    </div>
                  </div>

                  {/* Skills Chips */}
                  <div className="flex flex-wrap gap-1">
                    {emp.skills.map((sk, i) => (
                      <span
                        key={i}
                        className="text-[9px] bg-white text-[#787668] border border-[#E5E5DE] px-2 py-0.5 rounded-md font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>

                  {/* Emergency Contact & Contact details */}
                  <div className="pt-2 border-t border-[#E5E5DE] flex items-center justify-between text-[10px] text-[#8B7E66]">
                    <div className="flex items-center gap-2">
                      <a href={`mailto:${emp.email}`} className="hover:text-[#2D2D24] flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span>Email</span>
                      </a>
                      <a href={`tel:${emp.phone}`} className="hover:text-[#2D2D24] flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    </div>
                    <span className="text-[#2E6930] font-semibold">{emp.safetyIncidentFreeDays}d Safe</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Shift Allocations */}
        {activeTab === 'shifts' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-serif font-bold text-base text-[#2D2D24]">Active Shift Station Matrix</h3>
              <p className="text-xs text-[#8B7E66] mt-0.5">
                Current workstation assignments across machining bays, cleanroom SMT, and assembly lines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { shift: 'Shift A (Morning)', time: '06:00 - 14:30', count: 7, supervisor: 'Aisha Al-Mansoor', color: '#2E6930' },
                { shift: 'Shift B (Swing)', time: '14:00 - 22:30', count: 3, supervisor: 'Sarah Jenkins', color: '#5A5A40' },
                { shift: 'Shift C (Graveyard)', time: '22:00 - 06:30', count: 1, supervisor: 'Jackson Miller', color: '#787668' },
              ].map((s) => (
                <div key={s.shift} className="bg-[#FAF9F5] border border-[#E5E5DE] rounded-2xl p-4.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#2D2D24]">{s.shift}</h4>
                      <p className="text-[11px] text-[#8B7E66]">{s.time}</p>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-2xs"
                      style={{ backgroundColor: s.color }}
                    >
                      {s.count} On-Duty
                    </span>
                  </div>
                  <div className="text-xs text-[#787668]">
                    <span className="font-semibold text-[#2D2D24]">Shift Supervisor:</span> {s.supervisor}
                  </div>
                  <div className="pt-2 border-t border-[#E5E5DE] space-y-1.5">
                    {employees
                      .filter((e) => e.shift.includes(s.shift.split(' ')[1]))
                      .map((emp) => (
                        <div
                          key={emp.id}
                          className="bg-white border border-[#E5E5DE] rounded-xl p-2 flex items-center justify-between text-[11px]"
                        >
                          <span className="font-semibold text-[#2D2D24]">{emp.name}</span>
                          <span className="text-[#8B7E66] font-mono text-[10px]">{emp.assignedLineOrCell}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Certifications Matrix */}
        {activeTab === 'certifications' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-[#2D2D24]">Workforce Compliance & Certification Radar</h3>
                <p className="text-xs text-[#8B7E66] mt-0.5">
                  OSHA safety, Six Sigma, IPC-A-610 electronics, and robotic teach pendant certifications.
                </p>
              </div>
              <button
                onClick={() => {
                  if (onShowNotification) {
                    onShowNotification('Training Scheduled', 'OSHA 30 and IPC refresher batch scheduled for next Monday.');
                  }
                }}
                className="text-xs bg-[#5A5A40] hover:bg-[#474732] text-white font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Schedule Refresher Training Batch
              </button>
            </div>

            <div className="border border-[#E5E5DE] rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#E5E5DE] text-[10px] font-bold uppercase text-[#8B7E66]">
                    <th className="p-3">Operator Name</th>
                    <th className="p-3">Certification Title</th>
                    <th className="p-3">Issuing Agency</th>
                    <th className="p-3">Issue Date</th>
                    <th className="p-3">Expiration Date</th>
                    <th className="p-3 text-right">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5DE]">
                  {allCertifications.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FAF9F5] transition-colors">
                      <td className="p-3 font-semibold text-[#2D2D24]">
                        <div>{c.employeeName}</div>
                        <div className="text-[10px] text-[#8B7E66] font-mono">{c.employeeCode}</div>
                      </td>
                      <td className="p-3 font-medium text-[#2D2D24]">{c.name}</td>
                      <td className="p-3 text-[#787668]">{c.issuedBy}</td>
                      <td className="p-3 text-[#787668] font-mono">{c.issueDate}</td>
                      <td className="p-3 text-[#787668] font-mono">{c.expiryDate}</td>
                      <td className="p-3 text-right">
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                            c.status === 'valid'
                              ? 'bg-[#EBF3ED] text-[#2E6930] border border-[#CDE5D2]'
                              : c.status === 'expiring_soon'
                              ? 'bg-[#FFF9EB] text-[#8C6B1C] border border-[#F5E2B3]'
                              : 'bg-[#FFF5F5] text-[#B33A3A] border border-[#FCDAD7]'
                          }`}
                        >
                          {c.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Time & Attendance */}
        {activeTab === 'attendance' && (
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-serif font-bold text-base text-[#2D2D24]">Shift Time & Attendance Verification</h3>
              <p className="text-xs text-[#8B7E66] mt-0.5">
                Biometric punch clock-ins, assigned work stations, and supervisor overtime sign-offs.
              </p>
            </div>

            <div className="border border-[#E5E5DE] rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#E5E5DE] text-[10px] font-bold uppercase text-[#8B7E66]">
                    <th className="p-3">Employee</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Clock-In Time</th>
                    <th className="p-3">Station</th>
                    <th className="p-3">Overtime</th>
                    <th className="p-3">Supervisor Notes</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5DE]">
                  {attendanceRecords.map((att) => (
                    <tr key={att.id} className="hover:bg-[#FAF9F5] transition-colors">
                      <td className="p-3 font-semibold text-[#2D2D24]">{att.employeeName}</td>
                      <td className="p-3 text-[#787668] font-mono">{att.date}</td>
                      <td className="p-3 text-[#2D2D24] font-medium">{att.clockIn}</td>
                      <td className="p-3 text-[#787668]">{att.station}</td>
                      <td className="p-3 text-[#2D2D24] font-mono">
                        {att.overtimeMinutes > 0 ? `+${att.overtimeMinutes}m` : '0m'}
                      </td>
                      <td className="p-3 text-[#787668] italic">{att.supervisorNotes || 'Standard shift'}</td>
                      <td className="p-3 text-right">
                        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#EBF3ED] text-[#2E6930] border border-[#CDE5D2]">
                          {att.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Enroll New Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5E5DE] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#E5E5DE] flex items-center justify-between bg-[#FAF9F5]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#5A5A40]/15 text-[#5A5A40]">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#2D2D24]">Enroll New Workforce Member</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-[#8B7E66] hover:text-[#2D2D24]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block font-semibold text-[#2D2D24] mb-1">Full Name</label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  placeholder="e.g. Thomas Alvarez"
                  className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#5A5A40]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    placeholder="t.alvarez@vortix.internal"
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#5A5A40]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1">Phone</label>
                  <input
                    type="text"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    placeholder="+1 (312) 555-0199"
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-[#5A5A40]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1">Department</label>
                  <select
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value as any })}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                  >
                    <option value="Assembly">Assembly</option>
                    <option value="CNC Machining">CNC Machining</option>
                    <option value="Quality & SMT">Quality & SMT</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Warehouse & Logistics">Warehouse & Logistics</option>
                    <option value="Engineering">Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1">Role Title</label>
                  <input
                    type="text"
                    value={newEmployee.roleTitle}
                    onChange={(e) => setNewEmployee({ ...newEmployee, roleTitle: e.target.value })}
                    placeholder="e.g. SMT Solder Specialist"
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1">Shift</label>
                  <select
                    value={newEmployee.shift}
                    onChange={(e) => setNewEmployee({ ...newEmployee, shift: e.target.value as any })}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                  >
                    <option value="Shift A (06:00 - 14:30)">Shift A (06:00 - 14:30)</option>
                    <option value="Shift B (14:00 - 22:30)">Shift B (14:00 - 22:30)</option>
                    <option value="Shift C (22:00 - 06:30)">Shift C (22:00 - 06:30)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#2D2D24] mb-1">Hourly Base Rate ($)</label>
                  <input
                    type="number"
                    value={newEmployee.hourlyRate}
                    onChange={(e) => setNewEmployee({ ...newEmployee, hourlyRate: Number(e.target.value) })}
                    className="w-full bg-[#F5F5F0] border border-[#E5E5DE] rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E5DE] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E5DE] text-xs font-semibold text-[#2D2D24] hover:bg-[#F5F5F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#474732] text-white text-xs font-semibold"
                >
                  Enroll Operator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
