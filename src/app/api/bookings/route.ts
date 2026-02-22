import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { calculatePrice } from "@/lib/pricing"
import { bookingSchema } from "@/schemas/booking"
import { nanoid } from "@/lib/nanoid"

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Rate limiting - only active when Upstash is configured
  if (process.env.UPSTASH_REDIS_REST_URL) {
    const { bookingsRatelimit } = await import("@/lib/security")
    const { headers } = await import("next/headers")
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") ?? "unknown"
    const { success } = await bookingsRatelimit.limit(ip)
    if (!success) {
      return Response.json({ error: "Too many requests" }, { status: 429 })
    }
  }

  const body = await request.json()
  const parsed = bookingSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data

  // Verify quote exists and hasn't expired
  const quote = await prisma.quote.findUnique({
    where: { id: data.quoteId },
  })

  if (!quote) {
    return Response.json({ error: "Quote not found" }, { status: 404 })
  }

  if (quote.userId !== session.user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 403 })
  }

  if (new Date() > quote.expiresAt) {
    return Response.json({ error: "Quote has expired" }, { status: 410 })
  }

  // Calculate price
  const pricing = await calculatePrice(
    data.vehicleClassId,
    quote.distanceKm,
    quote.pickupDateTime,
    data.extras
  )

  // Create booking
  const reference = `ATB-${nanoid(8).toUpperCase()}`
  const booking = await prisma.booking.create({
    data: {
      reference,
      userId: session.user.id,
      journeyType: quote.journeyType,
      pickupAddress: quote.pickupAddress,
      pickupLat: quote.pickupLat,
      pickupLng: quote.pickupLng,
      dropoffAddress: quote.dropoffAddress,
      dropoffLat: quote.dropoffLat,
      dropoffLng: quote.dropoffLng,
      distanceKm: quote.distanceKm,
      flightNumber: quote.flightNumber,
      pickupDateTime: quote.pickupDateTime,
      passengers: quote.passengers,
      luggage: quote.luggage,
      vehicleClassId: data.vehicleClassId,
      extras: data.extras,
      basePrice: pricing.basePrice.toNumber(),
      extrasPrice: pricing.extrasPrice.toNumber(),
      totalPrice: pricing.totalPrice.toNumber(),
      specialRequests: data.specialRequests,
    },
  })

  return Response.json({
    bookingId: booking.id,
    reference: booking.reference,
    totalPrice: pricing.totalPrice.toString(),
  })
}
