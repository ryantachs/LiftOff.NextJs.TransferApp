"use client"

import { useRouter } from "next/navigation"
import { DriverForm } from "@/components/admin/drivers/DriverForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminNewDriverPage() {
  const router = useRouter()

  async function handleSubmit(data: {
    name: string
    email: string
    phone: string
    licenceNumber: string
    vehicleId: string | null
    isAvailable: boolean
  }) {
    const res = await fetch("/api/admin/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.error ?? "Failed to create driver")
    }
    router.push("/admin/drivers")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Driver</h1>
      <Card>
        <CardHeader>
          <CardTitle>Driver Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DriverForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  )
}
