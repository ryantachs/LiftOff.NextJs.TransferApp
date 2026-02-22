"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"

interface VehicleClassOption {
  id: string
  name: string
}

interface ManualBookingFormProps {
  vehicleClasses: VehicleClassOption[]
}

export function ManualBookingForm({ vehicleClasses }: ManualBookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState<{ reference: string; totalPrice: string } | null>(null)

  const [form, setForm] = useState({
    customerEmail: "",
    customerName: "",
    pickupAddress: "",
    dropoffAddress: "",
    pickupDateTime: "",
    passengers: "1",
    luggage: "0",
    vehicleClassId: "",
    flightNumber: "",
    specialRequests: "",
    distanceKm: "10",
    markAsPaid: false,
  })

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess(null)

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          passengers: parseInt(form.passengers, 10),
          luggage: parseInt(form.luggage, 10),
          distanceKm: parseFloat(form.distanceKm),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to create booking")
        return
      }

      const data = await res.json()
      setSuccess({ reference: data.reference, totalPrice: data.totalPrice })
      setForm({
        customerEmail: "",
        customerName: "",
        pickupAddress: "",
        dropoffAddress: "",
        pickupDateTime: "",
        passengers: "1",
        luggage: "0",
        vehicleClassId: "",
        flightNumber: "",
        specialRequests: "",
        distanceKm: "10",
        markAsPaid: false,
      })
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            Booking created successfully!
          </p>
          <p className="text-sm text-green-700">
            Reference: <strong>{success.reference}</strong> — Total: £{success.totalPrice}
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="text-sm font-semibold px-2">Customer</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email *</Label>
            <Input
              id="customerEmail"
              type="email"
              required
              value={form.customerEmail}
              onChange={(e) => updateField("customerEmail", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerName">Name</Label>
            <Input
              id="customerName"
              value={form.customerName}
              onChange={(e) => updateField("customerName", e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="text-sm font-semibold px-2">Journey Details</legend>
        <div className="space-y-2">
          <Label htmlFor="pickupAddress">Pickup Address *</Label>
          <Input
            id="pickupAddress"
            required
            value={form.pickupAddress}
            onChange={(e) => updateField("pickupAddress", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dropoffAddress">Dropoff Address *</Label>
          <Input
            id="dropoffAddress"
            required
            value={form.dropoffAddress}
            onChange={(e) => updateField("dropoffAddress", e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pickupDateTime">Pickup Date/Time *</Label>
            <Input
              id="pickupDateTime"
              type="datetime-local"
              required
              value={form.pickupDateTime}
              onChange={(e) => updateField("pickupDateTime", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="distanceKm">Distance (km)</Label>
            <Input
              id="distanceKm"
              type="number"
              step="0.1"
              min="0"
              value={form.distanceKm}
              onChange={(e) => updateField("distanceKm", e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="passengers">Passengers</Label>
            <Input
              id="passengers"
              type="number"
              min="1"
              value={form.passengers}
              onChange={(e) => updateField("passengers", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="luggage">Luggage</Label>
            <Input
              id="luggage"
              type="number"
              min="0"
              value={form.luggage}
              onChange={(e) => updateField("luggage", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flightNumber">Flight Number</Label>
            <Input
              id="flightNumber"
              value={form.flightNumber}
              onChange={(e) => updateField("flightNumber", e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="text-sm font-semibold px-2">Vehicle & Extras</legend>
        <div className="space-y-2">
          <Label htmlFor="vehicleClassId">Vehicle Class *</Label>
          <Select
            id="vehicleClassId"
            required
            value={form.vehicleClassId}
            onChange={(e) => updateField("vehicleClassId", e.target.value)}
          >
            <option value="">Select vehicle class...</option>
            {vehicleClasses.map((vc) => (
              <option key={vc.id} value={vc.id}>
                {vc.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialRequests">Special Requests</Label>
          <Input
            id="specialRequests"
            value={form.specialRequests}
            onChange={(e) => updateField("specialRequests", e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-lg border p-4">
        <legend className="text-sm font-semibold px-2">Payment</legend>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.markAsPaid}
            onChange={(e) => updateField("markAsPaid", e.target.checked)}
            className="rounded border"
          />
          <span className="text-sm">Mark as paid (cash/phone card)</span>
        </label>
        <p className="text-xs text-muted-foreground">
          Manual bookings bypass Stripe. Check this if payment has already been received.
        </p>
      </fieldset>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Creating Booking..." : "Create Booking"}
      </Button>
    </form>
  )
}
