import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorised" }, { status: 401 })
  }

  const { id } = await params

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { vehicleClass: true },
  })

  if (!booking || booking.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  return Response.json({
    id: booking.id,
    reference: booking.reference,
    status: booking.status,
    journeyType: booking.journeyType,
    pickupAddress: booking.pickupAddress,
    pickupLat: booking.pickupLat,
    pickupLng: booking.pickupLng,
    dropoffAddress: booking.dropoffAddress,
    dropoffLat: booking.dropoffLat,
    dropoffLng: booking.dropoffLng,
    distanceKm: booking.distanceKm,
    flightNumber: booking.flightNumber,
    pickupDateTime: booking.pickupDateTime.toISOString(),
    passengers: booking.passengers,
    luggage: booking.luggage,
    vehicleClass: {
      id: booking.vehicleClass.id,
      name: booking.vehicleClass.name,
      description: booking.vehicleClass.description,
    },
    extras: booking.extras,
    basePrice: booking.basePrice.toString(),
    extrasPrice: booking.extrasPrice.toString(),
    totalPrice: booking.totalPrice.toString(),
    currency: booking.currency,
    paidAt: booking.paidAt?.toISOString() ?? null,
    driverId: booking.driverId,
    vehicleId: booking.vehicleId,
    assignedAt: booking.assignedAt?.toISOString() ?? null,
    specialRequests: booking.specialRequests,
    cancelledAt: booking.cancelledAt?.toISOString() ?? null,
    cancellationReason: booking.cancellationReason,
    createdAt: booking.createdAt.toISOString(),
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorised" }, { status: 401 })
  }

  const { id } = await params

  const booking = await prisma.booking.findUnique({ where: { id } })
  if (!booking || booking.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const body = await request.json()

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      ...(body.internalNotes !== undefined && { internalNotes: body.internalNotes }),
    },
  })

  return Response.json({ id: updated.id, status: updated.status })
}
