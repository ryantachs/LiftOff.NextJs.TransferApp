"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AssignVehicleSelect } from "./AssignVehicleSelect"

interface DriverFormProps {
  initialData?: {
    name: string
    email: string
    phone: string
    licenceNumber: string
    vehicleId: string | null
    isAvailable: boolean
  }
  onSubmit: (data: {
    name: string
    email: string
    phone: string
    licenceNumber: string
    vehicleId: string | null
    isAvailable: boolean
  }) => Promise<void>
  isEdit?: boolean
}

export function DriverForm({ initialData, onSubmit, isEdit }: DriverFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    licenceNumber: initialData?.licenceNumber ?? "",
    vehicleId: initialData?.vehicleId ?? null,
    isAvailable: initialData?.isAvailable ?? true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            minLength={2}
            maxLength={100}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            required
            minLength={10}
            maxLength={20}
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="licenceNumber">Licence Number</Label>
          <Input
            id="licenceNumber"
            required
            minLength={5}
            maxLength={30}
            value={form.licenceNumber}
            onChange={(e) => setForm((f) => ({ ...f, licenceNumber: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vehicleId">Assigned Vehicle</Label>
        <AssignVehicleSelect
          currentVehicleId={form.vehicleId}
          onChange={(vehicleId) => setForm((f) => ({ ...f, vehicleId }))}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isAvailable"
          type="checkbox"
          checked={form.isAvailable}
          onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))}
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor="isAvailable">Available for dispatch</Label>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : isEdit ? "Update Driver" : "Create Driver"}
      </Button>
    </form>
  )
}
