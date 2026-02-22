"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { VehicleForm } from "@/components/admin/vehicles/VehicleForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface VehicleClass {
  id: string
  name: string
}

export default function AdminNewVehiclePage() {
  const router = useRouter()
  const [vehicleClasses, setVehicleClasses] = useState<VehicleClass[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch("/api/admin/vehicle-classes")
        if (res.ok) {
          const data = await res.json()
          setVehicleClasses(data.vehicleClasses)
        }
      } catch {
        // Network error
      } finally {
        setIsLoading(false)
      }
    }
    fetchClasses()
  }, [])

  async function handleSubmit(data: {
    registration: string
    make: string
    model: string
    year: number
    colour: string
    vehicleClassId: string
    motExpiry: string | null
    serviceExpiry: string | null
    isActive: boolean
  }) {
    const res = await fetch("/api/admin/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.error ?? "Failed to create vehicle")
    }
    router.push("/admin/vehicles")
  }

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Vehicle</h1>
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Details</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleForm
            vehicleClasses={vehicleClasses}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  )
}
