import { requireAdmin } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"
import { writeAuditLog } from "@/lib/audit"
import { canTransition } from "@/lib/status-transitions"
import { resend } from "@/lib/resend"
import { escapeHtml } from "@/lib/utils"
import type { BookingStatus } from "@prisma/client"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
  } catch (res) {
    return res as Response
  }

  const { id } = await params

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      vehicleClass: true,
      driver: { select: { id: true, name: true, email: true, phone: true } },
      vehicle: { select: { id: true, registration: true, make: true, model: true, colour: true } },
      auditLogs: { orderBy: { createdAt: "desc" } },
    },
  })

  if (!booking) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  return Response.json({
    id: booking.id,
    reference: booking.reference,
    status: booking.status,
    paymentMethod: booking.paymentMethod,
    customer: booking.user,
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
    driver: booking.driver,
    vehicle: booking.vehicle,
    assignedAt: booking.assignedAt?.toISOString() ?? null,
    specialRequests: booking.specialRequests,
    internalNotes: booking.internalNotes,
    cancelledAt: booking.cancelledAt?.toISOString() ?? null,
    cancellationReason: booking.cancellationReason,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    auditLogs: booking.auditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      actor: log.actor,
      changes: log.changes,
      createdAt: log.createdAt.toISOString(),
    })),
  })
}

export async function PATCH(
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

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } }, driver: { select: { name: true } } },
  })

  if (!booking) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const updateData: Record<string, unknown> = {}

  // Handle internal notes update
  if (body.internalNotes !== undefined) {
    updateData.internalNotes = body.internalNotes
  }

  // Handle status transition
  if (body.status && body.status !== booking.status) {
    const newStatus = body.status as BookingStatus

    if (!canTransition(booking.status, newStatus)) {
      return Response.json(
        { error: `Cannot transition from ${booking.status} to ${newStatus}` },
        { status: 400 }
      )
    }

    updateData.status = newStatus

    await writeAuditLog({
      bookingId: id,
      action: "STATUS_CHANGED",
      actor: session.user.email!,
      changes: { field: "status", from: booking.status, to: newStatus },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    })

    // Send status notification emails
    try {
      if (newStatus === "IN_PROGRESS") {
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: booking.user.email,
          subject: `Journey Started — ${booking.reference}`,
          html: `<h1>Journey In Progress</h1>
            <p>Hi ${escapeHtml(booking.user.name)},</p>
            <p>Your journey for booking <strong>${escapeHtml(booking.reference)}</strong> is now in progress.</p>
            <p><strong>Pickup:</strong> ${escapeHtml(booking.pickupAddress)}</p>
            <p><strong>Dropoff:</strong> ${escapeHtml(booking.dropoffAddress)}</p>`,
        })
      } else if (newStatus === "COMPLETED") {
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: booking.user.email,
          subject: `Journey Completed — ${booking.reference}`,
          html: `<h1>Journey Completed</h1>
            <p>Hi ${escapeHtml(booking.user.name)},</p>
            <p>Your journey for booking <strong>${escapeHtml(booking.reference)}</strong> has been completed.</p>
            <p>Thank you for choosing our airport transfer service.</p>`,
        })
      }
    } catch {
      console.error("Failed to send status email for booking:", id)
    }
  }

  if (Object.keys(updateData).length === 0) {
    return Response.json({ error: "No changes provided" }, { status: 400 })
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: updateData,
  })

  return Response.json({ id: updated.id, status: updated.status })
}
