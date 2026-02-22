"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  BookOpen,
  CalendarClock,
  PlusCircle,
  Users,
  Car,
  PoundSterling,
  BarChart3,
} from "lucide-react"

const navItems: { href: string; label: string; icon: typeof LayoutDashboard; adminOnly?: boolean }[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/bookings/new", label: "New Booking", icon: PlusCircle },
  { href: "/admin/dispatch", label: "Dispatch", icon: CalendarClock },
  { href: "/admin/drivers", label: "Drivers", icon: Users },
  { href: "/admin/vehicles", label: "Vehicles", icon: Car },
  { href: "/admin/pricing", label: "Pricing", icon: PoundSterling, adminOnly: true },
  { href: "/admin/reports", label: "Reports", icon: BarChart3, adminOnly: true },
]

interface AdminSidebarProps {
  role: string
}

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="flex w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-lg font-bold">Admin Panel</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems
          .filter((item) => !item.adminOnly || role === "ADMIN")
          .map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          Role: <span className="font-medium">{role}</span>
        </p>
      </div>
    </aside>
  )
}
