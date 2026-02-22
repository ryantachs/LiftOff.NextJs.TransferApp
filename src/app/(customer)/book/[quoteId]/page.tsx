"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Briefcase } from "lucide-react"

interface VehicleOption {
  id: string
  name: string
  description: string
  maxPassengers: number
  maxLuggage: number
  imageUrl: string | null
  price: string
}

interface QuoteData {
  quoteId: string
  distanceKm: number
  durationMins: number
  vehicleOptions: VehicleOption[]
  expiresAt: string
}

export default function VehicleSelectPage() {
  const router = useRouter()
  const params = useParams()
  const quoteId = params.quoteId as string
  const [selectedVehicle, setSelectedVehicle] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error] = useState(() => {
    if (typeof window === "undefined") return ""
    const stored = sessionStorage.getItem(`quote-${quoteId}`)
    if (!stored) return "Quote data not found. Please start a new quote."
    return ""
  })
  const [quoteData] = useState<QuoteData | null>(() => {
    if (typeof window === "undefined") return null
    const stored = sessionStorage.getItem(`quote-${quoteId}`)
    if (stored) return JSON.parse(stored) as QuoteData
    return null
  })

  async function handleContinue() {
    if (!selectedVehicle || !quoteData) return
    setLoading(true)

    // Store selection for the details page
    sessionStorage.setItem(
      `booking-draft`,
      JSON.stringify({
        quoteId,
        vehicleClassId: selectedVehicle,
        vehicle: quoteData.vehicleOptions.find((v) => v.id === selectedVehicle),
        distanceKm: quoteData.distanceKm,
        durationMins: quoteData.durationMins,
      })
    )

    router.push("/book/details")
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <Card>
          <CardContent className="py-12">
            <p className="text-destructive">{error}</p>
            <Button className="mt-4" onClick={() => router.push("/book")}>
              Start New Quote
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!quoteData) {
    return (
      <div className="mx-auto max-w-2xl text-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Select Your Vehicle</h1>
        <p className="text-muted-foreground">
          Distance: {quoteData.distanceKm.toFixed(1)} km · Estimated time: {quoteData.durationMins} min
        </p>
      </div>

      <div className="grid gap-4">
        {quoteData.vehicleOptions.map((vehicle) => (
          <Card
            key={vehicle.id}
            className={`cursor-pointer transition-colors ${
              selectedVehicle === vehicle.id ? "border-primary ring-2 ring-primary" : "hover:border-primary/50"
            }`}
            onClick={() => setSelectedVehicle(vehicle.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{vehicle.name}</CardTitle>
                  <CardDescription>{vehicle.description}</CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-1">
                  £{parseFloat(vehicle.price).toFixed(2)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> Up to {vehicle.maxPassengers} passengers
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" /> Up to {vehicle.maxLuggage} bags
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          size="lg"
          disabled={!selectedVehicle || loading}
          onClick={handleContinue}
        >
          {loading ? "Processing..." : "Continue to Review"}
        </Button>
      </div>
    </div>
  )
}
