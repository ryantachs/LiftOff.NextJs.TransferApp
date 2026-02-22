import { requireAdmin } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
  } catch (res) {
    return res as Response
  }

  const searchParams = request.nextUrl.searchParams
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")

  if (!dateFrom || !dateTo) {
    return Response.json(
      { error: "dateFrom and dateTo are required" },
      { status: 400 }
    )
  }

  const [bookings, drivers] = await Promise.all([
    prisma.booking.findMany({
      where: {
        pickupDateTime: {
          gte: new Date(dateFrom),
          lte: new Date(dateTo),
        },
        status: { notIn: ["CANCELLED", "PENDING_PAYMENT"] },
      },
      include: {
        user: { select: { name: true } },
        vehicleClass: { select: { id: true, name: true } },
        driver: { select: { id: true, name: true } },
        vehicle: { select: { id: true, registration: true } },
      },
      orderBy: { pickupDateTime: "asc" },
    }),
    prisma.driver.findMany({
      where: { isAvailable: true },
      include: {
        vehicle: {
          select: { id: true, registration: true, vehicleClassId: true },
        },
      },
      orderBy: { name: "asc" },
    }),
  ])

  return Response.json({
    bookings: bookings.map((b) => ({
      id: b.id,
      reference: b.reference,
      status: b.status,
      customerName: b.user.name,
      pickupAddress: b.pickupAddress,
      dropoffAddress: b.dropoffAddress,
      pickupDateTime: b.pickupDateTime.toISOString(),
      vehicleClassId: b.vehicleClass.id,
      vehicleClassName: b.vehicleClass.name,
      driverId: b.driver?.id ?? null,
      driverName: b.driver?.name ?? null,
      vehicleId: b.vehicle?.id ?? null,
      vehicleRegistration: b.vehicle?.registration ?? null,
    })),
    drivers: drivers.map((d) => ({
      id: d.id,
      name: d.name,
      vehicleId: d.vehicle?.id ?? null,
      vehicleRegistration: d.vehicle?.registration ?? null,
      vehicleClassId: d.vehicle?.vehicleClassId ?? null,
    })),
  })
}
