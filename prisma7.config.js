const { defineConfig } = require("@prisma/prisma7/config");
const { loadEnvConfig } = require("@next/env");

// Automatically load environment variables from .env
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
