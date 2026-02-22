"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DispatchTimeline } from "@/components/admin/dispatch/DispatchTimeline"
import { UnassignedBookingsList } from "@/components/admin/dispatch/UnassignedBookingsList"
import { AssignDriverModal } from "@/components/admin/AssignDriverModal"

interface DispatchBooking {
  id: string
  reference: string
  status: string
  customerName: string
  pickupAddress: string
  dropoffAddress: string
  pickupDateTime: string
  vehicleClassId: string
  vehicleClassName: string
  driverId: string | null
  driverName: string | null
  vehicleId: string | null
  vehicleRegistration: string | null
}

interface DispatchDriver {
  id: string
  name: string
  vehicleId: string | null
  vehicleRegistration: string | null
  vehicleClassId: string | null
}

export default function AdminDispatchPage() {
  const [view, setView] = useState<"day" | "week">("day")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [bookings, setBookings] = useState<DispatchBooking[]>([])
  const [drivers, setDrivers] = useState<DispatchDriver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [assignBookingId, setAssignBookingId] = useState<string | null>(null)
  const [assignVehicleClassId, setAssignVehicleClassId] = useState<string>("")

  const fetchData = useCallback(async () => {
    setIsLoading(true)

    const dateFrom = new Date(date)
    dateFrom.setHours(0, 0, 0, 0)

    const dateTo = new Date(date)
    if (view === "week") {
      dateTo.setDate(dateTo.getDate() + 7)
    } else {
      dateTo.setDate(dateTo.getDate() + 1)
    }
    dateTo.setHours(0, 0, 0, 0)

    try {
      const res = await fetch(
        `/api/admin/dispatch?dateFrom=${dateFrom.toISOString()}&dateTo=${dateTo.toISOString()}`
      )
      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings)
        setDrivers(data.drivers)
      }
    } catch {
      // error
    } finally {
      setIsLoading(false)
    }
  }, [date, view])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const unassigned = bookings.filter((b) => !b.driverId)
  const assigned = bookings.filter((b) => b.driverId)

  function handleAutoSuggest() {
    // Auto-suggest logic: assign drivers based on vehicle class match, availability, and no overlap
    const suggestions: Array<{ bookingId: string; driverId: string; vehicleId: string }> = []

    for (const booking of unassigned) {
      // Find matching driver
      const matchingDriver = drivers.find((d) => {
        // Vehicle class match
        if (d.vehicleClassId !== booking.vehicleClassId) return false
        if (!d.vehicleId) return false

        // Check no overlapping bookings (within 2 hours)
        const bookingTime = new Date(booking.pickupDateTime).getTime()
        const hasOverlap = assigned.some((ab) => {
          if (ab.driverId !== d.id) return false
          const assignedTime = new Date(ab.pickupDateTime).getTime()
          return Math.abs(bookingTime - assignedTime) < 2 * 60 * 60 * 1000
        })

        // Also check already suggested
        const alreadySuggested = suggestions.some(
          (s) => {
            if (s.driverId !== d.id) return false
            const suggestedBooking = unassigned.find((u) => u.id === s.bookingId)
            if (!suggestedBooking) return false
            const suggestedTime = new Date(suggestedBooking.pickupDateTime).getTime()
            return Math.abs(bookingTime - suggestedTime) < 2 * 60 * 60 * 1000
          }
        )

        return !hasOverlap && !alreadySuggested
      })

      if (matchingDriver && matchingDriver.vehicleId) {
        suggestions.push({
          bookingId: booking.id,
          driverId: matchingDriver.id,
          vehicleId: matchingDriver.vehicleId,
        })
      }
    }

    // Execute assignments
    Promise.all(
      suggestions.map((s) =>
        fetch(`/api/admin/bookings/${s.bookingId}/assign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            driverId: s.driverId,
            vehicleId: s.vehicleId,
          }),
        })
      )
    ).then(() => {
      fetchData()
    })
  }

  function handleAssignFromList(bookingId: string) {
    const booking = unassigned.find((b) => b.id === bookingId)
    if (booking) {
      setAssignBookingId(bookingId)
      setAssignVehicleClassId(booking.vehicleClassId)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dispatch</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={view === "day" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("day")}
            >
              Day
            </Button>
            <Button
              variant={view === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("week")}
            >
              Week
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="dispatch-date" className="sr-only">Date</Label>
            <Input
              id="dispatch-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-40"
            />
          </div>
          {unassigned.length > 0 && (
            <Button onClick={handleAutoSuggest} variant="secondary">
              Auto-Suggest ({unassigned.length})
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading dispatch data...</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <DispatchTimeline bookings={bookings} date={date} />
          <UnassignedBookingsList
            bookings={unassigned}
            onAssign={handleAssignFromList}
          />
        </div>
      )}

      {assignBookingId && (
        <AssignDriverModal
          bookingId={assignBookingId}
          vehicleClassId={assignVehicleClassId}
          isOpen={true}
          onClose={() => setAssignBookingId(null)}
          onAssigned={() => {
            setAssignBookingId(null)
            fetchData()
          }}
        />
      )}
    </div>
  )
}
