-- =====================================================================
-- Infinite African Safaris — lead capture table
-- Run this once in your Supabase project:  Dashboard → SQL Editor → paste → Run.
-- Reuse your existing image project (the same one hosting the photos).
-- =====================================================================

create table if not exists public.leads (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  source         text not null default 'website',   -- 'contact' | 'booking'
  name           text,
  email          text,
  phone          text,
  country        text,
  group_size     integer,
  preferred_date date,
  tour           text,
  message        text,
  raw            jsonb                                -- full submitted payload
);

-- Row Level Security: the public (anon) key may ONLY insert a lead.
-- It cannot read, update or delete — so nobody can scrape your enquiries.
alter table public.leads enable row level security;

drop policy if exists "anon can submit a lead" on public.leads;
create policy "anon can submit a lead"
  on public.leads
  for insert
  to anon
  with check (true);

-- Expose insert (only) to the public Data API role.
grant insert on public.leads to anon;

-- You (via the dashboard / service_role key) can read everything as normal.
-- Optional: get an email on every new lead by adding a Database Webhook or
-- Edge Function on INSERT to public.leads (Dashboard → Database → Webhooks).
