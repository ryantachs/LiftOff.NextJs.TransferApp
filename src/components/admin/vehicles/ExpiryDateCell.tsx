"use client"

interface ExpiryDateCellProps {
  date: string | null
}

export function ExpiryDateCell({ date }: ExpiryDateCellProps) {
  if (!date) {
    return <span className="text-muted-foreground">—</span>
  }

  const expiry = new Date(date)
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const formattedDate = expiry.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  if (expiry < now) {
    return (
      <span className="font-medium text-red-600">{formattedDate}</span>
    )
  }

  if (expiry < thirtyDaysFromNow) {
    return (
      <span className="font-medium text-amber-600">{formattedDate}</span>
    )
  }

  return <span>{formattedDate}</span>
}
