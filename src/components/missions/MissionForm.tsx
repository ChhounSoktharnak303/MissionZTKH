"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useCallback, useState, useRef } from "react";
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

  const PURPOSE_OPTIONS = ["GDT", "ក្រសួងរៀបចំដែនដី", "SUSU", "GDT SENSOK"];
  const PURPOSE_DISTANCE: Record<string, number> = {
    "GDT": 17.4,
    "ក្រសួងរៀបចំដែនដី": 5.9,
    "SUSU": 19.6,
    "GDT SENSOK": 6.2,
  };
  const PURPOSE_TICKET: Record<string, number> = {
    "GDT": 0.5,
  };
  const [purposeInput, setPurposeInput] = useState(initialValues?.purpose || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = PURPOSE_OPTIONS.filter((opt) =>
    opt.toLowerCase().includes(purposeInput.toLowerCase())
  );

  useEffect(() => {
    setValue("purpose", purposeInput);
  }, [purposeInput, setValue]);

  useEffect(() => {
    setValue("missionDate", initialValues?.missionDate || new Date().toISOString().split("T")[0]);
    setPurposeInput(initialValues?.purpose || "");
    setValue("purpose", initialValues?.purpose || "");
    setValue("distanceKm", initialValues?.distanceKm || 0);
    setValue("ticketCost", initialValues?.ticketCost ?? DEFAULT_TICKET_COST);
  }, [initialValues, setValue]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = useCallback(() => {
    setPurposeInput("");
    setShowDropdown(false);
    reset({
      missionDate: new Date().toISOString().split("T")[0],
      purpose: "",
      distanceKm: 0,
      ticketCost: DEFAULT_TICKET_COST,
    });
  }, [reset]);

  const fuelCost = calculateFuelCost(Number(distanceKm) || 0);
  const totalCost = calculateTotalCost(fuelCost, Number(ticketCost) || 0);

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
        <div className="relative" ref={dropdownRef}>
          <input
            ref={inputRef}
            type="text"
            value={purposeInput}
            onChange={(e) => {
              setPurposeInput(e.target.value);
              setShowDropdown(true);
              setHighlightIndex(-1);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={(e) => {
              if (!showDropdown || filteredOptions.length === 0) return;
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlightIndex((i) => (i + 1) % filteredOptions.length);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlightIndex((i) => (i - 1 + filteredOptions.length) % filteredOptions.length);
              } else if (e.key === "Enter" && highlightIndex >= 0) {
                e.preventDefault();
                const selected = filteredOptions[highlightIndex];
                setPurposeInput(selected);
                setShowDropdown(false);
                if (PURPOSE_DISTANCE[selected] !== undefined) {
                  setValue("distanceKm", PURPOSE_DISTANCE[selected], { shouldValidate: true });
                }
                if (PURPOSE_TICKET[selected] !== undefined) {
                  setValue("ticketCost", PURPOSE_TICKET[selected], { shouldValidate: true });
                }
              } else if (e.key === "Escape") {
                setShowDropdown(false);
              }
            }}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            placeholder="Select or type purpose..."
          />
          {showDropdown && filteredOptions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg">
              {filteredOptions.map((opt, i) => (
                <li
                  key={opt}
                  onMouseDown={() => {
                    setPurposeInput(opt);
                    setShowDropdown(false);
                    if (PURPOSE_DISTANCE[opt] !== undefined) {
                      setValue("distanceKm", PURPOSE_DISTANCE[opt], { shouldValidate: true });
                    }
                    if (PURPOSE_TICKET[opt] !== undefined) {
                      setValue("ticketCost", PURPOSE_TICKET[opt], { shouldValidate: true });
                    }
                  }}
                  onMouseEnter={() => setHighlightIndex(i)}
                  className={`px-4 py-2.5 cursor-pointer transition-colors ${
                    i === highlightIndex
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                      : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {opt}
                </li>
              ))}
            </ul>
          )}
        </div>
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
          <select
            {...register("ticketCost", { valueAsNumber: true })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          >
            <option value={0.25}>$0.25</option>
            <option value={0.5}>$0.50</option>
            <option value={0}>Not Paid</option>
          </select>
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
