import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const bookingId = request.nextUrl.searchParams.get("bookingId")
  if (!bookingId) {
    return Response.json({ error: "bookingId is required" }, { status: 400 })
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { vehicleClass: true },
  })

  if (!booking) {
    return Response.json({ error: "Booking not found" }, { status: 404 })
  }

  if (booking.userId !== session.user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 403 })
  }

  return Response.json({
    id: booking.id,
    reference: booking.reference,
    status: booking.status,
    pickupAddress: booking.pickupAddress,
    dropoffAddress: booking.dropoffAddress,
    pickupDateTime: booking.pickupDateTime.toISOString(),
    vehicleClass: booking.vehicleClass.name,
    totalPrice: booking.totalPrice.toString(),
    currency: booking.currency,
    paidAt: booking.paidAt?.toISOString() ?? null,
  })
}
