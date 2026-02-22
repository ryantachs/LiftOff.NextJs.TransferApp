import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const STATUSES = [
  { key: "PENDING_PAYMENT", label: "Payment Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "ASSIGNED", label: "Driver Assigned" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED", label: "Completed" },
]

export function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  if (currentStatus === "CANCELLED") {
    return (
      <div className="space-y-4">
        {STATUSES.map((s) => (
          <div key={s.key} className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted bg-muted">
              <span className="text-xs text-muted-foreground">✕</span>
            </div>
            <span className="text-sm text-muted-foreground line-through">{s.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-500 bg-red-100">
            <span className="text-xs text-red-600">✕</span>
          </div>
          <span className="text-sm font-medium text-red-600">Cancelled</span>
        </div>
      </div>
    )
  }

  const currentIndex = STATUSES.findIndex((s) => s.key === currentStatus)

  return (
    <div className="space-y-4">
      {STATUSES.map((s, i) => {
        const isCompleted = i < currentIndex
        const isCurrent = i === currentIndex
        return (
          <div key={s.key} className="flex items-center gap-3">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2",
              isCompleted && "border-green-500 bg-green-100",
              isCurrent && "border-blue-500 bg-blue-100",
              !isCompleted && !isCurrent && "border-muted bg-muted"
            )}>
              {isCompleted ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : isCurrent ? (
                <div className="h-2 w-2 rounded-full bg-blue-500" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              )}
            </div>
            <span className={cn(
              "text-sm",
              isCompleted && "text-green-700",
              isCurrent && "font-medium text-blue-700",
              !isCompleted && !isCurrent && "text-muted-foreground"
            )}>
              {s.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
