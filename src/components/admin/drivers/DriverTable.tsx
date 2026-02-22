"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface DriverRow {
  id: string
  name: string
  email: string
  phone: string
  licenceNumber: string
  isAvailable: boolean
  vehicle: {
    id: string
    registration: string
    make: string
    model: string
    motExpiry: string | null
    isActive: boolean
  } | null
  upcomingBookingsCount: number
}

interface DriverTableProps {
  drivers: DriverRow[]
  onToggleAvailability: (id: string, isAvailable: boolean) => void
}

function getMotBadge(vehicle: DriverRow["vehicle"]) {
  if (!vehicle) return null

  if (!vehicle.isActive) {
    return <Badge variant="destructive">Vehicle Inactive</Badge>
  }

  if (vehicle.motExpiry) {
    const expiry = new Date(vehicle.motExpiry)
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    if (expiry < now) {
      return <Badge variant="destructive">MOT Overdue</Badge>
    }
    if (expiry < thirtyDaysFromNow) {
      return <Badge className="bg-amber-500 text-white">MOT Expiring</Badge>
    }
  }

  return null
}

export function DriverTable({ drivers, onToggleAvailability }: DriverTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Name / Email</th>
            <th className="px-4 py-3 text-left font-medium">Phone</th>
            <th className="px-4 py-3 text-left font-medium">Assigned Vehicle</th>
            <th className="px-4 py-3 text-left font-medium">Available</th>
            <th className="px-4 py-3 text-left font-medium">Upcoming Bookings</th>
            <th className="px-4 py-3 text-left font-medium">Licence</th>
            <th className="px-4 py-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {drivers.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                No drivers found
              </td>
            </tr>
          )}
          {drivers.map((driver) => (
            <tr key={driver.id} className="hover:bg-muted/30">
              <td className="px-4 py-3">
                <div className="font-medium">{driver.name}</div>
                <div className="text-xs text-muted-foreground">{driver.email}</div>
              </td>
              <td className="px-4 py-3">{driver.phone}</td>
              <td className="px-4 py-3">
                {driver.vehicle ? (
                  <div className="flex items-center gap-2">
                    <span>
                      {driver.vehicle.registration} — {driver.vehicle.make} {driver.vehicle.model}
                    </span>
                    {getMotBadge(driver.vehicle)}
                  </div>
                ) : (
                  <span className="text-muted-foreground">No vehicle</span>
                )}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onToggleAvailability(driver.id, !driver.isAvailable)}
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium transition-colors ${
                    driver.isAvailable
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }`}
                >
                  {driver.isAvailable ? "Available" : "Unavailable"}
                </button>
              </td>
              <td className="px-4 py-3">{driver.upcomingBookingsCount}</td>
              <td className="px-4 py-3 font-mono text-xs">{driver.licenceNumber}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link href={`/admin/drivers/${driver.id}`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
