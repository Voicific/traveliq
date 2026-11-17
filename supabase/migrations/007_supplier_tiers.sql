-- Migration 007: supplier tiers (free / enhanced / growth), voice metering,
-- and tier-gated lead access.
--
-- Run in the Supabase SQL editor. Safe to run more than once.
--
-- PREVIEW FIRST (read-only) -------------------------------------------------
--   select id, name, is_published, is_demo, owner_id from public.suppliers order by name;
--   select tablename, policyname, cmd, qual, with_check from pg_policies
--    where schemaname = 'public' and tablename in ('suppliers','leads','profiles');
--   select tgrelid::regclass, tgname from pg_trigger
--    where not tgisinternal
--      and tgrelid in ('public.suppliers'::regclass, 'public.profiles'::regclass);
-- ---------------------------------------------------------------------------

-- =============================================================================
-- 1. suppliers.tier
-- =============================================================================
alter table public.suppliers
  add column if not exists tier text not null default 'free';

do $$ begin
  alter table public.suppliers
    add constraint suppliers_tier_check check (tier in ('free', 'enhanced', 'growth'));
exception when duplicate_object then null;
end $$;

comment on column public.suppliers.tier is
  'Commercial tier: free | enhanced | growth. Only admins / service role may change it (see guard_supplier_tier).';

-- =============================================================================
-- 2. Only admins, the SQL editor and the service role may set tier
-- =============================================================================
-- suppliers_owner_update lets an owner update ANY column of their own row, so
-- without this trigger a free supplier could simply set tier = 'growth'.
-- auth.role() is NULL in the SQL editor and 'service_role' for the service key,
-- so both pass through untouched.
create or replace function public.guard_supplier_tier()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(auth.role(), '') in ('anon', 'authenticated') and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.tier := 'free';
    else
      new.tier := old.tier;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists suppliers_guard_tier on public.suppliers;
create trigger suppliers_guard_tier
  before insert or update on public.suppliers
  for each row execute function public.guard_supplier_tier();

-- =============================================================================
-- 3. supplier_usage — one row per supplier per UTC month
-- =============================================================================
create table if not exists public.supplier_usage (
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  period text not null check (period ~ '^\d{4}-\d{2}$'),
  voice_seconds_used int not null default 0 check (voice_seconds_used >= 0),
  updated_at timestamptz not null default now(),
  unique (supplier_id, period)
);

alter table public.supplier_usage enable row level security;

-- A supplier reads only its own rows; admins read all.
drop policy if exists supplier_usage_read on public.supplier_usage;
create policy supplier_usage_read on public.supplier_usage
  for select using (
    public.is_admin()
    or supplier_id in (select id from public.suppliers where owner_id = auth.uid())
  );
-- Deliberately NO insert/update/delete policies: the only writer is the
-- voice-gate edge function, which uses the service role and bypasses RLS.

-- =============================================================================
-- 4. voice_sessions — server-side record of each voice session
-- =============================================================================
-- voice-gate opens a row on `check` and charges elapsed time by ITS OWN clock
-- on each `log`, so the browser never reports a duration.
create table if not exists public.voice_sessions (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  period text not null,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  ended_at timestamptz,
  granted_seconds int,              -- NULL = uncapped (paid tiers)
  charged_seconds int not null default 0
);

create index if not exists voice_sessions_open_idx
  on public.voice_sessions(supplier_id) where ended_at is null;

alter table public.voice_sessions enable row level security;

drop policy if exists voice_sessions_admin_read on public.voice_sessions;
create policy voice_sessions_admin_read on public.voice_sessions
  for select using (public.is_admin());

-- Atomic increment used by voice-gate. Service role only.
create or replace function public.voice_usage_add(p_supplier uuid, p_period text, p_seconds int)
returns int language sql security definer set search_path = public as $$
  insert into public.supplier_usage (supplier_id, period, voice_seconds_used)
  values (p_supplier, p_period, greatest(p_seconds, 0))
  on conflict (supplier_id, period) do update
    set voice_seconds_used = public.supplier_usage.voice_seconds_used + excluded.voice_seconds_used,
        updated_at = now()
  returning voice_seconds_used;
$$;

revoke all on function public.voice_usage_add(uuid, text, int) from public, anon, authenticated;
grant execute on function public.voice_usage_add(uuid, text, int) to service_role;

-- =============================================================================
-- 5. Leads: named rows for paid tiers only; free owners get a number
-- =============================================================================
drop policy if exists leads_supplier_read on public.leads;
create policy leads_supplier_read on public.leads
  for select using (
    public.is_admin()
    or supplier_id in (
      select id from public.suppliers
      where owner_id = auth.uid() and tier in ('enhanced', 'growth')
    )
  );

-- Returns ONLY a count, for the caller's own supplier, for one UTC month.
create or replace function public.get_my_lead_count(
  p_period text default to_char(now() at time zone 'utc', 'YYYY-MM')
)
returns integer language sql stable security definer set search_path = public as $$
  select count(*)::int
  from public.leads l
  join public.suppliers s on s.id = l.supplier_id
  where s.owner_id = auth.uid()
    and to_char(l.created_at at time zone 'utc', 'YYYY-MM') = p_period;
$$;

revoke all on function public.get_my_lead_count(text) from public, anon;
grant execute on function public.get_my_lead_count(text) to authenticated;

-- =============================================================================
-- 6. Stop users promoting themselves
-- =============================================================================
-- profiles_self_update (migration 001) lets a user update any column of their
-- own profile, including role and is_approved. An admin reads every lead, so
-- that would bypass section 5. Drop this block if you have already fixed it.
create or replace function public.guard_profile_privileges()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(auth.role(), '') in ('anon', 'authenticated') and not public.is_admin() then
    new.role := old.role;
    new.is_approved := old.is_approved;
  end if;
  return new;
end $$;

drop trigger if exists profiles_guard_privileges on public.profiles;
create trigger profiles_guard_privileges
  before update on public.profiles
  for each row execute function public.guard_profile_privileges();
