import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // Perintah CLI (migrate, db pull, dll.) memakai koneksi langsung (port 5432).
    // Aplikasi saat berjalan tetap memakai DATABASE_URL lewat schema.prisma.
    url: env("DIRECT_URL"),
  },
});