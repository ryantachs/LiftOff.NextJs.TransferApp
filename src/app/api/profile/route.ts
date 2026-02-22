import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"
import { updateProfileSchema, changePasswordSchema, changeEmailSchema } from "@/schemas/profile"
import bcrypt from "bcryptjs"

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session) {
    return Response.json({ error: "Unauthorised" }, { status: 401 })
  }

  const body = await request.json()
  const { action } = body

  switch (action) {
    case "updateProfile": {
      const parsed = updateProfileSchema.safeParse(body)
      if (!parsed.success) {
        return Response.json({ error: parsed.error.flatten() }, { status: 400 })
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: parsed.data.name,
          phone: parsed.data.phone,
        },
      })

      return Response.json({ success: true })
    }

    case "changePassword": {
      const parsed = changePasswordSchema.safeParse(body)
      if (!parsed.success) {
        return Response.json({ error: parsed.error.flatten() }, { status: 400 })
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      })
      if (!user || !user.passwordHash) {
        return Response.json({ error: "Cannot change password" }, { status: 400 })
      }

      const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash)
      if (!valid) {
        return Response.json({ error: "Current password is incorrect" }, { status: 400 })
      }

      // Check new password is different from current
      const sameAsOld = await bcrypt.compare(parsed.data.newPassword, user.passwordHash)
      if (sameAsOld) {
        return Response.json({ error: "New password must be different from current password" }, { status: 400 })
      }

      const hash = await bcrypt.hash(parsed.data.newPassword, 12)
      await prisma.user.update({
        where: { id: session.user.id },
        data: { passwordHash: hash },
      })

      return Response.json({ success: true })
    }

    case "changeEmail": {
      const parsed = changeEmailSchema.safeParse(body)
      if (!parsed.success) {
        return Response.json({ error: parsed.error.flatten() }, { status: 400 })
      }

      // Check if email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email: parsed.data.newEmail },
      })
      if (existingUser) {
        return Response.json({ error: "Email is already in use" }, { status: 400 })
      }

      // Send verification email via Resend
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: parsed.data.newEmail,
          subject: "Verify your new email address",
          html: `<h1>Verify Your Email</h1>
            <p>Please click the link below to verify your new email address:</p>
            <a href="${appUrl}/verify?email=${encodeURIComponent(parsed.data.newEmail)}">Verify Email</a>`,
        })
      } catch {
        return Response.json({ error: "Failed to send verification email" }, { status: 500 })
      }

      return Response.json({ success: true })
    }

    case "deleteAccount": {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          email: `deleted_${session.user.id}@deleted.invalid`,
          name: "Deleted User",
          phone: null,
          passwordHash: null,
          emailVerified: null,
        },
      })

      // Destroy sessions for this user
      await prisma.session.deleteMany({
        where: { userId: session.user.id },
      })

      return Response.json({ success: true })
    }

    default:
      return Response.json({ error: "Invalid action" }, { status: 400 })
  }
}
