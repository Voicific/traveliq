-- Migration 002: affiliate_applications table + fix suppliers type constraint
-- Safe to run more than once.

-- =============================================================================
-- FIX: Drop the overly-restrictive type check on suppliers
-- The app now supports 27 supplier categories (plain text, no enum needed).
-- =============================================================================
do $$ begin
  alter table public.suppliers drop constraint if exists suppliers_type_check;
exception when undefined_object then null;
end $$;

-- =============================================================================
-- AFFILIATE APPLICATIONS
-- Stores affiliate programme applications submitted via /affiliate-program.
-- Public can insert; only authenticated users can read/update (for admin review).
-- =============================================================================
create table if not exists public.affiliate_applications (
  id            uuid        primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  first_name    text        not null,
  last_name     text        not null,
  email         text        not null,
  phone         text,
  country       text        not null,
  role          text        not null,
  company       text,
  linkedin      text,
  experience    text        not null,
  supplier_types text[]     not null default '{}',
  network_size  text,
  methods       text[]      not null default '{}',
  notes         text,
  status        text        not null default 'pending'
                              check (status in ('pending', 'approved', 'rejected')),
  reviewed_at   timestamptz
);

create index if not exists affiliate_applications_status_idx
  on public.affiliate_applications(status);

create index if not exists affiliate_applications_created_idx
  on public.affiliate_applications(created_at desc);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.affiliate_applications enable row level security;

-- Anyone (including anon visitors) can submit an application
drop policy if exists affiliate_public_insert on public.affiliate_applications;
create policy affiliate_public_insert on public.affiliate_applications
  for insert with check (true);

-- Only authenticated users (supplier portal login or admin) can read applications
drop policy if exists affiliate_auth_select on public.affiliate_applications;
create policy affiliate_auth_select on public.affiliate_applications
  for select using (auth.uid() is not null);

-- Only authenticated users can update the status (approve / reject)
drop policy if exists affiliate_auth_update on public.affiliate_applications;
create policy affiliate_auth_update on public.affiliate_applications
  for update using (auth.uid() is not null)
  with check (auth.uid() is not null);
