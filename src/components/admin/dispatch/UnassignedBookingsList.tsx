"use client"

import { Button } from "@/components/ui/button"
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge"

interface UnassignedBooking {
  id: string
  reference: string
  status: string
  customerName: string
  pickupAddress: string
  dropoffAddress: string
  pickupDateTime: string
  vehicleClassName: string
  vehicleClassId: string
}

interface UnassignedBookingsListProps {
  bookings: UnassignedBooking[]
  onAssign: (bookingId: string) => void
}

export function UnassignedBookingsList({
  bookings,
  onAssign,
}: UnassignedBookingsListProps) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-lg border p-4 text-center text-sm text-muted-foreground">
        All bookings are assigned!
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">
        Unassigned Bookings ({bookings.length})
      </h3>
      {bookings.map((b) => (
        <div key={b.id} className="rounded-lg border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{b.reference}</span>
            <BookingStatusBadge status={b.status} />
          </div>
          <p className="text-xs text-muted-foreground">{b.customerName}</p>
          <p className="text-xs text-muted-foreground truncate">
            {b.pickupAddress} → {b.dropoffAddress}
          </p>
          <div className="flex items-center justify-between text-xs">
            <span>
              {new Date(b.pickupDateTime).toLocaleString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="text-muted-foreground">{b.vehicleClassName}</span>
          </div>
          <Button size="sm" className="w-full" onClick={() => onAssign(b.id)}>
            Assign Driver
          </Button>
        </div>
      ))}
    </div>
  )
}
