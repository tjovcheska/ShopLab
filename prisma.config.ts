import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Falls back to the same default as src/lib/db.ts so the app works
    // even before a .env file is created.
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
});
