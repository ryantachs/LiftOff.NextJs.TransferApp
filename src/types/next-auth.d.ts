import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "CUSTOMER" | "DISPATCHER" | "ADMIN"
    } & DefaultSession["user"]
  }

  interface User {
    role: "CUSTOMER" | "DISPATCHER" | "ADMIN"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}
