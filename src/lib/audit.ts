import { prisma } from "@/lib/prisma"

export async function writeAuditLog({
  bookingId,
  action,
  actor,
  changes,
  ipAddress,
}: {
  bookingId: string
  action: string
  actor: string
  changes: Record<string, unknown>
  ipAddress?: string
}) {
  await prisma.auditLog.create({
    data: {
      bookingId,
      action,
      actor,
      changes,
      ipAddress,
    },
  })
}
