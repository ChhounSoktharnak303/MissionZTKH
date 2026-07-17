export interface Mission {
  id: number;
  missionDate: string;
  purpose: string;
  distanceKm: number;
  fuelCost: number;
  ticketCost: number;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface MissionFormData {
  missionDate: string;
  purpose: string;
  distanceKm: number;
  ticketCost: number;
}

export interface MissionStats {
  totalMissions: number;
  totalKm: number;
  totalFuelCost: number;
  totalTicketCost: number;
  grandTotalCost: number;
}

export interface MonthlyData {
  month: string;
  missions: number;
  distance: number;
  fuelCost: number;
  ticketCost: number;
  totalCost: number;
}

export interface PaginatedResponse {
  data: Mission[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary: {
    totalMissions: number;
    totalKm: number;
    totalFuelCost: number;
    totalTicketCost: number;
    grandTotal: number;
  };
}

export type SortField =
  | "createdAt"
  | "missionDate"
  | "distanceKm"
  | "totalCost";
export type SortOrder = "asc" | "desc";

export interface MissionFilters {
  search?: string;
  month?: number;
  year?: number;
  sortField?: SortField;
  sortOrder?: SortOrder;
  page?: number;
  pageSize?: number;
}
