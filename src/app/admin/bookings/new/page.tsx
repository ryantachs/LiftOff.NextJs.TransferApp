import { prisma } from "@/lib/prisma"
import { ManualBookingForm } from "@/components/admin/bookings/ManualBookingForm"

export default async function AdminNewBookingPage() {
  const vehicleClasses = await prisma.vehicleClass.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { sortOrder: "asc" },
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Create Manual Booking</h1>
      <p className="text-muted-foreground">
        Create a booking for phone or walk-in customers. Manual bookings bypass the Stripe payment flow.
      </p>
      <ManualBookingForm vehicleClasses={vehicleClasses} />
    </div>
  )
}
