"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface BookingDraft {
  quoteId: string
  vehicleClassId: string
  vehicle: {
    name: string
    price: string
  }
  distanceKm: number
  durationMins: number
}

function BookingDetailsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [draft, setDraft] = useState<BookingDraft | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const bookingId = searchParams.get("bookingId")
    if (bookingId) {
      handlePayment(bookingId)
      return
    }

    const stored = sessionStorage.getItem("booking-draft")
    if (stored) {
      setDraft(JSON.parse(stored))
    } else {
      setError("No booking in progress. Please start a new quote.")
    }
  }, [searchParams])

  async function handlePayment(existingBookingId?: string) {
    setLoading(true)
    setError("")

    try {
      let bookingId = existingBookingId

      if (!bookingId && draft) {
        const bookingResponse = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quoteId: draft.quoteId,
            vehicleClassId: draft.vehicleClassId,
            extras: [],
            specialRequests: (document.getElementById("specialRequests") as HTMLTextAreaElement)?.value || undefined,
          }),
        })

        if (!bookingResponse.ok) {
          const result = await bookingResponse.json()
          setError(result.error ?? "Failed to create booking")
          setLoading(false)
          return
        }

        const bookingResult = await bookingResponse.json()
        bookingId = bookingResult.bookingId
      }

      const checkoutResponse = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })

      if (!checkoutResponse.ok) {
        const result = await checkoutResponse.json()
        setError(result.error ?? "Failed to start payment")
        setLoading(false)
        return
      }

      const { url } = await checkoutResponse.json()
      if (url) {
        window.location.href = url
      }
    } catch {
      setError("An unexpected error occurred")
      setLoading(false)
    }
  }

  if (error && !draft) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <Card>
          <CardContent className="py-12">
            <p className="text-destructive">{error}</p>
            <Button className="mt-4" onClick={() => router.push("/book")}>
              Start New Quote
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="mx-auto max-w-2xl text-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Review &amp; Pay</CardTitle>
          <CardDescription>Review your booking details before payment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vehicle</span>
              <span className="font-medium">{draft.vehicle.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Distance</span>
              <span>{draft.distanceKm.toFixed(1)} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Duration</span>
              <span>{draft.durationMins} min</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-semibold">Total</span>
              <span className="font-semibold text-lg">£{parseFloat(draft.vehicle.price).toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequests">Special Requests (optional)</Label>
            <textarea
              id="specialRequests"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g. child seat needed, wheelchair accessible vehicle"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            disabled={loading}
            onClick={() => handlePayment()}
          >
            {loading ? "Processing..." : `Pay £${parseFloat(draft.vehicle.price).toFixed(2)}`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function BookingDetailsPage() {
  return (
    <Suspense>
      <BookingDetailsContent />
    </Suspense>
  )
}
