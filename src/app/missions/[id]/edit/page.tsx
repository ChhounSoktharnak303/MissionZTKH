"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DashboardLayout from "@/app/dashboard-layout";
import MissionForm from "@/components/missions/MissionForm";
import type { MissionFormData } from "@/types/mission";

export default function EditMissionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [mission, setMission] = useState<(MissionFormData & { id: number }) | null>(null);
  const [loading, setLoading] = useState(true);

  const resolvedParams = useRef(params);

  useEffect(() => {
    const loadMission = async () => {
      try {
        const { id } = await resolvedParams.current;
        const res = await fetch(`/api/missions?pageSize=1000`);
        const json = await res.json();
        const found = json.data.find((m: { id: number }) => m.id === Number(id));
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
      } catch {
        toast.error("Failed to load mission");
      } finally {
        setLoading(false);
      }
    };
    loadMission();
  }, [router]);

  const handleSubmit = useCallback(async (data: MissionFormData) => {
    if (!mission) return;
    try {
      const res = await fetch("/api/missions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: mission.id, ...data }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success("Mission updated successfully!");
      router.push("/missions");
    } catch {
      toast.error("Failed to update mission");
    }
  }, [mission, router]);

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
