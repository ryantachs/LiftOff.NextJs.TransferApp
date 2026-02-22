import Decimal from "decimal.js"
import { prisma } from "@/lib/prisma"

export async function calculatePrice(
  vehicleClassId: string,
  distanceKm: number,
  pickupDateTime: Date,
  selectedExtras: { id: string; price: number }[]
): Promise<{ basePrice: Decimal; extrasPrice: Decimal; totalPrice: Decimal }> {
  const vehicleClass = await prisma.vehicleClass.findUniqueOrThrow({
    where: { id: vehicleClassId },
  })

  const ratePerKm = new Decimal(vehicleClass.baseRatePerKm.toString())
  const minFare = new Decimal(vehicleClass.minimumFare.toString())
  const distance = new Decimal(distanceKm)

  let basePrice = ratePerKm.mul(distance)
  if (basePrice.lessThan(minFare)) basePrice = minFare

  const dayOfWeek = pickupDateTime.getDay()
  const rules = await prisma.pricingRule.findMany({
    where: {
      isActive: true,
      OR: [{ vehicleClassId }, { vehicleClassId: null }],
      AND: [
        {
          OR: [
            { appliesFrom: null },
            { appliesFrom: { lte: pickupDateTime } },
          ],
        },
        {
          OR: [
            { appliesTo: null },
            { appliesTo: { gte: pickupDateTime } },
          ],
        },
      ],
    },
  })

  for (const rule of rules) {
    if (rule.daysOfWeek.length > 0 && !rule.daysOfWeek.includes(dayOfWeek)) continue

    const ruleValue = new Decimal(rule.value.toString())
    const amount = rule.isPercentage ? basePrice.mul(ruleValue).div(100) : ruleValue

    if (rule.type === "SURCHARGE") {
      basePrice = basePrice.add(amount)
    } else {
      basePrice = basePrice.sub(amount)
      if (basePrice.lessThan(0)) basePrice = new Decimal(0)
    }
  }

  const extrasPrice = selectedExtras.reduce(
    (sum, e) => sum.add(new Decimal(e.price)),
    new Decimal(0)
  )

  return {
    basePrice: basePrice.toDecimalPlaces(2),
    extrasPrice: extrasPrice.toDecimalPlaces(2),
    totalPrice: basePrice.add(extrasPrice).toDecimalPlaces(2),
  }
}
