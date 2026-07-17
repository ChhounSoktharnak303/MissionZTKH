export const DEFAULT_TICKET_COST = 0.5;

export function calculateFuelCost(distanceKm: number): number {
  let cost: number;
  if (distanceKm <= 3.0) {
    cost = 0.25;
  } else if (distanceKm <= 9.9) {
    cost = 0.50;
  } else {
    cost = 0.75;
  }
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
