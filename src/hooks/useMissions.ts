import { useState, useCallback } from "react";
import type { Mission, MissionFormData, MissionFilters, PaginatedResponse } from "@/types/mission";
import { getMissions, createMission as storageCreate, updateMission as storageUpdate, deleteMission as storageDelete, importMissions as storageImport, getAllMissions } from "@/lib/storage";

export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ totalMissions: 0, totalKm: 0, totalFuelCost: 0, totalTicketCost: 0, grandTotal: 0 });

  const fetchMissions = useCallback((filters: MissionFilters = {}) => {
    setLoading(true);
    try {
      const result: PaginatedResponse = getMissions(filters);
      setMissions(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      if (result.summary) setSummary(result.summary);
    } catch {
      setMissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMission = useCallback(async (data: MissionFormData) => {
    const mission = storageCreate(data);
    return mission;
  }, []);

  const updateMission = useCallback(async (id: number, data: MissionFormData) => {
    const mission = storageUpdate(id, data);
    return mission;
  }, []);

  const deleteMission = useCallback(async (id: number) => {
    storageDelete(id);
    return { success: true };
  }, []);

  const importMissions = useCallback(async (items: Omit<Mission, "id" | "createdAt" | "updatedAt">[]) => {
    const count = storageImport(items);
    return { success: true, count };
  }, []);

  return {
    missions,
    total,
    totalPages,
    loading,
    summary,
    fetchMissions,
    createMission,
    updateMission,
    deleteMission,
    importMissions,
  };
}

export { getAllMissions };
