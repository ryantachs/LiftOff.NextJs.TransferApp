import { requireAdmin } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"
import { pricingRulePatchSchema } from "@/schemas/pricing-rule"

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
  const parsed = pricingRulePatchSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.pricingRule.findUnique({ where: { id } })
  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const data = parsed.data
  const updateData: Record<string, unknown> = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.type !== undefined) updateData.type = data.type
  if (data.value !== undefined) updateData.value = data.value
  if (data.isPercentage !== undefined) updateData.isPercentage = data.isPercentage
  if (data.appliesFrom !== undefined) updateData.appliesFrom = data.appliesFrom ? new Date(data.appliesFrom) : null
  if (data.appliesTo !== undefined) updateData.appliesTo = data.appliesTo ? new Date(data.appliesTo) : null
  if (data.daysOfWeek !== undefined) updateData.daysOfWeek = data.daysOfWeek
  if (data.vehicleClassId !== undefined) updateData.vehicleClassId = data.vehicleClassId
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  const rule = await prisma.pricingRule.update({
    where: { id },
    data: updateData,
  })

  return Response.json({
    id: rule.id,
    name: rule.name,
    type: rule.type,
    value: rule.value.toString(),
    isPercentage: rule.isPercentage,
    appliesFrom: rule.appliesFrom?.toISOString() ?? null,
    appliesTo: rule.appliesTo?.toISOString() ?? null,
    daysOfWeek: rule.daysOfWeek,
    vehicleClassId: rule.vehicleClassId,
    isActive: rule.isActive,
    createdAt: rule.createdAt.toISOString(),
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

  const existing = await prisma.pricingRule.findUnique({ where: { id } })
  if (!existing) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.pricingRule.delete({ where: { id } })

  return Response.json({ success: true })
}
