import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { sendReminderEmail } from "@/lib/reminder-email"

export async function POST() {
  const headersList = await headers()
  const authHeader = headersList.get("authorization")

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorised" }, { status: 401 })
  }

  const now = new Date()
  const windowStart = new Date(now.getTime() + 115 * 60 * 1000) // +1h55m
  const windowEnd = new Date(now.getTime() + 125 * 60 * 1000) // +2h05m

  const upcomingBookings = await prisma.booking.findMany({
    where: {
      status: { in: ["CONFIRMED", "ASSIGNED"] },
      pickupDateTime: { gte: windowStart, lte: windowEnd },
    },
    include: { user: true, driver: true, vehicle: true },
  })

  const results = await Promise.allSettled(
    upcomingBookings.map((booking) =>
      sendReminderEmail({
        to: booking.user.email,
        booking,
      })
    )
  )

  const sent = results.filter((r) => r.status === "fulfilled").length
  const failed = results.filter((r) => r.status === "rejected").length

  return Response.json({ sent, failed, total: upcomingBookings.length })
}
