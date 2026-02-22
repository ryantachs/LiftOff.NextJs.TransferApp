import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Resend from "next-auth/providers/resend"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { loginSchema } from "@/schemas/auth"

export const { handlers, auth, signIn, signOut } = NextAuth({
  // @ts-expect-error - PrismaAdapter types conflict with extended User.role in next-auth.d.ts
  adapter: PrismaAdapter(prisma),

  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })
        if (!user || !user.passwordHash) return null

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),

    Resend({
      from: process.env.EMAIL_FROM!,
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as "CUSTOMER" | "DISPATCHER" | "ADMIN"
      return session
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/verify",
  },
})
