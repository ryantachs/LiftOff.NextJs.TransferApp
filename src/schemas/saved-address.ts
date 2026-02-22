import { z } from "zod"

export const savedAddressSchema = z.object({
  label: z.string().min(1, "Label is required").max(50, "Label too long"),
  address: z.string().min(1, "Address is required"),
  lat: z.number(),
  lng: z.number(),
})

export type SavedAddressInput = z.infer<typeof savedAddressSchema>
