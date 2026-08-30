const dotenv = require("dotenv");
const path = require("path");

// Prefer app-local env files when present (many users keep DATABASE_URL there).
dotenv.config({ path: path.resolve(__dirname, "../../apps/api/.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../../apps/saas-web/.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

/** @type {import("drizzle-kit").Config} */
const config = {
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    prefix: "timestamp",
  },
  casing: "snake_case",
  verbose: true,
  strict: true,
};

module.exports = config;
