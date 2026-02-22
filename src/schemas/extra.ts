import { z } from "zod"

export const extraSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional().nullable(),
  price: z.number().min(0),
  isPercentage: z.boolean(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean(),
  vehicleClassIds: z.array(z.string()).default([]),
})

export const extraPatchSchema = extraSchema.partial()

export type ExtraInput = z.infer<typeof extraSchema>
