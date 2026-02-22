import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { savedAddressSchema } from "@/schemas/saved-address"

export async function GET() {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorised" }, { status: 401 })
  }

  const addresses = await prisma.savedAddress.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return Response.json(addresses)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorised" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = savedAddressSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Check max 10 addresses
  const count = await prisma.savedAddress.count({
    where: { userId: session.user.id },
  })
  if (count >= 10) {
    return Response.json(
      { error: "Maximum of 10 saved addresses allowed" },
      { status: 400 }
    )
  }

  const address = await prisma.savedAddress.create({
    data: {
      userId: session.user.id,
      label: parsed.data.label,
      address: parsed.data.address,
      lat: parsed.data.lat,
      lng: parsed.data.lng,
    },
  })

  return Response.json(address, { status: 201 })
}
