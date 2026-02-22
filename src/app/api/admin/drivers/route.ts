import { requireAdmin } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"
import { driverSchema } from "@/schemas/driver"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
  } catch (res) {
    return res as Response
  }

  const searchParams = request.nextUrl.searchParams
  const available = searchParams.get("available")
  const hasVehicle = searchParams.get("hasVehicle")

  const where: Record<string, unknown> = {}

  if (available === "true") where.isAvailable = true
  if (available === "false") where.isAvailable = false
  if (hasVehicle === "true") where.vehicleId = { not: null }
  if (hasVehicle === "false") where.vehicleId = null

  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const drivers = await prisma.driver.findMany({
    where,
    include: {
      vehicle: {
        select: {
          id: true,
          registration: true,
          make: true,
          model: true,
          motExpiry: true,
          isActive: true,
        },
      },
      _count: {
        select: {
          bookings: {
            where: {
              pickupDateTime: { gte: now, lte: sevenDaysFromNow },
              status: { notIn: ["CANCELLED"] },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  })

  return Response.json({
    drivers: drivers.map((d) => ({
      id: d.id,
      name: d.name,
      email: d.email,
      phone: d.phone,
      licenceNumber: d.licenceNumber,
      isAvailable: d.isAvailable,
      vehicle: d.vehicle
        ? {
            id: d.vehicle.id,
            registration: d.vehicle.registration,
            make: d.vehicle.make,
            model: d.vehicle.model,
            motExpiry: d.vehicle.motExpiry?.toISOString() ?? null,
            isActive: d.vehicle.isActive,
          }
        : null,
      upcomingBookingsCount: d._count.bookings,
      createdAt: d.createdAt.toISOString(),
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
  const parsed = driverSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { vehicleId, ...data } = parsed.data

  // Check for duplicate email
  const existing = await prisma.driver.findUnique({
    where: { email: data.email },
  })
  if (existing) {
    return Response.json({ error: "A driver with this email already exists" }, { status: 409 })
  }

  // If assigning a vehicle, ensure it's not already assigned
  if (vehicleId) {
    const vehicleDriver = await prisma.driver.findFirst({
      where: { vehicleId },
    })
    if (vehicleDriver) {
      return Response.json({ error: "Vehicle is already assigned to another driver" }, { status: 409 })
    }
  }

  const driver = await prisma.driver.create({
    data: {
      ...data,
      vehicleId: vehicleId ?? null,
    },
  })

  return Response.json(driver, { status: 201 })
}
