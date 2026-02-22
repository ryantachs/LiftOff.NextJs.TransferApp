"use client"

import { useState, useEffect, useCallback } from "react"
import { BookingTable } from "@/components/admin/BookingTable"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useSearchParams, useRouter } from "next/navigation"

const statuses = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]

export default function AdminBookingsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [bookings, setBookings] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const [filters, setFilters] = useState({
    status: searchParams.get("status") ?? "",
    search: searchParams.get("search") ?? "",
    dateFrom: searchParams.get("dateFrom") ?? "",
    dateTo: searchParams.get("dateTo") ?? "",
    vehicleClassId: searchParams.get("vehicleClassId") ?? "",
    driverId: searchParams.get("driverId") ?? "",
    sortBy: searchParams.get("sortBy") ?? "pickupDateTime",
    sortDir: searchParams.get("sortDir") ?? "desc",
    page: parseInt(searchParams.get("page") ?? "1", 10),
  })

  const fetchBookings = useCallback(async () => {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (filters.status) params.set("status", filters.status)
    if (filters.search) params.set("search", filters.search)
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom)
    if (filters.dateTo) params.set("dateTo", filters.dateTo)
    if (filters.vehicleClassId) params.set("vehicleClassId", filters.vehicleClassId)
    if (filters.driverId) params.set("driverId", filters.driverId)
    params.set("sortBy", filters.sortBy)
    params.set("sortDir", filters.sortDir)
    params.set("page", filters.page.toString())

    try {
      const res = await fetch(`/api/admin/bookings?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings)
        setTotalPages(data.totalPages)
      }
    } catch {
      // Network error
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  function updateFilter(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  function handlePageChange(page: number) {
    setFilters((prev) => ({ ...prev, page }))
  }

  function handleReset() {
    setFilters({
      status: "",
      search: "",
      dateFrom: "",
      dateTo: "",
      vehicleClassId: "",
      driverId: "",
      sortBy: "pickupDateTime",
      sortDir: "desc",
      page: 1,
    })
    router.replace("/admin/bookings")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <Button onClick={() => router.push("/admin/bookings/new")}>
          Create Booking
        </Button>
      </div>

      {/* Filters */}
      <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>Search</Label>
          <Input
            placeholder="Reference, name, email..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
          >
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date From</Label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilter("dateFrom", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Date To</Label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => updateFilter("dateTo", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Sort By</Label>
          <Select
            value={filters.sortBy}
            onChange={(e) => updateFilter("sortBy", e.target.value)}
          >
            <option value="pickupDateTime">Pickup Date</option>
            <option value="createdAt">Created Date</option>
            <option value="totalPrice">Total Price</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Sort Direction</Label>
          <Select
            value={filters.sortDir}
            onChange={(e) => updateFilter("sortDir", e.target.value)}
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </Select>
        </div>
        <div className="flex items-end">
          <Button variant="outline" onClick={handleReset}>
            Reset Filters
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading bookings...</div>
      ) : (
        <BookingTable
          bookings={bookings}
          page={filters.page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}
