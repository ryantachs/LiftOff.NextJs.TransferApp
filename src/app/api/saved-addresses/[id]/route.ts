import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { savedAddressSchema } from "@/schemas/saved-address"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorised" }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.savedAddress.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  const body = await request.json()
  const parsed = savedAddressSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const updated = await prisma.savedAddress.update({
    where: { id },
    data: {
      label: parsed.data.label,
      address: parsed.data.address,
      lat: parsed.data.lat,
      lng: parsed.data.lng,
    },
  })

  return Response.json(updated)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorised" }, { status: 401 })
  }

  const { id } = await params

  const existing = await prisma.savedAddress.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.savedAddress.delete({ where: { id } })

  return Response.json({ success: true })
}
