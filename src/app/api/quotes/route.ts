import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getDistanceMatrix } from "@/lib/google-maps"
import { quoteSchema } from "@/schemas/quote"
import { headers } from "next/headers"

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Rate limiting - only active when Upstash is configured
  if (process.env.UPSTASH_REDIS_REST_URL) {
    const { quotesRatelimit } = await import("@/lib/security")
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") ?? "unknown"
    const { success } = await quotesRatelimit.limit(ip)
    if (!success) {
      return Response.json({ error: "Too many requests" }, { status: 429 })
    }
  }

  const body = await request.json()
  const parsed = quoteSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const pickupDateTime = new Date(data.pickupDateTime)

  // Validate pickup is in the future
  const minAdvanceHours = parseInt(process.env.BOOKING_ADVANCE_HOURS_MINIMUM ?? "3", 10)
  const minPickupTime = new Date(Date.now() + minAdvanceHours * 60 * 60 * 1000)
  if (pickupDateTime < minPickupTime) {
    return Response.json(
      { error: `Pickup must be at least ${minAdvanceHours} hours from now` },
      { status: 400 }
    )
  }

  // Get distance from Google Maps
  const { distanceKm, durationMins } = await getDistanceMatrix(
    { lat: data.pickupLat, lng: data.pickupLng },
    { lat: data.dropoffLat, lng: data.dropoffLng }
  )

  // Get available vehicle classes
  const vehicleClasses = await prisma.vehicleClass.findMany({
    where: {
      isActive: true,
      maxPassengers: { gte: data.passengers },
      maxLuggage: { gte: data.luggage },
    },
    orderBy: { sortOrder: "asc" },
  })

  // Create quote
  const quote = await prisma.quote.create({
    data: {
      userId: session.user.id,
      journeyType: data.journeyType,
      pickupAddress: data.pickupAddress,
      pickupLat: data.pickupLat,
      pickupLng: data.pickupLng,
      dropoffAddress: data.dropoffAddress,
      dropoffLat: data.dropoffLat,
      dropoffLng: data.dropoffLng,
      distanceKm,
      durationMins,
      flightNumber: data.flightNumber,
      pickupDateTime,
      passengers: data.passengers,
      luggage: data.luggage,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    },
  })

  // Calculate prices for each vehicle class
  const { calculatePrice } = await import("@/lib/pricing")
  const vehicleOptions = await Promise.all(
    vehicleClasses.map(async (vc) => {
      const pricing = await calculatePrice(vc.id, distanceKm, pickupDateTime, [])
      return {
        id: vc.id,
        name: vc.name,
        description: vc.description,
        maxPassengers: vc.maxPassengers,
        maxLuggage: vc.maxLuggage,
        imageUrl: vc.imageUrl,
        price: pricing.basePrice.toString(),
      }
    })
  )

  return Response.json({
    quoteId: quote.id,
    distanceKm,
    durationMins,
    vehicleOptions,
    expiresAt: quote.expiresAt.toISOString(),
  })
}
