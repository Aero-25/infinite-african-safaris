-- =====================================================================
-- Infinite African Safaris — lead capture table (Cloudflare D1)
-- Create once:   npm run db:init
-- (runs: wrangler d1 execute ias-leads --remote --file=db/schema.sql)
--
-- Only the Pages Function (functions/api/lead.js) can write here; there is
-- no public read access. View enquiries in the Cloudflare dashboard:
-- Workers & Pages → D1 → ias-leads → Explore data.
-- =====================================================================

CREATE TABLE IF NOT EXISTS leads (
  id             TEXT PRIMARY KEY,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  source         TEXT NOT NULL DEFAULT 'website',  -- contact | booking | braai | private-builder
  name           TEXT,
  email          TEXT,
  phone          TEXT,
  country        TEXT,
  group_size     INTEGER,
  preferred_date TEXT,                              -- YYYY-MM-DD
  tour           TEXT,
  message        TEXT,
  raw            TEXT                               -- full submitted payload (JSON)
);

CREATE INDEX IF NOT EXISTS leads_created_at ON leads (created_at DESC);
