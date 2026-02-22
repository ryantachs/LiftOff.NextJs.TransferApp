import { requireAdmin } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"
import { vehiclePatchSchema } from "@/schemas/vehicle"

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

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      vehicleClass: { select: { id: true, name: true } },
      driver: { select: { id: true, name: true, email: true, phone: true } },
      bookings: {
        include: {
          user: { select: { name: true } },
          driver: { select: { name: true } },
        },
        orderBy: { pickupDateTime: "desc" },
        take: 20,
      },
    },
  })

  if (!vehicle) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  return Response.json({
    id: vehicle.id,
    registration: vehicle.registration,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    colour: vehicle.colour,
    vehicleClassId: vehicle.vehicleClassId,
    vehicleClass: vehicle.vehicleClass,
    driver: vehicle.driver,
    motExpiry: vehicle.motExpiry?.toISOString() ?? null,
    serviceExpiry: vehicle.serviceExpiry?.toISOString() ?? null,
    isActive: vehicle.isActive,
    bookings: vehicle.bookings.map((b) => ({
      id: b.id,
      reference: b.reference,
      status: b.status,
      customerName: b.user.name,
      pickupAddress: b.pickupAddress,
      dropoffAddress: b.dropoffAddress,
      pickupDateTime: b.pickupDateTime.toISOString(),
      driverName: b.driver?.name ?? null,
    })),
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
  const parsed = vehiclePatchSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.vehicle.findUnique({ where: { id } })
  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const data = parsed.data
  const updateData: Record<string, unknown> = {}

  if (data.registration !== undefined) updateData.registration = data.registration
  if (data.make !== undefined) updateData.make = data.make
  if (data.model !== undefined) updateData.model = data.model
  if (data.year !== undefined) updateData.year = data.year
  if (data.colour !== undefined) updateData.colour = data.colour
  if (data.vehicleClassId !== undefined) updateData.vehicleClassId = data.vehicleClassId
  if (data.motExpiry !== undefined) updateData.motExpiry = data.motExpiry ? new Date(data.motExpiry) : null
  if (data.serviceExpiry !== undefined) updateData.serviceExpiry = data.serviceExpiry ? new Date(data.serviceExpiry) : null
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: updateData,
  })

  return Response.json(vehicle)
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

  const existing = await prisma.vehicle.findUnique({ where: { id } })
  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  // Soft delete: set isActive to false
  await prisma.vehicle.update({
    where: { id },
    data: { isActive: false },
  })

  return Response.json({ success: true })
}
