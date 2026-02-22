import { auth } from "@/auth"

export async function requireAdmin() {
  const session = await auth()
  if (!session || !["ADMIN", "DISPATCHER"].includes(session.user.role)) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 })
  }
  return session
}

export async function requireFullAdmin() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    throw new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 })
  }
  return session
}
