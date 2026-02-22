import { prisma } from "@/lib/prisma"
import Decimal from "decimal.js"

/**
 * Public quote estimate — no auth required, no Google Maps needed.
 * Accepts passengers, luggage, and an estimated distance (or defaults to 20km).
 * Returns vehicle class options with estimated prices.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const passengers = Math.max(1, Math.min(16, Number(body.passengers) || 1))
  const luggage = Math.max(0, Math.min(20, Number(body.luggage) || 1))
  const distanceKm = Math.max(1, Math.min(200, Number(body.distanceKm) || 20))

  const vehicleClasses = await prisma.vehicleClass.findMany({
    where: {
      isActive: true,
      maxPassengers: { gte: passengers },
      maxLuggage: { gte: luggage },
    },
    orderBy: { sortOrder: "asc" },
  })

  const vehicleOptions = vehicleClasses.map((vc) => {
    const ratePerKm = new Decimal(vc.baseRatePerKm.toString())
    const minFare = new Decimal(vc.minimumFare.toString())
    const distance = new Decimal(distanceKm)

    let price = ratePerKm.mul(distance)
    if (price.lessThan(minFare)) price = minFare

    return {
      id: vc.id,
      name: vc.name,
      description: vc.description,
      maxPassengers: vc.maxPassengers,
      maxLuggage: vc.maxLuggage,
      price: price.toDecimalPlaces(2).toString(),
    }
  })

  return Response.json({
    distanceKm,
    vehicleOptions,
    isEstimate: true,
  })
}
