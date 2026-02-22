import { requireFullAdmin } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"
import { unparse } from "papaparse"

export async function GET(request: NextRequest) {
  try {
    await requireFullAdmin()
  } catch (res) {
    return res as Response
  }

  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get("type")
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const format = searchParams.get("format")

  if (!type || !from || !to) {
    return Response.json(
      { error: "type, from, and to query parameters are required" },
      { status: 400 }
    )
  }

  const startDate = new Date(from)
  const endDate = new Date(to)

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return Response.json({ error: "Invalid date format" }, { status: 400 })
  }

  // Set endDate to end of day
  endDate.setHours(23, 59, 59, 999)

  switch (type) {
    case "revenue":
      return handleRevenue(startDate, endDate, format, from, to)
    case "volume":
      return handleVolume(startDate, endDate, format, from, to)
    case "utilisation":
      return handleUtilisation(startDate, endDate, format, from, to)
    case "cancellations":
      return handleCancellations(startDate, endDate, format, from, to)
    default:
      return Response.json({ error: "Invalid report type" }, { status: 400 })
  }
}

async function handleRevenue(
  startDate: Date,
  endDate: Date,
  format: string | null,
  from: string,
  to: string
) {
  const [revenueByClass, completedBookings] = await Promise.all([
    prisma.booking.groupBy({
      by: ["vehicleClassId"],
      where: {
        status: "COMPLETED",
        paidAt: { gte: startDate, lte: endDate },
      },
      _sum: { totalPrice: true },
      _count: { id: true },
    }),
    prisma.booking.findMany({
      where: {
        status: "COMPLETED",
        paidAt: { gte: startDate, lte: endDate },
      },
      select: {
        totalPrice: true,
        paidAt: true,
        vehicleClassId: true,
      },
    }),
  ])

  const vehicleClasses = await prisma.vehicleClass.findMany({
    select: { id: true, name: true },
  })

  const classMap = new Map(vehicleClasses.map((vc) => [vc.id, vc.name]))

  const totalRevenue = completedBookings.reduce(
    (sum, b) => sum + Number(b.totalPrice),
    0
  )
  const bookingCount = completedBookings.length
  const averageFare = bookingCount > 0 ? totalRevenue / bookingCount : 0

  const breakdown = revenueByClass.map((r) => ({
    vehicleClass: classMap.get(r.vehicleClassId) ?? "Unknown",
    vehicleClassId: r.vehicleClassId,
    revenue: Number(r._sum.totalPrice ?? 0).toFixed(2),
    bookings: r._count.id,
  }))

  // Group by day for chart data
  const dailyMap = new Map<string, number>()
  for (const b of completedBookings) {
    if (b.paidAt) {
      const day = b.paidAt.toISOString().split("T")[0]
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + Number(b.totalPrice))
    }
  }
  const dailyRevenue = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue: Number(revenue.toFixed(2)) }))

  const data = {
    totalRevenue: totalRevenue.toFixed(2),
    bookingCount,
    averageFare: averageFare.toFixed(2),
    breakdown,
    dailyRevenue,
  }

  if (format === "csv") {
    const rows = breakdown.map((r) => ({
      "Vehicle Class": r.vehicleClass,
      Revenue: r.revenue,
      Bookings: r.bookings,
    }))
    const csv = unparse(rows)
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="revenue-report-${from}-${to}.csv"`,
      },
    })
  }

  return Response.json(data)
}

async function handleVolume(
  startDate: Date,
  endDate: Date,
  format: string | null,
  from: string,
  to: string
) {
  const bookings = await prisma.booking.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    select: {
      status: true,
      createdAt: true,
    },
  })

  const totalBookings = bookings.length
  const statusCounts: Record<string, number> = {}
  const dailyMap = new Map<string, Record<string, number>>()

  for (const b of bookings) {
    statusCounts[b.status] = (statusCounts[b.status] ?? 0) + 1
    const day = b.createdAt.toISOString().split("T")[0]
    if (!dailyMap.has(day)) {
      dailyMap.set(day, {})
    }
    const dayData = dailyMap.get(day)!
    dayData[b.status] = (dayData[b.status] ?? 0) + 1
  }

  const cancelled = statusCounts["CANCELLED"] ?? 0
  const cancellationRate =
    totalBookings > 0 ? ((cancelled / totalBookings) * 100).toFixed(1) : "0"

  const dailyVolume = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, statuses]) => ({ date, ...statuses }))

  const data = {
    totalBookings,
    statusCounts,
    cancellationRate,
    dailyVolume,
  }

  if (format === "csv") {
    const rows = Object.entries(statusCounts).map(([status, count]) => ({
      Status: status,
      Count: count,
      Percentage: ((count / totalBookings) * 100).toFixed(1) + "%",
    }))
    const csv = unparse(rows)
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="volume-report-${from}-${to}.csv"`,
      },
    })
  }

  return Response.json(data)
}

