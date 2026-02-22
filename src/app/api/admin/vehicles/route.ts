import { requireAdmin } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"
import { vehicleSchema } from "@/schemas/vehicle"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
  } catch (res) {
    return res as Response
  }

  const searchParams = request.nextUrl.searchParams
  const sortBy = searchParams.get("sortBy") ?? "motExpiry"
  const sortDir = searchParams.get("sortDir") === "desc" ? "desc" : "asc"

  const vehicles = await prisma.vehicle.findMany({
    include: {
      vehicleClass: { select: { id: true, name: true } },
      driver: { select: { id: true, name: true } },
    },
    orderBy: { [sortBy]: sortDir },
  })

  return Response.json({
    vehicles: vehicles.map((v) => ({
      id: v.id,
      registration: v.registration,
      make: v.make,
      model: v.model,
      year: v.year,
      colour: v.colour,
      vehicleClass: v.vehicleClass,
      driver: v.driver,
      motExpiry: v.motExpiry?.toISOString() ?? null,
      serviceExpiry: v.serviceExpiry?.toISOString() ?? null,
      isActive: v.isActive,
    })),
  })
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (res) {
    return res as Response
  }

  const body = await request.json()
  const parsed = vehicleSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data

  // Check for duplicate registration
  const existing = await prisma.vehicle.findUnique({
    where: { registration: data.registration },
  })
  if (existing) {
    return Response.json({ error: "A vehicle with this registration already exists" }, { status: 409 })
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      registration: data.registration,
      make: data.make,
      model: data.model,
      year: data.year,
      colour: data.colour,
      vehicleClassId: data.vehicleClassId,
      motExpiry: data.motExpiry ? new Date(data.motExpiry) : null,
      serviceExpiry: data.serviceExpiry ? new Date(data.serviceExpiry) : null,
      isActive: data.isActive,
    },
  })

  return Response.json(vehicle, { status: 201 })
}
