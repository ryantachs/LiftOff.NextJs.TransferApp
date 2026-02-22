import { z } from "zod"

export const vehicleSchema = z.object({
  registration: z.string().min(2).max(10).toUpperCase(),
  make: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  year: z.number().int().min(2000).max(new Date().getFullYear() + 1),
  colour: z.string().min(1).max(30),
  vehicleClassId: z.string().min(1),
  motExpiry: z.string().datetime().optional().nullable(),
  serviceExpiry: z.string().datetime().optional().nullable(),
  isActive: z.boolean(),
})

export const vehiclePatchSchema = vehicleSchema.partial()

export type VehicleInput = z.infer<typeof vehicleSchema>
