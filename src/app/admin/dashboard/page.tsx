import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const [todayBookings, unassignedCount, revenueMtd, expiringVehicles] =
    await Promise.all([
      prisma.booking.count({
        where: {
          pickupDateTime: { gte: startOfDay, lt: endOfDay },
          status: { notIn: ["CANCELLED", "PENDING_PAYMENT"] },
        },
      }),
      prisma.booking.count({
        where: { status: "CONFIRMED", driverId: null },
      }),
      prisma.booking.aggregate({
        where: {
          status: "COMPLETED",
          pickupDateTime: { gte: startOfMonth },
        },
        _sum: { totalPrice: true },
      }),
      prisma.vehicle.findMany({
        where: {
          isActive: true,
          OR: [
            { motExpiry: { lte: thirtyDaysFromNow } },
            { serviceExpiry: { lte: thirtyDaysFromNow } },
          ],
        },
        select: {
          id: true,
          registration: true,
          make: true,
          model: true,
          motExpiry: true,
          serviceExpiry: true,
        },
      }),
    ])

  const revenue = revenueMtd._sum.totalPrice?.toString() ?? "0"

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {"Today's Bookings"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{todayBookings}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unassigned Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold">{unassignedCount}</p>
              {unassignedCount > 0 && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                  Needs attention
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue MTD
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">£{revenue}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expiring Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{expiringVehicles.length}</p>
          </CardContent>
        </Card>
      </div>

      {unassignedCount > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-amber-800">
                  {unassignedCount} booking{unassignedCount !== 1 ? "s" : ""}{" "}
                  waiting for driver assignment
                </p>
                <p className="text-sm text-amber-700">
                  Go to bookings to assign drivers.
                </p>
              </div>
              <Link
                href="/admin/bookings?status=CONFIRMED"
                className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
              >
                View Bookings
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {expiringVehicles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vehicles with Expiring MOT/Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Vehicle</th>
                    <th className="px-4 py-2 text-left font-medium">Registration</th>
                    <th className="px-4 py-2 text-left font-medium">MOT Expiry</th>
                    <th className="px-4 py-2 text-left font-medium">Service Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {expiringVehicles.map((v) => (
                    <tr key={v.id} className="border-b">
                      <td className="px-4 py-2">
                        {v.make} {v.model}
                      </td>
                      <td className="px-4 py-2">{v.registration}</td>
                      <td className="px-4 py-2">
                        {v.motExpiry
                          ? new Date(v.motExpiry).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                      <td className="px-4 py-2">
                        {v.serviceExpiry
                          ? new Date(v.serviceExpiry).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
