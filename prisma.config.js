const { defineConfig } = require("prisma/config");
const { loadEnvConfig } = require("@next/env");

// Automatically load variables from .env, .env.local, etc.
loadEnvConfig(process.cwd());

module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
