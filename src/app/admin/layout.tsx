import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || !["ADMIN", "DISPATCHER"].includes(session.user.role)) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar role={session.user.role} />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}
