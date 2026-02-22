"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface VehicleClassRow {
  id: string
  name: string
  description: string
  maxPassengers: number
  maxLuggage: number
  baseRatePerKm: string
  minimumFare: string
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
}

interface VehicleClassTableProps {
  vehicleClasses: VehicleClassRow[]
  onSave: (id: string, data: Partial<VehicleClassRow>) => Promise<void>
}

export function VehicleClassTable({ vehicleClasses, onSave }: VehicleClassTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<VehicleClassRow>>({})
  const [isSaving, setIsSaving] = useState(false)

  function startEditing(vc: VehicleClassRow) {
    setEditingId(vc.id)
    setEditForm({
      name: vc.name,
      description: vc.description,
      baseRatePerKm: vc.baseRatePerKm,
      minimumFare: vc.minimumFare,
      maxPassengers: vc.maxPassengers,
      maxLuggage: vc.maxLuggage,
      sortOrder: vc.sortOrder,
      imageUrl: vc.imageUrl,
      isActive: vc.isActive,
    })
  }

  async function handleSave() {
    if (!editingId) return
    setIsSaving(true)
    try {
      await onSave(editingId, {
        ...editForm,
        baseRatePerKm: editForm.baseRatePerKm,
        minimumFare: editForm.minimumFare,
      })
      setEditingId(null)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="px-4 py-3 text-left font-medium">Description</th>
            <th className="px-4 py-3 text-left font-medium">Rate/km (£)</th>
            <th className="px-4 py-3 text-left font-medium">Min Fare (£)</th>
            <th className="px-4 py-3 text-left font-medium">Max Pax</th>
            <th className="px-4 py-3 text-left font-medium">Max Luggage</th>
            <th className="px-4 py-3 text-left font-medium">Sort</th>
            <th className="px-4 py-3 text-left font-medium">Active</th>
            <th className="px-4 py-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {vehicleClasses.map((vc) => (
            <tr key={vc.id} className="hover:bg-muted/30">
              <td className="px-4 py-3">
                {editingId === vc.id ? (
                  <Input
                    value={editForm.name ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    className="h-8 w-32"
                  />
                ) : (
                  <span className="font-medium">{vc.name}</span>
                )}
              </td>
              <td className="px-4 py-3">
                {editingId === vc.id ? (
                  <Input
                    value={editForm.description ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    className="h-8 w-48"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">{vc.description}</span>
                )}
              </td>
              <td className="px-4 py-3">
                {editingId === vc.id ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.baseRatePerKm ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, baseRatePerKm: e.target.value }))}
                    className="h-8 w-24"
                  />
                ) : (
                  `£${parseFloat(vc.baseRatePerKm).toFixed(2)}`
                )}
              </td>
              <td className="px-4 py-3">
                {editingId === vc.id ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.minimumFare ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, minimumFare: e.target.value }))}
                    className="h-8 w-24"
                  />
                ) : (
                  `£${parseFloat(vc.minimumFare).toFixed(2)}`
                )}
              </td>
              <td className="px-4 py-3">
                {editingId === vc.id ? (
                  <Input
                    type="number"
                    value={editForm.maxPassengers ?? 0}
                    onChange={(e) => setEditForm((f) => ({ ...f, maxPassengers: parseInt(e.target.value, 10) }))}
                    className="h-8 w-16"
                  />
                ) : (
                  vc.maxPassengers
                )}
              </td>
              <td className="px-4 py-3">
                {editingId === vc.id ? (
                  <Input
                    type="number"
                    value={editForm.maxLuggage ?? 0}
                    onChange={(e) => setEditForm((f) => ({ ...f, maxLuggage: parseInt(e.target.value, 10) }))}
                    className="h-8 w-16"
                  />
                ) : (
                  vc.maxLuggage
                )}
              </td>
              <td className="px-4 py-3">
                {editingId === vc.id ? (
                  <Input
                    type="number"
                    value={editForm.sortOrder ?? 0}
                    onChange={(e) => setEditForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) }))}
                    className="h-8 w-16"
                  />
                ) : (
                  vc.sortOrder
                )}
              </td>
              <td className="px-4 py-3">
                {editingId === vc.id ? (
                  <input
                    type="checkbox"
                    checked={editForm.isActive ?? true}
                    onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="h-4 w-4"
                  />
                ) : (
                  <span className={vc.isActive ? "text-green-600" : "text-red-600"}>
                    {vc.isActive ? "Yes" : "No"}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                {editingId === vc.id ? (
                  <div className="flex gap-1">
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? "..." : "Save"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => startEditing(vc)}>
                    Edit
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
