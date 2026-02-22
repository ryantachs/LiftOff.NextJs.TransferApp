"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"

const validTransitions: Record<string, string[]> = {
  PENDING_PAYMENT: [],
  CONFIRMED: ["ASSIGNED"],
  ASSIGNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
}

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: "Pending Payment",
  CONFIRMED: "Confirmed",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}

interface StatusTransitionButtonProps {
  bookingId: string
  currentStatus: string
  onStatusChanged: () => void
}

export function StatusTransitionButton({
  bookingId,
  currentStatus,
  onStatusChanged,
}: StatusTransitionButtonProps) {
  const [selectedStatus, setSelectedStatus] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const nextStatuses = validTransitions[currentStatus] ?? []

  if (nextStatuses.length === 0) {
    return null
  }

  async function handleTransition() {
    if (!selectedStatus) return

    setIsSubmitting(true)
    setError("")

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to update status")
        return
      }

      onStatusChanged()
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="w-48"
      >
        <option value="">Advance status...</option>
        {nextStatuses.map((s) => (
          <option key={s} value={s}>
            {statusLabels[s] ?? s}
          </option>
        ))}
      </Select>
      <Button
        size="sm"
        onClick={handleTransition}
        disabled={!selectedStatus || isSubmitting}
      >
        {isSubmitting ? "Updating..." : "Update"}
      </Button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  )
}
