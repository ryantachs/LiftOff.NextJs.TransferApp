"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"

interface Driver {
  id: string
  name: string
  vehicleId: string | null
  vehicleRegistration: string | null
  vehicleClassId: string | null
}

interface Vehicle {
  id: string
  registration: string
  make: string
  model: string
  colour: string
  vehicleClassId: string
}

interface AssignDriverModalProps {
  bookingId: string
  vehicleClassId: string
  isOpen: boolean
  onClose: () => void
  onAssigned: () => void
}

export function AssignDriverModal({
  bookingId,
  vehicleClassId,
  isOpen,
  onClose,
  onAssigned,
}: AssignDriverModalProps) {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedDriverId, setSelectedDriverId] = useState("")
  const [selectedVehicleId, setSelectedVehicleId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isOpen) return
    // Fetch available drivers and vehicles
    fetch(`/api/admin/dispatch?dateFrom=${new Date().toISOString()}&dateTo=${new Date(Date.now() + 86400000).toISOString()}`)
      .then((r) => r.json())
      .then((data) => {
        setDrivers(
          (data.drivers ?? []).filter(
            (d: Driver) => d.vehicleClassId === vehicleClassId || !d.vehicleClassId
          )
        )
      })
      .catch(() => {})

    fetch(`/api/admin/dispatch?dateFrom=${new Date().toISOString()}&dateTo=${new Date(Date.now() + 86400000).toISOString()}`)
      .then(() => {
        // Vehicles come from the driver's assigned vehicle, we handle in selection
      })
      .catch(() => {})
  }, [isOpen, vehicleClassId])

  if (!isOpen) return null

  async function handleAssign() {
    if (!selectedDriverId || !selectedVehicleId) {
      setError("Please select both a driver and vehicle")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId: selectedDriverId,
          vehicleId: selectedVehicleId,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to assign driver")
        return
      }

      onAssigned()
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Assign Driver & Vehicle</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Select a driver and vehicle to assign to this booking.
        </p>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="driver-select">Driver</Label>
            <Select
              id="driver-select"
              value={selectedDriverId}
              onChange={(e) => {
                setSelectedDriverId(e.target.value)
                // Auto-select associated vehicle
                const driver = drivers.find((d) => d.id === e.target.value)
                if (driver?.vehicleId) {
                  setSelectedVehicleId(driver.vehicleId)
                }
              }}
            >
              <option value="">Select a driver...</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.vehicleRegistration ? `(${d.vehicleRegistration})` : ""}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle-select">Vehicle</Label>
            <Select
              id="vehicle-select"
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
            >
              <option value="">
                {selectedDriverId
                  ? drivers.find((d) => d.id === selectedDriverId)?.vehicleId
                    ? "Auto-selected from driver"
                    : "No vehicle linked — select manually"
                  : "Select a driver first..."}
              </option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.make} {v.model} ({v.registration})
                </option>
              ))}
            </Select>
          </div>
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isSubmitting}>
            {isSubmitting ? "Assigning..." : "Assign Driver"}
          </Button>
        </div>
      </div>
    </div>
  )
}
