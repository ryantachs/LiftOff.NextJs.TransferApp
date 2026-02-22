"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge"
import { AuditTrailTable } from "@/components/admin/AuditTrailTable"
import { StatusTransitionButton } from "@/components/admin/StatusTransitionButton"
import { AssignDriverModal } from "@/components/admin/AssignDriverModal"
import { AdminCancelBookingModal } from "@/components/admin/CancelBookingModal"

interface BookingDetail {
  id: string
  reference: string
  status: string
  paymentMethod: string
  customer: { name: string; email: string; phone: string | null }
  journeyType: string
  pickupAddress: string
  dropoffAddress: string
  pickupDateTime: string
  passengers: number
  luggage: number
  flightNumber: string | null
  vehicleClass: { id: string; name: string; description: string }
  extras: unknown
  basePrice: string
  extrasPrice: string
  totalPrice: string
  currency: string
  paidAt: string | null
  driver: { id: string; name: string; email: string; phone: string } | null
  vehicle: { id: string; registration: string; make: string; model: string; colour: string } | null
  assignedAt: string | null
  specialRequests: string | null
  internalNotes: string | null
  cancelledAt: string | null
  cancellationReason: string | null
  createdAt: string
  updatedAt: string
  auditLogs: Array<{
    id: string
    action: string
    actor: string
    changes: Record<string, unknown>
    createdAt: string
  }>
}

export default function AdminBookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [internalNotes, setInternalNotes] = useState("")
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [userRole, setUserRole] = useState<string>("")

  const fetchBooking = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`)
      if (res.ok) {
        const data = await res.json()
        setBooking(data)
        setInternalNotes(data.internalNotes ?? "")
      }
    } catch {
      // error
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchBooking()
  }, [fetchBooking])

  // Fetch user role for cancel button visibility
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.role) setUserRole(data.user.role)
      })
      .catch(() => {})
  }, [])

  async function handleNotesBlur() {
    if (!booking || internalNotes === (booking.internalNotes ?? "")) return

    await fetch(`/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ internalNotes }),
    })
  }

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading...</div>
  }

  if (!booking) {
    return <div className="py-12 text-center text-muted-foreground">Booking not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push("/admin/bookings")} className="mb-2">
            ← Back to Bookings
          </Button>
          <h1 className="text-2xl font-bold">Booking {booking.reference}</h1>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Journey Details */}
        <Card>
          <CardHeader>
            <CardTitle>Journey Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Journey Type</span>
              <span>{booking.journeyType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pickup</span>
              <span className="text-right max-w-[60%]">{booking.pickupAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dropoff</span>
              <span className="text-right max-w-[60%]">{booking.dropoffAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date/Time</span>
              <span>{new Date(booking.pickupDateTime).toLocaleString("en-GB")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Passengers</span>
              <span>{booking.passengers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Luggage</span>
              <span>{booking.luggage}</span>
            </div>
            {booking.flightNumber && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Flight</span>
                <span>{booking.flightNumber}</span>
              </div>
            )}
            {booking.specialRequests && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Special Requests</span>
                <span className="text-right max-w-[60%]">{booking.specialRequests}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer & Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Customer & Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer</span>
              <span>{booking.customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{booking.customer.email}</span>
            </div>
            {booking.customer.phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span>{booking.customer.phone}</span>
              </div>
            )}
            <hr />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vehicle Class</span>
              <span>{booking.vehicleClass.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base Price</span>
              <span>{booking.currency} {booking.basePrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Extras</span>
              <span>{booking.currency} {booking.extrasPrice}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{booking.currency} {booking.totalPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span>{booking.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid At</span>
              <span>{booking.paidAt ? new Date(booking.paidAt).toLocaleString("en-GB") : "—"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Driver & Vehicle */}
        <Card>
          <CardHeader>
            <CardTitle>Driver & Vehicle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {booking.driver ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Driver</span>
                  <span>{booking.driver.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span>{booking.driver.phone}</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No driver assigned</p>
            )}
            {booking.vehicle ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle</span>
                  <span>{booking.vehicle.make} {booking.vehicle.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registration</span>
                  <span>{booking.vehicle.registration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Colour</span>
                  <span>{booking.vehicle.colour}</span>
                </div>
              </>
            ) : (
              !booking.driver && null
            )}
            {booking.assignedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assigned At</span>
                <span>{new Date(booking.assignedAt).toLocaleString("en-GB")}</span>
              </div>
            )}
            {booking.status === "CONFIRMED" && (
              <Button
                className="w-full mt-2"
                onClick={() => setShowAssignModal(true)}
              >
                Assign Driver
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Admin Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Advance Status</p>
              <StatusTransitionButton
                bookingId={booking.id}
                currentStatus={booking.status}
                onStatusChanged={fetchBooking}
              />
            </div>

            {userRole === "ADMIN" &&
              booking.status !== "CANCELLED" &&
              booking.status !== "COMPLETED" && (
                <div className="pt-4 border-t">
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelModal(true)}
                    className="w-full"
                  >
                    Cancel Booking
                  </Button>
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Internal Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Internal Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            rows={4}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add internal notes (auto-saves on blur)..."
          />
        </CardContent>
      </Card>

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditTrailTable logs={booking.auditLogs} />
        </CardContent>
      </Card>

      {/* Modals */}
      <AssignDriverModal
        bookingId={booking.id}
        vehicleClassId={booking.vehicleClass.id}
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssigned={() => {
          setShowAssignModal(false)
          fetchBooking()
        }}
      />
      <AdminCancelBookingModal
        bookingId={booking.id}
        reference={booking.reference}
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onCancelled={() => {
          setShowCancelModal(false)
          fetchBooking()
        }}
      />
    </div>
  )
}
