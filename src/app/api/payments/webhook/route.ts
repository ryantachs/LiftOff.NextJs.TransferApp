import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { resend } from "@/lib/resend"
import BookingConfirmation from "@/emails/booking-confirmation"

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return Response.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    // Idempotency check
    const existing = await prisma.booking.findUnique({
      where: { stripeCheckoutSessionId: session.id },
    })
    if (existing?.status === "CONFIRMED") {
      return Response.json({ received: true })
    }

    const booking = await prisma.booking.update({
      where: { stripeCheckoutSessionId: session.id },
      data: {
        status: "CONFIRMED",
        stripePaymentIntentId: session.payment_intent as string,
        paidAt: new Date(),
      },
      include: {
        user: true,
        vehicleClass: true,
      },
    })

    // Send confirmation email
    if (booking.user.email && process.env.EMAIL_FROM) {
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: booking.user.email,
          subject: `Booking Confirmed — ${booking.reference}`,
          react: BookingConfirmation({
            customerName: booking.user.name,
            reference: booking.reference,
            pickupAddress: booking.pickupAddress,
            dropoffAddress: booking.dropoffAddress,
            pickupDateTime: booking.pickupDateTime.toLocaleString("en-GB"),
            vehicleClass: booking.vehicleClass.name,
            totalPrice: booking.totalPrice.toString(),
            currency: booking.currency,
          }),
        })
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError)
      }
    }
  }

  return Response.json({ received: true })
}
