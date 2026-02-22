"use client"

import { cn } from "@/lib/utils"

interface DispatchBooking {
  id: string
  reference: string
  status: string
  customerName: string
  pickupAddress: string
  dropoffAddress: string
  pickupDateTime: string
  vehicleClassName: string
  driverId: string | null
  driverName: string | null
}

interface DispatchTimelineProps {
  bookings: DispatchBooking[]
  date: string
}

const statusColors: Record<string, string> = {
  CONFIRMED: "bg-blue-200 border-blue-300 text-blue-900",
  ASSIGNED: "bg-indigo-200 border-indigo-300 text-indigo-900",
  IN_PROGRESS: "bg-purple-200 border-purple-300 text-purple-900",
  COMPLETED: "bg-green-200 border-green-300 text-green-900",
}

const hours = Array.from({ length: 19 }, (_, i) => i + 6) // 6am to midnight

export function DispatchTimeline({ bookings, date }: DispatchTimelineProps) {
  const assignedBookings = bookings.filter((b) => b.driverId)

  // Group by driver
  const driverBookings = new Map<string, DispatchBooking[]>()
  for (const b of assignedBookings) {
    const key = b.driverName ?? "Unknown"
    if (!driverBookings.has(key)) driverBookings.set(key, [])
    driverBookings.get(key)!.push(b)
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      {/* Header with hours */}
      <div className="flex border-b bg-muted/50">
        <div className="w-40 shrink-0 border-r px-4 py-2 text-sm font-medium">
          Driver
        </div>
        <div className="flex flex-1">
          {hours.map((h) => (
            <div
              key={h}
              className="min-w-[60px] flex-1 border-r px-1 py-2 text-center text-xs text-muted-foreground"
            >
              {h.toString().padStart(2, "0")}:00
            </div>
          ))}
        </div>
      </div>

      {/* Driver rows */}
      {Array.from(driverBookings.entries()).map(([driverName, driverBkgs]) => (
        <div key={driverName} className="flex border-b">
          <div className="w-40 shrink-0 border-r px-4 py-3 text-sm font-medium">
            {driverName}
          </div>
          <div className="relative flex flex-1">
            {hours.map((h) => (
              <div
                key={h}
                className="min-w-[60px] flex-1 border-r"
              />
            ))}
            {/* Booking blocks */}
            {driverBkgs.map((b) => {
              const pickupTime = new Date(b.pickupDateTime)
              const hour = pickupTime.getHours()
              const minute = pickupTime.getMinutes()
              const startPos = ((hour - 6) * 60 + minute) / (19 * 60) * 100

              return (
                <div
                  key={b.id}
                  className={cn(
                    "absolute top-1 h-8 rounded border px-2 py-1 text-xs truncate",
                    statusColors[b.status] ?? "bg-gray-200 border-gray-300"
                  )}
                  style={{
                    left: `${Math.max(0, Math.min(95, startPos))}%`,
                    width: "8%",
                  }}
                  title={`${b.reference}: ${b.pickupAddress} → ${b.dropoffAddress}`}
                >
                  {b.reference}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {driverBookings.size === 0 && (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          No assigned bookings for {date}
        </div>
      )}
    </div>
  )
}
