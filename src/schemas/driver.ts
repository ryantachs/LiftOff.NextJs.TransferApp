import { z } from "zod"

export const driverSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  licenceNumber: z.string().min(5).max(30),
  vehicleId: z.string().optional().nullable(),
  isAvailable: z.boolean(),
})

export const driverPatchSchema = driverSchema.partial()

export type DriverInput = z.infer<typeof driverSchema>
