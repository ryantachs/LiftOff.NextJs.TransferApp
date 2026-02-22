import { requireAdmin } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"
import { pricingRuleSchema } from "@/schemas/pricing-rule"

export async function GET() {
  try {
    await requireAdmin()
  } catch (res) {
    return res as Response
  }

  const rules = await prisma.pricingRule.findMany({
    orderBy: { createdAt: "desc" },
  })

  return Response.json({
    rules: rules.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      value: r.value.toString(),
      isPercentage: r.isPercentage,
      appliesFrom: r.appliesFrom?.toISOString() ?? null,
      appliesTo: r.appliesTo?.toISOString() ?? null,
      daysOfWeek: r.daysOfWeek,
      vehicleClassId: r.vehicleClassId,
      isActive: r.isActive,
      createdAt: r.createdAt.toISOString(),
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
  const parsed = pricingRuleSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data

  const rule = await prisma.pricingRule.create({
    data: {
      name: data.name,
      type: data.type,
      value: data.value,
      isPercentage: data.isPercentage,
      appliesFrom: data.appliesFrom ? new Date(data.appliesFrom) : null,
      appliesTo: data.appliesTo ? new Date(data.appliesTo) : null,
      daysOfWeek: data.daysOfWeek,
      vehicleClassId: data.vehicleClassId,
      isActive: data.isActive,
    },
  })

  return Response.json(
    {
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
    },
    { status: 201 }
  )
}
