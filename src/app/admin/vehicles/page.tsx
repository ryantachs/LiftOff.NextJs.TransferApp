"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { VehicleTable } from "@/components/admin/vehicles/VehicleTable"
import { Button } from "@/components/ui/button"

export default function AdminVehiclesPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/vehicles?sortBy=motExpiry&sortDir=asc")
      if (res.ok) {
        const data = await res.json()
        setVehicles(data.vehicles)
      }
    } catch {
      // Network error
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      const res = await fetch(`/api/admin/vehicles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })
      if (res.ok) {
        fetchVehicles()
      }
    } catch {
      // Network error
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vehicles</h1>
        <Button onClick={() => router.push("/admin/vehicles/new")}>
          Add Vehicle
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading vehicles...</div>
      ) : (
        <VehicleTable vehicles={vehicles} onToggleActive={handleToggleActive} />
      )}
    </div>
  )
}
