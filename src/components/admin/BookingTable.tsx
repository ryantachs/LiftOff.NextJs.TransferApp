"use client"

import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge"
import { Pagination } from "@/components/shared/Pagination"
import Link from "next/link"

interface BookingRow {
  id: string
  reference: string
  status: string
  customerName: string
  pickupAddress: string
  dropoffAddress: string
  pickupDateTime: string
  vehicleClass: string
  totalPrice: string
  currency: string
  driver: { id: string; name: string } | null
  createdAt: string
}

interface BookingTableProps {
  bookings: BookingRow[]
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function BookingTable({
  bookings,
  page,
  totalPages,
  onPageChange,
}: BookingTableProps) {
  return (
    <div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Reference</th>
              <th className="px-4 py-3 text-left font-medium">Customer</th>
              <th className="px-4 py-3 text-left font-medium">Route</th>
              <th className="px-4 py-3 text-left font-medium">Pickup</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Driver</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {booking.reference}
                  </Link>
                </td>
                <td className="px-4 py-3">{booking.customerName}</td>
                <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">
                  {booking.pickupAddress} → {booking.dropoffAddress}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(booking.pickupDateTime).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3">
                  <BookingStatusBadge status={booking.status} />
                </td>
                <td className="px-4 py-3">
                  {booking.driver?.name ?? (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {booking.currency} {booking.totalPrice}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No bookings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
}
