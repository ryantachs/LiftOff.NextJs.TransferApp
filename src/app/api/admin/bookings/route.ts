import { requireAdmin } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"
import { writeAuditLog } from "@/lib/audit"
import { calculatePrice } from "@/lib/pricing"
import { nanoid } from "@/lib/nanoid"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
  } catch (res) {
    return res as Response
  }

  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get("page") ?? "1", 10)
  const perPage = parseInt(searchParams.get("perPage") ?? "20", 10)
  const status = searchParams.get("status")
  const vehicleClassId = searchParams.get("vehicleClassId")
  const driverId = searchParams.get("driverId")
  const search = searchParams.get("search")
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")
  const sortBy = searchParams.get("sortBy") ?? "pickupDateTime"
  const sortDir = searchParams.get("sortDir") === "asc" ? "asc" : "desc"

  const where: Record<string, unknown> = {}

  if (status) {
    const statuses = status.split(",")
    where.status = { in: statuses }
  }

  if (vehicleClassId) {
    where.vehicleClassId = vehicleClassId
  }

  if (driverId) {
    where.driverId = driverId
  }

  if (dateFrom || dateTo) {
    where.pickupDateTime = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo) } : {}),
    }
  }

  if (search) {
    where.OR = [
      { reference: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ]
  }

  const orderBy: Record<string, string> = {}
  if (["pickupDateTime", "createdAt", "totalPrice"].includes(sortBy)) {
    orderBy[sortBy] = sortDir
  } else {
    orderBy.pickupDateTime = sortDir
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        vehicleClass: { select: { id: true, name: true } },
        driver: { select: { id: true, name: true } },
      },
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.booking.count({ where }),
  ])

  return Response.json({
    bookings: bookings.map((b) => ({
      id: b.id,
      reference: b.reference,
      status: b.status,
      customerName: b.user.name,
      customerEmail: b.user.email,
      pickupAddress: b.pickupAddress,
      dropoffAddress: b.dropoffAddress,
      pickupDateTime: b.pickupDateTime.toISOString(),
      vehicleClass: b.vehicleClass.name,
      totalPrice: b.totalPrice.toString(),
      currency: b.currency,
      driver: b.driver ? { id: b.driver.id, name: b.driver.name } : null,
      createdAt: b.createdAt.toISOString(),
    })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  })
}

export async function POST(request: Request) {
  let session
  try {
    session = await requireAdmin()
  } catch (res) {
    return res as Response
  }

  const body = await request.json()

  // Find or create user
  let userId: string
  if (body.userId) {
    userId = body.userId
  } else if (body.customerEmail) {
    let user = await prisma.user.findUnique({
      where: { email: body.customerEmail },
    })
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: body.customerEmail,
          name: body.customerName ?? body.customerEmail,
        },
      })
    }
    userId = user.id
  } else {
    return Response.json({ error: "Customer email or userId is required" }, { status: 400 })
  }

  if (!body.vehicleClassId || !body.pickupAddress || !body.dropoffAddress || !body.pickupDateTime) {
    return Response.json({ error: "Missing required fields" }, { status: 400 })
  }

  const pricing = await calculatePrice(
    body.vehicleClassId,
    body.distanceKm ?? 0,
    new Date(body.pickupDateTime),
    body.extras ?? []
  )

  const reference = `ATB-${nanoid(8).toUpperCase()}`
  const booking = await prisma.booking.create({
    data: {
      reference,
      status: "CONFIRMED",
      userId,
      journeyType: body.journeyType ?? "PICKUP",
      pickupAddress: body.pickupAddress,
      pickupLat: body.pickupLat ?? 0,
      pickupLng: body.pickupLng ?? 0,
      dropoffAddress: body.dropoffAddress,
      dropoffLat: body.dropoffLat ?? 0,
      dropoffLng: body.dropoffLng ?? 0,
      distanceKm: body.distanceKm ?? 0,
      flightNumber: body.flightNumber,
      pickupDateTime: new Date(body.pickupDateTime),
      passengers: body.passengers ?? 1,
      luggage: body.luggage ?? 0,
      vehicleClassId: body.vehicleClassId,
      extras: body.extras ?? [],
      basePrice: pricing.basePrice.toNumber(),
      extrasPrice: pricing.extrasPrice.toNumber(),
      totalPrice: pricing.totalPrice.toNumber(),
      specialRequests: body.specialRequests,
      paymentMethod: "MANUAL",
      paidAt: body.markAsPaid ? new Date() : null,
    },
  })

  await writeAuditLog({
    bookingId: booking.id,
    action: "MANUAL_BOOKING_CREATED",
    actor: session.user.email!,
    changes: { paymentMethod: "MANUAL", status: "CONFIRMED" },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  })

  return Response.json({
    id: booking.id,
    reference: booking.reference,
    status: booking.status,
    totalPrice: pricing.totalPrice.toString(),
  })
}
