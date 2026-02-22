import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { BookingStatusBadge } from "./BookingStatusBadge"

interface BookingCardProps {
  id: string
  reference: string
  status: string
  pickupAddress: string
  dropoffAddress: string
  pickupDateTime: string
  vehicleClassName: string
  totalPrice: string
  currency: string
}

export function BookingCard({
  id,
  reference,
  status,
  pickupAddress,
  dropoffAddress,
  pickupDateTime,
  vehicleClassName,
  totalPrice,
  currency,
}: BookingCardProps) {
  const currencySymbol = currency === "GBP" ? "£" : currency
  const formattedDate = new Date(pickupDateTime).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Link href={`/bookings/${id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-sm font-bold">{reference}</span>
            <BookingStatusBadge status={status} />
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex gap-2">
              <span className="text-muted-foreground shrink-0">From:</span>
              <span className="truncate">{pickupAddress}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground shrink-0">To:</span>
              <span className="truncate">{dropoffAddress}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-muted-foreground">{formattedDate}</span>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">{vehicleClassName}</span>
                <span className="font-semibold">{currencySymbol}{parseFloat(totalPrice).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
