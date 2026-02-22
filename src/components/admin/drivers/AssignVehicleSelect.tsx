"use client"

import { useState, useEffect } from "react"
import { Select } from "@/components/ui/select"

interface Vehicle {
  id: string
  registration: string
  make: string
  model: string
}

interface AssignVehicleSelectProps {
  currentVehicleId: string | null
  onChange: (vehicleId: string | null) => void
}

export function AssignVehicleSelect({ currentVehicleId, onChange }: AssignVehicleSelectProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const res = await fetch("/api/admin/vehicles")
        if (res.ok) {
          const data = await res.json()
          // Show vehicles that are active and either unassigned or currently assigned to this driver
          setVehicles(
            data.vehicles.filter(
              (v: { isActive: boolean; driver: { id: string } | null; id: string }) =>
                v.isActive && (!v.driver || v.id === currentVehicleId)
            )
          )
        }
      } catch {
        // Network error
      } finally {
        setIsLoading(false)
      }
    }
    fetchVehicles()
  }, [currentVehicleId])

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading vehicles...</div>

  return (
    <Select
      value={currentVehicleId ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">No vehicle assigned</option>
      {vehicles.map((v) => (
        <option key={v.id} value={v.id}>
          {v.registration} — {v.make} {v.model}
        </option>
      ))}
    </Select>
  )
}
