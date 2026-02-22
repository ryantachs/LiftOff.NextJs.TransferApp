import { requireAdmin } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"
import { vehicleClassPatchSchema } from "@/schemas/vehicle-class"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
  } catch (res) {
    return res as Response
  }

  const { id } = await params
  const body = await request.json()
  const parsed = vehicleClassPatchSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.vehicleClass.findUnique({ where: { id } })
  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const vehicleClass = await prisma.vehicleClass.update({
    where: { id },
    data: parsed.data,
  })

  return Response.json({
    id: vehicleClass.id,
    name: vehicleClass.name,
    description: vehicleClass.description,
    maxPassengers: vehicleClass.maxPassengers,
    maxLuggage: vehicleClass.maxLuggage,
    baseRatePerKm: vehicleClass.baseRatePerKm.toString(),
    minimumFare: vehicleClass.minimumFare.toString(),
    imageUrl: vehicleClass.imageUrl,
    sortOrder: vehicleClass.sortOrder,
    isActive: vehicleClass.isActive,
  })
}
