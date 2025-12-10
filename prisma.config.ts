import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import type { PrismaConfig } from "prisma";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
    seed: "node --loader tsx prisma/seed.ts", // Next.js용
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
