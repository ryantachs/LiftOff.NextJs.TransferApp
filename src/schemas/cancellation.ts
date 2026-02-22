import { z } from "zod"

export const cancellationSchema = z.object({
  reason: z.string().min(1, "Cancellation reason is required").max(500, "Reason too long"),
})

export type CancellationInput = z.infer<typeof cancellationSchema>
