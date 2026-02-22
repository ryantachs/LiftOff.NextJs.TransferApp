import Link from "next/link"

interface GoldButtonProps {
  href: string
  children: React.ReactNode
  icon?: React.ReactNode
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "px-5 py-2 text-[0.72rem]",
  md: "px-7 py-3 text-[0.8rem]",
  lg: "px-9 py-4 text-[0.85rem]",
}

export function GoldButton({
  href,
  children,
  icon,
  size = "md",
}: GoldButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-[2px] bg-gold font-sans font-medium uppercase tracking-[0.08em] text-ink transition-colors hover:bg-gold-light ${sizeClasses[size]}`}
    >
      {children}
      {icon}
    </Link>
  )
}
