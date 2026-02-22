import { requireAdmin } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"
import { extraPatchSchema } from "@/schemas/extra"

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
  const parsed = extraPatchSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.extra.findUnique({ where: { id } })
  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const { vehicleClassIds, ...data } = parsed.data

  // Update extra and optionally re-sync vehicle class associations
  const extra = await prisma.$transaction(async (tx) => {
    if (vehicleClassIds !== undefined) {
      await tx.extraVehicleClass.deleteMany({ where: { extraId: id } })
      if (vehicleClassIds.length > 0) {
        await tx.extraVehicleClass.createMany({
          data: vehicleClassIds.map((vcId) => ({
            extraId: id,
            vehicleClassId: vcId,
          })),
        })
      }
    }

    return tx.extra.update({
      where: { id },
      data,
      include: {
        vehicleClasses: {
          include: { vehicleClass: { select: { id: true, name: true } } },
        },
      },
    })
  })

  return Response.json({
    id: extra.id,
    name: extra.name,
    description: extra.description,
    price: extra.price.toString(),
    isPercentage: extra.isPercentage,
    sortOrder: extra.sortOrder,
    isActive: extra.isActive,
    vehicleClasses: extra.vehicleClasses.map((evc) => ({
      id: evc.vehicleClass.id,
      name: evc.vehicleClass.name,
    })),
    createdAt: extra.createdAt.toISOString(),
  })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
  } catch (res) {
    return res as Response
  }

  const { id } = await params

  const existing = await prisma.extra.findUnique({ where: { id } })
  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.extra.delete({ where: { id } })

  return Response.json({ success: true })
}
