"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import DashboardLayout from "@/app/dashboard-layout";
import StatsCards from "@/components/dashboard/StatsCards";
import DashboardCharts from "@/components/charts/DashboardCharts";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { formatDate } from "@/utils/format";
import { formatCurrency } from "@/utils/calculations";
import { getAllMissions } from "@/lib/storage";
import type { Mission, MissionStats, MonthlyData } from "@/types/mission";

export default function HomePage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [stats, setStats] = useState<MissionStats>({
    totalMissions: 0,
    totalKm: 0,
    totalFuelCost: 0,
    totalTicketCost: 0,
    grandTotalCost: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    try {
      const all: Mission[] = getAllMissions();
      setMissions(all);

      const totalMissions = all.length;
      const totalKm = all.reduce((s, m) => s + m.distanceKm, 0);
      const totalFuelCost = all.reduce((s, m) => s + m.fuelCost, 0);
      const totalTicketCost = all.reduce((s, m) => s + m.ticketCost, 0);
      const grandTotalCost = all.reduce((s, m) => s + m.totalCost, 0);

      setStats({ totalMissions, totalKm, totalFuelCost, totalTicketCost, grandTotalCost });

      const monthMap: Record<string, MonthlyData> = {};
      all.forEach((m) => {
        const d = new Date(m.missionDate);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!monthMap[key]) {
          monthMap[key] = {
            month: key,
            missions: 0,
            distance: 0,
            fuelCost: 0,
            ticketCost: 0,
            totalCost: 0,
          };
        }
        monthMap[key].missions += 1;
        monthMap[key].distance += m.distanceKm;
        monthMap[key].fuelCost += m.fuelCost;
        monthMap[key].ticketCost += m.ticketCost;
        monthMap[key].totalCost += m.totalCost;
      });

      const months = Object.values(monthMap)
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6)
        .map((m) => {
          const [y, mo] = m.month.split("-");
          const d = new Date(Number(y), Number(mo) - 1);
          return {
            ...m,
            month: d.toLocaleString("en", { month: "short" }),
          };
        });

      setMonthlyData(months);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Overview of your mission data
            </p>
          </div>
          <Link href="/missions/new">
            <Button>
              <Plus className="w-4 h-4" />
              Quick Add
            </Button>
          </Link>
        </div>

        <StatsCards stats={stats} />

        <DashboardCharts monthlyData={monthlyData} />

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Missions</h2>
            <Link href="/missions" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
              View All
            </Link>
          </div>
          {missions.length === 0 ? (
            <EmptyState
              title="No missions yet"
              description="Start by adding your first mission."
              action={
                <Link href="/missions/new">
                  <Button size="sm">
                    <Plus className="w-4 h-4" />
                    Add Mission
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">Date</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">Purpose</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">Distance</th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {missions.slice(0, 5).map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-4 py-3 text-gray-900 dark:text-white whitespace-nowrap">
                        {formatDate(m.missionDate)}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white truncate max-w-[200px]">
                        {m.purpose}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {m.distanceKm.toLocaleString()} km
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(m.totalCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
