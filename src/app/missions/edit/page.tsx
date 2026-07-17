"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/app/dashboard-layout";
import MissionForm from "@/components/missions/MissionForm";
import { getMissionById, updateMission } from "@/lib/storage";
import type { MissionFormData } from "@/types/mission";

function EditMissionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const [mission, setMission] = useState<(MissionFormData & { id: number }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idParam) {
      toast.error("No mission ID provided");
      router.push("/missions");
      return;
    }

    const found = getMissionById(Number(idParam));
    if (found) {
      setMission({
        id: found.id,
        missionDate: found.missionDate.split("T")[0],
        purpose: found.purpose,
        distanceKm: found.distanceKm,
        ticketCost: found.ticketCost,
      });
    } else {
      toast.error("Mission not found");
      router.push("/missions");
    }
    setLoading(false);
  }, [idParam, router]);

  const handleSubmit = async (data: MissionFormData) => {
    if (!mission) return;
    try {
      updateMission(mission.id, data);
      toast.success("Mission updated successfully!");
      router.push("/missions");
    } catch {
      toast.error("Failed to update mission");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-6" />
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Mission</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update the mission details below
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          {mission && (
            <MissionForm
              initialValues={mission}
              onSubmit={handleSubmit}
              isEditing
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function EditMissionPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="max-w-3xl">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-6" />
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
        </div>
      </DashboardLayout>
    }>
      <EditMissionContent />
    </Suspense>
  );
}
