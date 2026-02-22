"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { VehicleForm } from "@/components/admin/vehicles/VehicleForm"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface VehicleDetail {
  id: string
  registration: string
  make: string
  model: string
  year: number
  colour: string
  vehicleClassId: string
  vehicleClass: { id: string; name: string }
  driver: { id: string; name: string; email: string; phone: string } | null
  motExpiry: string | null
  serviceExpiry: string | null
  isActive: boolean
  bookings: {
    id: string
    reference: string
    status: string
    customerName: string
    pickupAddress: string
    dropoffAddress: string
    pickupDateTime: string
    driverName: string | null
  }[]
}

interface VehicleClass {
  id: string
  name: string
}

export default function AdminVehicleDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null)
  const [vehicleClasses, setVehicleClasses] = useState<VehicleClass[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [vehicleRes, classesRes] = await Promise.all([
          fetch(`/api/admin/vehicles/${id}`),
          fetch("/api/admin/vehicle-classes"),
        ])
        if (vehicleRes.ok) setVehicle(await vehicleRes.json())
        if (classesRes.ok) {
          const data = await classesRes.json()
          setVehicleClasses(data.vehicleClasses)
        }
      } catch {
        // Network error
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id])

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
    driverId?: string | null
  }) {
    // Update vehicle and driver assignment in single request
    const vehicleRes = await fetch(`/api/admin/vehicles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        registration: data.registration,
        make: data.make,
        model: data.model,
        year: data.year,
        colour: data.colour,
        vehicleClassId: data.vehicleClassId,
        motExpiry: data.motExpiry,
        serviceExpiry: data.serviceExpiry,
        isActive: data.isActive,
        driverId: data.driverId,
      }),
    })
    if (!vehicleRes.ok) {
      const errData = await vehicleRes.json()
      throw new Error(errData.error ?? "Failed to update vehicle")
    }

    router.push("/admin/vehicles")
  }

  async function handleDeactivate() {
    if (!confirm("This will mark the vehicle as inactive. Continue?")) return
    const res = await fetch(`/api/admin/vehicles/${id}`, { method: "DELETE" })
    if (res.ok) {
      router.push("/admin/vehicles")
    }
  }

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading vehicle...</div>
  }

  if (!vehicle) {
    return <div className="py-12 text-center text-muted-foreground">Vehicle not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Edit Vehicle: {vehicle.registration}
        </h1>
        <Button variant="destructive" onClick={handleDeactivate}>
          Deactivate Vehicle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Details</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleForm
            vehicleClasses={vehicleClasses}
            currentDriverId={vehicle.driver?.id ?? null}
            initialData={{
              registration: vehicle.registration,
              make: vehicle.make,
              model: vehicle.model,
              year: vehicle.year,
              colour: vehicle.colour,
              vehicleClassId: vehicle.vehicleClassId,
              motExpiry: vehicle.motExpiry,
              serviceExpiry: vehicle.serviceExpiry,
              isActive: vehicle.isActive,
            }}
            onSubmit={handleSubmit}
            isEdit
          />
        </CardContent>
      </Card>

      {vehicle.bookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Reference</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Customer</th>
                    <th className="px-4 py-3 text-left font-medium">Pickup</th>
                    <th className="px-4 py-3 text-left font-medium">Date/Time</th>
                    <th className="px-4 py-3 text-left font-medium">Driver</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {vehicle.bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/bookings/${b.id}`}
                          className="text-primary hover:underline"
                        >
                          {b.reference}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{b.status}</td>
                      <td className="px-4 py-3">{b.customerName}</td>
                      <td className="px-4 py-3 text-xs">{b.pickupAddress}</td>
                      <td className="px-4 py-3 text-xs">
                        {new Date(b.pickupDateTime).toLocaleString("en-GB")}
                      </td>
                      <td className="px-4 py-3">{b.driverName ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
