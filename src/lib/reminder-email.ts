import { resend } from "@/lib/resend"
import { render } from "@react-email/components"
import { JourneyReminderEmail } from "@/emails/journey-reminder"

interface SendReminderEmailParams {
  to: string
  booking: {
    reference: string
    pickupAddress: string
    dropoffAddress: string
    pickupDateTime: Date
    driver?: { name: string } | null
    vehicle?: { make: string; model: string; registration: string } | null
  }
}

export async function sendReminderEmail({ to, booking }: SendReminderEmailParams) {
  const html = await render(
    JourneyReminderEmail({
      reference: booking.reference,
      pickupAddress: booking.pickupAddress,
      dropoffAddress: booking.dropoffAddress,
      pickupDateTime: booking.pickupDateTime.toISOString(),
      driverName: booking.driver?.name ?? undefined,
      vehicleDetails: booking.vehicle
        ? `${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.registration})`
        : undefined,
    })
  )

  return resend.emails.send({
    from: process.env.EMAIL_FROM ?? "noreply@example.com",
    to,
    subject: `Reminder: Your transfer ${booking.reference} is in 2 hours`,
    html,
  })
}
