import { defineConfig } from "drizzle-kit";
import path from "path";

// For migrations use the direct connection (port 5432), not the pooler (port 6543)
// SUPABASE_DIRECT_URL = direct connection for drizzle-kit push/migrate
// SUPABASE_DATABASE_URL = pooled connection for runtime queries
const migrationUrl =
  process.env.SUPABASE_DIRECT_URL ||
  process.env.SUPABASE_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!migrationUrl) {
  throw new Error("SUPABASE_DIRECT_URL, SUPABASE_DATABASE_URL or DATABASE_URL must be set");
}

// Convert pooler URL (port 6543) to direct URL (port 5432) automatically if no direct URL set
const resolvedUrl = migrationUrl.replace(":6543/", ":5432/");

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: resolvedUrl,
    ssl: (process.env.SUPABASE_DATABASE_URL || process.env.SUPABASE_DIRECT_URL)
      ? { rejectUnauthorized: false }
      : undefined,
  },
});
