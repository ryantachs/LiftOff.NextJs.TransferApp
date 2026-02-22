import { cn } from "@/lib/utils"

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING_PAYMENT: { label: "Pending Payment", className: "bg-amber-100 text-amber-800 border-amber-200" },
  CONFIRMED: { label: "Confirmed", className: "bg-blue-100 text-blue-800 border-blue-200" },
  ASSIGNED: { label: "Assigned", className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  IN_PROGRESS: { label: "In Progress", className: "bg-purple-100 text-purple-800 border-purple-200" },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-800 border-green-200" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200" },
}

export function BookingStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, className: "" }
  return (
    <span className={cn(
      "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
      config.className
    )}>
      {config.label}
    </span>
  )
}
