interface DistanceMatrixResult {
  distanceKm: number
  durationMins: number
}

export async function getDistanceMatrix(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<DistanceMatrixResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured")
  }

  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json")
  url.searchParams.set("origins", `${origin.lat},${origin.lng}`)
  url.searchParams.set("destinations", `${destination.lat},${destination.lng}`)
  url.searchParams.set("units", "metric")
  url.searchParams.set("key", apiKey)

  const response = await fetch(url.toString())
  const data = await response.json()

  if (data.status !== "OK") {
    throw new Error(`Distance Matrix API error: ${data.status}`)
  }

  const element = data.rows[0]?.elements[0]
  if (!element || element.status !== "OK") {
    throw new Error(`Route not found: ${element?.status ?? "unknown"}`)
  }

  return {
    distanceKm: element.distance.value / 1000,
    durationMins: Math.ceil(element.duration.value / 60),
  }
}
