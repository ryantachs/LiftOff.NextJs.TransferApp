import { requireAdmin } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"
import { driverPatchSchema } from "@/schemas/driver"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
  } catch (res) {
    return res as Response
  }

  const { id } = await params

  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const driver = await prisma.driver.findUnique({
    where: { id },
    include: {
      vehicle: {
        include: {
          vehicleClass: { select: { id: true, name: true } },
        },
      },
      bookings: {
        where: {
          pickupDateTime: { gte: now, lte: sevenDaysFromNow },
          status: { notIn: ["CANCELLED"] },
        },
        include: {
          vehicleClass: { select: { name: true } },
        },
        orderBy: { pickupDateTime: "asc" },
        take: 20,
      },
    },
  })

  if (!driver) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  return Response.json({
    id: driver.id,
    name: driver.name,
    email: driver.email,
    phone: driver.phone,
    licenceNumber: driver.licenceNumber,
    isAvailable: driver.isAvailable,
    vehicleId: driver.vehicleId,
    vehicle: driver.vehicle
      ? {
          id: driver.vehicle.id,
          registration: driver.vehicle.registration,
          make: driver.vehicle.make,
          model: driver.vehicle.model,
          colour: driver.vehicle.colour,
          vehicleClass: driver.vehicle.vehicleClass,
          motExpiry: driver.vehicle.motExpiry?.toISOString() ?? null,
          serviceExpiry: driver.vehicle.serviceExpiry?.toISOString() ?? null,
          isActive: driver.vehicle.isActive,
        }
      : null,
    upcomingBookings: driver.bookings.map((b) => ({
      id: b.id,
      reference: b.reference,
      status: b.status,
      pickupAddress: b.pickupAddress,
      dropoffAddress: b.dropoffAddress,
      pickupDateTime: b.pickupDateTime.toISOString(),
      vehicleClassName: b.vehicleClass.name,
    })),
    createdAt: driver.createdAt.toISOString(),
    updatedAt: driver.updatedAt.toISOString(),
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
  } catch (res) {
    return res as Response
  }

  const { id } = await params
  const body = await request.json()
  const parsed = driverPatchSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.driver.findUnique({ where: { id } })
  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const { vehicleId, ...data } = parsed.data

  // If changing vehicle assignment, ensure it's not already assigned
  if (vehicleId !== undefined && vehicleId !== existing.vehicleId) {
    if (vehicleId) {
      const vehicleDriver = await prisma.driver.findFirst({
        where: { vehicleId, id: { not: id } },
      })
      if (vehicleDriver) {
        return Response.json({ error: "Vehicle is already assigned to another driver" }, { status: 409 })
      }
    }
  }

  const driver = await prisma.driver.update({
    where: { id },
    data: {
      ...data,
      ...(vehicleId !== undefined ? { vehicleId: vehicleId ?? null } : {}),
    },
  })

  return Response.json(driver)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
  } catch (res) {
    return res as Response
  }

  const { id } = await params

  const existing = await prisma.driver.findUnique({ where: { id } })
  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  // Soft delete: set isAvailable to false and unlink vehicle
  await prisma.driver.update({
    where: { id },
    data: { isAvailable: false, vehicleId: null },
  })

  return Response.json({ success: true })
}
