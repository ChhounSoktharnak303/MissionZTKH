"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useCallback } from "react";
import { Save, RotateCcw } from "lucide-react";
import {
  calculateFuelCost,
  calculateTotalCost,
  DEFAULT_TICKET_COST,
} from "@/utils/calculations";
import Button from "@/components/ui/Button";
import type { MissionFormData } from "@/types/mission";

const schema = z.object({
  missionDate: z.string().min(1, "Date is required"),
  purpose: z.string().min(1, "Purpose is required").min(2, "Purpose must be at least 2 characters"),
  distanceKm: z.number().min(0, "Distance must be >= 0"),
  ticketCost: z.number().min(0, "Ticket cost must be >= 0"),
});

type FormValues = z.infer<typeof schema>;

interface MissionFormProps {
  initialValues?: MissionFormData & { id?: number };
  onSubmit: (data: MissionFormData) => Promise<void>;
  isEditing?: boolean;
}

export default function MissionForm({
  initialValues,
  onSubmit,
  isEditing = false,
}: MissionFormProps) {
  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      missionDate: initialValues?.missionDate || new Date().toISOString().split("T")[0],
      purpose: initialValues?.purpose || "",
      distanceKm: initialValues?.distanceKm || 0,
      ticketCost: initialValues?.ticketCost ?? DEFAULT_TICKET_COST,
    },
  });

  const distanceKm = watch("distanceKm");
  const ticketCost = watch("ticketCost");

  const fuelCost = calculateFuelCost(Number(distanceKm) || 0);
  const totalCost = calculateTotalCost(fuelCost, Number(ticketCost) || 0);

  useEffect(() => {
    setValue("missionDate", initialValues?.missionDate || new Date().toISOString().split("T")[0]);
    setValue("purpose", initialValues?.purpose || "");
    setValue("distanceKm", initialValues?.distanceKm || 0);
    setValue("ticketCost", initialValues?.ticketCost ?? DEFAULT_TICKET_COST);
  }, [initialValues, setValue]);

  const handleClear = useCallback(() => {
    reset({
      missionDate: new Date().toISOString().split("T")[0],
      purpose: "",
      distanceKm: 0,
      ticketCost: DEFAULT_TICKET_COST,
    });
  }, [reset]);

  const handleFormSubmit = async (data: FormValues) => {
    await onSubmit({
      missionDate: data.missionDate,
      purpose: data.purpose,
      distanceKm: Number(data.distanceKm),
      ticketCost: Number(data.ticketCost),
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" id="mission-form">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ថ្ងៃខែ <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register("missionDate")}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
          {errors.missionDate && (
            <p className="mt-1 text-sm text-red-500">{errors.missionDate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            គីឡូ <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register("distanceKm", { valueAsNumber: true })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
          {errors.distanceKm && (
            <p className="mt-1 text-sm text-red-500">{errors.distanceKm.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          គោលបំណង <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("purpose")}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
          placeholder="Enter mission purpose..."
        />
        {errors.purpose && (
          <p className="mt-1 text-sm text-red-500">{errors.purpose.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            តម្លៃប្រេង (Read Only)
          </label>
          <div className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
            ${fuelCost.toFixed(3)}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            តម្លៃសំបុត្រម៉ូតូ
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register("ticketCost", { valueAsNumber: true })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
          {errors.ticketCost && (
            <p className="mt-1 text-sm text-red-500">{errors.ticketCost.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            សរុប (Read Only)
          </label>
          <div className="w-full px-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold text-lg">
            ${totalCost.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={isSubmitting}>
          <Save className="w-4 h-4" />
          {isEditing ? "Update" : "Save"}
        </Button>
        <Button type="button" variant="secondary" onClick={handleClear}>
          <RotateCcw className="w-4 h-4" />
          Clear
        </Button>
      </div>
    </form>
  );
}
