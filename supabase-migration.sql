-- ============================================================
-- Xito Tracker – Supabase Migration
-- Run this in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New query → paste & run
-- ============================================================

CREATE TABLE IF NOT EXISTS xito_clients (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL DEFAULT '',
  phone      TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'active',
  wedding_date       TEXT,
  event_location     TEXT,
  package_type       TEXT,
  total_amount       DOUBLE PRECISION,
  advance_paid       DOUBLE PRECISION,
  remaining_balance  DOUBLE PRECISION,
  payment_status     TEXT DEFAULT 'pending',
  notes      TEXT,
  tags       TEXT[] DEFAULT '{}',
  progress   INTEGER DEFAULT 0,
  referred_by TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xito_projects (
  id           BIGSERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  client_id    BIGINT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'Booked',
  type         TEXT,
  deadline     TEXT,
  delivery_date TEXT,
  delivery_link TEXT,
  notes        TEXT,
  priority     TEXT DEFAULT 'medium',
  assigned_to  TEXT,
  tags         TEXT[] DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xito_files (
  id             BIGSERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  original_name  TEXT NOT NULL,
  type           TEXT NOT NULL DEFAULT 'photo',
  size           INTEGER,
  url            TEXT,
  delivery_link  TEXT,
  project_id     BIGINT,
  client_id      BIGINT,
  uploaded_by    TEXT,
  availability   TEXT NOT NULL DEFAULT 'available',
  backup_status  TEXT NOT NULL DEFAULT 'none',
  download_count INTEGER NOT NULL DEFAULT 0,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xito_notifications (
  id          BIGSERIAL PRIMARY KEY,
  type        TEXT NOT NULL DEFAULT 'general',
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  client_id   BIGINT,
  project_id  BIGINT,
  due_date    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS xito_tags (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  color      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disable RLS so the service role can access freely
ALTER TABLE xito_clients      ENABLE ROW LEVEL SECURITY;
ALTER TABLE xito_projects     ENABLE ROW LEVEL SECURITY;
ALTER TABLE xito_files        ENABLE ROW LEVEL SECURITY;
ALTER TABLE xito_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE xito_tags         ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "service_role_all" ON xito_clients      FOR ALL USING (true);
CREATE POLICY "service_role_all" ON xito_projects     FOR ALL USING (true);
CREATE POLICY "service_role_all" ON xito_files        FOR ALL USING (true);
CREATE POLICY "service_role_all" ON xito_notifications FOR ALL USING (true);
CREATE POLICY "service_role_all" ON xito_tags         FOR ALL USING (true);
