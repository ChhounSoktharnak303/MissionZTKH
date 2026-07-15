"use client";

import { Target, Route, Fuel, Ticket, DollarSign } from "lucide-react";
import type { MissionStats } from "@/types/mission";
import { formatCurrency, formatNumber } from "@/utils/calculations";

interface StatsCardsProps {
  stats: MissionStats;
}

const cards = [
  {
    key: "totalMissions" as const,
    label: "Total Missions",
    icon: Target,
    color: "bg-blue-500",
    lightBg: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-600 dark:text-blue-400",
    format: (v: number) => String(v),
  },
  {
    key: "totalKm" as const,
    label: "Total KM",
    icon: Route,
    color: "bg-emerald-500",
    lightBg: "bg-emerald-50 dark:bg-emerald-900/20",
    textColor: "text-emerald-600 dark:text-emerald-400",
    format: (v: number) => `${formatNumber(v)} km`,
  },
  {
    key: "totalFuelCost" as const,
    label: "Total Fuel Cost",
    icon: Fuel,
    color: "bg-orange-500",
    lightBg: "bg-orange-50 dark:bg-orange-900/20",
    textColor: "text-orange-600 dark:text-orange-400",
    format: formatCurrency,
  },
  {
    key: "totalTicketCost" as const,
    label: "Total Ticket Cost",
    icon: Ticket,
    color: "bg-purple-500",
    lightBg: "bg-purple-50 dark:bg-purple-900/20",
    textColor: "text-purple-600 dark:text-purple-400",
    format: formatCurrency,
  },
  {
    key: "grandTotalCost" as const,
    label: "Grand Total Cost",
    icon: DollarSign,
    color: "bg-rose-500",
    lightBg: "bg-rose-50 dark:bg-rose-900/20",
    textColor: "text-rose-600 dark:text-rose-400",
    format: formatCurrency,
  },
];

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className={`${card.lightBg} rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-200`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center shadow-sm`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {card.format(stats[card.key])}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {card.label}
          </p>
        </div>
      ))}
    </div>
  );
}
