import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { resend } from "@/lib/resend"
import { cancellationSchema } from "@/schemas/cancellation"

const CANCELLATION_HOURS_CUTOFF = parseInt(
  process.env.CANCELLATION_HOURS_CUTOFF ?? "24",
  10
)

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorised" }, { status: 401 })
  }

  const { id } = await params

  const booking = await prisma.booking.findUnique({ where: { id } })
  if (!booking || booking.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  // Validate status
  if (booking.status !== "CONFIRMED" && booking.status !== "ASSIGNED") {
    return Response.json(
      { error: "Booking cannot be cancelled in its current status" },
      { status: 400 }
    )
  }

  // Validate time window
  const cutoffDate = new Date(
    Date.now() + CANCELLATION_HOURS_CUTOFF * 60 * 60 * 1000
  )
  if (booking.pickupDateTime <= cutoffDate) {
    return Response.json(
      {
        error: `Bookings can only be cancelled more than ${CANCELLATION_HOURS_CUTOFF} hours before pickup`,
      },
      { status: 400 }
    )
  }

  // Validate request body
  const body = await request.json()
  const parsed = cancellationSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Update booking status
  await prisma.booking.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancellationReason: parsed.data.reason,
    },
  })

  // Process Stripe refund
  let refundId: string | null = null
  if (booking.stripePaymentIntentId) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: booking.stripePaymentIntentId,
      })
      refundId = refund.id
    } catch {
      // Log refund failure but don't block cancellation
      console.error("Stripe refund failed for booking:", id)
    }
  }

  // Send cancellation email
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: session.user.email!,
      subject: `Booking ${booking.reference} Cancelled`,
      html: `<h1>Booking Cancelled</h1>
        <p>Your booking <strong>${booking.reference}</strong> has been cancelled.</p>
        <p><strong>Pickup:</strong> ${booking.pickupAddress}</p>
        <p><strong>Dropoff:</strong> ${booking.dropoffAddress}</p>
        <p><strong>Reason:</strong> ${parsed.data.reason}</p>
        ${refundId ? "<p>A refund has been initiated and will appear on your statement within 5-10 business days.</p>" : ""}`,
    })
  } catch {
    console.error("Failed to send cancellation email for booking:", id)
  }

  return Response.json({ success: true, refundId })
}
