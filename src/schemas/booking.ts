import { z } from "zod"

export const bookingSchema = z.object({
  quoteId: z.string().min(1, "Quote ID is required"),
  vehicleClassId: z.string().min(1, "Vehicle class is required"),
  extras: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
    })
  ).default([]),
  specialRequests: z.string().optional(),
})

export type BookingInput = z.infer<typeof bookingSchema>
