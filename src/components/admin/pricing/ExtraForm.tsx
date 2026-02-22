"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface VehicleClass {
  id: string
  name: string
}

interface ExtraFormProps {
  vehicleClasses: VehicleClass[]
  initialData?: {
    name: string
    description: string | null
    price: string
    isPercentage: boolean
    sortOrder: number
    isActive: boolean
    vehicleClasses: { id: string }[]
  }
  onSubmit: (data: {
    name: string
    description: string | null
    price: number
    isPercentage: boolean
    sortOrder: number
    isActive: boolean
    vehicleClassIds: string[]
  }) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
}

export function ExtraForm({
  vehicleClasses,
  initialData,
  onSubmit,
  onCancel,
  isEdit,
}: ExtraFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price ?? "0",
    isPercentage: initialData?.isPercentage ?? false,
    sortOrder: initialData?.sortOrder ?? 0,
    isActive: initialData?.isActive ?? true,
    vehicleClassIds: initialData?.vehicleClasses.map((vc) => vc.id) ?? [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)
    try {
      await onSubmit({
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price),
        isPercentage: form.isPercentage,
        sortOrder: form.sortOrder,
        isActive: form.isActive,
        vehicleClassIds: form.vehicleClassIds,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  function toggleVehicleClass(id: string) {
    setForm((f) => ({
      ...f,
      vehicleClassIds: f.vehicleClassIds.includes(id)
        ? f.vehicleClassIds.filter((vcId) => vcId !== id)
        : [...f.vehicleClassIds, id],
    }))
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold">
        {isEdit ? "Edit Extra" : "Create Extra"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="extra-name">Name</Label>
            <Input
              id="extra-name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="extra-description">Description</Label>
            <Input
              id="extra-description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="extra-price">Price</Label>
            <Input
              id="extra-price"
              type="number"
              step="0.01"
              min="0"
              required
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="extra-sortOrder">Sort Order</Label>
            <Input
              id="extra-sortOrder"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              id="extra-isPercentage"
              type="checkbox"
              checked={form.isPercentage}
              onChange={(e) => setForm((f) => ({ ...f, isPercentage: e.target.checked }))}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="extra-isPercentage">Price is percentage of base fare</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="extra-isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="extra-isActive">Active</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Applicable Vehicle Classes (empty = all)</Label>
          <div className="flex flex-wrap gap-2">
            {vehicleClasses.map((vc) => (
              <button
                key={vc.id}
                type="button"
                onClick={() => toggleVehicleClass(vc.id)}
                className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                  form.vehicleClassIds.includes(vc.id)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input hover:bg-muted"
                }`}
              >
                {vc.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
