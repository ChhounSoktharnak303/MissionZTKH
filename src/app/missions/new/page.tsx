"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DashboardLayout from "@/app/dashboard-layout";
import MissionForm from "@/components/missions/MissionForm";
import { createMission } from "@/lib/storage";
import type { MissionFormData } from "@/types/mission";

export default function NewMissionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = useCallback(async (data: MissionFormData) => {
    setSaving(true);
    try {
      createMission(data);
      toast.success("Mission created successfully!");
      router.push("/missions");
    } catch {
      toast.error("Failed to create mission");
    } finally {
      setSaving(false);
    }
  }, [router]);

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Mission</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Fill in the details below to create a new mission
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <MissionForm onSubmit={handleSubmit} />
        </div>
      </div>
    </DashboardLayout>
  );
}
