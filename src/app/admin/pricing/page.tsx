"use client"

import { useState, useEffect, useCallback } from "react"
import { VehicleClassTable } from "@/components/admin/pricing/VehicleClassTable"
import { ExtrasTable } from "@/components/admin/pricing/ExtrasTable"
import { ExtraForm } from "@/components/admin/pricing/ExtraForm"
import { PricingRuleTable } from "@/components/admin/pricing/PricingRuleTable"
import { PricingRuleForm } from "@/components/admin/pricing/PricingRuleForm"
import { PriceCalculator } from "@/components/admin/pricing/PriceCalculator"
import { Button } from "@/components/ui/button"

type Tab = "classes" | "extras" | "rules" | "calculator"

interface VehicleClass {
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

interface Extra {
  id: string
  name: string
  description: string | null
  price: string
  isPercentage: boolean
  sortOrder: number
  isActive: boolean
  vehicleClasses: { id: string; name: string }[]
}

interface PricingRule {
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

export default function AdminPricingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("classes")
  const [vehicleClasses, setVehicleClasses] = useState<VehicleClass[]>([])
  const [extras, setExtras] = useState<Extra[]>([])
  const [rules, setRules] = useState<PricingRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showExtraForm, setShowExtraForm] = useState(false)
  const [editingExtra, setEditingExtra] = useState<Extra | null>(null)
  const [showRuleForm, setShowRuleForm] = useState(false)
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [classesRes, extrasRes, rulesRes] = await Promise.all([
        fetch("/api/admin/vehicle-classes"),
        fetch("/api/admin/extras"),
        fetch("/api/admin/pricing-rules"),
      ])
      if (classesRes.ok) {
        const data = await classesRes.json()
        setVehicleClasses(data.vehicleClasses)
      }
      if (extrasRes.ok) {
        const data = await extrasRes.json()
        setExtras(data.extras)
      }
      if (rulesRes.ok) {
        const data = await rulesRes.json()
        setRules(data.rules)
      }
    } catch {
      // Network error
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Vehicle class handlers
  async function handleSaveVehicleClass(id: string, data: Partial<VehicleClass>) {
    const res = await fetch(`/api/admin/vehicle-classes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        baseRatePerKm: data.baseRatePerKm !== undefined ? Number(data.baseRatePerKm) : undefined,
        minimumFare: data.minimumFare !== undefined ? Number(data.minimumFare) : undefined,
        maxPassengers: data.maxPassengers,
        maxLuggage: data.maxLuggage,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        imageUrl: data.imageUrl,
      }),
    })
    if (res.ok) fetchData()
  }

  // Extra handlers
  async function handleCreateExtra(data: {
    name: string
    description: string | null
    price: number
    isPercentage: boolean
    sortOrder: number
    isActive: boolean
    vehicleClassIds: string[]
  }) {
    const res = await fetch("/api/admin/extras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.error ?? "Failed to create extra")
    }
    setShowExtraForm(false)
    setEditingExtra(null)
    fetchData()
  }

  async function handleUpdateExtra(data: {
    name: string
    description: string | null
    price: number
    isPercentage: boolean
    sortOrder: number
    isActive: boolean
    vehicleClassIds: string[]
  }) {
    if (!editingExtra) return
    const res = await fetch(`/api/admin/extras/${editingExtra.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.error ?? "Failed to update extra")
    }
    setShowExtraForm(false)
    setEditingExtra(null)
    fetchData()
  }

  async function handleDeleteExtra(id: string) {
    if (!confirm("Delete this extra?")) return
    const res = await fetch(`/api/admin/extras/${id}`, { method: "DELETE" })
    if (res.ok) fetchData()
  }

  async function handleToggleExtraActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/extras/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    })
    fetchData()
  }

  // Pricing rule handlers
  async function handleCreateRule(data: {
    name: string
    type: "SURCHARGE" | "DISCOUNT"
    value: number
    isPercentage: boolean
    appliesFrom: string | null
    appliesTo: string | null
    daysOfWeek: number[]
    vehicleClassId: string | null
    isActive: boolean
  }) {
    const res = await fetch("/api/admin/pricing-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.error ?? "Failed to create rule")
    }
    setShowRuleForm(false)
    setEditingRule(null)
    fetchData()
  }

  async function handleUpdateRule(data: {
    name: string
    type: "SURCHARGE" | "DISCOUNT"
    value: number
    isPercentage: boolean
    appliesFrom: string | null
    appliesTo: string | null
    daysOfWeek: number[]
    vehicleClassId: string | null
    isActive: boolean
  }) {
    if (!editingRule) return
    const res = await fetch(`/api/admin/pricing-rules/${editingRule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.error ?? "Failed to update rule")
    }
    setShowRuleForm(false)
    setEditingRule(null)
    fetchData()
  }

  async function handleDeleteRule(id: string) {
    if (!confirm("Delete this pricing rule?")) return
    const res = await fetch(`/api/admin/pricing-rules/${id}`, { method: "DELETE" })
    if (res.ok) fetchData()
  }

  async function handleToggleRuleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/pricing-rules/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    })
    fetchData()
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "classes", label: "Vehicle Classes" },
    { key: "extras", label: "Extras" },
    { key: "rules", label: "Pricing Rules" },
    { key: "calculator", label: "Price Calculator" },
  ]

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading pricing data...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pricing Management</h1>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "classes" && (
        <VehicleClassTable
          vehicleClasses={vehicleClasses}
          onSave={handleSaveVehicleClass}
        />
      )}

      {activeTab === "extras" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditingExtra(null)
                setShowExtraForm(true)
              }}
            >
              Add Extra
            </Button>
          </div>

          {(showExtraForm || editingExtra) && (
            <ExtraForm
              vehicleClasses={vehicleClasses}
              initialData={
                editingExtra
                  ? {
                      name: editingExtra.name,
                      description: editingExtra.description,
                      price: editingExtra.price,
                      isPercentage: editingExtra.isPercentage,
                      sortOrder: editingExtra.sortOrder,
                      isActive: editingExtra.isActive,
                      vehicleClasses: editingExtra.vehicleClasses,
                    }
                  : undefined
              }
              onSubmit={editingExtra ? handleUpdateExtra : handleCreateExtra}
              onCancel={() => {
                setShowExtraForm(false)
                setEditingExtra(null)
              }}
              isEdit={!!editingExtra}
            />
          )}

          <ExtrasTable
            extras={extras}
            onEdit={(extra) => {
              setEditingExtra(extra)
              setShowExtraForm(true)
            }}
            onDelete={handleDeleteExtra}
            onToggleActive={handleToggleExtraActive}
          />
        </div>
      )}

      {activeTab === "rules" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditingRule(null)
                setShowRuleForm(true)
              }}
            >
              Add Pricing Rule
            </Button>
          </div>

          {(showRuleForm || editingRule) && (
            <PricingRuleForm
              vehicleClasses={vehicleClasses}
              initialData={
                editingRule
                  ? {
                      name: editingRule.name,
                      type: editingRule.type,
                      value: editingRule.value,
                      isPercentage: editingRule.isPercentage,
                      appliesFrom: editingRule.appliesFrom,
                      appliesTo: editingRule.appliesTo,
                      daysOfWeek: editingRule.daysOfWeek,
                      vehicleClassId: editingRule.vehicleClassId,
                      isActive: editingRule.isActive,
                    }
                  : undefined
              }
              onSubmit={editingRule ? handleUpdateRule : handleCreateRule}
              onCancel={() => {
                setShowRuleForm(false)
                setEditingRule(null)
              }}
              isEdit={!!editingRule}
            />
          )}

          <PricingRuleTable
            rules={rules}
            vehicleClasses={vehicleClasses}
            onEdit={(rule) => {
              setEditingRule(rule)
              setShowRuleForm(true)
            }}
            onDelete={handleDeleteRule}
            onToggleActive={handleToggleRuleActive}
          />
        </div>
      )}

      {activeTab === "calculator" && (
        <PriceCalculator
          vehicleClasses={vehicleClasses}
          extras={extras.filter((e) => e.isActive)}
        />
      )}
    </div>
  )
}
