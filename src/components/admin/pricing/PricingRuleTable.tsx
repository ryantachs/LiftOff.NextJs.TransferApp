"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface PricingRuleRow {
  id: string
  name: string
  type: string
  value: string
  isPercentage: boolean
  appliesFrom: string | null
  appliesTo: string | null
  daysOfWeek: number[]
  vehicleClassId: string | null
  isActive: boolean
}

interface PricingRuleTableProps {
  rules: PricingRuleRow[]
  vehicleClasses: { id: string; name: string }[]
  onEdit: (rule: PricingRuleRow) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
}

export function PricingRuleTable({
  rules,
  vehicleClasses,
  onEdit,
  onDelete,
  onToggleActive,
}: PricingRuleTableProps) {
  function getVehicleClassName(id: string | null) {
    if (!id) return "All"
    return vehicleClasses.find((vc) => vc.id === id)?.name ?? id
  }

  function formatDateRange(from: string | null, to: string | null) {
    if (!from && !to) return "Always"
    const f = from
      ? new Date(from).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "—"
    const t = to
      ? new Date(to).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "—"
    return `${f} → ${t}`
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="px-4 py-3 text-left font-medium">Type</th>
            <th className="px-4 py-3 text-left font-medium">Value</th>
            <th className="px-4 py-3 text-left font-medium">Date Range</th>
            <th className="px-4 py-3 text-left font-medium">Days</th>
            <th className="px-4 py-3 text-left font-medium">Vehicle Class</th>
            <th className="px-4 py-3 text-left font-medium">Active</th>
            <th className="px-4 py-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rules.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                No pricing rules found
              </td>
            </tr>
          )}
          {rules.map((rule) => (
            <tr key={rule.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{rule.name}</td>
              <td className="px-4 py-3">
                <Badge variant={rule.type === "SURCHARGE" ? "destructive" : "default"}>
                  {rule.type}
                </Badge>
              </td>
              <td className="px-4 py-3">
                {rule.isPercentage
                  ? `${parseFloat(rule.value)}%`
                  : `£${parseFloat(rule.value).toFixed(2)}`}
              </td>
              <td className="px-4 py-3 text-xs">
                {formatDateRange(rule.appliesFrom, rule.appliesTo)}
              </td>
              <td className="px-4 py-3">
                {rule.daysOfWeek.length === 0 ? (
                  <span className="text-xs text-muted-foreground">All days</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {rule.daysOfWeek.map((d) => (
                      <Badge key={d} variant="secondary" className="text-xs">
                        {dayNames[d]}
                      </Badge>
                    ))}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">{getVehicleClassName(rule.vehicleClassId)}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onToggleActive(rule.id, !rule.isActive)}
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium transition-colors ${
                    rule.isActive
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }`}
                >
                  {rule.isActive ? "Active" : "Inactive"}
                </button>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(rule)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(rule.id)}>
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
