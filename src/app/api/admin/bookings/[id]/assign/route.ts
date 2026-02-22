import { requireAdmin } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"
import { writeAuditLog } from "@/lib/audit"
import { resend } from "@/lib/resend"
import { escapeHtml } from "@/lib/utils"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let session
  try {
    session = await requireAdmin()
  } catch (res) {
    return res as Response
  }

  const { id } = await params
  const body = await request.json()

  if (!body.driverId || !body.vehicleId) {
    return Response.json(
      { error: "driverId and vehicleId are required" },
      { status: 400 }
    )
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      vehicleClass: { select: { name: true } },
    },
  })

  if (!booking) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  if (booking.status !== "CONFIRMED") {
    return Response.json(
      { error: "Only CONFIRMED bookings can be assigned" },
      { status: 400 }
    )
  }

  const driver = await prisma.driver.findUnique({
    where: { id: body.driverId },
  })

  if (!driver) {
    return Response.json({ error: "Driver not found" }, { status: 404 })
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: body.vehicleId },
  })

  if (!vehicle) {
    return Response.json({ error: "Vehicle not found" }, { status: 404 })
  }

  if (vehicle.vehicleClassId !== booking.vehicleClassId) {
    return Response.json(
      { error: "Vehicle class does not match booking" },
      { status: 400 }
    )
  }

  // Update booking
  const updated = await prisma.booking.update({
    where: { id },
    data: {
      driverId: driver.id,
      vehicleId: vehicle.id,
      assignedAt: new Date(),
      status: "ASSIGNED",
    },
  })

  await writeAuditLog({
    bookingId: id,
    action: "DRIVER_ASSIGNED",
    actor: session.user.email!,
    changes: {
      driverId: driver.id,
      driverName: driver.name,
      vehicleId: vehicle.id,
      vehicleRegistration: vehicle.registration,
      field: "status",
      from: "CONFIRMED",
      to: "ASSIGNED",
    },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  })

  // Send customer notification
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: booking.user.email,
      subject: `Driver Confirmed — ${booking.reference}`,
      html: `<h1>Driver Confirmed</h1>
        <p>Hi ${escapeHtml(booking.user.name)},</p>
        <p>A driver has been assigned to your booking <strong>${escapeHtml(booking.reference)}</strong>.</p>
        <p><strong>Driver:</strong> ${escapeHtml(driver.name)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(driver.phone)}</p>
        <p><strong>Vehicle:</strong> ${escapeHtml(vehicle.make)} ${escapeHtml(vehicle.model)} (${escapeHtml(vehicle.colour)}, ${escapeHtml(vehicle.registration)})</p>`,
    })
  } catch {
    console.error("Failed to send customer assignment email for booking:", id)
  }

  // Send driver notification
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: driver.email,
      subject: `New Assignment — ${booking.reference}`,
      html: `<h1>New Journey Assignment</h1>
        <p>Hi ${escapeHtml(driver.name)},</p>
        <p>You have been assigned booking <strong>${escapeHtml(booking.reference)}</strong>.</p>
        <p><strong>Customer:</strong> ${escapeHtml(booking.user.name)}</p>
        <p><strong>Pickup:</strong> ${escapeHtml(booking.pickupAddress)}</p>
        <p><strong>Dropoff:</strong> ${escapeHtml(booking.dropoffAddress)}</p>
        <p><strong>Date/Time:</strong> ${escapeHtml(booking.pickupDateTime.toISOString())}</p>
        <p><strong>Passengers:</strong> ${booking.passengers}</p>
        <p><strong>Luggage:</strong> ${booking.luggage}</p>
        ${booking.flightNumber ? `<p><strong>Flight:</strong> ${escapeHtml(booking.flightNumber)}</p>` : ""}
        ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${escapeHtml(booking.specialRequests)}</p>` : ""}`,
    })
  } catch {
    console.error("Failed to send driver assignment email for booking:", id)
  }

  return Response.json({
    id: updated.id,
    status: updated.status,
    driverId: updated.driverId,
    vehicleId: updated.vehicleId,
    assignedAt: updated.assignedAt?.toISOString(),
  })
}
