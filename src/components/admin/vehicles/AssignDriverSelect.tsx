"use client"

import { useState, useEffect } from "react"
import { Select } from "@/components/ui/select"

interface Driver {
  id: string
  name: string
  email: string
}

interface AssignDriverSelectProps {
  currentDriverId: string | null
  onChange: (driverId: string | null) => void
}

export function AssignDriverSelect({ currentDriverId, onChange }: AssignDriverSelectProps) {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDrivers() {
      try {
        const res = await fetch("/api/admin/drivers?hasVehicle=false")
        if (res.ok) {
          const data = await res.json()
          // Include drivers without a vehicle + the current driver
          let available = data.drivers
          if (currentDriverId) {
            // Also fetch the current driver in case they have this vehicle
            const currentRes = await fetch(`/api/admin/drivers/${currentDriverId}`)
            if (currentRes.ok) {
              const currentDriver = await currentRes.json()
              if (!available.find((d: Driver) => d.id === currentDriverId)) {
                available = [
                  { id: currentDriver.id, name: currentDriver.name, email: currentDriver.email },
                  ...available,
                ]
              }
            }
          }
          setDrivers(available)
        }
      } catch {
        // Network error
      } finally {
        setIsLoading(false)
      }
    }
    fetchDrivers()
  }, [currentDriverId])

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading drivers...</div>

  return (
    <Select
      value={currentDriverId ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">No driver assigned</option>
      {drivers.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name} ({d.email})
        </option>
      ))}
    </Select>
  )
}
