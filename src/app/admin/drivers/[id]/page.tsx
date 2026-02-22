"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DriverForm } from "@/components/admin/drivers/DriverForm"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface DriverDetail {
  id: string
  name: string
  email: string
  phone: string
  licenceNumber: string
  vehicleId: string | null
  isAvailable: boolean
  vehicle: {
    id: string
    registration: string
    make: string
    model: string
    colour: string
    vehicleClass: { id: string; name: string }
    motExpiry: string | null
    serviceExpiry: string | null
    isActive: boolean
  } | null
  upcomingBookings: {
    id: string
    reference: string
    status: string
    pickupAddress: string
    dropoffAddress: string
    pickupDateTime: string
    vehicleClassName: string
  }[]
}

export default function AdminDriverDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [driver, setDriver] = useState<DriverDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDriver() {
      try {
        const res = await fetch(`/api/admin/drivers/${id}`)
        if (res.ok) {
          setDriver(await res.json())
        }
      } catch {
        // Network error
      } finally {
        setIsLoading(false)
      }
    }
    fetchDriver()
  }, [id])

  async function handleSubmit(data: {
    name: string
    email: string
    phone: string
    licenceNumber: string
    vehicleId: string | null
    isAvailable: boolean
  }) {
    const res = await fetch(`/api/admin/drivers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.error ?? "Failed to update driver")
    }
    router.push("/admin/drivers")
  }

  async function handleRemove() {
    if (!confirm("This will deactivate the driver and unlink their vehicle. Continue?")) return
    const res = await fetch(`/api/admin/drivers/${id}`, { method: "DELETE" })
    if (res.ok) {
      router.push("/admin/drivers")
    }
  }

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading driver...</div>
  }

  if (!driver) {
    return <div className="py-12 text-center text-muted-foreground">Driver not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Driver: {driver.name}</h1>
        <Button variant="destructive" onClick={handleRemove}>
          Remove Driver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Driver Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DriverForm
            initialData={{
              name: driver.name,
              email: driver.email,
              phone: driver.phone,
              licenceNumber: driver.licenceNumber,
              vehicleId: driver.vehicleId,
              isAvailable: driver.isAvailable,
            }}
            onSubmit={handleSubmit}
            isEdit
          />
        </CardContent>
      </Card>

      {driver.upcomingBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings (Next 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Reference</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Pickup</th>
                    <th className="px-4 py-3 text-left font-medium">Dropoff</th>
                    <th className="px-4 py-3 text-left font-medium">Date/Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {driver.upcomingBookings.map((b) => (
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
                      <td className="px-4 py-3 text-xs">{b.pickupAddress}</td>
                      <td className="px-4 py-3 text-xs">{b.dropoffAddress}</td>
                      <td className="px-4 py-3 text-xs">
                        {new Date(b.pickupDateTime).toLocaleString("en-GB")}
                      </td>
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
