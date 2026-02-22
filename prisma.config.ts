import path from "node:path"
import type { PrismaConfig } from "prisma"

export default {
  schema: path.join("prisma", "schema.prisma"),
  migrate: {
    async url() {
      return process.env.DATABASE_URL ?? ""
    },
  },
} satisfies PrismaConfig
