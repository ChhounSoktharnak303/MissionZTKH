export const FUEL_RATE_PER_10_KM = 0.75;
export const DEFAULT_TICKET_COST = 0.5;

export function calculateFuelCost(distanceKm: number): number {
  const cost = (distanceKm / 10) * FUEL_RATE_PER_10_KM;
  return Math.round(cost * 100) / 100;
}

export function calculateTotalCost(fuelCost: number, ticketCost: number): number {
  return Math.round((fuelCost + ticketCost) * 100) / 100;
}

export function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
