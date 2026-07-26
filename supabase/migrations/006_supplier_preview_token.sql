-- Migration 006: unlisted "preview" supplier profiles.
--
-- Lets a real supplier test their AI profile via a private direct link without
-- the row ever being readable by the public directory.
--
-- The existing RLS select policy is deliberately NOT relaxed:
--   suppliers_public_read: (is_published = true OR owner_id = auth.uid() OR is_admin())
-- An unpublished row therefore stays invisible to anon list queries, so it can
-- never leak into /suppliers or the build-time prerender of that page.
--
-- Access to a single preview row goes through a SECURITY DEFINER function keyed
-- on an unguessable token (uuid v4 = 122 bits of entropy). The URL is the
-- capability: no token, no row. There is no way to enumerate preview suppliers,
-- because the function only ever matches on equality with a supplied token.
--
-- Safe to run more than once.

-- =============================================================================
-- 1. preview_token column
-- =============================================================================
alter table public.suppliers
  add column if not exists preview_token uuid;

comment on column public.suppliers.preview_token is
  'Unguessable token for unlisted preview access via get_supplier_by_preview_token(). NULL = no preview link.';

-- Partial unique index: many rows may have NULL, but a live token is unique.
create unique index if not exists suppliers_preview_token_idx
  on public.suppliers(preview_token)
  where preview_token is not null;

-- =============================================================================
-- 2. Token-keyed read function
-- =============================================================================
-- SECURITY DEFINER so it can read past RLS, but ONLY for the single row whose
-- preview_token matches. STABLE + no dynamic SQL: the token is a bound
-- parameter, never interpolated.
create or replace function public.get_supplier_by_preview_token(token uuid)
returns setof public.suppliers
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.suppliers
  where token is not null
    and preview_token = token
  limit 1;
$$;

comment on function public.get_supplier_by_preview_token(uuid) is
  'Returns the single supplier matching an unlisted preview token, bypassing RLS. Used by the /preview/:token route.';

-- Only the two client roles may call it; revoke the implicit PUBLIC grant.
revoke all on function public.get_supplier_by_preview_token(uuid) from public;
grant execute on function public.get_supplier_by_preview_token(uuid) to anon, authenticated;
