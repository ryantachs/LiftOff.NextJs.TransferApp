"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock } from "lucide-react"

interface BookingStatus {
  id: string
  reference: string
  status: string
  pickupAddress: string
  dropoffAddress: string
  pickupDateTime: string
  vehicleClass: string
  totalPrice: string
  currency: string
  paidAt: string | null
}

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  )
}

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")
  const [booking, setBooking] = useState<BookingStatus | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!bookingId) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/bookings/status?bookingId=${bookingId}`)
        if (response.ok) {
          const data = await response.json()
          setBooking(data)
          if (data.status === "CONFIRMED") {
            clearInterval(pollInterval)
          }
        }
      } catch {
        // Silent retry
      }
    }, 2000)

    // Initial fetch
    fetch(`/api/bookings/status?bookingId=${bookingId}`)
      .then((res) => res.json())
      .then((data) => setBooking(data))
      .catch(() => setError("Failed to load booking details"))

    return () => clearInterval(pollInterval)
  }, [bookingId])

  if (error) {
    return (
      <div className="mx-auto max-w-2xl text-center py-12">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-2xl text-center py-12">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground animate-pulse" />
        <p className="mt-4 text-muted-foreground">Processing your payment...</p>
      </div>
    )
  }

  const isConfirmed = booking.status === "CONFIRMED"

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          {isConfirmed ? (
            <>
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              <CardTitle className="text-2xl mt-4">Booking Confirmed!</CardTitle>
              <CardDescription>Your airport transfer has been booked successfully.</CardDescription>
            </>
          ) : (
            <>
              <Clock className="h-16 w-16 mx-auto text-yellow-500 animate-pulse" />
              <CardTitle className="text-2xl mt-4">Processing Payment</CardTitle>
              <CardDescription>Please wait while we confirm your payment...</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono font-bold text-lg">{booking.reference}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={isConfirmed ? "default" : "secondary"}>
                {booking.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pickup</span>
              <span className="text-right max-w-[60%]">{booking.pickupAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dropoff</span>
              <span className="text-right max-w-[60%]">{booking.dropoffAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date/Time</span>
              <span>{new Date(booking.pickupDateTime).toLocaleString("en-GB")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vehicle</span>
              <span>{booking.vehicleClass}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Total Paid</span>
              <span className="font-semibold">
                {booking.currency === "GBP" ? "£" : booking.currency}{" "}
                {parseFloat(booking.totalPrice).toFixed(2)}
              </span>
            </div>
          </div>

          {isConfirmed && (
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground mb-4">
                A confirmation email has been sent to your registered email address.
              </p>
              <Link href="/book">
                <Button variant="outline">Book Another Transfer</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
