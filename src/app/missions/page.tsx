"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FileDown,
  FileUp,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/app/dashboard-layout";
import MissionList from "@/components/missions/MissionList";
import Button from "@/components/ui/Button";
import { exportToExcel, importFromExcel } from "@/utils/excel";
import { getAllMissions, importMissions as storageImport } from "@/lib/storage";
import type { Mission } from "@/types/mission";

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadAll = useCallback(() => {
    try {
      setMissions(getAllMissions());
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleExport = () => {
    if (missions.length === 0) {
      toast.error("No data to export");
      return;
    }
    exportToExcel(missions);
    toast.success("Exported successfully!");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await importFromExcel(file);
    if (!result.success) {
      toast.error(result.errors?.join(", ") || "Import failed");
    } else if (result.data) {
      try {
        const count = storageImport(result.data);
        toast.success(`Imported ${count} missions!`);
        if (result.errors && result.errors.length > 0) {
          toast(`Skipped rows: ${result.errors.join(", ")}`, { icon: "warning" });
        }
        loadAll();
      } catch {
        toast.error("Failed to import data");
      }
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mission List</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View, search, and manage all missions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <FileDown className="w-4 h-4" />
              Export Excel
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              className="hidden"
            />
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
              <FileUp className="w-4 h-4" />
              Import Excel
            </Button>
            <Link href="/missions/new">
              <Button size="sm">
                <Plus className="w-4 h-4" />
                Add Mission
              </Button>
            </Link>
          </div>
        </div>
        <MissionList />
      </div>
    </DashboardLayout>
  );
}
