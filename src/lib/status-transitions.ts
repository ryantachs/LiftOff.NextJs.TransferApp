import type { BookingStatus } from "@prisma/client"

export const validTransitions: Record<BookingStatus, BookingStatus[]> = {
  PENDING_PAYMENT: [],
  CONFIRMED: ["ASSIGNED"],
  ASSIGNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
}

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return validTransitions[from]?.includes(to) ?? false
}
