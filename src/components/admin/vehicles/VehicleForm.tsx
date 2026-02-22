"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { AssignDriverSelect } from "./AssignDriverSelect"

interface VehicleClass {
  id: string
  name: string
}

interface VehicleFormProps {
  vehicleClasses: VehicleClass[]
  currentDriverId?: string | null
  initialData?: {
    registration: string
    make: string
    model: string
    year: number
    colour: string
    vehicleClassId: string
    motExpiry: string | null
    serviceExpiry: string | null
    isActive: boolean
  }
  onSubmit: (data: {
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
  }) => Promise<void>
  isEdit?: boolean
}

export function VehicleForm({
  vehicleClasses,
  currentDriverId,
  initialData,
  onSubmit,
  isEdit,
}: VehicleFormProps) {
  const [form, setForm] = useState({
    registration: initialData?.registration ?? "",
    make: initialData?.make ?? "",
    model: initialData?.model ?? "",
    year: initialData?.year ?? new Date().getFullYear(),
    colour: initialData?.colour ?? "",
    vehicleClassId: initialData?.vehicleClassId ?? vehicleClasses[0]?.id ?? "",
    motExpiry: initialData?.motExpiry
      ? initialData.motExpiry.substring(0, 10)
      : "",
    serviceExpiry: initialData?.serviceExpiry
      ? initialData.serviceExpiry.substring(0, 10)
      : "",
    isActive: initialData?.isActive ?? true,
    driverId: currentDriverId ?? null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)
    try {
      await onSubmit({
        registration: form.registration.toUpperCase(),
        make: form.make,
        model: form.model,
        year: form.year,
        colour: form.colour,
        vehicleClassId: form.vehicleClassId,
        motExpiry: form.motExpiry
          ? new Date(form.motExpiry).toISOString()
          : null,
        serviceExpiry: form.serviceExpiry
          ? new Date(form.serviceExpiry).toISOString()
          : null,
        isActive: form.isActive,
        driverId: isEdit ? form.driverId : undefined,
      })
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
          <Label htmlFor="registration">Registration</Label>
          <Input
            id="registration"
            required
            minLength={2}
            maxLength={10}
            value={form.registration}
            onChange={(e) =>
              setForm((f) => ({ ...f, registration: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="make">Make</Label>
          <Input
            id="make"
            required
            value={form.make}
            onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            required
            value={form.model}
            onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            required
            min={2000}
            max={new Date().getFullYear() + 1}
            value={form.year}
            onChange={(e) =>
              setForm((f) => ({ ...f, year: parseInt(e.target.value, 10) }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="colour">Colour</Label>
          <Input
            id="colour"
            required
            value={form.colour}
            onChange={(e) =>
              setForm((f) => ({ ...f, colour: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vehicleClassId">Vehicle Class</Label>
          <Select
            id="vehicleClassId"
            value={form.vehicleClassId}
            onChange={(e) =>
              setForm((f) => ({ ...f, vehicleClassId: e.target.value }))
            }
          >
            {vehicleClasses.map((vc) => (
              <option key={vc.id} value={vc.id}>
                {vc.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="motExpiry">MOT Expiry</Label>
          <Input
            id="motExpiry"
            type="date"
            value={form.motExpiry}
            onChange={(e) =>
              setForm((f) => ({ ...f, motExpiry: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="serviceExpiry">Service Expiry</Label>
          <Input
            id="serviceExpiry"
            type="date"
            value={form.serviceExpiry}
            onChange={(e) =>
              setForm((f) => ({ ...f, serviceExpiry: e.target.value }))
            }
          />
        </div>
      </div>

      {isEdit && (
        <div className="space-y-2">
          <Label htmlFor="driverId">Assigned Driver</Label>
          <AssignDriverSelect
            currentDriverId={form.driverId}
            onChange={(driverId) => setForm((f) => ({ ...f, driverId }))}
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          id="isActive"
          type="checkbox"
          checked={form.isActive}
          onChange={(e) =>
            setForm((f) => ({ ...f, isActive: e.target.checked }))
          }
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? "Saving..."
          : isEdit
            ? "Update Vehicle"
            : "Create Vehicle"}
      </Button>
    </form>
  )
}
