import * as XLSX from "xlsx";
import type { Mission } from "@/types/mission";
import { calculateFuelCost, calculateTotalCost, DEFAULT_TICKET_COST } from "./calculations";

export function exportToExcel(missions: Mission[]): void {
  const headers = ["Date", "Purpose", "Distance KM", "Fuel Cost", "Ticket Cost", "Total Cost"];

  const aoa: (string | number | XLSX.CellObject)[][] = [headers];

  for (const m of missions) {
    aoa.push([
      new Date(m.missionDate).toLocaleDateString("en-GB"),
      m.purpose,
      { t: "n", v: m.distanceKm, z: '0.00 "km"' },
      { t: "n", v: m.fuelCost, z: '"$"#,##0.00' },
      { t: "n", v: m.ticketCost, z: '"$"#,##0.00' },
      { t: "n", v: m.totalCost, z: '"$"#,##0.00' },
    ]);
  }

  const lastDataRow = aoa.length;
  const totalRow: (string | number | XLSX.CellObject)[] = [
    "TOTAL",
    "",
    { t: "n", f: `SUM(C2:C${lastDataRow})`, z: '0.00 "km"' },
    { t: "n", f: `SUM(D2:D${lastDataRow})`, z: '"$"#,##0.00' },
    { t: "n", f: `SUM(E2:E${lastDataRow})`, z: '"$"#,##0.00' },
    { t: "n", f: `SUM(F2:F${lastDataRow})`, z: '"$"#,##0.00' },
  ];
  aoa.push(totalRow);

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  ws["!cols"] = [
    { wch: 14 },
    { wch: 30 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Missions");

  const today = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `missions-${today}.xlsx`);
}

export interface ImportResult {
  success: boolean;
  data?: Omit<Mission, "id" | "createdAt" | "updatedAt">[];
  errors?: string[];
}

export function importFromExcel(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

        if (rows.length === 0) {
          resolve({ success: false, errors: ["File is empty"] });
          return;
        }

        const requiredCols = ["Date", "Purpose", "Distance KM"];
        const headers = Object.keys(rows[0]);
        const missing = requiredCols.filter((c) => !headers.includes(c));
        if (missing.length > 0) {
          resolve({
            success: false,
            errors: [`Missing columns: ${missing.join(", ")}`],
          });
          return;
        }

        const missions: Omit<Mission, "id" | "createdAt" | "updatedAt">[] = [];
        const errors: string[] = [];

        rows.forEach((row, idx) => {
          try {
            const purpose = String(row["Purpose"] || "").trim();
            if (!purpose) throw new Error("Purpose is required");
            if (purpose === "TOTAL") return;

            const dateVal = row["Date"];
            let missionDate: Date;
            if (typeof dateVal === "number") {
              const excelDate = XLSX.SSF.parse_date_code(dateVal);
              missionDate = new Date(
                excelDate.y,
                excelDate.m - 1,
                excelDate.d
              );
            } else {
              missionDate = new Date(String(dateVal).replace(/\//g, "-"));
            }
            if (isNaN(missionDate.getTime())) {
              throw new Error("Invalid date");
            }

            const cleanNum = (val: unknown): number => {
              if (typeof val === "number") return val;
              return Number(String(val).replace(/[$,km\s]/g, "")) || 0;
            };

            const distanceKm = cleanNum(row["Distance KM"]);
            if (isNaN(distanceKm) || distanceKm < 0) {
              throw new Error("Invalid distance");
            }

            const fuelCost = cleanNum(row["Fuel Cost"]) || calculateFuelCost(distanceKm);
            const ticketCost = cleanNum(row["Ticket Cost"]) || DEFAULT_TICKET_COST;
            const totalCost = cleanNum(row["Total Cost"]) || calculateTotalCost(fuelCost, ticketCost);

            missions.push({
              missionDate: missionDate.toISOString(),
              purpose,
              distanceKm,
              fuelCost,
              ticketCost,
              totalCost,
            });
          } catch (err) {
            errors.push(`Row ${idx + 2}: ${(err as Error).message}`);
          }
        });

        if (errors.length > 0 && missions.length === 0) {
          resolve({ success: false, errors });
        } else {
          resolve({ success: true, data: missions, errors: errors.length > 0 ? errors : undefined });
        }
      } catch {
        resolve({ success: false, errors: ["Failed to parse Excel file"] });
      }
    };
    reader.readAsArrayBuffer(file);
  });
}