async function handleUtilisation(
  startDate: Date,
  endDate: Date,
  format: string | null,
  from: string,
  to: string
) {
  const utilisation = await prisma.booking.groupBy({
    by: ["driverId"],
    where: {
      status: "COMPLETED",
      paidAt: { gte: startDate, lte: endDate },
      driverId: { not: null },
    },
    _count: { id: true },
    _sum: { totalPrice: true },
  })

  const driverIds = utilisation
    .map((u) => u.driverId)
    .filter((id): id is string => id !== null)

  const drivers = await prisma.driver.findMany({
    where: { id: { in: driverIds } },
    select: { id: true, name: true },
  })

  const driverMap = new Map(drivers.map((d) => [d.id, d.name]))

  const rows = utilisation.map((u) => ({
    driverName: driverMap.get(u.driverId!) ?? "Unknown",
    driverId: u.driverId!,
    completedBookings: u._count.id,
    totalRevenue: Number(u._sum.totalPrice ?? 0).toFixed(2),
  }))

  if (format === "csv") {
    const csvRows = rows.map((r) => ({
      Driver: r.driverName,
      "Completed Bookings": r.completedBookings,
      "Total Revenue": r.totalRevenue,
    }))
    const csv = unparse(csvRows)
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="utilisation-report-${from}-${to}.csv"`,
      },
    })
  }

  return Response.json({ drivers: rows })
}

async function handleCancellations(
  startDate: Date,
  endDate: Date,
  format: string | null,
  from: string,
  to: string
) {
  const cancelledBookings = await prisma.booking.findMany({
    where: {
      status: "CANCELLED",
      cancelledAt: { gte: startDate, lte: endDate },
    },
    select: {
      cancellationReason: true,
      createdAt: true,
      cancelledAt: true,
    },
  })

  const totalCancelled = cancelledBookings.length

  // Group by reason
  const reasonCounts: Record<string, number> = {}
  let totalHoursToCancel = 0
  let cancelsWithTime = 0

  for (const b of cancelledBookings) {
    const reason = b.cancellationReason ?? "No reason provided"
    reasonCounts[reason] = (reasonCounts[reason] ?? 0) + 1

    if (b.cancelledAt) {
      const hoursToCancel =
        (b.cancelledAt.getTime() - b.createdAt.getTime()) / (1000 * 60 * 60)
      totalHoursToCancel += hoursToCancel
      cancelsWithTime++
    }
  }

  const averageHoursToCancel =
    cancelsWithTime > 0 ? totalHoursToCancel / cancelsWithTime : 0

  const byReason = Object.entries(reasonCounts).map(([reason, count]) => ({
    reason,
    count,
  }))

  const data = {
    totalCancelled,
    averageHoursToCancel: averageHoursToCancel.toFixed(1),
    byReason,
  }

  if (format === "csv") {
    const csvRows = byReason.map((r) => ({
      Reason: r.reason,
      Count: r.count,
    }))
    const csv = unparse(csvRows)
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="cancellations-report-${from}-${to}.csv"`,
      },
    })
  }

  return Response.json(data)
}
