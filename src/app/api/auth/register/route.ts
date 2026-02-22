import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/schemas/auth"
import bcrypt from "bcryptjs"
import { headers } from "next/headers"

export async function POST(request: Request) {
  // Rate limiting - only active when Upstash is configured
  if (process.env.UPSTASH_REDIS_REST_URL) {
    const { authRatelimit } = await import("@/lib/security")
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") ?? "unknown"
    const { success } = await authRatelimit.limit(ip)
    if (!success) {
      return Response.json({ error: "Too many requests" }, { status: 429 })
    }
  }

  const body = await request.json()
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, email, password, phone } = parsed.data

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email },
  })
  if (existing) {
    return Response.json({ error: "Email already registered" }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      phone,
    },
  })

  return Response.json({ id: user.id, email: user.email }, { status: 201 })
}
