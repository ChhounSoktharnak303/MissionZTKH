import type { Mission, MissionFormData, MissionFilters, PaginatedResponse } from "@/types/mission";
import { calculateFuelCost, calculateTotalCost, DEFAULT_TICKET_COST } from "@/utils/calculations";

const STORAGE_KEY = "mission_app_data";
const COUNTER_KEY = "mission_app_counter";

function getAll(): Mission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(missions: Mission[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
}

function nextId(): number {
  const raw = localStorage.getItem(COUNTER_KEY);
  const current = raw ? Number(raw) : 0;
  const next = current + 1;
  localStorage.setItem(COUNTER_KEY, String(next));
  return next;
}

export function getMissions(filters: MissionFilters = {}): PaginatedResponse {
  let data = getAll();

  if (filters.search) {
    const q = filters.search.toLowerCase();
    data = data.filter((m) => m.purpose.toLowerCase().includes(q));
  }

  if (filters.year) {
    data = data.filter((m) => new Date(m.missionDate).getFullYear() === filters.year);
  }

  if (filters.month) {
    data = data.filter((m) => new Date(m.missionDate).getMonth() + 1 === filters.month);
  }

  const sortField = filters.sortField || "createdAt";
  const sortOrder = filters.sortOrder || "desc";
  data.sort((a, b) => {
    let aVal: string | number, bVal: string | number;
    if (sortField === "missionDate") {
      aVal = new Date(a.missionDate).getTime();
      bVal = new Date(b.missionDate).getTime();
    } else if (sortField === "distanceKm") {
      aVal = a.distanceKm;
      bVal = b.distanceKm;
    } else if (sortField === "totalCost") {
      aVal = a.totalCost;
      bVal = b.totalCost;
    } else {
      aVal = new Date(a.createdAt).getTime();
      bVal = new Date(b.createdAt).getTime();
    }
    if (sortOrder === "asc") return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });

  const total = data.length;
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const totalPages = Math.ceil(total / pageSize);
  const paged = data.slice((page - 1) * pageSize, page * pageSize);

  const agg = data.reduce(
    (acc, m) => ({
      totalMissions: acc.totalMissions + 1,
      totalKm: acc.totalKm + m.distanceKm,
      totalFuelCost: acc.totalFuelCost + m.fuelCost,
      totalTicketCost: acc.totalTicketCost + m.ticketCost,
      grandTotal: acc.grandTotal + m.totalCost,
    }),
    { totalMissions: 0, totalKm: 0, totalFuelCost: 0, totalTicketCost: 0, grandTotal: 0 }
  );

  return {
    data: paged,
    total,
    page,
    pageSize,
    totalPages,
    summary: {
      totalMissions: agg.totalMissions,
      totalKm: Math.round(agg.totalKm * 100) / 100,
      totalFuelCost: Math.round(agg.totalFuelCost * 100) / 100,
      totalTicketCost: Math.round(agg.totalTicketCost * 100) / 100,
      grandTotal: Math.round(agg.grandTotal * 100) / 100,
    },
  };
}

export function getAllMissions(): Mission[] {
  return getAll();
}

export function getMissionById(id: number): Mission | undefined {
  return getAll().find((m) => m.id === id);
}

export function createMission(data: MissionFormData): Mission {
  const dist = Number(data.distanceKm);
  const fuel = calculateFuelCost(dist);
  const ticket = data.ticketCost !== undefined ? Number(data.ticketCost) : DEFAULT_TICKET_COST;
  const total = calculateTotalCost(fuel, ticket);

  const now = new Date().toISOString();
  const mission: Mission = {
    id: nextId(),
    missionDate: data.missionDate,
    purpose: data.purpose,
    distanceKm: dist,
    fuelCost: fuel,
    ticketCost: ticket,
    totalCost: total,
    createdAt: now,
    updatedAt: now,
  };

  const all = getAll();
  all.push(mission);
  saveAll(all);
  return mission;
}

export function updateMission(id: number, data: MissionFormData): Mission {
  const dist = Number(data.distanceKm);
  const fuel = calculateFuelCost(dist);
  const ticket = data.ticketCost !== undefined ? Number(data.ticketCost) : DEFAULT_TICKET_COST;
  const total = calculateTotalCost(fuel, ticket);

  const all = getAll();
  const idx = all.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error("Mission not found");

  all[idx] = {
    ...all[idx],
    missionDate: data.missionDate,
    purpose: data.purpose,
    distanceKm: dist,
    fuelCost: fuel,
    ticketCost: ticket,
    totalCost: total,
    updatedAt: new Date().toISOString(),
  };
  saveAll(all);
  return all[idx];
}

export function deleteMission(id: number): void {
  const all = getAll().filter((m) => m.id !== id);
  saveAll(all);
}

export function importMissions(items: Omit<Mission, "id" | "createdAt" | "updatedAt">[]): number {
  const all = getAll();
  let count = 0;
  for (const item of items) {
    all.push({
      ...item,
      id: nextId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    count++;
  }
  saveAll(all);
  return count;
}
