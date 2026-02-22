"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

type ReportType = "revenue" | "volume" | "utilisation" | "cancellations"

interface RevenueData {
  totalRevenue: string
  bookingCount: number
  averageFare: string
  breakdown: { vehicleClass: string; vehicleClassId: string; revenue: string; bookings: number }[]
  dailyRevenue: { date: string; revenue: number }[]
}

interface VolumeData {
  totalBookings: number
  statusCounts: Record<string, number>
  cancellationRate: string
  dailyVolume: Record<string, unknown>[]
}

interface UtilisationData {
  drivers: {
    driverName: string
    driverId: string
    completedBookings: number
    totalRevenue: string
  }[]
}

interface CancellationData {
  totalCancelled: number
  averageHoursToCancel: string
  byReason: { reason: string; count: number }[]
}

export default function ReportsPage() {
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [fromDate, setFromDate] = useState(
    thirtyDaysAgo.toISOString().split("T")[0]
  )
  const [toDate, setToDate] = useState(today.toISOString().split("T")[0])
  const [activeTab, setActiveTab] = useState<ReportType>("revenue")
  const [loading, setLoading] = useState(false)
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [volumeData, setVolumeData] = useState<VolumeData | null>(null)
  const [utilisationData, setUtilisationData] =
    useState<UtilisationData | null>(null)
  const [cancellationData, setCancellationData] =
    useState<CancellationData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchReport = useCallback(
    async (type: ReportType) => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(
          `/api/admin/reports?type=${type}&from=${fromDate}&to=${toDate}`
        )
        if (!res.ok) {
          const body = await res.json()
          throw new Error(body.error ?? "Failed to fetch report")
        }
        const data = await res.json()
        switch (type) {
          case "revenue":
            setRevenueData(data)
            break
          case "volume":
            setVolumeData(data)
            break
          case "utilisation":
            setUtilisationData(data)
            break
          case "cancellations":
            setCancellationData(data)
            break
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    },
    [fromDate, toDate]
  )

  const exportCsv = useCallback(
    async (type: ReportType) => {
      const res = await fetch(
        `/api/admin/reports?type=${type}&from=${fromDate}&to=${toDate}&format=csv`
      )
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}-report-${fromDate}-${toDate}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    },
    [fromDate, toDate]
  )

  const tabs: { key: ReportType; label: string }[] = [
    { key: "revenue", label: "Revenue" },
    { key: "volume", label: "Booking Volume" },
    { key: "utilisation", label: "Driver Utilisation" },
    { key: "cancellations", label: "Cancellations" },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      {/* Date range + tabs */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label
            htmlFor="report-from"
            className="block text-sm font-medium text-muted-foreground mb-1"
          >
            From
          </label>
          <input
            id="report-from"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="report-to"
            className="block text-sm font-medium text-muted-foreground mb-1"
          >
            To
          </label>
          <input
            id="report-to"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={() => fetchReport(activeTab)}
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Generate Report"}
        </button>
        <button
          onClick={() => exportCsv(activeTab)}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-secondary"
        >
          Export CSV
        </button>
      </div>

      {/* Tabs */}
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

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Revenue Report */}
      {activeTab === "revenue" && revenueData && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">£{revenueData.totalRevenue}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Booking Count
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{revenueData.bookingCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Fare
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">£{revenueData.averageFare}</p>
              </CardContent>
            </Card>
          </div>

          {revenueData.dailyRevenue.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData.dailyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#2563eb" name="Revenue (£)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Revenue by Vehicle Class</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Vehicle Class</th>
                      <th className="px-4 py-2 text-left font-medium">Revenue</th>
                      <th className="px-4 py-2 text-left font-medium">Bookings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.breakdown.map((row) => (
                      <tr key={row.vehicleClassId} className="border-b">
                        <td className="px-4 py-2">{row.vehicleClass}</td>
                        <td className="px-4 py-2">£{row.revenue}</td>
                        <td className="px-4 py-2">{row.bookings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Volume Report */}
      {activeTab === "volume" && volumeData && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{volumeData.totalBookings}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Cancellation Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{volumeData.cancellationRate}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Status Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {Object.entries(volumeData.statusCounts).map(([status, count]) => (
                    <div key={status} className="flex justify-between">
                      <span>{status}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {volumeData.dailyVolume.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bookings by Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeData.dailyVolume}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="CONFIRMED" stackId="a" fill="#3b82f6" />
                      <Bar dataKey="COMPLETED" stackId="a" fill="#22c55e" />
                      <Bar dataKey="CANCELLED" stackId="a" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Utilisation Report */}
      {activeTab === "utilisation" && utilisationData && (
        <Card>
          <CardHeader>
            <CardTitle>Driver Utilisation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Driver</th>
                    <th className="px-4 py-2 text-left font-medium">Completed Bookings</th>
                    <th className="px-4 py-2 text-left font-medium">Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {utilisationData.drivers.map((row) => (
                    <tr key={row.driverId} className="border-b">
                      <td className="px-4 py-2">{row.driverName}</td>
                      <td className="px-4 py-2">{row.completedBookings}</td>
                      <td className="px-4 py-2">£{row.totalRevenue}</td>
                    </tr>
                  ))}
                  {utilisationData.drivers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                        No driver data for the selected period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancellation Report */}
      {activeTab === "cancellations" && cancellationData && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Cancellations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{cancellationData.totalCancelled}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Time to Cancel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {cancellationData.averageHoursToCancel}h
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cancellations by Reason</CardTitle>
            </CardHeader>
            <CardContent>
              {cancellationData.byReason.length > 0 ? (
                <>
                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cancellationData.byReason}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="reason" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#ef4444" name="Cancellations" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">Reason</th>
                          <th className="px-4 py-2 text-left font-medium">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cancellationData.byReason.map((row, index) => (
                          <tr key={`${row.reason}-${index}`} className="border-b">
                            <td className="px-4 py-2">{row.reason}</td>
                            <td className="px-4 py-2">{row.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No cancellations for the selected period.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state */}
      {!loading &&
        !error &&
        ((activeTab === "revenue" && !revenueData) ||
          (activeTab === "volume" && !volumeData) ||
          (activeTab === "utilisation" && !utilisationData) ||
          (activeTab === "cancellations" && !cancellationData)) && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Select a date range and click &quot;Generate Report&quot; to view data.
            </CardContent>
          </Card>
        )}
    </div>
  )
}
