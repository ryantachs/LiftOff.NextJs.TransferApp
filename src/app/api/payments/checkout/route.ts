import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { bookingId } = body

  if (!bookingId) {
    return Response.json({ error: "bookingId is required" }, { status: 400 })
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { vehicleClass: true },
  })

  if (!booking) {
    return Response.json({ error: "Booking not found" }, { status: 404 })
  }

  if (booking.userId !== session.user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 403 })
  }

  if (booking.status !== "PENDING_PAYMENT") {
    return Response.json({ error: "Booking is not pending payment" }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: session.user.email ?? undefined,
    line_items: [
      {
        price_data: {
          currency: booking.currency.toLowerCase(),
          product_data: {
            name: `Airport Transfer — ${booking.vehicleClass.name}`,
            description: `${booking.pickupAddress} → ${booking.dropoffAddress}`,
          },
          unit_amount: Math.round(Number(booking.totalPrice) * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: booking.id,
    },
    success_url: `${appUrl}/book/confirm?bookingId=${booking.id}`,
    cancel_url: `${appUrl}/book/details?bookingId=${booking.id}`,
  })

  // Save Stripe session ID to booking
  await prisma.booking.update({
    where: { id: booking.id },
    data: { stripeCheckoutSessionId: checkoutSession.id },
  })

  return Response.json({ url: checkoutSession.url })
}
