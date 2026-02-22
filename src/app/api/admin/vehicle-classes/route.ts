import { requireAdmin } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await requireAdmin()
  } catch (res) {
    return res as Response
  }

  const vehicleClasses = await prisma.vehicleClass.findMany({
    include: {
      extras: {
        include: { extra: { select: { id: true, name: true } } },
      },
    },
    orderBy: { sortOrder: "asc" },
  })

  return Response.json({
    vehicleClasses: vehicleClasses.map((vc) => ({
      id: vc.id,
      name: vc.name,
      description: vc.description,
      maxPassengers: vc.maxPassengers,
      maxLuggage: vc.maxLuggage,
      baseRatePerKm: vc.baseRatePerKm.toString(),
      minimumFare: vc.minimumFare.toString(),
      imageUrl: vc.imageUrl,
      sortOrder: vc.sortOrder,
      isActive: vc.isActive,
    })),
  })
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch (res) {
    return res as Response
  }

  const body = await request.json()

  if (!body.name || !body.description) {
    return Response.json({ error: "Name and description are required" }, { status: 400 })
  }

  const vehicleClass = await prisma.vehicleClass.create({
    data: {
      name: body.name,
      description: body.description,
      maxPassengers: body.maxPassengers ?? 4,
      maxLuggage: body.maxLuggage ?? 2,
      baseRatePerKm: body.baseRatePerKm ?? 2.0,
      minimumFare: body.minimumFare ?? 15.0,
      imageUrl: body.imageUrl ?? null,
      sortOrder: body.sortOrder ?? 0,
      isActive: body.isActive ?? true,
    },
  })

  return Response.json(vehicleClass, { status: 201 })
}
