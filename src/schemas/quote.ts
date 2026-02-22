import { z } from "zod"

export const quoteSchema = z.object({
  journeyType: z.enum(["PICKUP", "DROPOFF"]),
  pickupAddress: z.string().min(1, "Pickup address is required"),
  pickupLat: z.number(),
  pickupLng: z.number(),
  dropoffAddress: z.string().min(1, "Dropoff address is required"),
  dropoffLat: z.number(),
  dropoffLng: z.number(),
  flightNumber: z.string().optional(),
  pickupDateTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date/time",
  }),
  passengers: z.number().int().min(1, "At least 1 passenger required").max(16),
  luggage: z.number().int().min(0).max(20),
})

export type QuoteInput = z.infer<typeof quoteSchema>
