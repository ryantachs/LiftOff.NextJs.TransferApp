"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { DriverTable } from "@/components/admin/drivers/DriverTable"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function AdminDriversPage() {
  const router = useRouter()
  const [drivers, setDrivers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterAvailable, setFilterAvailable] = useState("")
  const [filterHasVehicle, setFilterHasVehicle] = useState("")

  const fetchDrivers = useCallback(async () => {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (filterAvailable) params.set("available", filterAvailable)
    if (filterHasVehicle) params.set("hasVehicle", filterHasVehicle)

    try {
      const res = await fetch(`/api/admin/drivers?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setDrivers(data.drivers)
      }
    } catch {
      // Network error
    } finally {
      setIsLoading(false)
    }
  }, [filterAvailable, filterHasVehicle])

  useEffect(() => {
    fetchDrivers()
  }, [fetchDrivers])

  async function handleToggleAvailability(id: string, isAvailable: boolean) {
    try {
      const res = await fetch(`/api/admin/drivers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable }),
      })
      if (res.ok) {
        fetchDrivers()
      }
    } catch {
      // Network error
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Drivers</h1>
        <Button onClick={() => router.push("/admin/drivers/new")}>
          Add Driver
        </Button>
      </div>

      <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Availability</Label>
          <Select
            value={filterAvailable}
            onChange={(e) => setFilterAvailable(e.target.value)}
          >
            <option value="">All</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Vehicle Assignment</Label>
          <Select
            value={filterHasVehicle}
            onChange={(e) => setFilterHasVehicle(e.target.value)}
          >
            <option value="">All</option>
            <option value="true">Has vehicle</option>
            <option value="false">No vehicle</option>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading drivers...</div>
      ) : (
        <DriverTable
          drivers={drivers}
          onToggleAvailability={handleToggleAvailability}
        />
      )}
    </div>
  )
}
