import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateFuelCost, calculateTotalCost, DEFAULT_TICKET_COST } from "@/utils/calculations";
import type { MissionFilters, PaginatedResponse, Mission } from "@/types/mission";

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const sp = request.nextUrl.searchParams;
    const search = sp.get("search") || undefined;
    const month = sp.get("month") ? Number(sp.get("month")) : undefined;
    const year = sp.get("year") ? Number(sp.get("year")) : undefined;
    const sortField = (sp.get("sortField") || "createdAt") as MissionFilters["sortField"];
    const sortOrder = (sp.get("sortOrder") || "desc") as MissionFilters["sortOrder"];
    const page = Number(sp.get("page")) || 1;
    const pageSize = Number(sp.get("pageSize")) || 10;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (search) {
      where.purpose = { contains: search };
    }
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      where.missionDate = { gte: start, lte: end };
    } else if (year) {
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59);
      where.missionDate = { gte: start, lte: end };
    } else if (month) {
      const now = new Date();
      const y = now.getFullYear();
      const start = new Date(y, month - 1, 1);
      const end = new Date(y, month, 0, 23, 59, 59);
      where.missionDate = { gte: start, lte: end };
    }

    const orderBy: Record<string, string> = {};
    if (sortField === "missionDate") orderBy.missionDate = sortOrder || "desc";
    else if (sortField === "distanceKm") orderBy.distanceKm = sortOrder || "desc";
    else if (sortField === "totalCost") orderBy.totalCost = sortOrder || "desc";
    else orderBy.createdAt = sortOrder || "desc";

    const [total, rows] = await Promise.all([
      prisma.mission.count({ where }),
      prisma.mission.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const result: PaginatedResponse = {
      data: rows as unknown as Mission[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };

    return Response.json(result);
  } catch (err) {
    return Response.json(
      { error: "Failed to fetch missions", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { missionDate, purpose, distanceKm, ticketCost } = body;

    if (!missionDate || !purpose || distanceKm === undefined || distanceKm === null) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const dist = Number(distanceKm);
    if (dist < 0) {
      return Response.json({ error: "Distance must be >= 0" }, { status: 400 });
    }

    const fuel = calculateFuelCost(dist);
    const ticket = ticketCost !== undefined ? Number(ticketCost) : DEFAULT_TICKET_COST;
    const total = calculateTotalCost(fuel, ticket);

    const mission = await prisma.mission.create({
      data: {
        missionDate: new Date(missionDate),
        purpose,
        distanceKm: dist,
        fuelCost: fuel,
        ticketCost: ticket,
        totalCost: total,
      },
    });

    return Response.json(mission, { status: 201 });
  } catch (err) {
    return Response.json(
      { error: "Failed to create mission", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { id, missionDate, purpose, distanceKm, ticketCost } = body;

    if (!id) {
      return Response.json({ error: "Missing mission id" }, { status: 400 });
    }

    const dist = Number(distanceKm);
    if (dist < 0) {
      return Response.json({ error: "Distance must be >= 0" }, { status: 400 });
    }

    const fuel = calculateFuelCost(dist);
    const ticket = ticketCost !== undefined ? Number(ticketCost) : DEFAULT_TICKET_COST;
    const total = calculateTotalCost(fuel, ticket);

    const mission = await prisma.mission.update({
      where: { id: Number(id) },
      data: {
        missionDate: new Date(missionDate),
        purpose,
        distanceKm: dist,
        fuelCost: fuel,
        ticketCost: ticket,
        totalCost: total,
      },
    });

    return Response.json(mission);
  } catch (err) {
    return Response.json(
      { error: "Failed to update mission", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return Response.json({ error: "Missing mission id" }, { status: 400 });
    }

    await prisma.mission.delete({ where: { id: Number(id) } });
    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { error: "Failed to delete mission", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
