"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useMissions } from "@/hooks/useMissions";
import { formatDate } from "@/utils/format";
import { formatCurrency } from "@/utils/calculations";
import { getYears } from "@/utils/format";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Mission, SortField, MissionFilters } from "@/types/mission";
import Link from "next/link";
import toast from "react-hot-toast";

export default function MissionList() {
  const { missions, total, totalPages, loading, fetchMissions, deleteMission } = useMissions();
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState<number | "">("");
  const [year, setYear] = useState<number | "">("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Mission | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const load = useCallback(() => {
    const filters: MissionFilters = {
      search: debouncedSearch || undefined,
      month: month || undefined,
      year: year || undefined,
      sortField,
      sortOrder,
      page,
      pageSize: 10,
    };
    fetchMissions(filters);
  }, [debouncedSearch, month, year, sortField, sortOrder, page, fetchMissions]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMission(deleteTarget.id);
      toast.success("Mission deleted successfully");
      setDeleteTarget(null);
      load();
    } catch {
      toast.error("Failed to delete mission");
    } finally {
      setDeleting(false);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
    );
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by purpose..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <select
            value={month}
            onChange={(e) => {
              setMonth(e.target.value ? Number(e.target.value) : "");
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none"
          >
            <option value="">All Months</option>
            {months.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value ? Number(e.target.value) : "");
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none"
          >
            <option value="">All Years</option>
            {getYears().map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      )}

      <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">#</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">
                <button onClick={() => handleSort("missionDate")} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                  Date <SortIcon field="missionDate" />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Purpose</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">
                <button onClick={() => handleSort("distanceKm")} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                  Distance <SortIcon field="distanceKm" />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Fuel Cost</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Ticket Cost</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">
                <button onClick={() => handleSort("totalCost")} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                  Total <SortIcon field="totalCost" />
                </button>
              </th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3"><Skeleton className="h-4 w-8" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                </tr>
              ))
            ) : missions.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    title="No missions found"
                    description="Create your first mission or adjust your filters."
                  />
                </td>
              </tr>
            ) : (
              missions.map((m, idx) => (
                <tr
                  key={m.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {(page - 1) * 10 + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">
                    {formatDate(m.missionDate)}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white max-w-[200px] truncate">
                    {m.purpose}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-white">
                    {m.distanceKm.toLocaleString()} km
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {formatCurrency(m.fuelCost)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {formatCurrency(m.ticketCost)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(m.totalCost)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/missions/${m.id}/edit`}
                        className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(m)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {(page - 1) * 10 + 1}-{Math.min(page * 10, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === pageNum
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Mission"
        message={`Are you sure you want to delete this mission "${deleteTarget?.purpose}"? This action cannot be undone.`}
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
