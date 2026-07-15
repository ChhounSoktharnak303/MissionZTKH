import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "No items to import" }, { status: 400 });
    }

    const created = await prisma.mission.createMany({
      data: items.map(
        (item: {
          missionDate: string;
          purpose: string;
          distanceKm: number;
          fuelCost: number;
          ticketCost: number;
          totalCost: number;
        }) => ({
          missionDate: new Date(item.missionDate),
          purpose: item.purpose,
          distanceKm: item.distanceKm,
          fuelCost: item.fuelCost,
          ticketCost: item.ticketCost,
          totalCost: item.totalCost,
        })
      ),
    });

    return Response.json({ success: true, count: created.count }, { status: 201 });
  } catch {
    return Response.json({ error: "Failed to import missions" }, { status: 500 });
  }
}
