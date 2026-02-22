import { z } from "zod"

export const pricingRuleSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.enum(["SURCHARGE", "DISCOUNT"]),
  value: z.number().positive(),
  isPercentage: z.boolean(),
  appliesFrom: z.string().datetime().nullable(),
  appliesTo: z.string().datetime().nullable(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)),
  vehicleClassId: z.string().nullable(),
  isActive: z.boolean(),
})

export const pricingRulePatchSchema = pricingRuleSchema.partial()

export type PricingRuleInput = z.infer<typeof pricingRuleSchema>
