import { useState, useCallback } from "react";
import type { Mission, MissionFormData, MissionFilters, PaginatedResponse } from "@/types/mission";

const API_URL = "/api/missions";

export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchMissions = useCallback(async (filters: MissionFilters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.month) params.set("month", String(filters.month));
      if (filters.year) params.set("year", String(filters.year));
      if (filters.sortField) params.set("sortField", filters.sortField);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
      if (filters.page) params.set("page", String(filters.page));
      if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

      const res = await fetch(`${API_URL}?${params.toString()}`);
      const json: PaginatedResponse = await res.json();
      setMissions(json.data);
      setTotal(json.total);
      setTotalPages(json.totalPages);
    } catch {
      setMissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMission = useCallback(async (data: MissionFormData) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create mission");
    return res.json();
  }, []);

  const updateMission = useCallback(async (id: number, data: MissionFormData) => {
    const res = await fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    if (!res.ok) throw new Error("Failed to update mission");
    return res.json();
  }, []);

  const deleteMission = useCallback(async (id: number) => {
    const res = await fetch(API_URL, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error("Failed to delete mission");
    return res.json();
  }, []);

  const importMissions = useCallback(async (items: Omit<Mission, "id" | "createdAt" | "updatedAt">[]) => {
    const res = await fetch(`${API_URL}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) throw new Error("Failed to import missions");
    return res.json();
  }, []);

  return {
    missions,
    total,
    totalPages,
    loading,
    fetchMissions,
    createMission,
    updateMission,
    deleteMission,
    importMissions,
  };
}
