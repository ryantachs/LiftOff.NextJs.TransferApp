import { requireFullAdmin } from "@/lib/auth-guards"
import { prisma } from "@/lib/prisma"
import Decimal from "decimal.js"

export async function POST(request: Request) {
  try {
    await requireFullAdmin()
  } catch (res) {
    return res as Response
  }

  const body = await request.json()

  const {
    vehicleClassId,
    distanceKm,
    pickupDateTime,
    extras: selectedExtraIds,
  } = body

  if (!vehicleClassId || distanceKm === undefined || !pickupDateTime) {
    return Response.json(
      { error: "vehicleClassId, distanceKm, and pickupDateTime are required" },
      { status: 400 }
    )
  }

  const vehicleClass = await prisma.vehicleClass.findUnique({
    where: { id: vehicleClassId },
  })

  if (!vehicleClass) {
    return Response.json({ error: "Vehicle class not found" }, { status: 404 })
  }

  const ratePerKm = new Decimal(vehicleClass.baseRatePerKm.toString())
  const minFare = new Decimal(vehicleClass.minimumFare.toString())
  const distance = new Decimal(distanceKm)

  let basePrice = ratePerKm.mul(distance)
  const minimumFareApplied = basePrice.lessThan(minFare)
  if (minimumFareApplied) basePrice = minFare

  const pickupDate = new Date(pickupDateTime)
  const dayOfWeek = pickupDate.getDay()

  const rules = await prisma.pricingRule.findMany({
    where: {
      isActive: true,
      OR: [{ vehicleClassId }, { vehicleClassId: null }],
      AND: [
        {
          OR: [
            { appliesFrom: null },
            { appliesFrom: { lte: pickupDate } },
          ],
        },
        {
          OR: [
            { appliesTo: null },
            { appliesTo: { gte: pickupDate } },
          ],
        },
      ],
    },
  })

  const appliedRules: {
    name: string
    type: string
    value: string
    isPercentage: boolean
    effect: string
  }[] = []

  for (const rule of rules) {
    if (rule.daysOfWeek.length > 0 && !rule.daysOfWeek.includes(dayOfWeek)) continue

    const ruleValue = new Decimal(rule.value.toString())
    const amount = rule.isPercentage ? basePrice.mul(ruleValue).div(100) : ruleValue

    appliedRules.push({
      name: rule.name,
      type: rule.type,
      value: rule.value.toString(),
      isPercentage: rule.isPercentage,
      effect: (rule.type === "SURCHARGE" ? "+" : "-") + "£" + amount.toDecimalPlaces(2).toString(),
    })

    if (rule.type === "SURCHARGE") {
      basePrice = basePrice.add(amount)
    } else {
      basePrice = basePrice.sub(amount)
      if (basePrice.lessThan(0)) basePrice = new Decimal(0)
    }
  }

  // Calculate extras
  const extrasBreakdown: { id: string; name: string; price: string }[] = []
  let extrasTotal = new Decimal(0)

  if (Array.isArray(selectedExtraIds) && selectedExtraIds.length > 0) {
    const extras = await prisma.extra.findMany({
      where: { id: { in: selectedExtraIds }, isActive: true },
    })

    for (const extra of extras) {
      const extraPrice = extra.isPercentage
        ? basePrice.mul(new Decimal(extra.price.toString())).div(100)
        : new Decimal(extra.price.toString())

      extrasBreakdown.push({
        id: extra.id,
        name: extra.name,
        price: extraPrice.toDecimalPlaces(2).toString(),
      })

      extrasTotal = extrasTotal.add(extraPrice)
    }
  }

  const totalPrice = basePrice.add(extrasTotal)

  return Response.json({
    distanceKm,
    ratePerKm: ratePerKm.toString(),
    rawBasePrice: ratePerKm.mul(distance).toDecimalPlaces(2).toString(),
    minimumFareApplied,
    minimumFare: minFare.toString(),
    rulesApplied: appliedRules,
    basePriceAfterRules: basePrice.toDecimalPlaces(2).toString(),
    extras: extrasBreakdown,
    extrasTotal: extrasTotal.toDecimalPlaces(2).toString(),
    totalPrice: totalPrice.toDecimalPlaces(2).toString(),
  })
}
