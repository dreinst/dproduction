import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Urutan sama dengan Next.js: env proses menang, lalu .env.local, lalu .env.
config({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
