import { requireFullAdmin } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"
import { writeAuditLog } from "@/lib/audit"
import { stripe } from "@/lib/stripe"
import { resend } from "@/lib/resend"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let session
  try {
    session = await requireFullAdmin()
  } catch (res) {
    return res as Response
  }

  const { id } = await params
  const body = await request.json()

  if (!body.reason || typeof body.reason !== "string" || body.reason.trim().length === 0) {
    return Response.json({ error: "Cancellation reason is required" }, { status: 400 })
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  })

  if (!booking) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
    return Response.json(
      { error: "Booking cannot be cancelled in its current status" },
      { status: 400 }
    )
  }

  // Update booking status
  await prisma.booking.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancellationReason: body.reason.trim(),
    },
  })

  await writeAuditLog({
    bookingId: id,
    action: "CANCELLED",
    actor: session.user.email!,
    changes: {
      field: "status",
      from: booking.status,
      to: "CANCELLED",
      reason: body.reason.trim(),
    },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  })

  // Process Stripe refund if applicable
  let refundId: string | null = null
  if (booking.paymentMethod === "STRIPE" && booking.stripePaymentIntentId) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: booking.stripePaymentIntentId,
      })
      refundId = refund.id
    } catch {
      console.error("Stripe refund failed for booking:", id)
    }
  }

  // Send cancellation email
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: booking.user.email,
      subject: `Booking ${booking.reference} Cancelled`,
      html: `<h1>Booking Cancelled</h1>
        <p>Hi ${booking.user.name},</p>
        <p>Your booking <strong>${booking.reference}</strong> has been cancelled by our team.</p>
        <p><strong>Pickup:</strong> ${booking.pickupAddress}</p>
        <p><strong>Dropoff:</strong> ${booking.dropoffAddress}</p>
        <p><strong>Reason:</strong> ${body.reason.trim()}</p>
        ${refundId ? "<p>A refund has been initiated and will appear on your statement within 5-10 business days.</p>" : ""}`,
    })
  } catch {
    console.error("Failed to send cancellation email for booking:", id)
  }

  return Response.json({ success: true, refundId })
}
