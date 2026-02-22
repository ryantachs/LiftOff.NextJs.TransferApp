import { requireAdmin } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"
import { extraSchema } from "@/schemas/extra"

export async function GET() {
  try {
    await requireAdmin()
  } catch (res) {
    return res as Response
  }

  const extras = await prisma.extra.findMany({
    include: {
      vehicleClasses: {
        include: { vehicleClass: { select: { id: true, name: true } } },
      },
    },
    orderBy: { sortOrder: "asc" },
  })

  return Response.json({
    extras: extras.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      price: e.price.toString(),
      isPercentage: e.isPercentage,
      sortOrder: e.sortOrder,
      isActive: e.isActive,
      vehicleClasses: e.vehicleClasses.map((evc) => ({
        id: evc.vehicleClass.id,
        name: evc.vehicleClass.name,
      })),
      createdAt: e.createdAt.toISOString(),
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
  const parsed = extraSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { vehicleClassIds, ...data } = parsed.data

  const extra = await prisma.extra.create({
    data: {
      ...data,
      vehicleClasses: vehicleClassIds.length > 0
        ? {
            create: vehicleClassIds.map((vcId) => ({
              vehicleClassId: vcId,
            })),
          }
        : undefined,
    },
    include: {
      vehicleClasses: {
        include: { vehicleClass: { select: { id: true, name: true } } },
      },
    },
  })

  return Response.json(
    {
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
    },
    { status: 201 }
  )
}
