"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function QuoteFormPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)

    const data = {
      journeyType: formData.get("journeyType") as string,
      pickupAddress: formData.get("pickupAddress") as string,
      pickupLat: parseFloat(formData.get("pickupLat") as string),
      pickupLng: parseFloat(formData.get("pickupLng") as string),
      dropoffAddress: formData.get("dropoffAddress") as string,
      dropoffLat: parseFloat(formData.get("dropoffLat") as string),
      dropoffLng: parseFloat(formData.get("dropoffLng") as string),
      flightNumber: (formData.get("flightNumber") as string) || undefined,
      pickupDateTime: formData.get("pickupDateTime") as string,
      passengers: parseInt(formData.get("passengers") as string, 10),
      luggage: parseInt(formData.get("luggage") as string, 10),
    }

    if (isNaN(data.pickupLat) || isNaN(data.pickupLng) || isNaN(data.dropoffLat) || isNaN(data.dropoffLng)) {
      setError("Please select valid pickup and dropoff locations using the address fields.")
      setLoading(false)
      return
    }

    const response = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const result = await response.json()
      setError(result.error ?? "Failed to get quote")
      setLoading(false)
      return
    }

    const result = await response.json()
    sessionStorage.setItem(`quote-${result.quoteId}`, JSON.stringify(result))
    router.push(`/book/${result.quoteId}`)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Get a Quote</CardTitle>
          <CardDescription>Enter your journey details to see available vehicles and prices.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {typeof error === "string" ? error : "Validation error. Please check your inputs."}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="journeyType">Journey Type</Label>
              <Select id="journeyType" name="journeyType" required>
                <option value="PICKUP">Airport Pickup</option>
                <option value="DROPOFF">Airport Dropoff</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupAddress">Pickup Address</Label>
              <Input id="pickupAddress" name="pickupAddress" required placeholder="Enter pickup location" />
              <input type="hidden" name="pickupLat" />
              <input type="hidden" name="pickupLng" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dropoffAddress">Dropoff Address</Label>
              <Input id="dropoffAddress" name="dropoffAddress" required placeholder="Enter dropoff location" />
              <input type="hidden" name="dropoffLat" />
              <input type="hidden" name="dropoffLng" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="flightNumber">Flight Number (optional)</Label>
              <Input id="flightNumber" name="flightNumber" placeholder="e.g. BA1234" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pickupDateTime">Pickup Date &amp; Time</Label>
              <Input id="pickupDateTime" name="pickupDateTime" type="datetime-local" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passengers">Passengers</Label>
                <Input id="passengers" name="passengers" type="number" min={1} max={16} defaultValue={1} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="luggage">Luggage Items</Label>
                <Input id="luggage" name="luggage" type="number" min={0} max={20} defaultValue={1} required />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Getting quote..." : "Get Quote"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
