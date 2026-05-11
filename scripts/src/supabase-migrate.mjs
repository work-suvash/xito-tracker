/**
 * Creates Xito Tracker tables in Supabase via the PostgREST RPC or direct HTTP.
 * Run: node scripts/src/supabase-migrate.mjs
 */

const SUPABASE_URL = process.env.SUPABASE_URL || "https://trbgmgnxifqrdpequuxq.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required");
  process.exit(1);
}

const headers = {
  "apikey": SERVICE_KEY,
  "Authorization": `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

const SQL = `
-- Xito Tracker tables

CREATE TABLE IF NOT EXISTS xito_clients (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  wedding_date TEXT,
  event_location TEXT,
  package_type TEXT,
  total_amount DOUBLE PRECISION,
  advance_paid DOUBLE PRECISION,
  remaining_balance DOUBLE PRECISION,
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  progress INTEGER DEFAULT 0,
  referred_by TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xito_projects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  client_id BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Booked',
  type TEXT,
  deadline TEXT,
  delivery_date TEXT,
  delivery_link TEXT,
  notes TEXT,
  priority TEXT DEFAULT 'medium',
  assigned_to TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xito_files (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'photo',
  size INTEGER,
  url TEXT,
  delivery_link TEXT,
  project_id BIGINT,
  client_id BIGINT,
  uploaded_by TEXT,
  availability TEXT NOT NULL DEFAULT 'available',
  backup_status TEXT NOT NULL DEFAULT 'none',
  download_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xito_notifications (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  client_id BIGINT,
  project_id BIGINT,
  due_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xito_tags (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

// Try the Supabase management API (needs personal access token, won't work with service key)
// Instead, we'll create a stored procedure first, then call it

// Create tables one by one via a workaround: insert into a non-existent table
// to get the error, which reveals connectivity. Real approach: use pg_dump-style HTTP

// The actual approach: call the Supabase pg extension via rpc
// First let's check what we can reach
async function checkTables() {
  const tables = ["xito_clients", "xito_projects", "xito_files", "xito_notifications", "xito_tags"];
  const results = {};
  for (const table of tables) {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, { headers });
    results[table] = r.status === 200 ? "exists" : `missing (${r.status})`;
  }
  return results;
}

async function createTablesViaRpc() {
  // Use Supabase's pg_dump endpoint or management API
  // Since we only have anon/service key, let's use the SQL via the postgres endpoint
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_ddl`, {
    method: "POST",
    headers,
    body: JSON.stringify({ sql: SQL }),
  });
  return { status: r.status, body: await r.text() };
}

async function main() {
  console.log("Checking existing xito tables...");
  const tableStatus = await checkTables();
  console.log(tableStatus);

  const missingTables = Object.entries(tableStatus).filter(([, v]) => v !== "exists").map(([k]) => k);
  if (missingTables.length === 0) {
    console.log("All tables already exist!");
    return;
  }

  console.log(`Missing tables: ${missingTables.join(", ")}`);
  console.log("Attempting to create via RPC...");
  const result = await createTablesViaRpc();
  console.log("RPC result:", result);

  // Re-check
  const afterStatus = await checkTables();
  console.log("After migration:", afterStatus);
}

main().catch(console.error);
