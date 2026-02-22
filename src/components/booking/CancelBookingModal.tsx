"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CancelBookingModalProps {
  bookingId: string
  isOpen: boolean
  onClose: () => void
  onCancelled: () => void
}

export function CancelBookingModal({ bookingId, isOpen, onClose, onCancelled }: CancelBookingModalProps) {
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen) return null

  async function handleCancel() {
    if (!reason.trim()) {
      setError("Please provide a reason for cancellation")
      return
    }
    setIsSubmitting(true)
    setError("")
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to cancel booking")
        return
      }
      onCancelled()
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Cancel Booking</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Are you sure you want to cancel this booking? A refund will be processed to your original payment method.
        </p>
        <div className="mt-4 space-y-2">
          <Label htmlFor="cancel-reason">Reason for cancellation</Label>
          <Input
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason..."
            maxLength={500}
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Keep Booking
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={isSubmitting}>
            {isSubmitting ? "Cancelling..." : "Cancel Booking"}
          </Button>
        </div>
      </div>
    </div>
  )
}
