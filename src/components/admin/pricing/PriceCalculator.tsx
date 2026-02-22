"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface VehicleClass {
  id: string
  name: string
}

interface Extra {
  id: string
  name: string
  price: string
  isPercentage: boolean
}

interface CalculationResult {
  distanceKm: number
  ratePerKm: string
  rawBasePrice: string
  minimumFareApplied: boolean
  minimumFare: string
  rulesApplied: {
    name: string
    type: string
    value: string
    isPercentage: boolean
    effect: string
  }[]
  basePriceAfterRules: string
  extras: { id: string; name: string; price: string }[]
  extrasTotal: string
  totalPrice: string
}

interface PriceCalculatorProps {
  vehicleClasses: VehicleClass[]
  extras: Extra[]
}

export function PriceCalculator({ vehicleClasses, extras }: PriceCalculatorProps) {
  const [form, setForm] = useState({
    pickupAddress: "",
    dropoffAddress: "",
    pickupDateTime: "",
    distanceKm: "",
    passengers: "1",
    vehicleClassId: vehicleClasses[0]?.id ?? "",
    selectedExtras: [] as string[],
  })
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState("")

  async function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsCalculating(true)
    setResult(null)

    try {
      const res = await fetch("/api/admin/pricing/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleClassId: form.vehicleClassId,
          distanceKm: parseFloat(form.distanceKm),
          pickupDateTime: new Date(form.pickupDateTime).toISOString(),
          extras: form.selectedExtras,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Calculation failed")
      }

      setResult(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsCalculating(false)
    }
  }

  function toggleExtra(id: string) {
    setForm((f) => ({
      ...f,
      selectedExtras: f.selectedExtras.includes(id)
        ? f.selectedExtras.filter((eid) => eid !== id)
        : [...f.selectedExtras, id],
    }))
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Price Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCalculate} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="calc-pickup">Pickup Address</Label>
              <Input
                id="calc-pickup"
                placeholder="e.g. Heathrow Airport Terminal 5"
                value={form.pickupAddress}
                onChange={(e) => setForm((f) => ({ ...f, pickupAddress: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calc-dropoff">Dropoff Address</Label>
              <Input
                id="calc-dropoff"
                placeholder="e.g. 10 Downing Street, London"
                value={form.dropoffAddress}
                onChange={(e) => setForm((f) => ({ ...f, dropoffAddress: e.target.value }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="calc-datetime">Date &amp; Time</Label>
                <Input
                  id="calc-datetime"
                  type="datetime-local"
                  required
                  value={form.pickupDateTime}
                  onChange={(e) => setForm((f) => ({ ...f, pickupDateTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calc-distance">Distance (km)</Label>
                <Input
                  id="calc-distance"
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={form.distanceKm}
                  onChange={(e) => setForm((f) => ({ ...f, distanceKm: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calc-passengers">Passengers</Label>
                <Input
                  id="calc-passengers"
                  type="number"
                  min="1"
                  value={form.passengers}
                  onChange={(e) => setForm((f) => ({ ...f, passengers: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calc-vehicleClass">Vehicle Class</Label>
                <Select
                  id="calc-vehicleClass"
                  value={form.vehicleClassId}
                  onChange={(e) => setForm((f) => ({ ...f, vehicleClassId: e.target.value }))}
                >
                  {vehicleClasses.map((vc) => (
                    <option key={vc.id} value={vc.id}>
                      {vc.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {extras.length > 0 && (
              <div className="space-y-2">
                <Label>Extras</Label>
                <div className="flex flex-wrap gap-2">
                  {extras.map((extra) => (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => toggleExtra(extra.id)}
                      className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                        form.selectedExtras.includes(extra.id)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input hover:bg-muted"
                      }`}
                    >
                      {extra.name} ({extra.isPercentage ? `${parseFloat(extra.price)}%` : `£${parseFloat(extra.price).toFixed(2)}`})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" disabled={isCalculating} className="w-full">
              {isCalculating ? "Calculating..." : "Calculate Price"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Price Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Distance</span>
                <span>{result.distanceKm} km</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">
                  Base rate: £{parseFloat(result.ratePerKm).toFixed(4)} / km × {result.distanceKm} km
                </span>
                <span>£{parseFloat(result.rawBasePrice).toFixed(2)}</span>
              </div>
              {result.minimumFareApplied && (
                <div className="flex justify-between border-b pb-2 text-amber-600">
                  <span>Minimum fare applied</span>
                  <span>£{parseFloat(result.minimumFare).toFixed(2)}</span>
                </div>
              )}

              {result.rulesApplied.length > 0 && (
                <div className="space-y-1 border-b pb-2">
                  <span className="text-sm font-medium">Rules Applied:</span>
                  {result.rulesApplied.map((rule, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {rule.name} ({rule.isPercentage ? `${parseFloat(rule.value)}%` : `£${parseFloat(rule.value).toFixed(2)}`})
                      </span>
                      <span className={rule.type === "SURCHARGE" ? "text-red-600" : "text-green-600"}>
                        {rule.effect}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Base price (after rules)</span>
                <span>£{parseFloat(result.basePriceAfterRules).toFixed(2)}</span>
              </div>

              {result.extras.length > 0 && (
                <div className="space-y-1 border-b pb-2">
                  <span className="text-sm font-medium">Extras:</span>
                  {result.extras.map((extra) => (
                    <div key={extra.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{extra.name}</span>
                      <span>£{parseFloat(extra.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between pt-2 text-lg font-bold">
                <span>Total</span>
                <span>£{parseFloat(result.totalPrice).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
