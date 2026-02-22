import path from "node:path"
import fs from "node:fs"
import { defineConfig } from "prisma/config"

// Load .env for Prisma CLI
const envPath = path.resolve(import.meta.dirname ?? ".", ".env")
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8")
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eqIndex = trimmed.indexOf("=")
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed.slice(eqIndex + 1).trim()
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

const databaseUrl = process.env.DATABASE_URL ?? ""

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: databaseUrl,
  },
  migrate: {
    async url() {
      return databaseUrl
    },
  },
})
