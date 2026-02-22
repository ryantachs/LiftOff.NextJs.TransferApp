import { z } from "zod"

export const vehicleClassPatchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  maxPassengers: z.number().int().min(1).optional(),
  maxLuggage: z.number().int().min(0).optional(),
  baseRatePerKm: z.number().positive().optional(),
  minimumFare: z.number().min(0).optional(),
  imageUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
})

export type VehicleClassPatchInput = z.infer<typeof vehicleClassPatchSchema>
