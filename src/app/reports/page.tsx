"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileDown,
  Printer,
  Calendar,
  TrendingUp,
  DollarSign,
  Route,
  Target,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/app/dashboard-layout";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate, getMonthName, getYears } from "@/utils/format";
import { formatCurrency, formatNumber } from "@/utils/calculations";
import { exportToExcel } from "@/utils/excel";
import { getAllMissions } from "@/lib/storage";
import type { Mission } from "@/types/mission";

export default function ReportsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const load = useCallback(() => {
    setLoading(true);
    try {
      const all = getAllMissions().filter(
        (m) => new Date(m.missionDate).getFullYear() === selectedYear
      );
      setMissions(all);
    } catch {
      setMissions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    load();
  }, [load]);

  const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
    const monthMissions = missions.filter((m) => {
      const d = new Date(m.missionDate);
      return d.getFullYear() === selectedYear && d.getMonth() === i;
    });
    return {
      month: i + 1,
      name: getMonthName(i + 1),
      count: monthMissions.length,
      distance: monthMissions.reduce((s, m) => s + m.distanceKm, 0),
      fuelCost: monthMissions.reduce((s, m) => s + m.fuelCost, 0),
      ticketCost: monthMissions.reduce((s, m) => s + m.ticketCost, 0),
      totalCost: monthMissions.reduce((s, m) => s + m.totalCost, 0),
    };
  });

  const yearTotal = {
    count: missions.length,
    distance: missions.reduce((s, m) => s + m.distanceKm, 0),
    fuelCost: missions.reduce((s, m) => s + m.fuelCost, 0),
    ticketCost: missions.reduce((s, m) => s + m.ticketCost, 0),
    totalCost: missions.reduce((s, m) => s + m.totalCost, 0),
  };

  const handleExport = () => {
    if (missions.length === 0) {
      toast.error("No data to export");
      return;
    }
    exportToExcel(missions);
    toast.success("Report exported!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Annual and monthly mission summaries
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none"
            >
              {getYears().map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <Button variant="secondary" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <FileDown className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : missions.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-8 h-8 text-gray-400" />}
            title={`No missions in ${selectedYear}`}
            description="There are no missions recorded for this year."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-800">
                <Target className="w-8 h-8 text-blue-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{yearTotal.count}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Missions</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-800">
                <Route className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(yearTotal.distance)} km</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Distance</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-5 border border-orange-100 dark:border-orange-800">
                <TrendingUp className="w-8 h-8 text-orange-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(yearTotal.fuelCost)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fuel Cost</p>
              </div>
              <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-5 border border-rose-100 dark:border-rose-800">
                <DollarSign className="w-8 h-8 text-rose-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(yearTotal.totalCost)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Grand Total</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Monthly Summary — {selectedYear}
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Month</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Missions</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Distance</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Fuel Cost</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Ticket Cost</th>
                      <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyBreakdown.map((row) => (
                      <tr
                        key={row.month}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.name}</td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{row.count}</td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                          {row.distance > 0 ? `${formatNumber(row.distance)} km` : "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                          {row.fuelCost > 0 ? formatCurrency(row.fuelCost) : "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                          {row.ticketCost > 0 ? formatCurrency(row.ticketCost) : "-"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                          {row.totalCost > 0 ? formatCurrency(row.totalCost) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 font-semibold">
                      <td className="px-4 py-3 text-gray-900 dark:text-white">Total</td>
                      <td className="px-4 py-3 text-right text-gray-900 dark:text-white">{yearTotal.count}</td>
                      <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                        {formatNumber(yearTotal.distance)} km
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                        {formatCurrency(yearTotal.fuelCost)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                        {formatCurrency(yearTotal.ticketCost)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900 dark:text-white">
                        {formatCurrency(yearTotal.totalCost)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
