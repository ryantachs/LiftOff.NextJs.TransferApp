"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExpiryDateCell } from "./ExpiryDateCell"

interface VehicleRow {
  id: string
  registration: string
  make: string
  model: string
  year: number
  colour: string
  vehicleClass: { id: string; name: string }
  driver: { id: string; name: string } | null
  motExpiry: string | null
  serviceExpiry: string | null
  isActive: boolean
}

interface VehicleTableProps {
  vehicles: VehicleRow[]
  onToggleActive: (id: string, isActive: boolean) => void
}

export function VehicleTable({ vehicles, onToggleActive }: VehicleTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Registration</th>
            <th className="px-4 py-3 text-left font-medium">Make / Model / Year</th>
            <th className="px-4 py-3 text-left font-medium">Colour</th>
            <th className="px-4 py-3 text-left font-medium">Class</th>
            <th className="px-4 py-3 text-left font-medium">Assigned Driver</th>
            <th className="px-4 py-3 text-left font-medium">MOT Expiry</th>
            <th className="px-4 py-3 text-left font-medium">Service Expiry</th>
            <th className="px-4 py-3 text-left font-medium">Active</th>
            <th className="px-4 py-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {vehicles.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                No vehicles found
              </td>
            </tr>
          )}
          {vehicles.map((vehicle) => (
            <tr key={vehicle.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-mono font-medium">{vehicle.registration}</td>
              <td className="px-4 py-3">
                {vehicle.make} {vehicle.model} ({vehicle.year})
              </td>
              <td className="px-4 py-3">{vehicle.colour}</td>
              <td className="px-4 py-3">
                <Badge variant="secondary">{vehicle.vehicleClass.name}</Badge>
              </td>
              <td className="px-4 py-3">
                {vehicle.driver ? (
                  <Link
                    href={`/admin/drivers/${vehicle.driver.id}`}
                    className="text-primary hover:underline"
                  >
                    {vehicle.driver.name}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </td>
              <td className="px-4 py-3">
                <ExpiryDateCell date={vehicle.motExpiry} />
              </td>
              <td className="px-4 py-3">
                <ExpiryDateCell date={vehicle.serviceExpiry} />
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onToggleActive(vehicle.id, !vehicle.isActive)}
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium transition-colors ${
                    vehicle.isActive
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }`}
                >
                  {vehicle.isActive ? "Active" : "Inactive"}
                </button>
              </td>
              <td className="px-4 py-3">
                <Link href={`/admin/vehicles/${vehicle.id}`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
