-- Migration 003: add is_demo to suppliers + relax write RLS for legacy admin page
-- Safe to run more than once.

-- Add is_demo column (defaults true so all existing suppliers show Demo badge until cleared)
alter table public.suppliers
  add column if not exists is_demo boolean not null default true;

-- The legacy /admin page uses hardcoded auth (not Supabase auth), so auth.uid() is null
-- when it performs writes. Relax insert / update / delete to allow anon so the admin
-- page can still manage suppliers. The admin page has its own password check.
drop policy if exists suppliers_owner_insert on public.suppliers;
create policy suppliers_owner_insert on public.suppliers
  for insert with check (true);

drop policy if exists suppliers_owner_update on public.suppliers;
create policy suppliers_owner_update on public.suppliers
  for update using (true);

drop policy if exists suppliers_admin_delete on public.suppliers;
create policy suppliers_admin_delete on public.suppliers
  for delete using (true);
