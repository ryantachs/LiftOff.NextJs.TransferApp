"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ExtraRow {
  id: string
  name: string
  description: string | null
  price: string
  isPercentage: boolean
  sortOrder: number
  isActive: boolean
  vehicleClasses: { id: string; name: string }[]
}

interface ExtrasTableProps {
  extras: ExtraRow[]
  onEdit: (extra: ExtraRow) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
}

export function ExtrasTable({ extras, onEdit, onDelete, onToggleActive }: ExtrasTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="px-4 py-3 text-left font-medium">Description</th>
            <th className="px-4 py-3 text-left font-medium">Price</th>
            <th className="px-4 py-3 text-left font-medium">Vehicle Classes</th>
            <th className="px-4 py-3 text-left font-medium">Active</th>
            <th className="px-4 py-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {extras.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                No extras found
              </td>
            </tr>
          )}
          {extras.map((extra) => (
            <tr key={extra.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{extra.name}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {extra.description ?? "—"}
              </td>
              <td className="px-4 py-3">
                {extra.isPercentage
                  ? `${parseFloat(extra.price)}%`
                  : `£${parseFloat(extra.price).toFixed(2)}`}
              </td>
              <td className="px-4 py-3">
                {extra.vehicleClasses.length === 0 ? (
                  <span className="text-xs text-muted-foreground">All classes</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {extra.vehicleClasses.map((vc) => (
                      <Badge key={vc.id} variant="secondary" className="text-xs">
                        {vc.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onToggleActive(extra.id, !extra.isActive)}
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium transition-colors ${
                    extra.isActive
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }`}
                >
                  {extra.isActive ? "Active" : "Inactive"}
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(extra)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(extra.id)}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
