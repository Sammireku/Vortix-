import { create } from 'zustand';
import { Employee, HrAttendanceRecord, FleetVehicle, FleetMission } from '../types';
import {
  initialEmployees,
  initialAttendanceRecords,
  initialFleetVehicles,
  initialFleetMissions,
} from '../data/hrAndFleetData';

interface FleetAndHrState {
  // Workforce HR
  employees: Employee[];
  setEmployees: (employees: Employee[] | ((prev: Employee[]) => Employee[])) => void;
  handleAddEmployee: (emp: Employee) => void;
  handleUpdateEmployeeStatus: (id: string, status: Employee['status']) => void;
  handleUploadEmployeesBatch: (uploadedEmployees: Employee[], mode: 'append' | 'update') => void;

  attendanceRecords: HrAttendanceRecord[];
  setAttendanceRecords: (records: HrAttendanceRecord[] | ((prev: HrAttendanceRecord[]) => HrAttendanceRecord[])) => void;

  // Fleet Robotics & Logistics
  fleetVehicles: FleetVehicle[];
  setFleetVehicles: (vehicles: FleetVehicle[] | ((prev: FleetVehicle[]) => FleetVehicle[])) => void;
  handleUpdateVehicleStatus: (vehicleId: string, status: FleetVehicle['status']) => void;

  fleetMissions: FleetMission[];
  setFleetMissions: (missions: FleetMission[] | ((prev: FleetMission[]) => FleetMission[])) => void;
  handleDispatchFleetMission: (mission: FleetMission) => void;
}

export const useFleetAndHrStore = create<FleetAndHrState>((set) => ({
  employees: initialEmployees,
  setEmployees: (employees) =>
    set((state) => ({
      employees: typeof employees === 'function' ? employees(state.employees) : employees,
    })),
  handleAddEmployee: (emp) =>
    set((state) => ({
      employees: [emp, ...state.employees],
    })),
  handleUpdateEmployeeStatus: (id, status) =>
    set((state) => ({
      employees: state.employees.map((e) => (e.id === id ? { ...e, status } : e)),
    })),
  handleUploadEmployeesBatch: (uploadedEmployees, mode) =>
    set((state) => {
      if (mode === 'append') {
        return { employees: [...state.employees, ...uploadedEmployees] };
      }
      const map = new Map<string, Employee>();
      state.employees.forEach((emp) => map.set(emp.employeeCode.toLowerCase(), emp));
      uploadedEmployees.forEach((emp) => {
        const key = emp.employeeCode.toLowerCase();
        const existing =
          map.get(key) ||
          Array.from(map.values()).find((e) => e.email.toLowerCase() === emp.email.toLowerCase());
        if (existing) {
          map.set(existing.employeeCode.toLowerCase(), { ...existing, ...emp, id: existing.id });
        } else {
          map.set(key, emp);
        }
      });
      return { employees: Array.from(map.values()) };
    }),

  attendanceRecords: initialAttendanceRecords,
  setAttendanceRecords: (records) =>
    set((state) => ({
      attendanceRecords: typeof records === 'function' ? records(state.attendanceRecords) : records,
    })),

  fleetVehicles: initialFleetVehicles,
  setFleetVehicles: (vehicles) =>
    set((state) => ({
      fleetVehicles: typeof vehicles === 'function' ? vehicles(state.fleetVehicles) : vehicles,
    })),
  handleUpdateVehicleStatus: (vehicleId, status) =>
    set((state) => ({
      fleetVehicles: state.fleetVehicles.map((v) => (v.id === vehicleId ? { ...v, status } : v)),
    })),

  fleetMissions: initialFleetMissions,
  setFleetMissions: (missions) =>
    set((state) => ({
      fleetMissions: typeof missions === 'function' ? missions(state.fleetMissions) : missions,
    })),
  handleDispatchFleetMission: (mission) =>
    set((state) => ({
      fleetMissions: [mission, ...state.fleetMissions],
      fleetVehicles: state.fleetVehicles.map((v) =>
        v.id === mission.vehicleId ? { ...v, status: 'in_mission' as const } : v
      ),
    })),
}));
