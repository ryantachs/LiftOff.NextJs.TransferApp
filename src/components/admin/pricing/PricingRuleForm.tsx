"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface VehicleClass {
  id: string
  name: string
}

interface PricingRuleFormProps {
  vehicleClasses: VehicleClass[]
  initialData?: {
    name: string
    type: string
    value: string
    isPercentage: boolean
    appliesFrom: string | null
    appliesTo: string | null
    daysOfWeek: number[]
    vehicleClassId: string | null
    isActive: boolean
  }
  onSubmit: (data: {
    name: string
    type: "SURCHARGE" | "DISCOUNT"
    value: number
    isPercentage: boolean
    appliesFrom: string | null
    appliesTo: string | null
    daysOfWeek: number[]
    vehicleClassId: string | null
    isActive: boolean
  }) => Promise<void>
  onCancel: () => void
  isEdit?: boolean
}

export function PricingRuleForm({
  vehicleClasses,
  initialData,
  onSubmit,
  onCancel,
  isEdit,
}: PricingRuleFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    type: (initialData?.type ?? "SURCHARGE") as "SURCHARGE" | "DISCOUNT",
    value: initialData?.value ?? "0",
    isPercentage: initialData?.isPercentage ?? false,
    appliesFrom: initialData?.appliesFrom
      ? initialData.appliesFrom.substring(0, 16)
      : "",
    appliesTo: initialData?.appliesTo
      ? initialData.appliesTo.substring(0, 16)
      : "",
    daysOfWeek: initialData?.daysOfWeek ?? [],
    vehicleClassId: initialData?.vehicleClassId ?? "",
    isActive: initialData?.isActive ?? true,
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
        type: form.type,
        value: parseFloat(form.value),
        isPercentage: form.isPercentage,
        appliesFrom: form.appliesFrom
          ? new Date(form.appliesFrom).toISOString()
          : null,
        appliesTo: form.appliesTo
          ? new Date(form.appliesTo).toISOString()
          : null,
        daysOfWeek: form.daysOfWeek,
        vehicleClassId: form.vehicleClassId || null,
        isActive: form.isActive,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  function toggleDay(day: number) {
    setForm((f) => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(day)
        ? f.daysOfWeek.filter((d) => d !== day)
        : [...f.daysOfWeek, day].sort(),
    }))
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold">
        {isEdit ? "Edit Pricing Rule" : "Create Pricing Rule"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rule-name">Name</Label>
            <Input
              id="rule-name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rule-type">Type</Label>
            <Select
              id="rule-type"
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  type: e.target.value as "SURCHARGE" | "DISCOUNT",
                }))
              }
            >
              <option value="SURCHARGE">Surcharge</option>
              <option value="DISCOUNT">Discount</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rule-value">Value</Label>
            <Input
              id="rule-value"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rule-vehicleClass">Vehicle Class</Label>
            <Select
              id="rule-vehicleClass"
              value={form.vehicleClassId}
              onChange={(e) =>
                setForm((f) => ({ ...f, vehicleClassId: e.target.value }))
              }
            >
              <option value="">All Classes</option>
              {vehicleClasses.map((vc) => (
                <option key={vc.id} value={vc.id}>
                  {vc.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rule-appliesFrom">Applies From</Label>
            <Input
              id="rule-appliesFrom"
              type="datetime-local"
              value={form.appliesFrom}
              onChange={(e) =>
                setForm((f) => ({ ...f, appliesFrom: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rule-appliesTo">Applies To</Label>
            <Input
              id="rule-appliesTo"
              type="datetime-local"
              value={form.appliesTo}
              onChange={(e) =>
                setForm((f) => ({ ...f, appliesTo: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              id="rule-isPercentage"
              type="checkbox"
              checked={form.isPercentage}
              onChange={(e) =>
                setForm((f) => ({ ...f, isPercentage: e.target.checked }))
              }
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="rule-isPercentage">Value is percentage</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="rule-isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((f) => ({ ...f, isActive: e.target.checked }))
              }
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="rule-isActive">Active</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Days of Week (empty = all days)</Label>
          <div className="flex flex-wrap gap-2">
            {dayNames.map((name, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                  form.daysOfWeek.includes(i)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input hover:bg-muted"
                }`}
              >
                {name}
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
